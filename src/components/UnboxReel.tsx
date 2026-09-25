import React, { useEffect, useRef, useState } from 'react';
import { BoxItem, BoxTier, CryptoCurrency, RollResult } from '../types';
import { CRYPTO_RATES } from '../data/boxes';
import { playTickSound, playWinSound } from '../utils/audio';
import { ShieldCheck, CheckCircle2, RotateCcw, ExternalLink, Sparkles, Bitcoin, Diamond, Zap } from 'lucide-react';

interface UnboxReelProps {
  box: BoxTier;
  targetResult: RollResult | null;
  currency: CryptoCurrency;
  soundEnabled: boolean;
  onFinished: () => void;
  onOpenAgain: () => void;
  onVerifyProof: (result: RollResult) => void;
}

export const UnboxReel: React.FC<UnboxReelProps> = ({
  box,
  targetResult,
  currency,
  soundEnabled,
  onFinished,
  onOpenAgain,
  onVerifyProof,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reelItems, setReelItems] = useState<BoxItem[]>([]);
  const [isSpinning, setIsSpinning] = useState(true);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [offset, setOffset] = useState(0);

  // Card dimensions: 130px width + 12px gap = 142px per item
  const ITEM_WIDTH = 130;
  const ITEM_GAP = 12;
  const STRIDE = ITEM_WIDTH + ITEM_GAP;
  const WINNER_INDEX = 45; // Place winning card at index 45 of 60 items

  useEffect(() => {
    // Helper to generate wild boxes with original site styling
    const createWildBox = (type: 'BTC' | 'ETH' | 'SOL', index: number): BoxItem => {
      const base = pool[index % pool.length];
      if (type === 'BTC') {
        return {
          ...base,
          id: `wild-btc-${index}`,
          name: 'Bitcoin Wild',
          valueUsd: Number((base.valueUsd * 10).toFixed(2)),
          tier: 'legendary',
          wildType: 'BTC',
          wildBoostPct: 1000,
        };
      }
      if (type === 'ETH') {
        return {
          ...base,
          id: `wild-eth-${index}`,
          name: 'Ethereum Wild',
          valueUsd: Number((base.valueUsd * 5).toFixed(2)),
          tier: 'epic',
          wildType: 'ETH',
          wildBoostPct: 500,
        };
      }
      return {
        ...base,
        id: `wild-sol-${index}`,
        name: 'Solana Wild',
        valueUsd: Number((base.valueUsd * 2).toFixed(2)),
        tier: 'rare',
        wildType: 'SOL',
        wildBoostPct: 100,
      };
    };

    const pool = box.items;

    if (!targetResult) {
      setIsSpinning(false);
      setHasRevealed(false);
      setOffset(0);

      // Generate initial carousel items from box pool with wild boxes visible
      const items: BoxItem[] = [];
      for (let i = 0; i < 60; i++) {
        if (i === 10) items.push(createWildBox('SOL', i));
        else if (i === 22) items.push(createWildBox('ETH', i));
        else if (i === 38) items.push(createWildBox('BTC', i));
        else if (i === 52) items.push(createWildBox('SOL', i));
        else items.push(pool[i % pool.length]);
      }
      setReelItems(items);
      return;
    }

    setIsSpinning(true);
    setHasRevealed(false);
    setOffset(0);

    // Generate reel of 60 items with winning item placed at WINNER_INDEX
    // and wild boxes placed across the reel so they are seen spinning and where they land
    const items: BoxItem[] = [];

    for (let i = 0; i < 60; i++) {
      if (i === WINNER_INDEX) {
        const wonItem = targetResult.wildBonus
          ? {
              ...targetResult.wonItem,
              wildType: targetResult.wildBonus.type,
              wildBoostPct: targetResult.wildBonus.boostPct,
            }
          : targetResult.wonItem;
        items.push(wonItem);
      } else if (i === 11) {
        items.push(createWildBox('SOL', i));
      } else if (i === 23) {
        items.push(createWildBox('ETH', i));
      } else if (i === 35) {
        items.push(createWildBox('BTC', i));
      } else if (i === 42 && !targetResult.wildBonus) {
        // Near-miss wild right before winner so the user sees where the wild was!
        items.push(createWildBox('ETH', i));
      } else if (i === 48 && !targetResult.wildBonus) {
        // Near-miss wild right after winner so the user sees where the wild was!
        items.push(createWildBox('BTC', i));
      } else if (i === 54) {
        items.push(createWildBox('SOL', i));
      } else {
        // Pseudo-random filler items from the box pool
        const randIdx = Math.floor(Math.random() * pool.length);
        items.push(pool[randIdx]);
      }
    }
    setReelItems(items);

    // Calculate landing translation
    // Container width will be measured
    let animFrame: number;
    const startTime = performance.now();
    const duration = 4800; // 4.8 seconds deceleration spin

    const startAnimation = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth || 800;
      const centerPoint = containerWidth / 2;

      // Centered precision alignment with subtle natural needle jitter [-8px, +8px]
      const cardCenter = WINNER_INDEX * STRIDE + ITEM_WIDTH / 2;
      const jitter = (Math.random() - 0.5) * 16;
      const targetOffset = -(cardCenter - centerPoint + jitter);

      let lastTickIndex = -1;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);

        // Cubic-bezier like easeOutExpo for realistic slot deceleration
        const easeOut = 1 - Math.pow(2, -10 * progress);
        const currentOffset = targetOffset * easeOut;

        setOffset(currentOffset);

        // Sound tick check
        const currentItemIndex = Math.floor(Math.abs(currentOffset) / STRIDE);
        if (currentItemIndex !== lastTickIndex && currentItemIndex < WINNER_INDEX + 3) {
          playTickSound(soundEnabled);
          lastTickIndex = currentItemIndex;
        }

        if (progress < 1) {
          animFrame = requestAnimationFrame(animate);
        } else {
          setIsSpinning(false);
          setHasRevealed(true);
          playWinSound(targetResult.wonItem.tier, soundEnabled);
          onFinished();
        }
      };

      animFrame = requestAnimationFrame(animate);
    };

    const timer = setTimeout(startAnimation, 100);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animFrame);
    };
  }, [targetResult?.id, box.id]);

  const formatPrice = (valUsd: number) => {
    if (currency === 'USDC') return `$${valUsd.toFixed(2)}`;
    const crypto = valUsd / CRYPTO_RATES[currency];
    if (currency === 'BTC') return `${crypto.toFixed(6)} BTC`;
    if (currency === 'ETH') return `${crypto.toFixed(5)} ETH`;
    return `${crypto.toFixed(3)} SOL`;
  };

  const getTierBorder = (tier: string) => {
    switch (tier) {
      case 'legendary':
        return 'border-amber-400 bg-amber-950/40 text-amber-300 shadow-amber-500/20';
      case 'epic':
        return 'border-purple-400 bg-purple-950/40 text-purple-300 shadow-purple-500/20';
      case 'rare':
        return 'border-emerald-400 bg-emerald-950/40 text-emerald-300 shadow-emerald-500/20';
      case 'uncommon':
        return 'border-blue-400 bg-blue-950/40 text-blue-300 shadow-blue-500/20';
      default:
        return 'border-slate-700 bg-slate-900/60 text-slate-300 shadow-transparent';
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-md">
      {/* Box Title & Live State */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white tracking-tight">{box.name}</span>
          <span className="text-xs text-slate-400">
            {targetResult ? `· Nonce #${targetResult.nonce}` : '· Standby'}
          </span>
          <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-400 border border-cyan-500/20">
            {isSpinning ? 'Unboxing...' : targetResult ? 'Outcome Confirmed' : 'Ready to Spin'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>Target Roll:</span>
          <span className="font-semibold text-cyan-300">
            {isSpinning ? 'Rolling...' : targetResult ? `${targetResult.rollNumber.toFixed(4)}%` : 'Ready'}
          </span>
        </div>
      </div>

      {/* Reel Carousel Viewer with Center Pointer */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 py-6">
        {/* Center Target Indicator Needle */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-0.5 -translate-x-1/2 bg-cyan-400 shadow-[0_0_12px_#22d3ee]">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-x-4 border-t-6 border-x-transparent border-t-cyan-400" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-x-4 border-b-6 border-x-transparent border-b-cyan-400" />
        </div>

        {/* Carousel Container */}
        <div ref={containerRef} className="relative h-36 w-full overflow-hidden">
          <div
            className="absolute left-0 flex items-center gap-3 transition-transform will-change-transform"
            style={{
              transform: `translate3d(${offset}px, 0, 0)`,
            }}
          >
            {reelItems.map((item, idx) => {
              const isWinner = !isSpinning && hasRevealed && idx === WINNER_INDEX;
              const isWild = Boolean(item.wildType);

              if (isWild) {
                const wildType = item.wildType!;
                const isBtc = wildType === 'BTC';
                const isEth = wildType === 'ETH';

                const cardBgBorder = isBtc
                  ? 'border-amber-400 bg-gradient-to-b from-amber-950/90 via-slate-900/95 to-amber-950/70 shadow-[0_0_18px_rgba(245,158,11,0.35)]'
                  : isEth
                  ? 'border-indigo-400 bg-gradient-to-b from-indigo-950/90 via-slate-900/95 to-indigo-950/70 shadow-[0_0_18px_rgba(99,102,241,0.35)]'
                  : 'border-cyan-400 bg-gradient-to-b from-cyan-950/90 via-slate-900/95 to-purple-950/70 shadow-[0_0_18px_rgba(34,211,238,0.35)]';

                const winnerRing = isBtc
                  ? 'ring-4 ring-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.8)]'
                  : isEth
                  ? 'ring-4 ring-indigo-400 shadow-[0_0_35px_rgba(99,102,241,0.8)]'
                  : 'ring-4 ring-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.8)]';

                return (
                  <div
                    key={`${item.id}-${idx}`}
                    style={{ width: `${ITEM_WIDTH}px` }}
                    className={`relative flex h-32 shrink-0 flex-col items-center justify-between rounded-lg border p-2.5 transition-all duration-300 ${cardBgBorder} ${
                      isWinner
                        ? `scale-110 ${winnerRing} z-30 opacity-100 animate-pulse`
                        : 'opacity-95 hover:opacity-100'
                    }`}
                  >
                    {/* Floating Winning Wild Hit Announcement */}
                    {isWinner && (
                      <div
                        className={`absolute -top-3 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-xl border bg-slate-950 animate-bounce flex items-center gap-1 ${
                          isBtc
                            ? 'border-amber-400 text-amber-300'
                            : isEth
                            ? 'border-indigo-400 text-indigo-300'
                            : 'border-cyan-400 text-cyan-300'
                        }`}
                      >
                        <Sparkles className="h-2.5 w-2.5 animate-spin" />
                        +{item.wildBoostPct}% WILD HIT!
                      </div>
                    )}

                    {/* Top Wild Multiplier Pill */}
                    <div
                      className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider shadow-sm ${
                        isBtc
                          ? 'bg-amber-500/25 border-amber-400/80 text-amber-300'
                          : isEth
                          ? 'bg-indigo-500/25 border-indigo-400/80 text-indigo-300'
                          : 'bg-cyan-500/25 border-cyan-400/80 text-cyan-300'
                      }`}
                    >
                      <Sparkles className="h-2 w-2" />
                      {item.wildBoostPct}% WILD
                    </div>

                    {/* Original Crypto Logo in site's style */}
                    {isBtc && (
                      <div className="relative my-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 p-[1.5px] shadow-[0_0_14px_rgba(245,158,11,0.6)]">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950/95 border border-amber-400/40">
                          <Bitcoin className="h-5 w-5 text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.9)]" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[8px] font-black text-slate-950 shadow">
                          10x
                        </div>
                      </div>
                    )}

                    {isEth && (
                      <div className="relative my-0.5 flex h-9 w-9 items-center justify-center rounded-xl rotate-45 bg-gradient-to-tr from-indigo-500 via-purple-500 to-indigo-200 p-[1.5px] shadow-[0_0_14px_rgba(99,102,241,0.6)]">
                        <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-950/95 -rotate-45 border border-indigo-400/40">
                          <Diamond className="h-5 w-5 text-indigo-300 drop-shadow-[0_0_5px_rgba(129,140,248,0.9)]" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 -rotate-45 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-400 text-[8px] font-black text-slate-950 shadow">
                          5x
                        </div>
                      </div>
                    )}

                    {!isBtc && !isEth && (
                      <div className="relative my-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-500 via-cyan-400 to-emerald-400 p-[1.5px] shadow-[0_0_14px_rgba(34,211,238,0.6)]">
                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-950/95 border border-cyan-400/40">
                          <Zap className="h-5 w-5 text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.9)]" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-[8px] font-black text-slate-950 shadow">
                          2x
                        </div>
                      </div>
                    )}

                    {/* Bottom Value & Name */}
                    <div className="text-center w-full">
                      <div
                        className={`text-sm font-black font-mono tracking-tight leading-none ${
                          isBtc ? 'text-amber-300' : isEth ? 'text-indigo-300' : 'text-cyan-300'
                        }`}
                      >
                        ${item.valueUsd.toFixed(2)}
                      </div>
                      <div
                        className={`text-[9px] font-extrabold uppercase tracking-wider mt-0.5 truncate ${
                          isBtc ? 'text-amber-400/90' : isEth ? 'text-indigo-400/90' : 'text-cyan-400/90'
                        }`}
                      >
                        {isBtc ? 'Bitcoin Wild' : isEth ? 'Ethereum Wild' : 'Solana Wild'}
                      </div>
                    </div>
                  </div>
                );
              }

              // Standard Regular Item Box
              return (
                <div
                  key={`${item.id}-${idx}`}
                  style={{ width: `${ITEM_WIDTH}px` }}
                  className={`relative flex h-32 shrink-0 flex-col items-center justify-between rounded-lg border p-3 transition-all duration-300 ${getTierBorder(
                    item.tier
                  )} ${isWinner ? 'scale-105 ring-2 ring-cyan-400 shadow-xl opacity-100' : 'opacity-80'}`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.tier}
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-white">
                      ${item.valueUsd >= 1 ? item.valueUsd.toFixed(2) : item.valueUsd.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{item.name}</div>
                  </div>
                  <div className="text-[9px] font-mono text-cyan-300/80">{item.probability}% drop</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Standby Status Bar when not spinning & not revealed */}
      {!isSpinning && !hasRevealed && !targetResult && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-800 bg-slate-900/50 py-3 px-4 text-xs text-slate-400 shadow-inner">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-300">Provably Fair Reel Standby</span>
            <span className="text-slate-500">· Ready for unboxing</span>
          </div>
          <span className="font-semibold text-cyan-400 font-mono">Click Unbox Moonshot to spin</span>
        </div>
      )}

      {/* Suspenseful Spinning Status Bar */}
      {isSpinning && (
        <div className="mt-4 flex items-center justify-center gap-2.5 rounded-xl border border-cyan-500/20 bg-slate-900/50 py-3.5 px-4 text-xs text-slate-300 shadow-inner">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-semibold text-cyan-300">Spinning Reel...</span>
          <span className="text-slate-400">Winning outcome revealed when wheel stops</span>
        </div>
      )}

      {/* Revealed Outcome & Cryptographic Proof Section - strictly only shown when stopped */}
      {!isSpinning && hasRevealed && targetResult && (
        <div
          id="unbox-revealed-outcome-card"
          className="mt-5 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-emerald-950/20 p-5 shadow-lg shadow-emerald-950/20 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left min-w-0 flex-1">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-emerald-400 flex items-center justify-center sm:justify-start gap-1.5 mb-0.5 whitespace-nowrap">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {targetResult.wonItem.valueUsd >= box.priceUsd
                      ? `Winner! +$${(targetResult.wonItem.valueUsd - box.priceUsd).toFixed(2)} Profit Credited`
                      : `Roll Complete · $${targetResult.wonItem.valueUsd.toFixed(2)} Return Credited`}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight whitespace-nowrap truncate">
                  {targetResult.wonItem.name}{' '}
                  <span className="text-emerald-400 font-extrabold ml-1">
                    (+${targetResult.wonItem.valueUsd.toFixed(2)} USD)
                  </span>
                </h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                  <span className="text-xs text-slate-300 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap">
                    Crypto: {formatPrice(targetResult.wonItem.valueUsd)}
                  </span>
                  <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 whitespace-nowrap">
                    Multiplier: {(targetResult.wonItem.valueUsd / box.priceUsd).toFixed(2)}x
                  </span>
                  {targetResult.wildBonus && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border whitespace-nowrap flex items-center gap-1 ${
                        targetResult.wildBonus.type === 'BTC'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          : targetResult.wildBonus.type === 'ETH'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                      }`}
                    >
                      {targetResult.wildBonus.type === 'BTC' && <Bitcoin className="h-3 w-3 text-amber-400" />}
                      {targetResult.wildBonus.type === 'ETH' && <Diamond className="h-3 w-3 text-indigo-400" />}
                      {targetResult.wildBonus.type === 'SOL' && <Zap className="h-3 w-3 text-cyan-400" />}
                      +{targetResult.wildBonus.boostPct}% {targetResult.wildBonus.type} Wild Hit!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="btn-reel-open-again"
                onClick={onOpenAgain}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20 active:scale-95"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Open Again (${box.priceUsd.toFixed(2)})</span>
              </button>

              <button
                id="btn-reel-verify-proof"
                onClick={() => onVerifyProof(targetResult)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs font-medium text-slate-200 hover:border-cyan-500 hover:text-white transition-colors active:scale-95"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>Verify Proof</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Seed Verification Bar */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-slate-800 pt-3 text-[11px] font-mono text-slate-400">
            <div>
              <span className="text-slate-500">Roll Result: </span>
              <span className="text-cyan-300 font-bold">{targetResult.rollNumber.toFixed(6)}%</span>
            </div>
            <div className="truncate">
              <span className="text-slate-500">Client Seed: </span>
              <span className="text-slate-300">{targetResult.clientSeed}</span>
            </div>
            <div className="truncate">
              <span className="text-slate-500">Server Hash: </span>
              <span className="text-slate-300">{targetResult.serverSeedHash.slice(0, 16)}...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
