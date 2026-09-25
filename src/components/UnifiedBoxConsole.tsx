import React, { useState, useMemo } from 'react';
import {
  BoxItem,
  BoxTier,
  CryptoCurrency,
  GameMode,
} from '../types';
import {
  SUPPORTED_BETS,
  GAME_MODES_META,
  generateBoxForModeAndBet,
  GameModeMeta,
} from '../data/gameModes';
import { CRYPTO_RATES } from '../data/boxes';
import {
  Flame,
  Zap,
  Activity,
  Feather,
  PackageOpen,
  Crown,
  Sparkles,
  Shield,
  Coins,
  TrendingUp,
  Award,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  Play,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface UnifiedBoxConsoleProps {
  currentMode?: GameMode;
  currentBet: number;
  onModeChange?: (mode: GameMode) => void;
  onBetChange: (bet: number) => void;
  onOpenBox: (box: BoxTier) => void;
  isOpening: boolean;
  currency: CryptoCurrency;
  balanceUsd: number;
  onOpenOddsModal: (box: BoxTier) => void;
}

export const UnifiedBoxConsole: React.FC<UnifiedBoxConsoleProps> = ({
  currentMode = 'hot',
  currentBet,
  onModeChange,
  onBetChange,
  onOpenBox,
  isOpening,
  currency,
  balanceUsd,
  onOpenOddsModal,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLootTableExpanded, setIsLootTableExpanded] = useState(false);
  const [simResults, setSimResults] = useState<{
    simCount: number;
    totalReturned: number;
    hitsByTier: Record<string, number>;
  } | null>(null);

  // Active mode is locked to hot (Crypto Moonshot)
  const lockedMode: GameMode = 'hot';

  // Generate current BoxTier based on Crypto Moonshot and bet
  const activeBox = useMemo(() => {
    return generateBoxForModeAndBet(lockedMode, currentBet);
  }, [lockedMode, currentBet]);

  const activeMeta = GAME_MODES_META[lockedMode];

  const formatCurrency = (valUsd: number) => {
    if (currency === 'USDC') return `$${valUsd.toFixed(2)}`;
    const rate = CRYPTO_RATES[currency];
    const converted = valUsd / rate;
    if (currency === 'BTC') return `${converted.toFixed(6)} BTC`;
    if (currency === 'ETH') return `${converted.toFixed(5)} ETH`;
    return `${converted.toFixed(4)} SOL`;
  };

  const getModeIcon = (modeId: GameMode) => {
    switch (modeId) {
      case 'relaxed':
        return <Feather className="h-4 w-4 text-emerald-400" />;
      case 'dynamic':
        return <Activity className="h-4 w-4 text-cyan-400" />;
      case 'fever':
        return <Zap className="h-4 w-4 text-purple-400" />;
      case 'hot':
        return <Flame className="h-4 w-4 text-rose-400" />;
    }
  };

  const getItemIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Crown':
        return <Crown className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'TrendingUp':
        return <TrendingUp className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Shield':
        return <Shield className={className} />;
      default:
        return <Coins className={className} />;
    }
  };

  // Quick 100-roll Monte Carlo test
  const handleQuickSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      let totalRet = 0;
      const hits: Record<string, number> = {
        legendary: 0,
        epic: 0,
        rare: 0,
        uncommon: 0,
        common: 0,
      };

      for (let i = 0; i < 100; i++) {
        const rand = Math.random() * 100;
        let cumulative = 0;
        let won = activeBox.items[activeBox.items.length - 1];
        for (const item of activeBox.items) {
          cumulative += item.probability;
          if (rand < cumulative) {
            won = item;
            break;
          }
        }
        totalRet += won.valueUsd;
        hits[won.tier] = (hits[won.tier] || 0) + 1;
      }

      setSimResults({
        simCount: 100,
        totalReturned: totalRet,
        hitsByTier: hits,
      });
      setIsSimulating(false);
    }, 250);
  };

  return (
    <div
      id="unified-customizable-box-console"
      className="relative rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-sm overflow-hidden"
    >
      {/* Top Ambient Glow Banner */}
      <div
        className={`absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${activeMeta.glowColor} pointer-events-none opacity-40 transition-all duration-500`}
      />

      <div className="relative p-5 sm:p-7 space-y-6">
        {/* Header Bar: Mode Indicator & Odds Inspector link */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl border bg-slate-950/80 shadow-inner ${activeMeta.borderColor}`}
            >
              <Flame className="h-6 w-6 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-black tracking-tight text-white">
                  {activeMeta.name}
                </h3>
                <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[11px] font-mono text-slate-300">
                  RTP {activeMeta.rtp}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeMeta.tagline}
              </p>
            </div>
          </div>

          <button
            id="btn-inspect-custom-box-odds"
            onClick={() => onOpenOddsModal(activeBox)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-cyan-300 transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-400" />
            <span>Audited Probability Specs</span>
          </button>
        </div>

        {/* Customizable Bets Selection (12 Supported Bets) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Customisable Bet Amount
            </label>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Selected Bet:</span>
              <span className="font-mono font-bold text-cyan-300">
                ${currentBet.toFixed(2)} USDC
              </span>
            </div>
          </div>

          {/* Preset Buttons Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
            {SUPPORTED_BETS.map((betValue) => {
              const isSelected = currentBet === betValue;
              return (
                <button
                  key={betValue}
                  id={`btn-bet-${betValue.toString().replace('.', '-')}`}
                  type="button"
                  onClick={() => onBetChange(betValue)}
                  className={`rounded-lg py-2 px-1 text-xs font-mono font-bold border transition-all text-center ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-sm shadow-cyan-500/20'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  ${betValue.toFixed(2)}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Active Box Summary Showcase & Loot Table Preview (Foldable) */}
        <div id="loot-table-foldable-box" className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden transition-all">
          <button
            type="button"
            id="btn-toggle-loot-table"
            onClick={() => setIsLootTableExpanded((prev) => !prev)}
            aria-expanded={isLootTableExpanded}
            className="w-full p-4 flex flex-wrap items-center justify-between gap-3 text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <PackageOpen className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">
                Live Loot Table for ${currentBet.toFixed(2)} Bet
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                {isLootTableExpanded ? 'Tap to fold' : 'Tap to expand'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400">
                Top Payout Cap:{' '}
                <strong className="text-amber-400 font-mono">
                  {formatCurrency(activeBox.maxPrizeUsd)}
                </strong>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">
                Audited Return:{' '}
                <strong className="text-emerald-400 font-mono">
                  {activeBox.rtp}% RTP
                </strong>
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  isLootTableExpanded ? 'rotate-180 text-cyan-400' : ''
                }`}
              />
            </div>
          </button>

          {/* Loot Items Grid (Expands on click) */}
          {isLootTableExpanded && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-800/80">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {activeBox.items.map((item) => {
                  const mult = (item.valueUsd / currentBet).toFixed(1);
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-950 ${
                            item.tier === 'legendary'
                              ? 'text-amber-400'
                              : item.tier === 'epic'
                              ? 'text-purple-400'
                              : item.tier === 'rare'
                              ? 'text-cyan-400'
                              : item.tier === 'uncommon'
                              ? 'text-blue-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {item.tier}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-slate-400">
                          {item.probability}%
                        </span>
                      </div>

                      <div className="my-1 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-950 border border-slate-800">
                          {getItemIcon(item.icon, `h-3.5 w-3.5 ${item.color}`)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-xs font-bold text-white truncate">
                            {formatCurrency(item.valueUsd)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {mult}x multiplier
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 4. Main Action & Simulation Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Quick Simulation Output or Trigger */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="btn-quick-sim-100"
              type="button"
              disabled={isSimulating}
              onClick={handleQuickSimulation}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Simulating...' : 'Test 100 Rolls'}</span>
            </button>

            {simResults && (
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                100 Rolls: Returned ${simResults.totalReturned.toFixed(2)} on ${ (currentBet * 100).toFixed(2) } (
                {((simResults.totalReturned / (currentBet * 100)) * 100).toFixed(1)}% RTP)
              </span>
            )}
          </div>

          {/* Primary Unbox Button */}
          <button
            id="btn-open-custom-box-primary"
            type="button"
            disabled={isOpening}
            onClick={() => onOpenBox(activeBox)}
            className={`w-full sm:w-auto min-w-[240px] flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 font-bold text-sm text-slate-950 transition-all transform active:scale-98 shadow-lg ${
              isOpening
                ? 'bg-slate-700 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-rose-500 via-amber-400 to-rose-400 hover:brightness-110 shadow-rose-500/20'
            }`}
          >
            <PackageOpen className="h-5 w-5" />
            <span>
              {isOpening
                ? 'Spinning Reel...'
                : `Unbox Moonshot for $${currentBet.toFixed(2)} USDC`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
