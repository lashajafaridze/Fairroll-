import React, { useState } from 'react';
import { RollResult, CryptoCurrency } from '../types';
import { CRYPTO_RATES } from '../data/boxes';
import { History, ShieldCheck, ExternalLink, ArrowUpRight, MoreHorizontal } from 'lucide-react';

interface RollHistoryProps {
  history: RollResult[];
  currency: CryptoCurrency;
  onVerifyRoll: (result: RollResult) => void;
}

export const RollHistory: React.FC<RollHistoryProps> = ({
  history,
  currency,
  onVerifyRoll,
}) => {
  const [expanded, setExpanded] = useState(false);

  const formatPrice = (valUsd: number) => {
    if (currency === 'USDC') return `$${valUsd.toFixed(2)}`;
    const crypto = valUsd / CRYPTO_RATES[currency];
    if (currency === 'BTC') return `${crypto.toFixed(6)} BTC`;
    if (currency === 'ETH') return `${crypto.toFixed(5)} ETH`;
    return `${crypto.toFixed(3)} SOL`;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'legendary':
        return 'text-amber-400 font-bold';
      case 'epic':
        return 'text-purple-400 font-semibold';
      case 'rare':
        return 'text-emerald-400 font-semibold';
      case 'uncommon':
        return 'text-blue-400 font-medium';
      default:
        return 'text-slate-300';
    }
  };

  const visibleRolls = expanded ? history : history.slice(0, 6);
  const hiddenCount = Math.max(0, history.length - 6);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Recent Audited Rolls</h3>
          <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-400">
            {history.length} rolls {history.length > 6 && !expanded ? '(showing last 6)' : ''}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          Every spin is cryptographically recorded
        </span>
      </div>

      {history.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center text-slate-500">
          <p className="text-xs">No unboxings yet. Pick any micro-crate above to start playing.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="pb-2 font-semibold">Time</th>
                <th className="pb-2 font-semibold">Box</th>
                <th className="pb-2 font-semibold">Cost</th>
                <th className="pb-2 font-semibold">Won Item</th>
                <th className="pb-2 font-semibold text-right">Value (USD)</th>
                <th className="pb-2 font-semibold text-right font-mono">Roll %</th>
                <th className="pb-2 font-semibold text-right font-mono">Nonce</th>
                <th className="pb-2 font-semibold text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {visibleRolls.map((roll) => (
                <tr key={roll.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2 text-[11px] text-slate-400 font-sans">
                    {new Date(roll.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2 font-sans font-medium text-white">{roll.boxName}</td>
                  <td className="py-2 text-slate-400">${roll.boxPriceUsd.toFixed(2)}</td>
                  <td className={`py-2 font-sans ${getTierColor(roll.wonItem.tier)}`}>
                    {roll.wonItem.name}
                  </td>
                  <td className="py-2 text-right font-bold text-white">
                    ${roll.wonItem.valueUsd.toFixed(2)}
                  </td>
                  <td className="py-2 text-right text-cyan-300">
                    {roll.rollNumber.toFixed(4)}%
                  </td>
                  <td className="py-2 text-right text-slate-400">#{roll.nonce}</td>
                  <td className="py-2 text-right font-sans">
                    <button
                      id={`btn-verify-roll-${roll.id}`}
                      onClick={() => onVerifyRoll(roll)}
                      className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-cyan-400 hover:bg-slate-700 transition-colors"
                    >
                      <span>Verify</span>
                      <ArrowUpRight className="h-2.5 w-2.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Show "..." for remaining rolls beyond last 6 */}
              {history.length > 6 && !expanded && (
                <tr
                  id="row-history-ellipsis"
                  onClick={() => setExpanded(true)}
                  className="bg-slate-900/50 hover:bg-slate-800/50 cursor-pointer transition-colors"
                  title="Click to expand older rolls"
                >
                  <td colSpan={8} className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <span className="font-mono text-lg font-black tracking-widest text-cyan-400">...</span>
                      <span className="text-[11px] text-slate-400 font-sans">
                        ({hiddenCount} older rolls archived · click to expand)
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {/* Option to collapse back if expanded */}
              {history.length > 6 && expanded && (
                <tr
                  id="row-history-collapse"
                  onClick={() => setExpanded(false)}
                  className="bg-slate-900/50 hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td colSpan={8} className="py-2.5 text-center text-slate-400 font-sans text-[11px]">
                    ▲ Collapse back to last 6 rolls
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
