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

export type VIPLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
export type KYCStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type WalletProvider = 'MetaMask' | 'Phantom' | 'WalletConnect' | 'Coinbase' | 'Solflare';
export type CryptoNetwork = 'Ethereum' | 'Solana' | 'Polygon' | 'Arbitrum' | 'Base';

export interface ConnectedWallet {
  provider: WalletProvider;
  address: string;
  network: CryptoNetwork;
  connectedAt: number;
  balanceCrypto: number;
  balanceUsd: number;
}

export interface UserKYC {
  status: KYCStatus;
  level: number; // 0: None, 1: Basic, 2: Document Verified
  fullName?: string;
  country?: string;
  docType?: 'passport' | 'id_card' | 'drivers_license';
  docNumber?: string;
  submittedAt?: number;
  verifiedAt?: number;
  rejectReason?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  createdAt: number;
  kyc: UserKYC;
  twoFactorEnabled: boolean;
  vipTier: VIPLevel;
  balanceUsd: number;
  totalWageredUsd: number;
  totalWonUsd: number;
  boxesOpened: number;
  isBanned: boolean;
  connectedWallet?: ConnectedWallet;
}

export type TransactionType =
  | 'deposit'
  | 'withdraw'
  | 'faucet'
  | 'unbox_win'
  | 'unbox_cost'
  | 'admin_adjustment';

export interface UserTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amountUsd: number;
  currency: CryptoCurrency;
  cryptoAmount: number;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
  timestamp: number;
  note?: string;
}

export interface AdminPlatformStats {
  totalTurnoverUsd: number;
  houseProfitUsd: number;
  totalBoxesOpened: number;
  totalRegisteredUsers: number;
  activePlayersToday: number;
  averageRtp: number;
  globalHouseEdgePct: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: string;
  adminUsername: string;
  targetUserId?: string;
  details: string;
}

export type ManagerOutcomeOverride = 'natural' | 'force_big_win' | 'force_jackpot' | 'force_loss' | 'force_wild_btc' | 'force_wild_eth' | 'force_wild_sol';

export type VolatilityMode = 'standard' | 'low_volatility' | 'high_roller' | 'frenzy';

export interface ManagerGameControls {
  // Global win/loss bias: -50 (maximum house squeeze/loss) to +50 (player lucky boost)
  winLossBias: number;
  // Specific forced outcome for upcoming rolls
  outcomeOverride: ManagerOutcomeOverride;
  // Volatility mode
  volatility: VolatilityMode;
  // Live RTP target override (e.g. 96.5%)
  targetRtp: number;
  // Wild Multiplier bonus rate boost (1.0x to 5.0x)
  wildBonusRateMultiplier: number;
  // Global house edge percentage
  houseEdgePct: number;
  // Game maintenance or frozen state
  isMaintenanceMode: boolean;
  // Emergency stop on unboxing
  emergencyStop: boolean;
  // Force jackpot alert trigger
  forceJackpotNext: boolean;
  // Speed multiplier for spin reel (1x, 2x, 4x, instant)
  spinSpeedMultiplier: number;
}

export interface LiveGameBet {
  id: string;
  timestamp: number;
  userId: string;
  username: string;
  userAvatar: string;
  boxId: string;
  boxName: string;
  wagerUsd: number;
  payoutUsd: number;
  profitUsd: number; // payout - wager (positive = user won, negative = house won)
  isWin: boolean;
  isBigWin: boolean;
  isLoss: boolean;
  multiplier: number;
  wonItemName: string;
  wildType?: 'BTC' | 'ETH' | 'SOL';
  rollNumber: number;
}

export interface ManagerStatsRealtime {
  totalGrossBetsUsd: number;
  totalGrossPayoutsUsd: number;
  netHouseProfitUsd: number;
  totalBetsCount: number;
  totalWinsCount: number;
  totalLossesCount: number;
  currentWinRatePct: number;
  realizedRtpPct: number;
  activeOnlinePlayers: number;
  biggestWinTodayUsd: number;
  biggestWinnerUsername: string;
}
