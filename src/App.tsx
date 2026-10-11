import React, { useState, useEffect, useMemo } from 'react';
import {
  BoxTier,
  CryptoCurrency,
  GameMode,
  ProvablyFairPair,
  RollResult,
  WalletState,
  UserProfile,
  ConnectedWallet,
} from './types';
import { BOX_TIERS } from './data/boxes';
import { generateBoxForModeAndBet } from './data/gameModes';
import { sha256, generateRandomSeed, calculateRollOutcome } from './utils/crypto';
import { Header } from './components/Header';
import { UnifiedBoxConsole } from './components/UnifiedBoxConsole';
import { OddsModal } from './components/OddsModal';
import { UnboxReel } from './components/UnboxReel';
import { ProvablyFairModal } from './components/ProvablyFairModal';
import { RollHistory } from './components/RollHistory';
import { ResponsibleModal } from './components/ResponsibleModal';
import { ModelDistributionInspector } from './components/ModelDistributionInspector';
import { ConnectWalletModal } from './components/ConnectWalletModal';
import { AuthModal } from './components/AuthModal';
import { UserDashboardModal } from './components/UserDashboardModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { ManagerDashboardModal } from './components/ManagerDashboardModal';
import {
  getActiveUser,
  setActiveUser,
  connectUserWallet,
  disconnectUserWallet,
  adjustUserBalance,
  getStoredUsers,
} from './utils/userStore';
import {
  getManagerControls,
  applyManagerOverrides,
  recordLiveBet,
} from './utils/managerStore';
import { ShieldCheck, Sparkles, AlertTriangle, ExternalLink, HelpCircle, Lock } from 'lucide-react';

export default function App() {
  // Active Logged-in User
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getActiveUser());

  // Wallet State synchronized with active user
  const [wallet, setWallet] = useState<WalletState>(() => {
    const user = getActiveUser();
    return {
      balanceUsd: user.balanceUsd || 250.0,
      currency: 'USDC',
      dailySpendTotal: 0,
      dailySpendLimit: 9999999, // Limits OFF: Unlimited trading
      totalWonUsd: user.totalWonUsd || 0,
      totalOpened: user.boxesOpened || 0,
      soundEnabled: true,
    };
  });

  // Keep wallet balance in sync when active user changes
  useEffect(() => {
    setWallet((prev) => ({
      ...prev,
      balanceUsd: currentUser.balanceUsd,
      totalWonUsd: currentUser.totalWonUsd,
      totalOpened: currentUser.boxesOpened,
    }));
  }, [currentUser]);

  // Fixed game mode (Modes switch deactivated: locked on Crypto Moonshot) and customizable bet
  const [currentMode] = useState<GameMode>('hot');
  const [currentBet, setCurrentBet] = useState<number>(10.0);

  // Provably Fair Seeds
  const [provablyFair, setProvablyFair] = useState<ProvablyFairPair>({
    serverSeed: '',
    serverSeedHash: '',
    clientSeed: 'fair-client-' + Math.floor(Math.random() * 8999 + 1000),
    nonce: 1,
    revealedOldSeeds: [],
  });

  // Unbox reel active states
  const [activeOpeningBox, setActiveOpeningBox] = useState<BoxTier | null>(null);
  const [activeRollResult, setActiveRollResult] = useState<RollResult | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  // History
  const [rollHistory, setRollHistory] = useState<RollResult[]>(() => {
    const saved = localStorage.getItem('fairroll_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Modals
  const [selectedOddsBox, setSelectedOddsBox] = useState<BoxTier | null>(null);
  const [showProvablyFairModal, setShowProvablyFairModal] = useState(false);
  const [verifierPrefill, setVerifierPrefill] = useState<RollResult | null>(null);
  const [showResponsibleModal, setShowResponsibleModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New User & Web3 Modals
  const [showConnectWalletModal, setShowConnectWalletModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [showUserDashboardModal, setShowUserDashboardModal] = useState(false);
  const [userDashboardTab, setUserDashboardTab] = useState<
    'balance' | 'history' | 'profile' | 'verification' | 'wallet'
  >('balance');
  const [showAdminPanelModal, setShowAdminPanelModal] = useState(false);
  const [showManagerDashboardModal, setShowManagerDashboardModal] = useState(false);

  // Initialize initial Server Seed & Hash on mount
  useEffect(() => {
    const initSeed = async () => {
      const sSeed = generateRandomSeed(32);
      const sHash = await sha256(sSeed);
      setProvablyFair((prev) => ({
        ...prev,
        serverSeed: sSeed,
        serverSeedHash: sHash,
      }));
    };
    initSeed();
  }, []);

  // Save history updates
  useEffect(() => {
    localStorage.setItem('fairroll_history', JSON.stringify(rollHistory));
  }, [rollHistory]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Rotate Server Seed (reveals old seed to user)
  const handleRotateServerSeed = async () => {
    const newSeed = generateRandomSeed(32);
    const newHash = await sha256(newSeed);

    const oldRecord = {
      serverSeed: provablyFair.serverSeed,
      serverSeedHash: provablyFair.serverSeedHash,
      rolledCount: provablyFair.nonce - 1,
    };

    setProvablyFair((prev) => ({
      ...prev,
      serverSeed: newSeed,
      serverSeedHash: newHash,
      revealedOldSeeds: [oldRecord, ...(prev.revealedOldSeeds || [])],
    }));

    showToast('Server seed rotated! Previous seed is now visible for verification.');
  };

  // Update Client Seed
  const handleUpdateClientSeed = (newSeed: string) => {
    setProvablyFair((prev) => ({
      ...prev,
      clientSeed: newSeed,
    }));
    showToast('Client seed updated successfully.');
  };

  // Open Box Handler (All Limits OFF: Unlimited Trading)
  const handleOpenBox = async (box: BoxTier) => {
    if (isOpening) return;

    // Check balance; auto-replenish demo funds if needed
    // Manager Emergency & Maintenance Check
    const managerControls = getManagerControls();
    if (managerControls.emergencyStop) {
      showToast('⚠️ Game is temporarily frozen by Casino Manager. Please standby.');
      return;
    }

    let startingBalance = currentUser.balanceUsd;
    if (startingBalance < box.priceUsd) {
      const replenished = adjustUserBalance(
        currentUser.id,
        100.0,
        'faucet',
        'Auto-replenish Unlimited Play Demo Grant'
      );
      if (replenished) {
        setCurrentUser(replenished);
        startingBalance = replenished.balanceUsd;
      }
      showToast('Auto-replenished +$100.00 USDC demo funds!');
    }

    let sSeed = provablyFair.serverSeed;
    let sHash = provablyFair.serverSeedHash;
    if (!sSeed) {
      sSeed = generateRandomSeed(32);
      sHash = await sha256(sSeed);
      setProvablyFair((prev) => ({
        ...prev,
        serverSeed: sSeed,
        serverSeedHash: sHash,
      }));
    }

    setIsOpening(true);

    // Compute outcome deterministically
    const currentNonce = provablyFair.nonce;
    const { rollNumber: naturalRoll, item: naturalItem, wildBonus: naturalWild } = await calculateRollOutcome(
      sSeed,
      provablyFair.clientSeed,
      currentNonce,
      box.items
    );

    // Apply Manager Game Controls & Win/Loss Overrides if active
    const { rollNumber, wonItem: finalWonItem, wildBonus: finalWild } = applyManagerOverrides(
      box.items,
      naturalRoll,
      naturalItem,
      naturalWild
    );

    const rollRes: RollResult = {
      id: `${Date.now()}-${currentNonce}`,
      timestamp: Date.now(),
      boxId: box.id,
      boxName: box.name,
      boxPriceUsd: box.priceUsd,
      wonItem: finalWonItem,
      rollNumber,
      serverSeedHash: provablyFair.serverSeedHash,
      clientSeed: provablyFair.clientSeed,
      nonce: currentNonce,
      wildBonus: finalWild,
    };

    // Deduct entry price from user account
    const updatedUser = adjustUserBalance(
      currentUser.id,
      -box.priceUsd,
      'unbox_cost',
      `Unboxed ${box.name} ($${box.priceUsd.toFixed(2)})`
    );
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }

    // Increment nonce
    setProvablyFair((prev) => ({
      ...prev,
      nonce: prev.nonce + 1,
    }));

    setActiveOpeningBox(box);
    setActiveRollResult(rollRes);
    setTimeout(() => {
      document.getElementById('unbox-active-reel-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Reel finished callback
  const handleReelFinished = () => {
    setIsOpening(false);
    if (activeRollResult) {
      // Credit prize to user account in userStore
      const updatedUser = adjustUserBalance(
        currentUser.id,
        activeRollResult.wonItem.valueUsd,
        'unbox_win',
        `Prize won from ${activeRollResult.boxName}: ${activeRollResult.wonItem.name}`
      );
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }

      // Record in Manager Real-Time Telemetry & Live Bets Stream
      const profit = activeRollResult.wonItem.valueUsd - activeRollResult.boxPriceUsd;
      const multiplier = Number(
        (activeRollResult.wonItem.valueUsd / activeRollResult.boxPriceUsd).toFixed(2)
      );
      recordLiveBet({
        id: `bet-${activeRollResult.id}`,
        timestamp: Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        userAvatar: currentUser.avatar,
        boxId: activeRollResult.boxId,
        boxName: activeRollResult.boxName,
        wagerUsd: activeRollResult.boxPriceUsd,
        payoutUsd: activeRollResult.wonItem.valueUsd,
        profitUsd: Number(profit.toFixed(2)),
        isWin: profit > 0,
        isBigWin: profit > activeRollResult.boxPriceUsd * 3,
        isLoss: profit <= 0,
        multiplier,
        wonItemName: activeRollResult.wonItem.name,
        wildType: activeRollResult.wildBonus?.type,
        rollNumber: activeRollResult.rollNumber,
      });

      // Append to audited roll history
      setRollHistory((prev) => [activeRollResult, ...prev]);
    }
  };

  // Faucet Claim
  const handleClaimFaucet = () => {
    const updatedUser = adjustUserBalance(
      currentUser.id,
      50.0,
      'faucet',
      'Instant Testnet Faucet Claim (+$50)'
    );
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }
    showToast('+$50.00 USDC Testnet Faucet funds credited!');
  };

  const handleVerifyRoll = (roll: RollResult) => {
    setVerifierPrefill(roll);
    setShowProvablyFairModal(true);
  };

  // Connect Wallet handlers
  const handleWalletConnected = (connected: ConnectedWallet) => {
    const updated = connectUserWallet(currentUser.id, connected);
    if (updated) {
      setCurrentUser(updated);
    }
    showToast(`Connected ${connected.provider} (${connected.network})!`);
  };

  const handleWalletDisconnected = () => {
    const updated = disconnectUserWallet(currentUser.id);
    if (updated) {
      setCurrentUser(updated);
    }
    showToast('Wallet disconnected.');
  };

  const handleDepositFromConnectedWallet = (amountUsd: number) => {
    const updated = adjustUserBalance(
      currentUser.id,
      amountUsd,
      'deposit',
      `Deposit from connected ${currentUser.connectedWallet?.provider || 'Web3'} wallet`
    );
    if (updated) {
      setCurrentUser(updated);
    }
    showToast(`+$${amountUsd.toFixed(2)} USDC successfully deposited!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation & Header */}
      <Header
        wallet={wallet}
        user={currentUser}
        onCurrencyChange={(cur) => setWallet((prev) => ({ ...prev, currency: cur }))}
        onClaimFaucet={handleClaimFaucet}
        onToggleSound={() => setWallet((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
        onOpenProvablyFair={() => {
          setVerifierPrefill(null);
          setShowProvablyFairModal(true);
        }}
        onOpenResponsible={() => setShowResponsibleModal(true)}
        onOpenConnectWallet={() => setShowConnectWalletModal(true)}
        onOpenUserDashboard={(tab) => {
          if (tab) setUserDashboardTab(tab);
          setShowUserDashboardModal(true);
        }}
        onOpenAdminPanel={() => setShowAdminPanelModal(true)}
        onOpenManagerBackend={() => setShowManagerDashboardModal(true)}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'register');
          setShowAuthModal(true);
        }}
        serverSeedHash={provablyFair.serverSeedHash}
      />

      {/* Main Content Body */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 space-y-8">
        {/* Customizable Box Console (Fixed on Crypto Moonshot) */}
        <section className="space-y-4">
          <UnifiedBoxConsole
            currentMode={currentMode}
            currentBet={currentBet}
            onBetChange={setCurrentBet}
            onOpenBox={handleOpenBox}
            isOpening={isOpening}
            currency={wallet.currency}
            balanceUsd={wallet.balanceUsd}
            onOpenOddsModal={(b) => setSelectedOddsBox(b)}
          />
        </section>

        {/* Active Unboxing Reel Stage - Always Visible */}
        <section id="unbox-active-reel-section">
          <UnboxReel
            key={activeRollResult ? activeRollResult.id : `standby-${currentBet}`}
            box={activeOpeningBox || generateBoxForModeAndBet('hot', currentBet)}
            targetResult={activeRollResult}
            currency={wallet.currency}
            soundEnabled={wallet.soundEnabled}
            onFinished={handleReelFinished}
            onOpenAgain={() =>
              handleOpenBox(activeOpeningBox || generateBoxForModeAndBet('hot', currentBet))
            }
            onVerifyProof={(result) => handleVerifyRoll(result)}
          />
        </section>

        {/* Crypto Moonshot 10%/20%/30%/40% Model Inspector & Monte Carlo Simulator */}
        <ModelDistributionInspector
          customBox={generateBoxForModeAndBet('hot', currentBet)}
          onSelectBox={(b) => handleOpenBox(b)}
        />

        {/* Audit & Roll History Table */}
        <section>
          <RollHistory
            history={rollHistory}
            currency={wallet.currency}
            onVerifyRoll={handleVerifyRoll}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 px-4 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">FairRoll</span>
            <span>·</span>
            <span>Cryptographically Verified Micro-Ticket Protocol</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => {
                setUserDashboardTab('verification');
                setShowUserDashboardModal(true);
              }}
              className="hover:text-slate-200 transition-colors"
            >
              KYC & Verification
            </button>
            <span>·</span>
            <button
              onClick={() => setShowAdminPanelModal(true)}
              className="hover:text-purple-300 transition-colors text-purple-400 font-medium"
            >
              Admin Control Panel
            </button>
            <span>·</span>
            <button
              onClick={() => {
                setVerifierPrefill(null);
                setShowProvablyFairModal(true);
              }}
              className="hover:text-slate-200 transition-colors"
            >
              HMAC-SHA256 Verifier
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedOddsBox && (
        <OddsModal
          box={selectedOddsBox}
          currency={wallet.currency}
          onClose={() => setSelectedOddsBox(null)}
          onOpenVerifier={() => {
            setSelectedOddsBox(null);
            setShowProvablyFairModal(true);
          }}
        />
      )}

      {showProvablyFairModal && (
        <ProvablyFairModal
          pair={provablyFair}
          onUpdateClientSeed={handleUpdateClientSeed}
          onRotateServerSeed={handleRotateServerSeed}
          onClose={() => setShowProvablyFairModal(false)}
          prefillResult={verifierPrefill}
        />
      )}

      {showResponsibleModal && (
        <ResponsibleModal
          dailySpendTotal={wallet.dailySpendTotal}
          dailySpendLimit={wallet.dailySpendLimit}
          onUpdateLimit={(newLimit) =>
            setWallet((prev) => ({ ...prev, dailySpendLimit: newLimit }))
          }
          onResetSpend={() => setWallet((prev) => ({ ...prev, dailySpendTotal: 0 }))}
          onClose={() => setShowResponsibleModal(false)}
        />
      )}

      {/* Connect Wallet Modal */}
      <ConnectWalletModal
        isOpen={showConnectWalletModal}
        onClose={() => setShowConnectWalletModal(false)}
        connectedWallet={currentUser.connectedWallet}
        onConnect={handleWalletConnected}
        onDisconnect={handleWalletDisconnected}
        onDepositFromWallet={handleDepositFromConnectedWallet}
      />

      {/* Auth & Registration Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
        onAuthSuccess={(u) => {
          setCurrentUser(u);
          showToast(`Welcome, ${u.username}! Account active.`);
        }}
      />

      {/* User Dashboard Modal (Balance, History, Profile, Verification, Wallet) */}
      <UserDashboardModal
        isOpen={showUserDashboardModal}
        onClose={() => setShowUserDashboardModal(false)}
        user={currentUser}
        rollHistory={rollHistory}
        initialTab={userDashboardTab}
        onOpenConnectWallet={() => {
          setShowUserDashboardModal(false);
          setShowConnectWalletModal(true);
        }}
        onOpenVerifier={(roll) => {
          setShowUserDashboardModal(false);
          handleVerifyRoll(roll);
        }}
        onUserUpdated={(u) => setCurrentUser(u)}
        onClaimFaucet={handleClaimFaucet}
      />

      {/* Full User Admin Panel Modal */}
      <AdminPanelModal
        isOpen={showAdminPanelModal}
        onClose={() => setShowAdminPanelModal(false)}
        currentUser={currentUser}
        onUserSwitched={(u) => {
          setCurrentUser(u);
          showToast(`Switched active session to ${u.username}!`);
        }}
      />

      {/* Casino Manager Backend Modal */}
      <ManagerDashboardModal
        isOpen={showManagerDashboardModal}
        onClose={() => setShowManagerDashboardModal(false)}
        onControlsUpdated={(ctrl) => {
          if (ctrl.emergencyStop) {
            showToast('Casino game engine placed on EMERGENCY FREEZE.');
          } else {
            showToast('Game backend parameters updated live.');
          }
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-cyan-500/40 bg-slate-900/95 px-4 py-3 text-xs font-semibold text-cyan-200 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
