export type CryptoCurrency = 'USDC' | 'SOL' | 'ETH' | 'BTC';

export type GameMode = 'relaxed' | 'dynamic' | 'fever' | 'hot';

export interface BoxItem {
  id: string;
  name: string;
  valueUsd: number;
  cryptoEquivalent: {
    SOL: number;
    ETH: number;
    BTC: number;
  };
  probability: number; // Percentage, e.g., 42.50 means 42.50%
  tier: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  color: string;
  icon: string;
  wildType?: WildCryptoType;
  wildBoostPct?: number;
}

export interface BoxTier {
  id: string;
  name: string;
  subtitle: string;
  priceUsd: number;
  rtp: number; // e.g. 97.0 (%)
  maxPrizeUsd: number;
  tagline: string;
  items: BoxItem[];
  themeColor: {
    primary: string;
    border: string;
    badge: string;
    glow: string;
  };
}

export interface ProvablyFairPair {
  serverSeed: string; // Secret until rotated
  serverSeedHash: string; // Public SHA-256 hash of serverSeed
  clientSeed: string; // User configurable
  nonce: number; // Increments each roll
  revealedOldSeeds?: {
    serverSeed: string;
    serverSeedHash: string;
    rolledCount: number;
  }[];
}

export type WildCryptoType = 'BTC' | 'ETH' | 'SOL';

export interface WildBonus {
  type: WildCryptoType;
  name: string;
  boostPct: number; // 1000 (BTC), 500 (ETH), 100 (SOL)
  multiplier: number; // 10x, 5x, 2x
  baseValueUsd: number;
  finalValueUsd: number;
}

export interface RollResult {
  id: string;
  timestamp: number;
  boxId: string;
  boxName: string;
  boxPriceUsd: number;
  wonItem: BoxItem;
  rollNumber: number; // 0.000000 to 99.999999
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  serverSeedRevealed?: string;
  isVerified?: boolean;
  wildBonus?: WildBonus;
}

export interface WalletState {
  balanceUsd: number;
  currency: CryptoCurrency;
  dailySpendTotal: number;
  dailySpendLimit: number;
  totalWonUsd: number;
  totalOpened: number;
  soundEnabled: boolean;
}
