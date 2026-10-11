import React from 'react';
import {
  ShieldCheck,
  Coins,
  RefreshCw,
  Volume2,
  VolumeX,
  Sparkles,
  Wallet,
  User,
  ShieldAlert,
  Crown,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { CryptoCurrency, WalletState, UserProfile } from '../types';
import { CRYPTO_RATES } from '../data/boxes';

interface HeaderProps {
  wallet: WalletState;
  user: UserProfile;
  onCurrencyChange: (c: CryptoCurrency) => void;
  onClaimFaucet: () => void;
  onToggleSound: () => void;
  onOpenProvablyFair: () => void;
  onOpenResponsible: () => void;
  onOpenConnectWallet: () => void;
  onOpenUserDashboard: (tab?: 'balance' | 'history' | 'profile' | 'verification' | 'wallet') => void;
  onOpenAdminPanel: () => void;
  onOpenManagerBackend: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  serverSeedHash: string;
}

export const Header: React.FC<HeaderProps> = ({
  wallet,
  user,
  onCurrencyChange,
  onClaimFaucet,
  onToggleSound,
  onOpenProvablyFair,
  onOpenResponsible,
  onOpenConnectWallet,
  onOpenUserDashboard,
  onOpenAdminPanel,
  onOpenManagerBackend,
  onOpenAuth,
  serverSeedHash,
}) => {
  const formatBalance = (amountUsd: number, cur: CryptoCurrency) => {
    if (cur === 'USDC') return `$${amountUsd.toFixed(2)}`;
    const cryptoVal = amountUsd / CRYPTO_RATES[cur];
    if (cur === 'BTC') return `${cryptoVal.toFixed(6)} BTC`;
    if (cur === 'ETH') return `${cryptoVal.toFixed(5)} ETH`;
    return `${cryptoVal.toFixed(4)} SOL`;
  };

  const isWalletConnected = Boolean(user.connectedWallet);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-3 sm:px-6 py-2.5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-md shadow-cyan-500/20 shrink-0">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-white">FairRoll</span>
          </div>
        </div>

        {/* Central Trust Pill: Active Provably Fair Seed Hash */}
        <button
          id="btn-header-provably-fair"
          onClick={onOpenProvablyFair}
          className="hidden xl:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500/40 transition-colors"
          title="Click to view & verify active cryptographic seed"
        >
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-slate-400">Server Seed Hash:</span>
          <span className="font-mono text-cyan-300 font-semibold">
            {serverSeedHash.slice(0, 10)}...{serverSeedHash.slice(-6)}
          </span>
          <span className="text-xs text-cyan-400 underline decoration-cyan-500/50">Verify</span>
        </button>

        {/* Right Section: Currency, Wallet, User Profile, Admin */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Currency Switcher */}
          <div className="hidden sm:flex rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs font-medium text-slate-400">
            {(['USDC', 'SOL', 'ETH', 'BTC'] as CryptoCurrency[]).map((cur) => (
              <button
                key={cur}
                onClick={() => onCurrencyChange(cur)}
                className={`rounded-md px-2 py-1 transition-colors ${
                  wallet.currency === cur
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'hover:text-slate-200'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>

          {/* Account Balance Badge (Clickable to open Balance Tab) */}
          <button
            onClick={() => onOpenUserDashboard('balance')}
            className="flex items-center rounded-lg border border-slate-800 bg-slate-900 px-2.5 sm:px-3 py-1.5 text-right hover:border-cyan-500/40 transition-colors"
            title="Click to manage Balance, Deposit & Withdraw"
          >
            <Coins className="mr-1.5 sm:mr-2 h-4 w-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white font-mono">
                {formatBalance(wallet.balanceUsd, wallet.currency)}
              </div>
              <div className="text-[10px] text-slate-400 hidden xs:block">
                ${wallet.balanceUsd.toFixed(2)} USD
              </div>
            </div>
          </button>

          {/* Testnet Faucet Button */}
          <button
            id="btn-claim-faucet"
            onClick={onClaimFaucet}
            className="hidden md:flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all"
            title="Claim +$50.00 Testnet Demo USDC"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Faucet +$50</span>
          </button>

          {/* CONNECT WALLET BUTTON */}
          <button
            id="btn-open-responsible"
            onClick={onOpenConnectWallet}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all shadow-sm ${
              isWalletConnected
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400'
                : 'border-cyan-500/50 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-cyan-500/10 text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(34,211,238,0.25)] animate-pulse'
            }`}
            title={
              isWalletConnected
                ? `Connected: ${user.connectedWallet?.address} (${user.connectedWallet?.network})`
                : 'Connect MetaMask, Phantom, or Web3 Wallet'
            }
          >
            {isWalletConnected ? (
              <>
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono text-[11px] truncate max-w-[80px] sm:max-w-[100px]">
                  {user.connectedWallet?.address.slice(0, 4)}...{user.connectedWallet?.address.slice(-3)}
                </span>
                <span className="hidden lg:inline text-[9px] rounded bg-emerald-500/20 px-1 py-0.2 text-emerald-300 uppercase">
                  {user.connectedWallet?.network}
                </span>
              </>
            ) : (
              <>
                <Wallet className="h-3.5 w-3.5 text-cyan-400" />
                <span>Connect Wallet</span>
              </>
            )}
          </button>

          {/* USER PROFILE BUTTON (Opens User Page with Balance, History, Profile, Verification, Wallet) */}
          <button
            id="btn-user-profile"
            onClick={() => onOpenUserDashboard('profile')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2 sm:px-2.5 py-1.5 text-xs text-white hover:border-cyan-500/40 hover:bg-slate-850 transition-colors"
            title="Open User Dashboard (Balance, History, Profile, Verification)"
          >
            <span className="text-base">{user.avatar}</span>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-bold text-xs leading-none truncate max-w-[80px]">
                {user.username}
              </span>
              <span className="text-[9px] font-mono text-cyan-300 uppercase tracking-wider leading-tight">
                {user.vipTier}
              </span>
            </div>
            {user.kyc.status === 'verified' && (
              <span
                className="h-3.5 w-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-bold border border-emerald-500/30"
                title="KYC Verified"
              >
                ✓
              </span>
            )}
          </button>

          {/* ADMIN PANEL BUTTON (Accessible to admin or testing) */}
          <button
            id="btn-open-admin-panel"
            onClick={onOpenAdminPanel}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-bold transition-all ${
              user.role === 'admin'
                ? 'border-purple-500/50 bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-purple-300 hover:border-purple-500/30'
            }`}
            title="Open Full User Admin Panel"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-purple-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* MANAGER BACKEND LOGIN & CONTROLS BUTTON */}
          <button
            id="btn-open-manager-backend"
            onClick={onOpenManagerBackend}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20 hover:border-red-400 transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
            title="Open Game Manager Backend (Live Stats, Win/Loss Engine & Controls)"
          >
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />
            <Lock className="h-3.5 w-3.5 text-red-400" />
            <span className="hidden xs:inline">Manager</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            className="hidden xs:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors"
            title={wallet.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {wallet.soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
            ) : (
              <VolumeX className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
