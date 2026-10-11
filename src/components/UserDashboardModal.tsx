import React, { useState } from 'react';
import {
  User,
  Wallet,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  Crown,
  Sparkles,
  ExternalLink,
  Upload,
  X,
  FileText,
  Lock,
  LogOut,
  Zap,
} from 'lucide-react';
import {
  UserProfile,
  UserTransaction,
  RollResult,
  CryptoCurrency,
  ConnectedWallet,
  VIPLevel,
} from '../types';
import { CRYPTO_RATES } from '../data/boxes';
import {
  getStoredTransactions,
  adjustUserBalance,
  submitKYCDocuments,
  disconnectUserWallet,
  updateUserProfile,
} from '../utils/userStore';

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  rollHistory: RollResult[];
  onOpenConnectWallet: () => void;
  onOpenVerifier: (roll: RollResult) => void;
  onUserUpdated: (updatedUser: UserProfile) => void;
  onClaimFaucet: () => void;
  initialTab?: 'balance' | 'history' | 'profile' | 'verification' | 'wallet';
}

const VIP_TIER_DETAILS: Record<
  VIPLevel,
  { rakeback: number; nextTarget: number; color: string; badgeBg: string }
> = {
  Bronze: { rakeback: 5, nextTarget: 250, color: 'text-amber-500', badgeBg: 'bg-amber-500/10 border-amber-500/30' },
  Silver: { rakeback: 7.5, nextTarget: 1000, color: 'text-slate-300', badgeBg: 'bg-slate-300/10 border-slate-300/30' },
  Gold: { rakeback: 10, nextTarget: 5000, color: 'text-yellow-400', badgeBg: 'bg-yellow-400/10 border-yellow-400/30' },
  Platinum: { rakeback: 12.5, nextTarget: 20000, color: 'text-cyan-400', badgeBg: 'bg-cyan-400/10 border-cyan-400/30' },
  Diamond: { rakeback: 15, nextTarget: 50000, color: 'text-purple-400', badgeBg: 'bg-purple-400/10 border-purple-400/30' },
};

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({
  isOpen,
  onClose,
  user,
  rollHistory,
  onOpenConnectWallet,
  onOpenVerifier,
  onUserUpdated,
  onClaimFaucet,
  initialTab = 'balance',
}) => {
  const [activeTab, setActiveTab] = useState<
    'balance' | 'history' | 'profile' | 'verification' | 'wallet'
  >(initialTab);

  // Balance tab states
  const [depositCurrency, setDepositCurrency] = useState<CryptoCurrency>('USDC');
  const [depositAmount, setDepositAmount] = useState('50');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [copiedAddr, setCopiedAddr] = useState(false);

  // KYC tab states
  const [kycFullName, setKycFullName] = useState(user.kyc.fullName || '');
  const [kycCountry, setKycCountry] = useState(user.kyc.country || 'United States');
  const [kycDocType, setKycDocType] = useState<'passport' | 'id_card' | 'drivers_license'>(
    user.kyc.docType || 'passport'
  );
  const [kycDocNum, setKycDocNum] = useState(user.kyc.docNumber || '');
  const [kycUploadedFileName, setKycUploadedFileName] = useState<string | null>(null);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [kycFeedback, setKycFeedback] = useState<string | null>(null);

  // Profile states
  const [avatarEditing, setAvatarEditing] = useState(false);

  if (!isOpen) return null;

  const transactions = getStoredTransactions(user.id);
  const vipInfo = VIP_TIER_DETAILS[user.vipTier] || VIP_TIER_DETAILS.Bronze;
  const vipProgress = Math.min(100, Math.round((user.totalWageredUsd / vipInfo.nextTarget) * 100));

  const handleCopyDepositAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const handleSimulateDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;
    const updated = adjustUserBalance(
      user.id,
      amt,
      'deposit',
      `Manual Crypto Deposit: ${amt} ${depositCurrency}`
    );
    if (updated) {
      onUserUpdated(updated);
    }
  };

  const handleSimulateWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawMsg(null);
    const amt = parseFloat(withdrawAmount);

    if (isNaN(amt) || amt <= 0) {
      setWithdrawMsg({ type: 'error', text: 'Enter a valid withdrawal amount.' });
      return;
    }
    if (amt > user.balanceUsd) {
      setWithdrawMsg({ type: 'error', text: 'Insufficient balance for this withdrawal.' });
      return;
    }
    if (!withdrawAddress.trim() || withdrawAddress.length < 12) {
      setWithdrawMsg({ type: 'error', text: 'Please enter a valid crypto destination address.' });
      return;
    }

    const updated = adjustUserBalance(
      user.id,
      -amt,
      'withdraw',
      `Withdrawal to ${withdrawAddress.slice(0, 8)}... (${amt} USD)`
    );
    if (updated) {
      onUserUpdated(updated);
      setWithdrawAmount('');
      setWithdrawAddress('');
      setWithdrawMsg({
        type: 'success',
        text: `Withdrawal of $${amt.toFixed(2)} USD broadcasted! TX: 0x${Math.random().toString(16).slice(2, 10)}...`,
      });
    }
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycFullName.trim()) {
      setKycFeedback('Please enter your full legal name');
      return;
    }
    if (!kycDocNum.trim()) {
      setKycFeedback('Please enter your document ID number');
      return;
    }

    setKycSubmitting(true);
    setTimeout(() => {
      const updated = submitKYCDocuments(
        user.id,
        kycFullName,
        kycCountry,
        kycDocType,
        kycDocNum
      );
      setKycSubmitting(false);
      if (updated) {
        onUserUpdated(updated);
        setKycFeedback('Documents submitted successfully! Status is now Pending Review in Admin.');
      }
    }, 600);
  };

  const handleToggle2FA = () => {
    const updated = updateUserProfile(user.id, { twoFactorEnabled: !user.twoFactorEnabled });
    if (updated) onUserUpdated(updated);
  };

  const handleSelectAvatar = (av: string) => {
    const updated = updateUserProfile(user.id, { avatar: av });
    if (updated) onUserUpdated(updated);
    setAvatarEditing(false);
  };

  const depositAddressMock =
    depositCurrency === 'SOL'
      ? '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
      : depositCurrency === 'BTC'
      ? 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
      : '0x8849E7f8b9e1De29C5B72605e26b1E6D3A0A7129';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative flex flex-col h-[90vh] max-h-[850px] w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-cyan-950/40 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-2xl border border-slate-700 shadow-inner">
                {user.avatar}
              </span>
              <span
                className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold ${
                  user.kyc.status === 'verified'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-500 text-slate-950'
                }`}
                title={`KYC: ${user.kyc.status}`}
              >
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{user.username}</h2>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${vipInfo.badgeBg} ${vipInfo.color}`}
                >
                  VIP {user.vipTier}
                </span>
                {user.role === 'admin' && (
                  <span className="rounded bg-purple-500/20 border border-purple-500/40 px-1.5 py-0.5 text-[9px] font-bold text-purple-300">
                    Admin
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{user.email}</span>
                <span>•</span>
                <span className="font-mono text-cyan-300 font-semibold">
                  ${user.balanceUsd.toFixed(2)} USD
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 px-6 overflow-x-auto">
          {[
            { id: 'balance', label: 'Balance & Wallet', icon: Wallet },
            { id: 'history', label: 'Unbox History', icon: Clock },
            { id: 'profile', label: 'Profile & VIP', icon: User },
            { id: 'verification', label: 'Identity / Verification', icon: ShieldCheck },
            { id: 'wallet', label: 'Web3 Wallet', icon: Zap },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BALANCE & WALLET */}
          {activeTab === 'balance' && (
            <div className="space-y-6">
              {/* Primary Balance Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 p-4 shadow-sm">
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Total Account Balance
                  </div>
                  <div className="mt-1 text-2xl font-black font-mono text-cyan-300">
                    ${user.balanceUsd.toFixed(2)} USD
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                    <span>≈ {(user.balanceUsd / CRYPTO_RATES.SOL).toFixed(3)} SOL</span>
                    <span>≈ {(user.balanceUsd / CRYPTO_RATES.ETH).toFixed(4)} ETH</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Total Wagered (Turnover)
                  </div>
                  <div className="mt-1 text-2xl font-bold font-mono text-white">
                    ${user.totalWageredUsd.toFixed(2)}
                  </div>
                  <div className="mt-2 text-xs text-slate-400 border-t border-slate-800/80 pt-2">
                    {user.boxesOpened} mystery boxes unboxed
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Total Winnings Paid
                  </div>
                  <div className="mt-1 text-2xl font-bold font-mono text-emerald-400">
                    +${user.totalWonUsd.toFixed(2)}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-300 border-t border-slate-800/80 pt-2">
                    <Sparkles className="h-3 w-3 text-emerald-400" />
                    <span>Provably Fair verifiable RTP</span>
                  </div>
                </div>
              </div>

              {/* Deposit & Withdraw Tabs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Deposit Section */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">Deposit Crypto Funds</h3>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">Instant • 0% Fee</span>
                  </div>

                  {/* Currency selector */}
                  <div className="flex gap-1.5">
                    {(['USDC', 'SOL', 'ETH', 'BTC'] as CryptoCurrency[]).map((cur) => (
                      <button
                        key={cur}
                        onClick={() => setDepositCurrency(cur)}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-mono font-medium border transition-colors ${
                          depositCurrency === cur
                            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cur}
                      </button>
                    ))}
                  </div>

                  {/* Deposit Address Box */}
                  <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 space-y-2">
                    <div className="text-[10px] text-slate-400 uppercase">
                      Your Dedicated {depositCurrency} Deposit Address
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-slate-200 truncate select-all">
                        {depositAddressMock}
                      </span>
                      <button
                        onClick={() => handleCopyDepositAddress(depositAddressMock)}
                        className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-300 hover:text-white"
                      >
                        {copiedAddr ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedAddr ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Deposit Simulator */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Quick Simulator Deposit
                    </label>
                    <div className="flex gap-2">
                      {['25', '50', '100', '250'].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setDepositAmount(amt)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-mono border transition-colors ${
                            depositAmount === amt
                              ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold'
                              : 'border-slate-800 bg-slate-900 text-slate-300'
                          }`}
                        >
                          +${amt}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2.5 flex gap-2">
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                      />
                      <button
                        onClick={handleSimulateDeposit}
                        className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors whitespace-nowrap"
                      >
                        Credit Funds
                      </button>
                    </div>
                  </div>
                </div>

                {/* Withdraw Section */}
                <form
                  onSubmit={handleSimulateWithdrawal}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-cyan-400" />
                      <h3 className="text-sm font-bold text-white">Withdraw Funds</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Available: ${user.balanceUsd.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Destination Crypto Address
                    </label>
                    <input
                      type="text"
                      required
                      value={withdrawAddress}
                      onChange={(e) => setWithdrawAddress(e.target.value)}
                      placeholder="Enter external SOL or ETH address"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-slate-400">Withdraw Amount (USD)</label>
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(user.balanceUsd.toString())}
                        className="text-[10px] text-cyan-400 hover:underline"
                      >
                        Max (${user.balanceUsd.toFixed(2)})
                      </button>
                    </div>
                    <input
                      type="number"
                      step="any"
                      required
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Amount to withdraw"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {withdrawMsg && (
                    <div
                      className={`rounded-lg p-2.5 text-xs flex items-center gap-1.5 ${
                        withdrawMsg.type === 'success'
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {withdrawMsg.type === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0" />
                      )}
                      <span>{withdrawMsg.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 py-2 text-xs font-bold text-white hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-md shadow-cyan-500/20"
                  >
                    Confirm Instant Withdrawal
                  </button>
                </form>
              </div>

              {/* Transaction Ledger Table */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
                  <button
                    onClick={onClaimFaucet}
                    className="text-xs font-medium text-cyan-400 hover:underline"
                  >
                    Claim +$50 Faucet
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2 font-medium">Type</th>
                        <th className="pb-2 font-medium">Amount</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Note</th>
                        <th className="pb-2 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-500">
                            No transactions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        transactions.slice(0, 8).map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-900/40">
                            <td className="py-2.5 font-medium capitalize flex items-center gap-1.5">
                              {tx.type === 'deposit' || tx.type === 'unbox_win' || tx.type === 'faucet' ? (
                                <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <ArrowUpRight className="h-3.5 w-3.5 text-rose-400" />
                              )}
                              <span>{tx.type.replace('_', ' ')}</span>
                            </td>
                            <td
                              className={`py-2.5 font-mono font-bold ${
                                tx.type === 'deposit' || tx.type === 'unbox_win' || tx.type === 'faucet'
                                  ? 'text-emerald-400'
                                  : 'text-slate-200'
                              }`}
                            >
                              {tx.type === 'unbox_cost' || tx.type === 'withdraw' ? '-' : '+'}
                              ${tx.amountUsd.toFixed(2)} USD
                            </td>
                            <td className="py-2.5">
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/20">
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-2.5 text-slate-400 truncate max-w-[200px]">
                              {tx.note || '—'}
                            </td>
                            <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                              {new Date(tx.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UNBOX HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Your Mystery Box Rolls</h3>
                  <p className="text-xs text-slate-400">
                    Every result is recorded on-chain with cryptographic SHA-256 seed pairs.
                  </p>
                </div>
                <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-mono text-cyan-300">
                  {rollHistory.length} Total Rolls
                </span>
              </div>

              {rollHistory.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-12 text-center">
                  <Coins className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400">No boxes opened in this session yet.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Unbox any mystery box on the main console to generate verified provably fair rolls!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {rollHistory.map((roll) => (
                    <div
                      key={roll.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-lg">
                          {roll.wonItem.icon || '🎁'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {roll.wonItem.name}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                                roll.wonItem.tier === 'legendary'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : roll.wonItem.tier === 'epic'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              }`}
                            >
                              {roll.wonItem.tier}
                            </span>
                            {roll.wildBonus && (
                              <span className="rounded bg-amber-500/20 text-amber-300 px-1 py-0.2 text-[9px] font-bold border border-amber-400/50">
                                +{roll.wildBonus.boostPct}% WILD
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Box: <span className="text-slate-300">{roll.boxName}</span> (${roll.boxPriceUsd.toFixed(2)}) • Roll #{roll.nonce}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                        <div className="text-right">
                          <div className="text-sm font-black font-mono text-emerald-400">
                            +${roll.wonItem.valueUsd.toFixed(2)} USD
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Seed Hash: {roll.serverSeedHash.slice(0, 8)}...
                          </div>
                        </div>

                        <button
                          onClick={() => onOpenVerifier(roll)}
                          className="flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all shrink-0"
                          title="Verify cryptographic fairness"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Verify</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE & VIP */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Card & Avatar */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 border-2 border-cyan-400/50 text-3xl shadow-lg">
                        {user.avatar}
                      </div>
                      <button
                        onClick={() => setAvatarEditing(!avatarEditing)}
                        className="absolute -bottom-1 -right-1 rounded-full bg-cyan-500 p-1 text-slate-950 hover:bg-cyan-400 transition-colors shadow"
                        title="Change Avatar"
                      >
                        <Zap className="h-3 w-3" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {user.username}
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-400">
                          {user.id}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Member since {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xs text-slate-400">Current Role</div>
                    <div className="text-sm font-bold uppercase text-cyan-300">{user.role}</div>
                  </div>
                </div>

                {avatarEditing && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <span className="text-xs font-semibold text-slate-300 block mb-2">
                      Select Avatar
                    </span>
                    <div className="flex gap-2">
                      {['🦊', '👑', '⚡', '🐳', '🥷', '🚀', '💎', '🎲'].map((av) => (
                        <button
                          key={av}
                          onClick={() => handleSelectAvatar(av)}
                          className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 text-lg hover:border-cyan-400 transition-all flex items-center justify-center"
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* VIP Club Tier Progression */}
              <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className={`h-5 w-5 ${vipInfo.color}`} />
                    <h3 className="text-sm font-bold text-white">VIP Loyalty Club</h3>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${vipInfo.badgeBg} ${vipInfo.color}`}>
                    Tier: {user.vipTier} ({vipInfo.rakeback}% Rakeback)
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
                    <span>Progress to Next Tier: ${user.totalWageredUsd.toFixed(2)}</span>
                    <span>Target: ${vipInfo.nextTarget.toFixed(2)}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-500"
                      style={{ width: `${vipProgress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-center">
                    <div className="text-[10px] text-slate-400">Rakeback</div>
                    <div className="text-sm font-bold text-cyan-300 font-mono">{vipInfo.rakeback}%</div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-center">
                    <div className="text-[10px] text-slate-400">Daily Lossback</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono">3.5%</div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-center">
                    <div className="text-[10px] text-slate-400">Withdraw Speed</div>
                    <div className="text-sm font-bold text-white">Instant</div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-center">
                    <div className="text-[10px] text-slate-400">VIP Host</div>
                    <div className="text-sm font-bold text-purple-300">Dedicated</div>
                  </div>
                </div>
              </div>

              {/* Security & Settings */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="h-4 w-4 text-cyan-400" />
                  Account Security
                </h3>

                <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <div>
                    <div className="text-xs font-semibold text-white">Two-Factor Authentication (2FA)</div>
                    <p className="text-[11px] text-slate-400">
                      Protect withdrawals with Google Authenticator or WebAuthn
                    </p>
                  </div>
                  <button
                    onClick={handleToggle2FA}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      user.twoFactorEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {user.twoFactorEnabled ? 'Enabled ✓' : 'Enable 2FA'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: IDENTITY / KYC VERIFICATION */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              {/* KYC Status Banner */}
              <div
                className={`rounded-xl border p-4 flex items-center gap-3.5 ${
                  user.kyc.status === 'verified'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : user.kyc.status === 'pending'
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                    : 'border-slate-800 bg-slate-950/70 text-slate-300'
                }`}
              >
                <ShieldCheck
                  className={`h-7 w-7 shrink-0 ${
                    user.kyc.status === 'verified'
                      ? 'text-emerald-400'
                      : user.kyc.status === 'pending'
                      ? 'text-amber-400 animate-pulse'
                      : 'text-slate-500'
                  }`}
                />
                <div className="flex-1">
                  <div className="text-sm font-bold uppercase tracking-wider">
                    Identity Status:{' '}
                    {user.kyc.status === 'verified'
                      ? 'Verified (Level 2)'
                      : user.kyc.status === 'pending'
                      ? 'Pending Admin Verification'
                      : 'Unverified'}
                  </div>
                  <p className="text-xs opacity-90 mt-0.5">
                    {user.kyc.status === 'verified'
                      ? 'Your account has completed identity verification. You enjoy unlimited withdrawals and prioritized blockchain settlement.'
                      : user.kyc.status === 'pending'
                      ? 'Your identification documents are currently being processed by the platform administrator in the Admin Panel.'
                      : 'Submit your legal documents below to unlock full withdrawal limits and high-tier VIP bonuses.'}
                  </p>
                </div>
              </div>

              {/* If Verified, show verified overview */}
              {user.kyc.status === 'verified' ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Verified Credentials
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="rounded-lg bg-slate-900 p-3">
                      <div className="text-[10px] text-slate-500 uppercase">Legal Name</div>
                      <div className="text-xs font-bold text-white font-mono mt-0.5">
                        {user.kyc.fullName || user.username}
                      </div>
                    </div>
                    <div className="rounded-lg bg-slate-900 p-3">
                      <div className="text-[10px] text-slate-500 uppercase">Country / Jurisdiction</div>
                      <div className="text-xs font-bold text-white font-mono mt-0.5">
                        {user.kyc.country || 'Global'}
                      </div>
                    </div>
                    <div className="rounded-lg bg-slate-900 p-3">
                      <div className="text-[10px] text-slate-500 uppercase">Document Type</div>
                      <div className="text-xs font-bold text-white font-mono uppercase mt-0.5">
                        {user.kyc.docType || 'Passport'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* KYC Submission Form */
                <form
                  onSubmit={handleKycSubmit}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4"
                >
                  <h4 className="text-sm font-bold text-white">
                    Submit Identification Documents
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        required
                        value={kycFullName}
                        onChange={(e) => setKycFullName(e.target.value)}
                        placeholder="e.g. Satoshi Nakamoto"
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Country of Residence
                      </label>
                      <input
                        type="text"
                        required
                        value={kycCountry}
                        onChange={(e) => setKycCountry(e.target.value)}
                        placeholder="e.g. Germany / United Kingdom"
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Document Type
                      </label>
                      <select
                        value={kycDocType}
                        onChange={(e) => setKycDocType(e.target.value as any)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="passport">Passport</option>
                        <option value="id_card">National Identity Card</option>
                        <option value="drivers_license">Driver's License</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Document Number
                      </label>
                      <input
                        type="text"
                        required
                        value={kycDocNum}
                        onChange={(e) => setKycDocNum(e.target.value)}
                        placeholder="e.g. A9283741"
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Document Upload Simulator */}
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Upload Document Photo (Front & Back)
                    </label>
                    <div
                      onClick={() => setKycUploadedFileName('identity_document_scan.jpg')}
                      className="cursor-pointer rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-center hover:border-cyan-400 transition-colors"
                    >
                      <Upload className="mx-auto h-6 w-6 text-slate-400 mb-2" />
                      {kycUploadedFileName ? (
                        <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-300 font-mono">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{kycUploadedFileName} attached</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-slate-300 font-medium">
                            Click to upload or drag & drop document scan
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            PNG, JPG, or PDF up to 15MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {kycFeedback && (
                    <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{kycFeedback}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={kycSubmitting}
                    className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 py-2.5 text-xs font-bold text-white hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
                  >
                    {kycSubmitting ? 'Uploading to Verification Server...' : 'Submit Verification Request'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 5: WEB3 WALLET */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              {user.connectedWallet ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-slate-950 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          {user.connectedWallet.provider} Connected
                        </span>
                      </div>
                      <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-mono text-cyan-300">
                        {user.connectedWallet.network}
                      </span>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                      <div className="text-[10px] text-slate-400 uppercase mb-1">
                        Public Address
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-white truncate mr-2 select-all">
                          {user.connectedWallet.address}
                        </span>
                        <button
                          onClick={() => handleCopyDepositAddress(user.connectedWallet!.address)}
                          className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-300 hover:text-white shrink-0"
                        >
                          {copiedAddr ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedAddr ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">
                          External Wallet Balance
                        </div>
                        <div className="text-lg font-bold font-mono text-cyan-300">
                          ${user.connectedWallet.balanceUsd.toFixed(2)} USD
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          ≈ {user.connectedWallet.balanceCrypto}{' '}
                          {user.connectedWallet.network === 'Solana' ? 'SOL' : 'ETH'}
                        </div>
                      </div>
                      <div className="flex flex-col justify-end items-end">
                        <button
                          onClick={() => {
                            const updated = disconnectUserWallet(user.id);
                            if (updated) onUserUpdated(updated);
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Disconnect Wallet
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-8 text-center space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Wallet className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">No Crypto Wallet Linked</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      Connect your MetaMask, Phantom, Coinbase, or WalletConnect account to directly
                      deposit and withdraw crypto tokens seamlessly.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenConnectWallet();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all"
                  >
                    <Zap className="h-4 w-4" />
                    Open Connect Wallet Modal
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
