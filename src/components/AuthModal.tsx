import React, { useState } from 'react';
import {
  UserPlus,
  LogIn,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Mail,
  User,
  Crown,
} from 'lucide-react';
import { UserProfile } from '../types';
import { registerNewUser, getStoredUsers, setActiveUser } from '../utils/userStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

const AVATAR_OPTIONS = ['🦊', '👑', '⚡', '🐳', '🥷', '🚀', '💎', '🎲'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'register',
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🚀');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = registerNewUser(username, email, selectedAvatar);
      setIsSubmitting(false);
      if (res.error) {
        setError(res.error);
      } else {
        onAuthSuccess(res.user);
        onClose();
      }
    }, 400);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email or username');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const users = getStoredUsers();
      const clean = email.trim().toLowerCase();
      const user = users.find(
        (u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
      );

      setIsSubmitting(false);
      if (!user) {
        setError('No account found with this email or username.');
        return;
      }
      if (user.isBanned) {
        setError('This account has been suspended by the platform administrator.');
        return;
      }

      setActiveUser(user);
      onAuthSuccess(user);
      onClose();
    }, 400);
  };

  const handleQuickDemoLogin = (targetUserId: string) => {
    const users = getStoredUsers();
    const target = users.find((u) => u.id === targetUserId);
    if (target) {
      setActiveUser(target);
      onAuthSuccess(target);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-cyan-950/40">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 pb-3">
          <button
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex items-center gap-2 pb-2 text-sm font-semibold transition-colors border-b-2 mr-6 ${
              tab === 'register'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Create Account
          </button>
          <button
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex items-center gap-2 pb-2 text-sm font-semibold transition-colors border-b-2 ${
              tab === 'login'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-500/15 border border-rose-500/30 p-2.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        {tab === 'register' ? (
          <form onSubmit={handleRegister} className="mt-4 space-y-4">
            {/* Promo Banner */}
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                <strong>+$100 Welcome Bonus:</strong> Instant demo balance automatically credited upon
                registration!
              </span>
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Choose Avatar
              </label>
              <div className="flex gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    type="button"
                    key={av}
                    onClick={() => setSelectedAvatar(av)}
                    className={`h-9 w-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                      selectedAvatar === av
                        ? 'border-cyan-400 bg-cyan-500/20 shadow-md scale-110'
                        : 'border-slate-800 bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. SatoshiTrader"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Account...' : 'Register & Claim $100'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="mt-4 space-y-4">
            {/* Email or Username */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fairroll.io or voyager@crypto.net"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Quick Demo Switcher Buttons */}
            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Demo Accounts (1-Click)
              </span>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('user-admin-01')}
                  className="flex w-full items-center justify-between rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-200 hover:bg-purple-500/20 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-400" />
                    <span>Login as Super Admin (Full Control)</span>
                  </div>
                  <span className="font-mono text-[10px] text-purple-400">admin@fairroll.io</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('user-player-01')}
                  className="flex w-full items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-200 hover:bg-cyan-500/20 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span>🦊</span>
                    <span>CryptoVoyager (Active Player · $250)</span>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-400">VIP Silver</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
