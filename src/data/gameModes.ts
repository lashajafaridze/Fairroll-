import { BoxItem, BoxTier, CryptoCurrency, GameMode } from '../types';
import { CRYPTO_RATES } from './boxes';

export const SUPPORTED_BETS: number[] = [
  0.5, 1.0, 2.0, 3.0, 4.0, 5.0, 10.0, 20.0, 30.0, 40.0, 50.0, 100.0,
];

export interface GameModeMeta {
  id: GameMode;
  name: string;
  tagline: string;
  description: string;
  volatility: 'Low' | 'Medium' | 'High' | 'Extreme';
  badgeColor: string;
  accentColor: string;
  borderColor: string;
  bgGradient: string;
  glowColor: string;
  icon: string;
  rtp: number;
}

export const GAME_MODES_META: Record<GameMode, GameModeMeta> = {
  relaxed: {
    id: 'relaxed',
    name: 'Relaxed Play',
    tagline: 'Low Volatility · Smooth Runs · High Hit Frequency',
    description: 'Designed for extended play sessions with high hit rates and low variance cushions.',
    volatility: 'Low',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    bgGradient: 'from-emerald-950/40 via-slate-900 to-slate-950',
    glowColor: 'from-emerald-500/10 to-transparent',
    icon: 'Feather',
    rtp: 98.2,
  },
  dynamic: {
    id: 'dynamic',
    name: 'Dynamic Play',
    tagline: 'Balanced Flow · Classic Volatility · 25x Max Jackpot',
    description: 'The golden balance between consistent small gains and exciting multi-tier jackpot surges.',
    volatility: 'Medium',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    accentColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/30 hover:border-cyan-400',
    bgGradient: 'from-cyan-950/40 via-slate-900 to-slate-950',
    glowColor: 'from-cyan-500/10 to-transparent',
    icon: 'Activity',
    rtp: 97.8,
  },
  fever: {
    id: 'fever',
    name: 'Fever Play',
    tagline: 'Adrenaline High · Spiked Multipliers · 50x Mega Multiplier',
    description: 'Intense volatility crafted for thrill seekers chasing rapid escalations and 50x multipliers.',
    volatility: 'High',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/30 hover:border-purple-400',
    bgGradient: 'from-purple-950/40 via-slate-900 to-slate-950',
    glowColor: 'from-purple-500/10 to-transparent',
    icon: 'Zap',
    rtp: 98.0,
  },
  hot: {
    id: 'hot',
    name: 'Crypto Moonshot',
    tagline: '10% Moonshots (Up to 80x) · 20% Diamond Strikes · 30% Crypto Gains · 40% Floor',
    description: 'Permanent High-Heat Protocol: 10% massive moonshots up to 80x, 20% diamond hits, 30% block gains, 40% liquid floor variance.',
    volatility: 'Extreme',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    accentColor: 'text-rose-400',
    borderColor: 'border-rose-500/30 hover:border-rose-400',
    bgGradient: 'from-rose-950/40 via-slate-900 to-slate-950',
    glowColor: 'from-rose-500/10 to-transparent',
    icon: 'Flame',
    rtp: 98.5,
  },
};

interface ItemTemplate {
  name: (bet: number, mult: number) => string;
  multiplier: number;
  probability: number;
  tier: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  color: string;
  icon: string;
}

const MODE_ITEM_TEMPLATES: Record<GameMode, ItemTemplate[]> = {
  relaxed: [
    {
      name: (_, m) => `Zen Peak (${m}x)`,
      multiplier: 5.0,
      probability: 1.0,
      tier: 'legendary',
      color: 'text-amber-400',
      icon: 'Crown',
    },
    {
      name: (_, m) => `Calm Surge (${m}x)`,
      multiplier: 2.5,
      probability: 5.0,
      tier: 'epic',
      color: 'text-emerald-400',
      icon: 'Sparkles',
    },
    {
      name: (_, m) => `Smooth Wave (${m}x)`,
      multiplier: 1.8,
      probability: 10.0,
      tier: 'rare',
      color: 'text-teal-400',
      icon: 'TrendingUp',
    },
    {
      name: (_, m) => `Gentle Boost (${m}x)`,
      multiplier: 1.3,
      probability: 20.0,
      tier: 'uncommon',
      color: 'text-cyan-400',
      icon: 'Coins',
    },
    {
      name: (_, m) => `Safety Shield (${m}x)`,
      multiplier: 0.9,
      probability: 30.0,
      tier: 'common',
      color: 'text-slate-300',
      icon: 'Shield',
    },
    {
      name: (_, m) => `Soft Cushion (${m}x)`,
      multiplier: 0.3,
      probability: 34.0,
      tier: 'common',
      color: 'text-slate-500',
      icon: 'Coins',
    },
  ],

  dynamic: [
    {
      name: (_, m) => `Dynamic Apex (${m}x)`,
      multiplier: 20.0,
      probability: 1.0,
      tier: 'legendary',
      color: 'text-amber-400',
      icon: 'Crown',
    },
    {
      name: (_, m) => `Surge Strike (${m}x)`,
      multiplier: 7.0,
      probability: 2.5,
      tier: 'epic',
      color: 'text-cyan-400',
      icon: 'Sparkles',
    },
    {
      name: (_, m) => `Triple Momentum (${m}x)`,
      multiplier: 3.5,
      probability: 5.5,
      tier: 'rare',
      color: 'text-blue-400',
      icon: 'TrendingUp',
    },
    {
      name: (_, m) => `Solid Gain (${m}x)`,
      multiplier: 1.8,
      probability: 12.0,
      tier: 'uncommon',
      color: 'text-emerald-400',
      icon: 'Coins',
    },
    {
      name: (_, m) => `Half Return (${m}x)`,
      multiplier: 0.4,
      probability: 25.0,
      tier: 'common',
      color: 'text-slate-400',
      icon: 'Shield',
    },
    {
      name: (_, m) => `Rebound Dust (${m}x)`,
      multiplier: 0.15,
      probability: 54.0,
      tier: 'common',
      color: 'text-slate-500',
      icon: 'Coins',
    },
  ],

  fever: [
    {
      name: (_, m) => `Inferno Fever (${m}x)`,
      multiplier: 50.0,
      probability: 0.5,
      tier: 'legendary',
      color: 'text-amber-400',
      icon: 'Crown',
    },
    {
      name: (_, m) => `Neon Supernova (${m}x)`,
      multiplier: 20.0,
      probability: 1.5,
      tier: 'epic',
      color: 'text-purple-400',
      icon: 'Zap',
    },
    {
      name: (_, m) => `Electric Strike (${m}x)`,
      multiplier: 8.0,
      probability: 4.0,
      tier: 'rare',
      color: 'text-fuchsia-400',
      icon: 'Sparkles',
    },
    {
      name: (_, m) => `Fever Spark (${m}x)`,
      multiplier: 3.5,
      probability: 10.0,
      tier: 'uncommon',
      color: 'text-indigo-400',
      icon: 'TrendingUp',
    },
    {
      name: (_, m) => `Adrenaline Surge (${m}x)`,
      multiplier: 1.6,
      probability: 18.0,
      tier: 'uncommon',
      color: 'text-cyan-400',
      icon: 'Coins',
    },
    {
      name: (_, m) => `Ember Spark (${m}x · Return 70%)`,
      multiplier: 0.7,
      probability: 30.0,
      tier: 'common',
      color: 'text-slate-400',
      icon: 'Shield',
    },
    {
      name: (_, m) => `Rebound Spark (${m}x · Return 40%)`,
      multiplier: 0.4,
      probability: 36.0,
      tier: 'common',
      color: 'text-slate-500',
      icon: 'Coins',
    },
  ],

  hot: [
    // 10% Tier: Big wins up to 80x
    {
      name: (b) => `$${(b * 80).toFixed(0)} Mega Moonshot (80x)`,
      multiplier: 80.0,
      probability: 0.5,
      tier: 'legendary',
      color: 'text-amber-400',
      icon: 'Crown',
    },
    {
      name: (b) => `$${(b * 50).toFixed(0)} Whale Surge (50x)`,
      multiplier: 50.0,
      probability: 1.5,
      tier: 'legendary',
      color: 'text-amber-400',
      icon: 'Sparkles',
    },
    {
      name: (b) => `$${(b * 25).toFixed(0)} Bull Run Strike (25x)`,
      multiplier: 25.0,
      probability: 3.0,
      tier: 'epic',
      color: 'text-purple-400',
      icon: 'Zap',
    },
    {
      name: (b) => `$${(b * 10).toFixed(0)} Alpha Breakout (10x)`,
      multiplier: 10.0,
      probability: 5.0,
      tier: 'epic',
      color: 'text-purple-400',
      icon: 'Flame',
    },
    // 20% Tier: 7x - 10x
    {
      name: (b) => `$${(b * 10).toFixed(0)} Diamond Hands (10x)`,
      multiplier: 10.0,
      probability: 4.0,
      tier: 'rare',
      color: 'text-emerald-400',
      icon: 'Award',
    },
    {
      name: (b) => `$${(b * 8.5).toFixed(1)} Sat Stack (8.5x)`,
      multiplier: 8.5,
      probability: 6.0,
      tier: 'rare',
      color: 'text-emerald-400',
      icon: 'TrendingUp',
    },
    {
      name: (b) => `$${(b * 7).toFixed(1)} Node Payout (7x)`,
      multiplier: 7.0,
      probability: 10.0,
      tier: 'rare',
      color: 'text-emerald-400',
      icon: 'TrendingUp',
    },
    // 30% Tier: 2x - 5x
    {
      name: (b) => `$${(b * 5).toFixed(1)} Block Reward (5x)`,
      multiplier: 5.0,
      probability: 6.0,
      tier: 'uncommon',
      color: 'text-blue-400',
      icon: 'Coins',
    },
    {
      name: (b) => `$${(b * 3.5).toFixed(1)} HODL Gain (3.5x)`,
      multiplier: 3.5,
      probability: 10.0,
      tier: 'uncommon',
      color: 'text-blue-400',
      icon: 'Coins',
    },
    {
      name: (b) => `$${(b * 2).toFixed(1)} Gas Rebate (2x)`,
      multiplier: 2.0,
      probability: 14.0,
      tier: 'uncommon',
      color: 'text-blue-400',
      icon: 'Shield',
    },
    // 40% Tier: Lose portion of bet (0.2x - 0.9x partial return, never $0.00)
    {
      name: (b) => `$${(b * 0.9).toFixed(2)} (Micro Dip · 90% Return)`,
      multiplier: 0.9,
      probability: 10.0,
      tier: 'common',
      color: 'text-slate-400',
      icon: 'Shield',
    },
    {
      name: (b) => `$${(b * 0.7).toFixed(2)} (Market Pullback · 70% Return)`,
      multiplier: 0.7,
      probability: 10.0,
      tier: 'common',
      color: 'text-slate-400',
      icon: 'Coins',
    },
    {
      name: (b) => `$${(b * 0.5).toFixed(2)} (Half Liquidity · 50% Return)`,
      multiplier: 0.5,
      probability: 10.0,
      tier: 'common',
      color: 'text-slate-400',
      icon: 'Coins',
    },
    {
      name: (b) => `$${(b * 0.2).toFixed(2)} (Bear Floor · 20% Return)`,
      multiplier: 0.2,
      probability: 10.0,
      tier: 'common',
      color: 'text-slate-400',
      icon: 'Coins',
    },
  ],
};

/**
 * Builds a dynamic BoxTier from a chosen GameMode and custom bet
 */
export function generateBoxForModeAndBet(mode: GameMode, bet: number): BoxTier {
  const meta = GAME_MODES_META[mode];
  const templates = MODE_ITEM_TEMPLATES[mode];

  const items: BoxItem[] = templates.map((tpl, idx) => {
    const rawVal = bet * tpl.multiplier;
    const valueUsd = Number(rawVal.toFixed(2));
    return {
      id: `${mode}-${idx}-${bet}`,
      name: tpl.name(bet, tpl.multiplier),
      valueUsd,
      cryptoEquivalent: {
        SOL: valueUsd / CRYPTO_RATES.SOL,
        ETH: valueUsd / CRYPTO_RATES.ETH,
        BTC: valueUsd / CRYPTO_RATES.BTC,
      },
      probability: tpl.probability,
      tier: tpl.tier,
      color: tpl.color,
      icon: tpl.icon,
    };
  });

  const maxMultiplier = Math.max(...templates.map((t) => t.multiplier));
  const maxPrizeUsd = Number((bet * maxMultiplier).toFixed(2));

  return {
    id: `custom-box-${mode}-${bet}`,
    name: `${meta.name} ($${bet.toFixed(2)})`,
    subtitle: `${meta.tagline} · Capped at $${maxPrizeUsd.toFixed(2)} (${maxMultiplier}x)`,
    priceUsd: bet,
    rtp: meta.rtp,
    maxPrizeUsd,
    tagline: meta.tagline,
    themeColor: {
      primary: meta.accentColor,
      border: meta.borderColor,
      badge: meta.badgeColor,
      glow: meta.glowColor,
    },
    items,
  };
}
