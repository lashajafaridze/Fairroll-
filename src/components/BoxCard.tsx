import React from 'react';
import { BoxTier, CryptoCurrency } from '../types';
import { CRYPTO_RATES } from '../data/boxes';
import { Package, ShieldAlert, Sparkles, Percent, ArrowUpRight, Award } from 'lucide-react';

interface BoxCardProps {
  box: BoxTier;
  currency: CryptoCurrency;
  balanceUsd: number;
  isOpening: boolean;
  onOpenBox: (box: BoxTier) => void;
  onViewOdds: (box: BoxTier) => void;
}

export const BoxCard: React.FC<BoxCardProps> = ({
  box,
  currency,
  balanceUsd,
  isOpening,
  onOpenBox,
  onViewOdds,
}) => {
  const canAfford = balanceUsd >= box.priceUsd;

  const formatPrice = (valUsd: number) => {
    if (currency === 'USDC') return `$${valUsd.toFixed(2)}`;
    const crypto = valUsd / CRYPTO_RATES[currency];
    if (currency === 'BTC') return `${crypto.toFixed(6)} BTC`;
    if (currency === 'ETH') return `${crypto.toFixed(5)} ETH`;
    return `${crypto.toFixed(3)} SOL`;
  };

  const topPrize = box.items.reduce((max, item) => (item.valueUsd > max.valueUsd ? item : max), box.items[0]);

  return (
    <div
      id={`box-card-${box.id}`}
      className={`group relative flex flex-col justify-between rounded-xl border bg-slate-900/90 p-5 transition-all duration-200 hover:shadow-xl hover:shadow-slate-950/50 ${box.themeColor.border}`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">{box.name}</h3>
              <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold border ${box.themeColor.badge}`}>
                {box.rtp}% RTP
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">{box.subtitle}</p>
          </div>

          <div className="text-right">
            <span className="text-lg font-extrabold text-white tracking-tight">
              ${box.priceUsd.toFixed(2)}
            </span>
            <div className="text-[10px] text-slate-400 font-mono">
              {formatPrice(box.priceUsd)}
            </div>
          </div>
        </div>

        {/* Box Graphical Showcase & Max Cap Pill */}
        <div className="my-5 rounded-lg border border-slate-800/80 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Payout Ceiling:</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <Award className="h-3.5 w-3.5" />
              Up to ${box.maxPrizeUsd.toFixed(2)} ({box.maxPrizeUsd / box.priceUsd}x Cap)
            </span>
          </div>

          {/* Mini Prize Preview Grid */}
          <div className="mt-3 grid grid-cols-5 gap-1.5 pt-2 border-t border-slate-800/60">
            {box.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center rounded bg-slate-900/60 p-1.5 text-center border border-slate-800/40"
                title={`${item.name} (${item.probability}%)`}
              >
                <span className={`text-[11px] font-bold ${item.color}`}>
                  ${item.valueUsd >= 1 ? item.valueUsd.toFixed(0) : item.valueUsd.toFixed(2)}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {item.probability}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="space-y-2 pt-2">
        <button
          id={`btn-open-box-${box.id}`}
          onClick={() => onOpenBox(box)}
          disabled={!canAfford || isOpening}
          className={`w-full flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-sm font-semibold transition-all ${
            !canAfford
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : isOpening
              ? 'bg-cyan-600/50 text-cyan-200 cursor-wait'
              : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 active:scale-[0.99]'
          }`}
        >
          <Package className="h-4 w-4" />
          {isOpening ? 'Opening Box...' : `Open 1x (${formatPrice(box.priceUsd)})`}
        </button>

        <button
          id={`btn-view-odds-${box.id}`}
          onClick={() => onViewOdds(box)}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 py-1.5 px-3 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
        >
          <Percent className="h-3 w-3 text-cyan-400" />
          <span>View Audited Odds & Math</span>
          <ArrowUpRight className="h-3 w-3 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
