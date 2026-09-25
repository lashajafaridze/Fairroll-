import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Unlock } from 'lucide-react';

interface ResponsibleModalProps {
  dailySpendTotal: number;
  dailySpendLimit: number;
  onUpdateLimit: (newLimit: number) => void;
  onResetSpend: () => void;
  onClose: () => void;
}

export const ResponsibleModal: React.FC<ResponsibleModalProps> = ({
  dailySpendTotal,
  dailySpendLimit,
  onUpdateLimit,
  onResetSpend,
  onClose,
}) => {
  const isUnlimited = dailySpendLimit >= 999999;
  const [limitInput, setLimitInput] = useState(isUnlimited ? 9999999 : dailySpendLimit);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Close modal on 'Escape' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = (valToSave?: number) => {
    const val = valToSave !== undefined ? valToSave : Number(limitInput);
    onUpdateLimit(val);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const spendPct = isUnlimited ? 0 : Math.min(100, Math.round((dailySpendTotal / dailySpendLimit) * 100));

  return (
    <div
      id="responsible-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
    >
      <div
        id="responsible-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-6 cursor-default animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Unlock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Trading & Safety Controls</h2>
              <p className="text-xs text-slate-400">All limits currently disabled (Unlimited Trading)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
              ESC
            </span>
            <button
              id="btn-close-responsible-modal"
              onClick={onClose}
              title="Close modal (Esc or click outside)"
              aria-label="Close modal"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/80 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Limit Status Badge */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-emerald-300">All Limits OFF (Unlimited Trading)</span>
                <p className="text-[11px] text-slate-400">You can trade and unbox freely as much as you can.</p>
              </div>
            </div>
            <span className="font-mono text-xs font-black text-emerald-400">UNLIMITED</span>
          </div>

          {/* Spending Progress Bar */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-300">Session Spend Tracking</span>
              <span className="font-mono text-cyan-400">
                ${dailySpendTotal.toFixed(2)} spent / {isUnlimited ? '∞ Unlimited' : `$${dailySpendLimit.toFixed(2)}`}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full transition-all duration-300 bg-cyan-500"
                style={{ width: `${isUnlimited ? 100 : spendPct}%` }}
              />
            </div>
          </div>

          {/* Set Daily Limit or Keep OFF */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-200">
              Trading Limit Mode
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setLimitInput(9999999);
                  handleSave(9999999);
                }}
                className={`col-span-2 rounded-lg py-2 text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                  isUnlimited
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <Unlock className="h-3.5 w-3.5" />
                <span>Limits OFF (Unlimited)</span>
              </button>

              {[100, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setLimitInput(preset);
                    handleSave(preset);
                  }}
                  className={`rounded-lg py-2 text-xs font-bold border transition-colors ${
                    !isUnlimited && limitInput === preset
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  ${preset} Cap
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2 text-xs text-slate-400">$</span>
                <input
                  type="number"
                  min={5}
                  max={500}
                  value={limitInput}
                  onChange={(e) => setLimitInput(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-7 pr-3 py-2 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <button
                id="btn-save-daily-limit"
                onClick={() => handleSave()}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors"
              >
                {savedSuccess ? 'Saved' : 'Update Limit'}
              </button>
            </div>
          </div>

          {/* Safety & Compliance Comparison Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2.5 text-xs">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Transparent Micro-Ticket Safeguards
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Strict Micro Pricing:</strong> Tickets are strictly capped between $0.50 and $5.00. No monthly recurring drain.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Disclosed Return (RTP):</strong> Every crate has a public, mathematical RTP of 97.0%+ with clear EV contribution.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Hard Payout Caps:</strong> Strict 10x–25x prize ceiling ($5–$100) preventing misleading "up to $10M" false hope mechanics.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Provably Fair Seeds:</strong> Client seeds prevent operator manipulation; outcomes are verifiable via HMAC-SHA256.</span>
              </li>
            </ul>
          </div>

          {/* Reset Demo Spend Counter */}
          <div className="pt-2 flex justify-between items-center text-xs">
            <span className="text-slate-500">Testing your limits?</span>
            <button
              id="btn-reset-demo-spend"
              onClick={() => {
                onResetSpend();
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 2000);
              }}
              className="text-cyan-400 hover:underline"
            >
              Reset Spend Counter to $0.00
            </button>
          </div>
        </div>

        {/* Footer / Bottom Close Action */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/60 px-6 py-3.5">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            Press <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">Esc</kbd> or click outside to exit
          </span>
          <button
            id="btn-footer-close-responsible-modal"
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
          >
            <X className="h-3.5 w-3.5" />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
