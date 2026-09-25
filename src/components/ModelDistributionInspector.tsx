import React, { useState } from 'react';
import { BoxTier } from '../types';
import { Sparkles, Sliders, Calculator, Play, CheckCircle2, AlertCircle, ArrowDownCircle } from 'lucide-react';

interface ModelDistributionInspectorProps {
  customBox: BoxTier;
  onSelectBox: (box: BoxTier) => void;
}

export const ModelDistributionInspector: React.FC<ModelDistributionInspectorProps> = ({
  customBox,
  onSelectBox,
}) => {
  const [activeModelPreset, setActiveModelPreset] = useState<'calibrated' | 'normalized'>('calibrated');
  const [simulationResult, setSimulationResult] = useState<{
    total: number;
    tier10Count: number;
    tier20Count: number;
    tier30Count: number;
    tierLossCount: number;
    avgReturn: number;
  } | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);

  // Group items by the user's requested tiers
  const tier10Items = customBox.items.filter((i) => i.valueUsd >= 100 && i.tier !== 'rare');
  const tier20Items = customBox.items.filter((i) => i.valueUsd >= 70 && i.valueUsd <= 100 && i.tier === 'rare');
  const tier30Items = customBox.items.filter((i) => i.valueUsd >= 20 && i.valueUsd <= 50);
  const tierLossItems = customBox.items.filter((i) => i.valueUsd < 10);

  const tier10Prob = tier10Items.reduce((acc, i) => acc + i.probability, 0);
  const tier20Prob = tier20Items.reduce((acc, i) => acc + i.probability, 0);
  const tier30Prob = tier30Items.reduce((acc, i) => acc + i.probability, 0);
  const tierLossProb = tierLossItems.reduce((acc, i) => acc + i.probability, 0);

  // Fast Monte-Carlo simulation to prove empirical frequencies
  const handleSimulate1000 = () => {
    setIsSimulating(true);
    setTimeout(() => {
      let t10 = 0;
      let t20 = 0;
      let t30 = 0;
      let tLoss = 0;
      let totalReturn = 0;
      const count = 1000;

      for (let i = 0; i < count; i++) {
        const roll = Math.random() * 100;
        let cumulative = 0;
        for (const item of customBox.items) {
          cumulative += item.probability;
          if (roll < cumulative) {
            totalReturn += item.valueUsd;
            if (item.valueUsd >= 100 && item.tier !== 'rare') t10++;
            else if (item.valueUsd >= 70 && item.valueUsd <= 100 && item.tier === 'rare') t20++;
            else if (item.valueUsd >= 20 && item.valueUsd <= 50) t30++;
            else tLoss++;
            break;
          }
        }
      }

      setSimulationResult({
        total: count,
        tier10Count: t10,
        tier20Count: t20,
        tier30Count: t30,
        tierLossCount: tLoss,
        avgReturn: totalReturn / count,
      });
      setIsSimulating(false);
    }, 250);
  };

  return (
    <section className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/20 p-6 shadow-2xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300">
            <Sparkles className="h-3.5 w-3.5 text-rose-400" />
            Crypto Moonshot Distribution Active
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Crypto Moonshot Matrix (10% / 20% / 30% / 40%)
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Permanent high-volatility protocol: 10% Moonshots ($100–$800), 20% Diamond Strikes ($70–$100), 30% Crypto Gains ($20–$50), and 40% Liquid Floor ($2–$9 return).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-unbox-now-custom"
            onClick={() => onSelectBox(customBox)}
            className="flex items-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
          >
            <Play className="h-4 w-4 fill-slate-950" />
            <span>Unbox Moonshot ($10.00)</span>
          </button>
        </div>
      </div>

      {/* Visual Tiers Distribution Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tier 1: 10% ($100 - $800) */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              10% Moonshot Tier
            </span>
            <span className="font-mono text-sm font-black text-white">{tier10Prob.toFixed(1)}%</span>
          </div>
          <div className="text-xl font-extrabold text-amber-300">$100 – $800</div>
          <p className="text-[11px] text-slate-400">
            Drops: $800 Mega Moonshot (80x), $500 Whale Surge (50x), $250 Bull Run, $100 Alpha.
          </p>
          <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[10px] text-amber-400/80 font-mono">
            <span>Multiplier: 10x – 80x</span>
            <span>1 in 10 chance</span>
          </div>
        </div>

        {/* Tier 2: 20% ($70 - $100) */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              20% Diamond Tier
            </span>
            <span className="font-mono text-sm font-black text-white">{tier20Prob.toFixed(1)}%</span>
          </div>
          <div className="text-xl font-extrabold text-emerald-300">$70 – $100</div>
          <p className="text-[11px] text-slate-400">
            Drops: $100 Diamond Hands (10x), $85 Sat Stack (8.5x), $70 Node Payout (7x).
          </p>
          <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[10px] text-emerald-400/80 font-mono">
            <span>Multiplier: 7x – 10x</span>
            <span>1 in 5 chance</span>
          </div>
        </div>

        {/* Tier 3: 30% ($20 - $50) */}
        <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              30% Crypto Gain Tier
            </span>
            <span className="font-mono text-sm font-black text-white">{tier30Prob.toFixed(1)}%</span>
          </div>
          <div className="text-xl font-extrabold text-blue-300">$20 – $50</div>
          <p className="text-[11px] text-slate-400">
            Drops: $50 Block Reward (5x), $35 HODL Gain (3.5x), $20 Gas Rebate (2x).
          </p>
          <div className="pt-2 border-t border-blue-500/20 flex items-center justify-between text-[10px] text-blue-400/80 font-mono">
            <span>Multiplier: 2x – 5x</span>
            <span>1 in 3.3 chance</span>
          </div>
        </div>

        {/* Tier 4: Loss Tier (Players lose $1 - $10) */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              40% Floor Cushion Tier
            </span>
            <span className="font-mono text-sm font-black text-rose-400">{tierLossProb.toFixed(1)}%</span>
          </div>
          <div className="text-xl font-extrabold text-slate-300">$2 – $9 Partial Return</div>
          <p className="text-[11px] text-slate-400">
            On $10 ticket: Returns $9 (Micro Dip · 90%), $7 (Market Pullback), $5 (Half Liquidity), $2 (Bear Floor).
          </p>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Net Return: 20% – 90%</span>
            <span>40% probability</span>
          </div>
        </div>
      </div>

      {/* Probability Calibration & Monte Carlo Simulation Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-2.5 text-xs text-slate-400">
          <AlertCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-white font-semibold">Mathematical Sum Integrity: </span>
            <span>
              10% + 20% + 30% equals 60% winning chance. To ensure exact 100.0% probability without artificial skew, the loss bracket is precisely 40% (60% + 40% = 100.00%).
            </span>
          </div>
        </div>

        {/* Monte-Carlo 1000 Roll Tester */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            id="btn-simulate-1000"
            onClick={handleSimulate1000}
            disabled={isSimulating}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:border-cyan-500 hover:text-white px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors"
          >
            <Calculator className="h-3.5 w-3.5 text-cyan-400" />
            <span>{isSimulating ? 'Simulating...' : 'Simulate 1,000 Rolls'}</span>
          </button>
        </div>
      </div>

      {/* Simulation Results (if triggered) */}
      {simulationResult && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs font-mono animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-emerald-400 font-sans font-bold mb-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Empirical Results from {simulationResult.total} Simulated Rolls
            </span>
            <span className="text-white text-xs">
              Average Payout: ${simulationResult.avgReturn.toFixed(2)} per $10 Ticket
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded bg-slate-900/80 p-2 border border-slate-800">
              <span className="text-slate-400 text-[10px]">10% Tier ($100-$800)</span>
              <div className="text-sm font-bold text-amber-300">
                {simulationResult.tier10Count} hits ({(simulationResult.tier10Count / 10).toFixed(1)}%)
              </div>
            </div>
            <div className="rounded bg-slate-900/80 p-2 border border-slate-800">
              <span className="text-slate-400 text-[10px]">20% Tier ($70-$100)</span>
              <div className="text-sm font-bold text-emerald-300">
                {simulationResult.tier20Count} hits ({(simulationResult.tier20Count / 10).toFixed(1)}%)
              </div>
            </div>
            <div className="rounded bg-slate-900/80 p-2 border border-slate-800">
              <span className="text-slate-400 text-[10px]">30% Tier ($20-$50)</span>
              <div className="text-sm font-bold text-blue-300">
                {simulationResult.tier30Count} hits ({(simulationResult.tier30Count / 10).toFixed(1)}%)
              </div>
            </div>
            <div className="rounded bg-slate-900/80 p-2 border border-slate-800">
              <span className="text-slate-400 text-[10px]">Loss Tier (Lose $1-$10)</span>
              <div className="text-sm font-bold text-rose-300">
                {simulationResult.tierLossCount} hits ({(simulationResult.tierLossCount / 10).toFixed(1)}%)
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
