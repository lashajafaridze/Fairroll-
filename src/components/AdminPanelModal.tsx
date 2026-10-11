import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  BarChart3,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  DollarSign,
  Crown,
  FileCheck,
  Ban,
  RotateCcw,
  Plus,
  X,
  Sparkles,
  AlertTriangle,
  History,
  ShieldCheck,
  Check,
  ArrowUpDown,
  Lock,
} from 'lucide-react';
import {
  UserProfile,
  KYCStatus,
  VIPLevel,
  AdminPlatformStats,
  AuditLogEntry,
} from '../types';
import {
  getStoredUsers,
  saveStoredUsers,
  adjustUserBalance,
  reviewKYCStatus,
  updateUserProfile,
  calculatePlatformStats,
  getStoredAuditLogs,
  setActiveUser,
} from '../utils/userStore';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserSwitched: (user: UserProfile) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserSwitched,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'kyc' | 'logs'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [kycFilter, setKycFilter] = useState<'all' | KYCStatus>('all');
  const [vipFilter, setVipFilter] = useState<'all' | VIPLevel>('all');

  // Selected user for editing
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('100');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState('Promotional grant');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // House edge control
  const [houseEdge, setHouseEdge] = useState(2.6);

  if (!isOpen) return null;

  const users = getStoredUsers();
  const stats = calculatePlatformStats();
  const auditLogs = getStoredAuditLogs();

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKyc = kycFilter === 'all' || u.kyc.status === kycFilter;
    const matchesVip = vipFilter === 'all' || u.vipTier === vipFilter;
    return matchesSearch && matchesKyc && matchesVip;
  });

  const pendingKycUsers = users.filter((u) => u.kyc.status === 'pending');
  const selectedUser = users.find((u) => u.id === editingUserId);

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const amt = parseFloat(adjustAmount);
    if (isNaN(amt) || amt <= 0) return;

    const delta = adjustType === 'credit' ? amt : -amt;
    const updated = adjustUserBalance(
      selectedUser.id,
      delta,
      'admin_adjustment',
      adjustReason,
      currentUser.username
    );

    if (updated) {
      setActionSuccess(
        `Successfully ${adjustType === 'credit' ? 'credited' : 'deducted'} $${amt} for ${
          selectedUser.username
        }`
      );
      setTimeout(() => setActionSuccess(null), 3000);
      if (currentUser.id === selectedUser.id) {
        onUserSwitched(updated);
      }
    }
  };

  const handleReviewKYC = (userId: string, action: 'approve' | 'reject', reason?: string) => {
    const updated = reviewKYCStatus(userId, action, currentUser.username, reason);
    if (updated) {
      setActionSuccess(
        `KYC for ${updated.username} marked as ${action === 'approve' ? 'VERIFIED' : 'REJECTED'}.`
      );
      setTimeout(() => setActionSuccess(null), 3000);
      if (currentUser.id === userId) {
        onUserSwitched(updated);
      }
    }
  };

  const handleToggleBan = (user: UserProfile) => {
    const newStatus = !user.isBanned;
    const updated = updateUserProfile(user.id, { isBanned: newStatus });
    if (updated) {
      setActionSuccess(`${user.username} has been ${newStatus ? 'BANNED' : 'UNBANNED'}.`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleChangeVip = (userId: string, tier: VIPLevel) => {
    const updated = updateUserProfile(userId, { vipTier: tier });
    if (updated) {
      setActionSuccess(`Updated ${updated.username}'s VIP level to ${tier}.`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleImpersonateUser = (user: UserProfile) => {
    setActiveUser(user);
    onUserSwitched(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative flex flex-col h-[90vh] max-h-[880px] w-full max-w-5xl rounded-2xl border border-purple-500/30 bg-slate-900/95 shadow-2xl shadow-purple-950/40 overflow-hidden">
        {/* Top Admin Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md shadow-purple-500/20 text-white">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">FairRoll Super Admin Control Center</h2>
                <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                  Full Authority
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as <strong className="text-purple-300">{currentUser.username}</strong> ({currentUser.email})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action feedback bar */}
        {actionSuccess && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-6 py-2 text-xs font-semibold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/80 px-6 overflow-x-auto">
          {[
            { id: 'users', label: 'User Directory & Management', icon: Users, badge: users.length },
            {
              id: 'kyc',
              label: 'Pending KYC Verifications',
              icon: FileCheck,
              badge: pendingKycUsers.length,
              badgeColor: 'bg-amber-500 text-slate-950 font-bold',
            },
            { id: 'analytics', label: 'Platform Financials & RTP', icon: BarChart3 },
            { id: 'logs', label: 'Security & Audit Logs', icon: History },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-purple-400 text-purple-300 bg-purple-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
                {t.badge !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      t.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: USERS DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by username, email, ID..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    value={kycFilter}
                    onChange={(e) => setKycFilter(e.target.value as any)}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="all">KYC: All Statuses</option>
                    <option value="verified">KYC: Verified</option>
                    <option value="pending">KYC: Pending</option>
                    <option value="unverified">KYC: Unverified</option>
                  </select>

                  <select
                    value={vipFilter}
                    onChange={(e) => setVipFilter(e.target.value as any)}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="all">VIP: All Tiers</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Diamond">Diamond</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                        <th className="p-3 font-semibold">User</th>
                        <th className="p-3 font-semibold">Balance</th>
                        <th className="p-3 font-semibold">KYC</th>
                        <th className="p-3 font-semibold">VIP</th>
                        <th className="p-3 font-semibold">Wagered</th>
                        <th className="p-3 font-semibold">Boxes</th>
                        <th className="p-3 font-semibold">Status</th>
                        <th className="p-3 font-semibold text-right">Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-base">
                                {u.avatar}
                              </span>
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{u.username}</span>
                                  {u.role === 'admin' && (
                                    <span className="rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] px-1 py-0.2">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3 font-mono font-bold text-cyan-300">
                            ${u.balanceUsd.toFixed(2)}
                          </td>

                          <td className="p-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border ${
                                u.kyc.status === 'verified'
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : u.kyc.status === 'pending'
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse'
                                  : 'bg-slate-800 border-slate-700 text-slate-400'
                              }`}
                            >
                              {u.kyc.status}
                            </span>
                          </td>

                          <td className="p-3">
                            <span className="rounded bg-slate-800 px-2 py-0.5 font-bold text-amber-300 text-[10px]">
                              {u.vipTier}
                            </span>
                          </td>

                          <td className="p-3 font-mono text-slate-300">
                            ${u.totalWageredUsd.toFixed(0)}
                          </td>

                          <td className="p-3 font-mono text-slate-300">{u.boxesOpened}</td>

                          <td className="p-3">
                            {u.isBanned ? (
                              <span className="rounded bg-rose-500/20 text-rose-300 px-2 py-0.5 text-[10px] font-bold">
                                Banned
                              </span>
                            ) : (
                              <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px]">
                                Active
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() =>
                                  setEditingUserId(editingUserId === u.id ? null : u.id)
                                }
                                className="rounded bg-purple-500/20 border border-purple-500/30 px-2 py-1 text-[11px] font-bold text-purple-300 hover:bg-purple-500/30 transition-colors"
                              >
                                {editingUserId === u.id ? 'Close' : 'Manage'}
                              </button>

                              <button
                                onClick={() => handleImpersonateUser(u)}
                                className="rounded bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors"
                                title="Switch active session to this user"
                              >
                                Switch
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* User Edit Drawer / Action Drawer */}
              {selectedUser && (
                <div className="rounded-xl border border-purple-500/30 bg-slate-950 p-5 space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{selectedUser.avatar}</span>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          Admin Management: {selectedUser.username}
                        </h4>
                        <span className="text-xs text-slate-400">{selectedUser.id}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingUserId(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Adjust Balance Form */}
                    <form onSubmit={handleAdjustBalance} className="space-y-3">
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                        Credit / Debit Balance
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAdjustType('credit')}
                          className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-colors ${
                            adjustType === 'credit'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          + Credit Funds
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdjustType('debit')}
                          className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-colors ${
                            adjustType === 'debit'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          - Debit Funds
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          required
                          step="any"
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(e.target.value)}
                          placeholder="Amount in USD"
                          className="w-32 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={adjustReason}
                          onChange={(e) => setAdjustReason(e.target.value)}
                          placeholder="Reason / Note for ledger"
                          className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 transition-colors w-full"
                      >
                        Execute Balance Modification
                      </button>
                    </form>

                    {/* Quick Status / VIP / Ban Controls */}
                    <div className="space-y-3">
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                        Privilege & Tier Controls
                      </span>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Set VIP Level</label>
                        <div className="flex gap-1.5">
                          {(['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'] as VIPLevel[]).map(
                            (tier) => (
                              <button
                                key={tier}
                                onClick={() => handleChangeVip(selectedUser.id, tier)}
                                className={`flex-1 rounded py-1 text-[10px] font-bold border transition-colors ${
                                  selectedUser.vipTier === tier
                                    ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                                }`}
                              >
                                {tier}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => handleReviewKYC(selectedUser.id, 'approve')}
                          className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Approve KYC Level 2
                        </button>

                        <button
                          onClick={() => handleToggleBan(selectedUser)}
                          className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                            selectedUser.isBanned
                              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                              : 'border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                          }`}
                        >
                          <Ban className="h-4 w-4" />
                          {selectedUser.isBanned ? 'Lift Account Ban' : 'Ban Account'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PENDING KYC QUEUE */}
          {activeTab === 'kyc' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Pending Verification Submissions</h3>
                  <p className="text-xs text-slate-400">
                    Review incoming KYC identity proofs submitted by users from the verification tab.
                  </p>
                </div>
                <span className="rounded-lg bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-xs font-mono text-amber-300 font-bold">
                  {pendingKycUsers.length} Pending Actions
                </span>
              </div>

              {pendingKycUsers.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-12 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
                  <p className="text-sm text-slate-300 font-medium">All Verification Requests Cleared</p>
                  <p className="text-xs text-slate-500 mt-1">
                    There are currently no outstanding user identity applications in the queue.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingKycUsers.map((u) => (
                    <div
                      key={u.id}
                      className="rounded-xl border border-amber-500/30 bg-slate-950/80 p-4 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{u.avatar}</span>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{u.username}</span>
                              <span className="text-xs font-mono text-slate-400">({u.email})</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              Legal Name: <strong className="text-white">{u.kyc.fullName}</strong> •
                              Country: <strong className="text-white">{u.kyc.country}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReviewKYC(u.id, 'approve')}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve Level 2
                          </button>
                          <button
                            onClick={() =>
                              handleReviewKYC(u.id, 'reject', 'Image was unreadable or ID expired')
                            }
                            className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Doc Type</span>
                          <span className="text-slate-300 uppercase">{u.kyc.docType || 'Passport'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Doc ID</span>
                          <span className="text-cyan-300">{u.kyc.docNumber || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Submitted</span>
                          <span className="text-slate-400">
                            {u.kyc.submittedAt ? new Date(u.kyc.submittedAt).toLocaleTimeString() : 'Recent'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">User Balance</span>
                          <span className="text-emerald-400 font-bold">${u.balanceUsd.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PLATFORM FINANCIALS & RTP */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Total Turnover (Wagered)
                  </div>
                  <div className="mt-1 text-2xl font-black font-mono text-white">
                    ${stats.totalTurnoverUsd.toFixed(2)} USD
                  </div>
                  <div className="mt-2 text-xs text-slate-400 border-t border-slate-800 pt-2">
                    Across {stats.totalBoxesOpened} box openings
                  </div>
                </div>

                <div className="rounded-xl border border-purple-500/30 bg-slate-950/80 p-4">
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Platform Gross Profit (GGR)
                  </div>
                  <div className="mt-1 text-2xl font-black font-mono text-purple-300">
                    +${Math.max(0, stats.houseProfitUsd).toFixed(2)} USD
                  </div>
                  <div className="mt-2 text-xs text-slate-400 border-t border-slate-800 pt-2">
                    Theoretical House Edge: {houseEdge}%
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Observed Realized RTP
                  </div>
                  <div className="mt-1 text-2xl font-black font-mono text-emerald-400">
                    {stats.averageRtp}%
                  </div>
                  <div className="mt-2 text-xs text-emerald-300 border-t border-slate-800 pt-2">
                    Compliant with transparent micro-box math
                  </div>
                </div>
              </div>

              {/* House Edge Configuration Slider */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">House Edge Calibration</h4>
                    <p className="text-xs text-slate-400">
                      Fine-tune target mathematical edge across randomized multiplier wheels.
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-purple-300">
                    {houseEdge.toFixed(1)}% (RTP: {(100 - houseEdge).toFixed(1)}%)
                  </span>
                </div>

                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={houseEdge}
                  onChange={(e) => setHouseEdge(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>1.0% (Ultra High Player Value)</span>
                  <span>2.6% (Standard FairRoll Config)</span>
                  <span>5.0% (Max Retail Margin)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">System Security & Audit Trail</h3>
                <span className="text-xs text-slate-400 font-mono">{auditLogs.length} events logged</span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2.5">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-purple-500/20 text-purple-300 px-1.5 py-0.2 text-[10px] font-bold">
                          {log.action}
                        </span>
                        <span className="text-slate-300 font-medium">{log.details}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Admin: <strong className="text-slate-400">{log.adminUsername}</strong>
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
