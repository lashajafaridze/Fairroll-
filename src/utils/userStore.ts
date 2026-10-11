import {
  UserProfile,
  UserTransaction,
  UserKYC,
  AuditLogEntry,
  AdminPlatformStats,
  ConnectedWallet,
  VIPLevel,
  CryptoCurrency,
} from '../types';
import { CRYPTO_RATES } from '../data/boxes';

const USERS_STORAGE_KEY = 'fairroll_users_v2';
const CURRENT_USER_KEY = 'fairroll_active_user_v2';
const TRANSACTIONS_KEY = 'fairroll_transactions_v2';
const AUDIT_LOGS_KEY = 'fairroll_audit_logs_v2';

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-admin-01',
    username: 'FairRollAdmin',
    email: 'admin@fairroll.io',
    avatar: '👑',
    role: 'admin',
    createdAt: Date.now() - 90 * 86400000,
    kyc: {
      status: 'verified',
      level: 2,
      fullName: 'Alexandre Vance',
      country: 'Switzerland',
      docType: 'passport',
      docNumber: 'CH-892144-V',
      submittedAt: Date.now() - 85 * 86400000,
      verifiedAt: Date.now() - 85 * 86400000,
    },
    twoFactorEnabled: true,
    vipTier: 'Diamond',
    balanceUsd: 15420.5,
    totalWageredUsd: 48920.0,
    totalWonUsd: 52140.0,
    boxesOpened: 420,
    isBanned: false,
    connectedWallet: {
      provider: 'MetaMask',
      address: '0x8849E7f8b9e1De29C5B72605e26b1E6D3A0A7129',
      network: 'Ethereum',
      connectedAt: Date.now() - 30 * 86400000,
      balanceCrypto: 4.82,
      balanceUsd: 15420.5,
    },
  },
  {
    id: 'user-player-01',
    username: 'CryptoVoyager',
    email: 'voyager@crypto.net',
    avatar: '🦊',
    role: 'user',
    createdAt: Date.now() - 14 * 86400000,
    kyc: {
      status: 'verified',
      level: 1,
      fullName: 'Jordan Miller',
      country: 'Germany',
      docType: 'id_card',
      docNumber: 'DE-49201991',
      submittedAt: Date.now() - 12 * 86400000,
      verifiedAt: Date.now() - 12 * 86400000,
    },
    twoFactorEnabled: false,
    vipTier: 'Silver',
    balanceUsd: 250.0,
    totalWageredUsd: 680.0,
    totalWonUsd: 795.0,
    boxesOpened: 46,
    isBanned: false,
    connectedWallet: {
      provider: 'Phantom',
      address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      network: 'Solana',
      connectedAt: Date.now() - 5 * 86400000,
      balanceCrypto: 1.45,
      balanceUsd: 250.0,
    },
  },
  {
    id: 'user-whale-02',
    username: 'MoonWhale_99',
    email: 'whale@apex.io',
    avatar: '🐳',
    role: 'user',
    createdAt: Date.now() - 40 * 86400000,
    kyc: {
      status: 'verified',
      level: 2,
      fullName: 'Elena Rostova',
      country: 'Estonia',
      docType: 'passport',
      docNumber: 'EE-991204',
      submittedAt: Date.now() - 38 * 86400000,
      verifiedAt: Date.now() - 37 * 86400000,
    },
    twoFactorEnabled: true,
    vipTier: 'Platinum',
    balanceUsd: 4180.25,
    totalWageredUsd: 14200.0,
    totalWonUsd: 15890.0,
    boxesOpened: 210,
    isBanned: false,
  },
  {
    id: 'user-pending-03',
    username: 'SatoshiSeeker',
    email: 'seeker@proton.me',
    avatar: '⚡',
    role: 'user',
    createdAt: Date.now() - 2 * 86400000,
    kyc: {
      status: 'pending',
      level: 2,
      fullName: 'Kenji Takahashi',
      country: 'Japan',
      docType: 'drivers_license',
      docNumber: 'JP-9281726',
      submittedAt: Date.now() - 1800000, // 30 mins ago
    },
    twoFactorEnabled: false,
    vipTier: 'Bronze',
    balanceUsd: 85.0,
    totalWageredUsd: 120.0,
    totalWonUsd: 95.0,
    boxesOpened: 14,
    isBanned: false,
  },
  {
    id: 'user-newbie-04',
    username: 'DeFiNinja',
    email: 'ninja@web3.xyz',
    avatar: '🥷',
    role: 'user',
    createdAt: Date.now() - 1 * 86400000,
    kyc: {
      status: 'unverified',
      level: 0,
    },
    twoFactorEnabled: false,
    vipTier: 'Bronze',
    balanceUsd: 45.0,
    totalWageredUsd: 30.0,
    totalWonUsd: 18.0,
    boxesOpened: 6,
    isBanned: false,
  },
];

const INITIAL_TRANSACTIONS: UserTransaction[] = [
  {
    id: 'tx-init-01',
    userId: 'user-player-01',
    type: 'faucet',
    amountUsd: 50.0,
    currency: 'USDC',
    cryptoAmount: 50.0,
    status: 'completed',
    timestamp: Date.now() - 5 * 86400000,
    note: 'Welcome Testnet Demo Drop',
  },
  {
    id: 'tx-init-02',
    userId: 'user-player-01',
    type: 'deposit',
    amountUsd: 200.0,
    currency: 'SOL',
    cryptoAmount: 1.16,
    status: 'completed',
    txHash: '0x99a2c3...f81a',
    timestamp: Date.now() - 3 * 86400000,
    note: 'Connected Phantom Wallet Deposit',
  },
  {
    id: 'tx-init-03',
    userId: 'user-player-01',
    type: 'unbox_win',
    amountUsd: 180.0,
    currency: 'USDC',
    cryptoAmount: 180.0,
    status: 'completed',
    timestamp: Date.now() - 1 * 86400000,
    note: 'Won Bitcoin Wild +1000% Multiplier',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-01',
    timestamp: Date.now() - 85 * 86400000,
    action: 'KYC_APPROVED',
    adminUsername: 'FairRollAdmin',
    targetUserId: 'user-admin-01',
    details: 'System automated Level 2 Passport verification approved.',
  },
  {
    id: 'log-02',
    timestamp: Date.now() - 12 * 86400000,
    action: 'KYC_APPROVED',
    adminUsername: 'FairRollAdmin',
    targetUserId: 'user-player-01',
    details: 'User ID card document approved for Level 1 verification.',
  },
];

export function getStoredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveStoredUsers(INITIAL_USERS);
  return INITIAL_USERS;
}

export function saveStoredUsers(users: UserProfile[]) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {}
}

export function getActiveUser(): UserProfile {
  const users = getStoredUsers();
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      const parsedId = JSON.parse(raw);
      const found = users.find((u) => u.id === parsedId || u.id === parsedId?.id);
      if (found && !found.isBanned) return found;
    }
  } catch {}
  // Default to player-01
  const defaultUser = users[1] || users[0];
  setActiveUser(defaultUser);
  return defaultUser;
}

export function setActiveUser(user: UserProfile) {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user.id));
  } catch {}
}

export function getStoredTransactions(userId?: string): UserTransaction[] {
  let txs: UserTransaction[] = [];
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (raw) txs = JSON.parse(raw);
    else {
      txs = INITIAL_TRANSACTIONS;
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
    }
  } catch {
    txs = INITIAL_TRANSACTIONS;
  }
  if (userId) {
    return txs.filter((t) => t.userId === userId).sort((a, b) => b.timestamp - a.timestamp);
  }
  return txs.sort((a, b) => b.timestamp - a.timestamp);
}

export function addStoredTransaction(tx: Omit<UserTransaction, 'id' | 'timestamp'>): UserTransaction {
  const all = getStoredTransactions();
  const newTx: UserTransaction = {
    ...tx,
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now(),
  };
  const updated = [newTx, ...all].slice(0, 500);
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
  } catch {}
  return newTx;
}

export function getStoredAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  try {
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
  } catch {}
  return INITIAL_AUDIT_LOGS;
}

export function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
  const logs = getStoredAuditLogs();
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now(),
  };
  const updated = [newEntry, ...logs].slice(0, 200);
  try {
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated));
  } catch {}
}

export function registerNewUser(
  username: string,
  email: string,
  avatar = '🚀'
): { user: UserProfile; error?: string } {
  const users = getStoredUsers();
  const cleanUsername = username.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
    return { user: users[0], error: 'Username already registered. Please choose another.' };
  }
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { user: users[0], error: 'Email address already associated with an account.' };
  }

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    username: cleanUsername,
    email: cleanEmail,
    avatar,
    role: 'user',
    createdAt: Date.now(),
    kyc: {
      status: 'unverified',
      level: 0,
    },
    twoFactorEnabled: false,
    vipTier: 'Bronze',
    balanceUsd: 100.0, // Free $100 Welcome Play Bonus!
    totalWageredUsd: 0,
    totalWonUsd: 0,
    boxesOpened: 0,
    isBanned: false,
  };

  const updatedUsers = [...users, newUser];
  saveStoredUsers(updatedUsers);
  setActiveUser(newUser);

  addStoredTransaction({
    userId: newUser.id,
    type: 'faucet',
    amountUsd: 100.0,
    currency: 'USDC',
    cryptoAmount: 100.0,
    status: 'completed',
    note: 'FairRoll Welcome $100 Sign-Up Bonus',
  });

  return { user: newUser };
}

export function updateUserProfile(
  userId: string,
  partial: Partial<UserProfile>
): UserProfile | null {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return null;

  const updatedUser = { ...users[index], ...partial };
  users[index] = updatedUser;
  saveStoredUsers(users);

  const active = getActiveUser();
  if (active.id === userId) {
    setActiveUser(updatedUser);
  }
  return updatedUser;
}

export function adjustUserBalance(
  userId: string,
  deltaUsd: number,
  type: UserTransaction['type'],
  note?: string,
  adminUsername?: string
): UserProfile | null {
  const users = getStoredUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  const newBalance = Math.max(0, Number((user.balanceUsd + deltaUsd).toFixed(2)));
  user.balanceUsd = newBalance;

  if (deltaUsd > 0 && (type === 'unbox_win' || type === 'deposit' || type === 'faucet')) {
    if (type === 'unbox_win') user.totalWonUsd += deltaUsd;
  }
  if (deltaUsd < 0 && type === 'unbox_cost') {
    user.totalWageredUsd += Math.abs(deltaUsd);
    user.boxesOpened += 1;
    // Check VIP progression based on wager
    if (user.totalWageredUsd >= 20000) user.vipTier = 'Diamond';
    else if (user.totalWageredUsd >= 5000) user.vipTier = 'Platinum';
    else if (user.totalWageredUsd >= 1000) user.vipTier = 'Gold';
    else if (user.totalWageredUsd >= 250) user.vipTier = 'Silver';
  }

  saveStoredUsers(users);

  addStoredTransaction({
    userId,
    type,
    amountUsd: Math.abs(deltaUsd),
    currency: 'USDC',
    cryptoAmount: Math.abs(deltaUsd),
    status: 'completed',
    note: note || (deltaUsd >= 0 ? 'Credit adjustment' : 'Debit adjustment'),
  });

  if (adminUsername) {
    addAuditLog({
      action: 'BALANCE_ADJUSTED',
      adminUsername,
      targetUserId: userId,
      details: `${deltaUsd >= 0 ? 'Added' : 'Deducted'} $${Math.abs(deltaUsd).toFixed(2)} to ${user.username}. New balance: $${newBalance.toFixed(2)}. Reason: ${note || 'Admin adjustment'}`,
    });
  }

  const active = getActiveUser();
  if (active.id === userId) {
    setActiveUser(user);
  }

  return user;
}

export function submitKYCDocuments(
  userId: string,
  fullName: string,
  country: string,
  docType: 'passport' | 'id_card' | 'drivers_license',
  docNumber: string
): UserProfile | null {
  const kycData: UserKYC = {
    status: 'pending',
    level: 2,
    fullName,
    country,
    docType,
    docNumber,
    submittedAt: Date.now(),
  };
  return updateUserProfile(userId, { kyc: kycData });
}

export function reviewKYCStatus(
  userId: string,
  action: 'approve' | 'reject',
  adminUsername: string,
  reason?: string
): UserProfile | null {
  const users = getStoredUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  if (action === 'approve') {
    user.kyc = {
      ...user.kyc,
      status: 'verified',
      level: 2,
      verifiedAt: Date.now(),
      rejectReason: undefined,
    };
    addAuditLog({
      action: 'KYC_APPROVED',
      adminUsername,
      targetUserId: userId,
      details: `Approved verification documents for ${user.username} (${user.email}). Level 2 KYC unlocked.`,
    });
  } else {
    user.kyc = {
      ...user.kyc,
      status: 'rejected',
      rejectReason: reason || 'Document image blurred or name mismatch.',
    };
    addAuditLog({
      action: 'KYC_REJECTED',
      adminUsername,
      targetUserId: userId,
      details: `Rejected verification for ${user.username}. Reason: ${reason || 'Unspecified document error'}`,
    });
  }

  saveStoredUsers(users);
  const active = getActiveUser();
  if (active.id === userId) {
    setActiveUser(user);
  }
  return user;
}

export function connectUserWallet(
  userId: string,
  wallet: ConnectedWallet
): UserProfile | null {
  return updateUserProfile(userId, { connectedWallet: wallet });
}

export function disconnectUserWallet(userId: string): UserProfile | null {
  const users = getStoredUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  user.connectedWallet = undefined;
  saveStoredUsers(users);

  const active = getActiveUser();
  if (active.id === userId) {
    setActiveUser(user);
  }
  return user;
}

export function calculatePlatformStats(): AdminPlatformStats {
  const users = getStoredUsers();
  const totalWagered = users.reduce((acc, u) => acc + (u.totalWageredUsd || 0), 0);
  const totalWon = users.reduce((acc, u) => acc + (u.totalWonUsd || 0), 0);
  const totalBoxes = users.reduce((acc, u) => acc + (u.boxesOpened || 0), 0);
  const houseProfit = totalWagered - totalWon;

  return {
    totalTurnoverUsd: Number(totalWagered.toFixed(2)),
    houseProfitUsd: Number(houseProfit.toFixed(2)),
    totalBoxesOpened: totalBoxes,
    totalRegisteredUsers: users.length,
    activePlayersToday: Math.max(3, users.filter((u) => !u.isBanned).length),
    averageRtp: totalWagered > 0 ? Number(((totalWon / totalWagered) * 100).toFixed(1)) : 97.4,
    globalHouseEdgePct: 2.6,
  };
}
