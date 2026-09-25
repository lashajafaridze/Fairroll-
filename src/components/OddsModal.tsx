import React, { useEffect } from 'react';
import { BoxTier, CryptoCurrency } from '../types';
import { CRYPTO_RATES } from '../data/boxes';
import { X, ShieldCheck, Calculator, Info, ExternalLink } from 'lucide-react';

interface OddsModalProps {
  box: BoxTier | null;
  currency: CryptoCurrency;
  onClose: () => void;
  onOpenVerifier: () => void;
}

export const OddsModal: React.FC<OddsModalProps> = ({
  box,
  currency,
  onClose,
  onOpenVerifier,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!box) return null;

  // Calculate cumulative probability ranges and EV contribution
  let currentStart = 0;
  const tableRows = box.items.map((item) => {
    const start = currentStart;
    const end = currentStart + item.probability;
    currentStart = end;
    const evContribution = (item.valueUsd * item.probability) / 100;
    const oneIn = (100 / item.probability).toFixed(1);

    return {
      ...item,
      rangeStart: start.toFixed(4),
      rangeEnd: end.toFixed(4),
      evContribution,
      oneIn,
    };
  });

  const totalEv = tableRows.reduce((acc, r) => acc + r.evContribution, 0);
  const houseEdge = (100 - box.rtp).toFixed(1);

  const formatPrice = (valUsd: number) => {
    if (currency === 'USDC') return `$${valUsd.toFixed(2)}`;
    const crypto = valUsd / CRYPTO_RATES[currency];
    if (currency === 'BTC') return `${crypto.toFixed(6)} BTC`;
    if (currency === 'ETH') return `${crypto.toFixed(5)} ETH`;
    return `${crypto.toFixed(3)} SOL`;
  };

  return (
    <div
      id="odds-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
    >
      <div
        id="odds-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-8 cursor-default animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {box.name} — Public Probability Table
              </h2>
              <p className="text-xs text-slate-400">Audited Mathematical Payouts & Drop Ranges</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
              ESC
            </span>
            <button
              id="btn-close-odds-modal"
              onClick={onClose}
              title="Close modal (Esc or click outside)"
              aria-label="Close modal"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/80 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* High-level Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-center">
            <span className="text-[11px] font-medium text-slate-400">Ticket Price</span>
            <div className="text-base font-bold text-white">${box.priceUsd.toFixed(2)}</div>
            <div className="text-[10px] text-slate-400">{formatPrice(box.priceUsd)}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-center">
            <span className="text-[11px] font-medium text-slate-400">Return to Player (RTP)</span>
            <div className="text-base font-bold text-emerald-400">{box.rtp}%</div>
            <div className="text-[10px] text-slate-400">Transparent & Capped</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-center">
            <span className="text-[11px] font-medium text-slate-400">Expected Value (EV)</span>
            <div className="text-base font-bold text-cyan-400">${totalEv.toFixed(3)}</div>
            <div className="text-[10px] text-slate-400">Per $1 spent</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-center">
            <span className="text-[11px] font-medium text-slate-400">Platform Reserve Fee</span>
            <div className="text-base font-bold text-slate-300">{houseEdge}%</div>
            <div className="text-[10px] text-slate-400">Protocol liquidity</div>
          </div>
        </div>

        {/* Probability Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Tier & Item</th>
                <th className="pb-3 font-semibold text-right">Value (USD)</th>
                <th className="pb-3 font-semibold text-right">Drop Chance</th>
                <th className="pb-3 font-semibold text-right">Odds Ratio</th>
                <th className="pb-3 font-semibold text-right font-mono">Roll Range (0-100)</th>
                <th className="pb-3 font-semibold text-right">EV Contrib.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tableRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 font-medium flex items-center gap-2">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        row.tier === 'legendary'
                          ? 'bg-amber-400 ring-2 ring-amber-400/30'
                          : row.tier === 'epic'
                          ? 'bg-purple-400'
                          : row.tier === 'rare'
                          ? 'bg-emerald-400'
                          : row.tier === 'uncommon'
                          ? 'bg-blue-400'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span className="text-white">{row.name}</span>
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-white">
                    ${row.valueUsd.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold text-cyan-300">
                    {row.probability.toFixed(2)}%
                  </td>
                  <td className="py-2.5 text-right text-slate-400">
                    1 in {row.oneIn}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-400 text-[11px]">
                    [{row.rangeStart} - {row.rangeEnd})
                  </td>
                  <td className="py-2.5 text-right font-mono text-emerald-400">
                    ${row.evContribution.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Verification Footer Link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/60 px-6 py-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Cryptographically generated via HMAC-SHA256 uniform distribution.</span>
          </div>
          <button
            id="btn-modal-open-verifier"
            onClick={() => {
              onClose();
              onOpenVerifier();
            }}
            className="flex items-center gap-1 font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Open Seed Verifier</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
