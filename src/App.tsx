import React, { useState, useEffect, useMemo } from 'react';
import { BoxTier, CryptoCurrency, GameMode, ProvablyFairPair, RollResult, WalletState } from './types';
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
import { ShieldCheck, Sparkles, AlertTriangle, ExternalLink, HelpCircle, Lock } from 'lucide-react';

export default function App() {
  // Wallet State with LocalStorage fallbacks
  const [wallet, setWallet] = useState<WalletState>(() => {
    const saved = localStorage.getItem('fairroll_wallet');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.balanceUsd < 20) parsed.balanceUsd = 100.0;
        parsed.dailySpendLimit = 9999999; // Limits OFF: Unlimited trading
        return parsed;
      } catch {}
    }
    return {
      balanceUsd: 100.0,
      currency: 'USDC',
      dailySpendTotal: 0,
      dailySpendLimit: 9999999, // Limits OFF: Unlimited trading
      totalWonUsd: 0,
      totalOpened: 0,
      soundEnabled: true,
    };
  });

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

  // Save wallet updates
  useEffect(() => {
    localStorage.setItem('fairroll_wallet', JSON.stringify(wallet));
  }, [wallet]);

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

    // If balance is below ticket price, auto-replenish demo funds so trading never stops
    let startingBalance = wallet.balanceUsd;
    if (startingBalance < box.priceUsd) {
      startingBalance += 100.0;
      showToast('Auto-replenished +$100.00 USDC demo funds (Limits OFF · Unlimited Trading)!');
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
    const { rollNumber, item, wildBonus } = await calculateRollOutcome(
      sSeed,
      provablyFair.clientSeed,
      currentNonce,
      box.items
    );

    const rollRes: RollResult = {
      id: `${Date.now()}-${currentNonce}`,
      timestamp: Date.now(),
      boxId: box.id,
      boxName: box.name,
      boxPriceUsd: box.priceUsd,
      wonItem: item,
      rollNumber,
      serverSeedHash: provablyFair.serverSeedHash,
      clientSeed: provablyFair.clientSeed,
      nonce: currentNonce,
      wildBonus,
    };

    // Deduct entry price immediately with limits off
    setWallet((prev) => ({
      ...prev,
      balanceUsd: startingBalance - box.priceUsd,
      dailySpendTotal: prev.dailySpendTotal + box.priceUsd,
      totalOpened: prev.totalOpened + 1,
    }));

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
      // Credit prize to wallet
      setWallet((prev) => ({
        ...prev,
        balanceUsd: prev.balanceUsd + activeRollResult.wonItem.valueUsd,
        totalWonUsd: prev.totalWonUsd + activeRollResult.wonItem.valueUsd,
      }));

      // Append to audited roll history
      setRollHistory((prev) => [activeRollResult, ...prev]);
    }
  };

  // Faucet Claim
  const handleClaimFaucet = () => {
    setWallet((prev) => ({
      ...prev,
      balanceUsd: prev.balanceUsd + 50.0,
    }));
    showToast('+$50.00 USDC Testnet Faucet funds credited!');
  };

  const handleVerifyRoll = (roll: RollResult) => {
    setVerifierPrefill(roll);
    setShowProvablyFairModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation & Header */}
      <Header
        wallet={wallet}
        onCurrencyChange={(cur) => setWallet((prev) => ({ ...prev, currency: cur }))}
        onClaimFaucet={handleClaimFaucet}
        onToggleSound={() => setWallet((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
        onOpenProvablyFair={() => {
          setVerifierPrefill(null);
          setShowProvablyFairModal(true);
        }}
        onOpenResponsible={() => setShowResponsibleModal(true)}
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
            onOpenAgain={() => handleOpenBox(activeOpeningBox || generateBoxForModeAndBet('hot', currentBet))}
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
              onClick={() => setShowResponsibleModal(true)}
              className="hover:text-slate-200 transition-colors"
            >
              Responsible Gaming Policy
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
          onResetSpend={() =>
            setWallet((prev) => ({ ...prev, dailySpendTotal: 0 }))
          }
          onClose={() => setShowResponsibleModal(false)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-cyan-500/40 bg-slate-900/95 px-4 py-3 text-xs font-semibold text-cyan-200 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
