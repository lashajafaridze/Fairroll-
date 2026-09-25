import React from 'react';
import { ShieldCheck, Coins, RefreshCw, Volume2, VolumeX, AlertCircle, Sparkles, Unlock } from 'lucide-react';
import { CryptoCurrency, WalletState } from '../types';
import { CRYPTO_RATES } from '../data/boxes';

interface HeaderProps {
  wallet: WalletState;
  onCurrencyChange: (c: CryptoCurrency) => void;
  onClaimFaucet: () => void;
  onToggleSound: () => void;
  onOpenProvablyFair: () => void;
  onOpenResponsible: () => void;
  serverSeedHash: string;
}

export const Header: React.FC<HeaderProps> = ({
  wallet,
  onCurrencyChange,
  onClaimFaucet,
  onToggleSound,
  onOpenProvablyFair,
  onOpenResponsible,
  serverSeedHash,
}) => {
  const formatBalance = (amountUsd: number, cur: CryptoCurrency) => {
    if (cur === 'USDC') return `$${amountUsd.toFixed(2)}`;
    const cryptoVal = amountUsd / CRYPTO_RATES[cur];
    if (cur === 'BTC') return `${cryptoVal.toFixed(6)} BTC`;
    if (cur === 'ETH') return `${cryptoVal.toFixed(5)} ETH`;
    return `${cryptoVal.toFixed(4)} SOL`;
  };

  const spendPct = Math.min(100, Math.round((wallet.dailySpendTotal / wallet.dailySpendLimit) * 100));

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-md shadow-cyan-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">FairRoll</span>
          </div>
        </div>

        {/* Central Trust Pill: Active Provably Fair Seed Hash */}
        <button
          id="btn-header-provably-fair"
          onClick={onOpenProvablyFair}
          className="hidden lg:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500/40 transition-colors"
          title="Click to view & verify active cryptographic seed"
        >
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-slate-400">Server Seed Hash:</span>
          <span className="font-mono text-cyan-300 font-semibold">{serverSeedHash.slice(0, 10)}...{serverSeedHash.slice(-6)}</span>
          <span className="text-xs text-cyan-400 underline decoration-cyan-500/50">Verify</span>
        </button>

        {/* Right Section: Controls & Wallet */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs font-medium text-slate-400">
            {(['USDC', 'SOL', 'ETH', 'BTC'] as CryptoCurrency[]).map((cur) => (
              <button
                key={cur}
                onClick={() => onCurrencyChange(cur)}
                className={`rounded-md px-2 py-1 transition-colors ${
                  wallet.currency === cur ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'hover:text-slate-200'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>

          {/* Wallet Balance Badge */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-right">
            <Coins className="mr-2 h-4 w-4 text-cyan-400" />
            <div>
              <div className="text-xs font-semibold text-white">
                {formatBalance(wallet.balanceUsd, wallet.currency)}
              </div>
              <div className="text-[10px] text-slate-400">
                ${wallet.balanceUsd.toFixed(2)} USD
              </div>
            </div>
          </div>

          {/* Testnet Faucet Button */}
          <button
            id="btn-claim-faucet"
            onClick={onClaimFaucet}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all"
            title="Claim +$50.00 Testnet Demo USDC"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Faucet +$50</span>
          </button>

          {/* Responsible Gaming Tool / Limits Status */}
          <button
            id="btn-open-responsible"
            onClick={onOpenResponsible}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all"
            title="All Limits OFF: Unlimited Trading Enabled"
          >
            <Unlock className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden md:inline">Limits: OFF (Unlimited)</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors"
            title={wallet.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {wallet.soundEnabled ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
