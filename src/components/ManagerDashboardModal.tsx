import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  Sliders,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Play,
  RotateCcw,
  Radio,
  Lock,
  Unlock,
  Users,
  Eye,
  CheckCircle2,
  XCircle,
  Zap,
  Gauge,
  Sparkles,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  RefreshCw,
  LogOut,
  X,
  Volume2,
  BarChart3,
  Bot,
} from 'lucide-react';
import {
  ManagerGameControls,
  ManagerStatsRealtime,
  LiveGameBet,
  ManagerOutcomeOverride,
  VolatilityMode,
} from '../types';
import {
  getManagerControls,
  saveManagerControls,
  calculateRealtimeStats,
  getLiveBets,
  recordLiveBet,
  clearLiveBetsHistory,
  DEFAULT_MANAGER_CONTROLS,
} from '../utils/managerStore';
import { getStoredUsers, adjustUserBalance } from '../utils/userStore';

interface ManagerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onControlsUpdated?: (controls: ManagerGameControls) => void;
}

export const ManagerDashboardModal: React.FC<ManagerDashboardModalProps> = ({
  isOpen,
  onClose,
  onControlsUpdated,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fairroll_manager_authenticated') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active section
  const [activeSection, setActiveSection] = useState<
    'realtime' | 'controls' | 'live_bets' | 'player_rigging' | 'simulation'
  >('realtime');

  // Controls state
  const [controls, setControls] = useState<ManagerGameControls>(getManagerControls);
  const [stats, setStats] = useState<ManagerStatsRealtime>(calculateRealtimeStats);
  const [liveBets, setLiveBets] = useState<LiveGameBet[]>(getLiveBets);
  const [betFilter, setBetFilter] = useState<'all' | 'wins' | 'losses' | 'big_wins' | 'wilds'>('all');
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Quick feedback toast
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Sync state & live listeners
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setStats(calculateRealtimeStats());
      setLiveBets(getLiveBets());
    }, 2000);

    const handleControlsUpdate = () => {
      setControls(getManagerControls());
    };
    const handleNewBet = () => {
      setLiveBets(getLiveBets());
      setStats(calculateRealtimeStats());
    };

    window.addEventListener('manager_controls_updated', handleControlsUpdate);
    window.addEventListener('manager_new_live_bet', handleNewBet);

    return () => {
      clearInterval(interval);
      window.removeEventListener('manager_controls_updated', handleControlsUpdate);
      window.removeEventListener('manager_new_live_bet', handleNewBet);
    };
  }, [isOpen]);

  // Simulated traffic generator when toggled on
  useEffect(() => {
    if (!autoSimulate || !isOpen) return;
    const interval = setInterval(() => {
      const users = [
        { id: 'user-player-01', username: 'CryptoVoyager', avatar: '🦊' },
        { id: 'user-whale-02', username: 'MoonWhale_99', avatar: '🐳' },
        { id: 'user-demo-03', username: 'SatoshiSeeker', avatar: '⚡' },
        { id: 'user-ninja-04', username: 'DeFiNinja', avatar: '🥷' },
        { id: 'user-guest-09', username: 'ApexTrader', avatar: '💎' },
      ];
      const boxes = [
        { id: 'penny-roll', name: 'Penny Roll', wager: 0.5 },
        { id: 'cyber-pulse', name: 'Cyber Pulse', wager: 5.0 },
        { id: 'sol-surge', name: 'Solana Surge', wager: 15.0 },
        { id: 'eth-genesis', name: 'Ethereum Genesis', wager: 45.0 },
        { id: 'btc-titan', name: 'Bitcoin Titan', wager: 150.0 },
      ];

      const user = users[Math.floor(Math.random() * users.length)];
      const box = boxes[Math.floor(Math.random() * boxes.length)];
      
      // Outcome calculation influenced by current controls
      const rollNumber = Number((Math.random() * 100).toFixed(2));
      const isWinChance = 0.48 + (controls.winLossBias * 0.005);
      const isWin = Math.random() < isWinChance;

      let payout = 0;
      let multiplier = 0;
      let wonItemName = `${(box.wager * 0.2).toFixed(2)} USDC (Dust)`;
      let wildType: 'BTC' | 'ETH' | 'SOL' | undefined;

      if (isWin) {
        multiplier = Number((1.2 + Math.random() * 3.5).toFixed(2));
        payout = Number((box.wager * multiplier).toFixed(2));
        wonItemName = `Tier Win (${multiplier}x)`;
        if (Math.random() < 0.15) {
          wildType = Math.random() > 0.6 ? 'BTC' : Math.random() > 0.3 ? 'ETH' : 'SOL';
          multiplier *= wildType === 'BTC' ? 10 : wildType === 'ETH' ? 5 : 2;
          payout = Number((box.wager * multiplier).toFixed(2));
          wonItemName = `⚡ ${wildType} Wild Multiplier Strike!`;
        }
      } else {
        multiplier = Number((Math.random() * 0.4).toFixed(2));
        payout = Number((box.wager * multiplier).toFixed(2));
      }

      const profitUsd = Number((payout - box.wager).toFixed(2));
      const isBigWin = profitUsd > box.wager * 4;

      const simulatedBet: LiveGameBet = {
        id: `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: Date.now(),
        userId: user.id,
        username: user.username,
        userAvatar: user.avatar,
        boxId: box.id,
        boxName: box.name,
        wagerUsd: box.wager,
        payoutUsd: payout,
        profitUsd,
        isWin: profitUsd > 0,
        isBigWin,
        isLoss: profitUsd <= 0,
        multiplier,
        wonItemName,
        wildType,
        rollNumber,
      };

      recordLiveBet(simulatedBet);
    }, 2800);

    return () => clearInterval(interval);
  }, [autoSimulate, isOpen, controls.winLossBias]);

  if (!isOpen) return null;

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin' || passwordInput === 'manager123' || passwordInput === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('fairroll_manager_authenticated', 'true');
      setLoginError(null);
      triggerToast('Manager credentials verified. Welcome to Backend Control.');
    } else {
      setLoginError('Invalid Manager Master Key. Hint: use "admin" or "manager123"');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('fairroll_manager_authenticated');
    triggerToast('Logged out of Manager Backend');
  };

  // Update controls
  const handleUpdateControl = <K extends keyof ManagerGameControls>(
    key: K,
    val: ManagerGameControls[K]
  ) => {
    const next = { ...controls, [key]: val };
    setControls(next);
    saveManagerControls(next);
    onControlsUpdated?.(next);
    triggerToast(`Updated ${String(key)} -> ${String(val)}`);
  };

  const handleResetControls = () => {
    setControls(DEFAULT_MANAGER_CONTROLS);
    saveManagerControls(DEFAULT_MANAGER_CONTROLS);
    onControlsUpdated?.(DEFAULT_MANAGER_CONTROLS);
    triggerToast('All game engine parameters reset to default mathematical baselines');
  };

  // Filtered bets
  const filteredBets = liveBets.filter((bet) => {
    if (betFilter === 'wins') return bet.isWin;
    if (betFilter === 'losses') return bet.isLoss;
    if (betFilter === 'big_wins') return bet.isBigWin;
    if (betFilter === 'wilds') return !!bet.wildType;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-5 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl border border-red-500/40 bg-slate-950 text-slate-100 shadow-[0_0_60px_rgba(239,68,68,0.2)] overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-red-500/30 bg-gradient-to-r from-red-950/70 via-slate-900 to-red-950/40 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-amber-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-white">
                  CASINO MANAGER BACKEND
                </h2>
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-red-400 border border-red-500/30 uppercase tracking-widest flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                  Live Engine 2.4
                </span>
                {controls.isMaintenanceMode && (
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/40">
                    MAINTENANCE ACTIVE
                  </span>
                )}
                {controls.emergencyStop && (
                  <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white animate-pulse">
                    EMERGENCY FROZEN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Real-time game telemetrics, live win/loss rigging & odds controller
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
                title="Lock Manager Console"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Lock / Sign Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Toast Feedback */}
        {toast && (
          <div className="bg-red-500/15 border-b border-red-500/30 px-4 py-1.5 text-center text-xs font-semibold text-red-300 flex items-center justify-center gap-2 animate-fade-in">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>{toast}</span>
          </div>
        )}

        {/* Main Content Area */}
        {!isAuthenticated ? (
          /* MANAGER LOGIN SCREEN */
          <div className="flex flex-1 flex-col items-center justify-center p-8 sm:p-12 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/30 via-slate-950 to-slate-950">
            <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.3)]">
                <Lock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-white">Manager Authentication</h3>
              <p className="mt-1 text-xs text-slate-400">
                Restricted access: Real-time casino odds engine, win/loss governor, and telemetry feed.
              </p>

              <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Manager Master Key / Password
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter key (e.g. admin or manager123)..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    autoFocus
                  />
                  {loginError && (
                    <p className="mt-1.5 text-xs text-red-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      {loginError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-red-600 to-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <Unlock className="h-4 w-4" />
                  <span>Authorize & Access Game Backend</span>
                </button>

                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-center">
                  <div className="text-[11px] text-slate-400">
                    Quick Demo Credentials:{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordInput('admin');
                        setIsAuthenticated(true);
                        localStorage.setItem('fairroll_manager_authenticated', 'true');
                        triggerToast('Demo Manager Access Authorized');
                      }}
                      className="font-mono text-red-400 font-bold underline hover:text-red-300 ml-1"
                    >
                      "admin" (Click for 1-Tap Entry)
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED MANAGER DASHBOARD */
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Top Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-5 py-2">
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  onClick={() => setActiveSection('realtime')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    activeSection === 'realtime'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>Real-Time Stats & Telemetry</span>
                </button>

                <button
                  onClick={() => setActiveSection('controls')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    activeSection === 'controls'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Win / Loss Engine Controls</span>
                </button>

                <button
                  onClick={() => setActiveSection('live_bets')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    activeSection === 'live_bets'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                  <span>Live Bets Monitor ({liveBets.length})</span>
                </button>

                <button
                  onClick={() => setActiveSection('player_rigging')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    activeSection === 'player_rigging'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>Player Luck & Intervention</span>
                </button>
              </div>

              {/* Simulation switch button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAutoSimulate(!autoSimulate);
                    triggerToast(
                      !autoSimulate
                        ? 'Simulated player traffic stream STARTED'
                        : 'Simulated traffic stream PAUSED'
                    );
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all border ${
                    autoSimulate
                      ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Simulates real-time bets from active players into the telemetry stream"
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>{autoSimulate ? 'Simulating Bets (LIVE)' : 'Start Simulated Traffic'}</span>
                </button>
              </div>
            </div>

            {/* Sub-body scrollable view */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* SECTION 1: REAL-TIME STATS */}
              {activeSection === 'realtime' && (
                <div className="space-y-6">
                  {/* Top Key Performance Indicator Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Gross Volume
                      </div>
                      <div className="mt-1 text-lg font-black text-white font-mono">
                        ${stats.totalGrossBetsUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="mt-1 text-[10px] text-cyan-400">Total Bets Inflow</div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Total Payouts
                      </div>
                      <div className="mt-1 text-lg font-black text-amber-300 font-mono">
                        ${stats.totalGrossPayoutsUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="mt-1 text-[10px] text-amber-400/80">Player Claims</div>
                    </div>

                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
                      <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Net House PnL
                      </div>
                      <div className="mt-1 text-lg font-black text-emerald-300 font-mono">
                        +${stats.netHouseProfitUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="mt-1 text-[10px] text-emerald-400/80">Casino Retained Profit</div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Realized RTP
                      </div>
                      <div className="mt-1 text-lg font-black text-white font-mono">
                        {stats.realizedRtpPct}%
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400">Target: {controls.targetRtp}%</div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Win / Loss Ratio
                      </div>
                      <div className="mt-1 text-lg font-black text-white font-mono">
                        {stats.currentWinRatePct}%
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400">
                        {stats.totalWinsCount}W / {stats.totalLossesCount}L
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Peak Win Today
                      </div>
                      <div className="mt-1 text-lg font-black text-purple-300 font-mono">
                        ${stats.biggestWinTodayUsd.toFixed(2)}
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400 truncate">
                        By {stats.biggestWinnerUsername}
                      </div>
                    </div>
                  </div>

                  {/* Financial & Mathematical Health Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                        <Gauge className="h-4 w-4 text-red-400" />
                        Live House Margin & Risk Calibration
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Current Win/Loss Bias State:</span>
                            <span
                              className={`font-bold font-mono ${
                                controls.winLossBias > 0
                                  ? 'text-emerald-400'
                                  : controls.winLossBias < 0
                                  ? 'text-red-400'
                                  : 'text-cyan-400'
                              }`}
                            >
                              {controls.winLossBias > 0
                                ? `+${controls.winLossBias} (Player Advantage)`
                                : controls.winLossBias < 0
                                ? `${controls.winLossBias} (House Tighten)`
                                : '0.0 (Pure Mathematical Fair)'}
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden relative">
                            <div
                              className="h-full bg-gradient-to-r from-red-500 via-cyan-400 to-emerald-400"
                              style={{ width: `${((controls.winLossBias + 50) / 100) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Target RTP Setting:</span>
                            <span className="font-bold text-white font-mono">{controls.targetRtp}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-cyan-500"
                              style={{ width: `${controls.targetRtp}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                          <div className="rounded-lg bg-slate-950 p-2 text-xs">
                            <span className="text-slate-500 block">Active Override:</span>
                            <span className="font-mono font-bold text-amber-400 uppercase">
                              {controls.outcomeOverride}
                            </span>
                          </div>
                          <div className="rounded-lg bg-slate-950 p-2 text-xs">
                            <span className="text-slate-500 block">Engine Volatility:</span>
                            <span className="font-mono font-bold text-purple-400 uppercase">
                              {controls.volatility}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                        <Flame className="h-4 w-4 text-amber-400" />
                        Quick Action Overrides
                      </h4>
                      <p className="text-xs text-slate-400 mb-3">
                        Instantly inject specific outcomes into the next roll on the site:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            handleUpdateControl('outcomeOverride', 'force_big_win');
                            triggerToast('Next unbox FORCED to BIG WIN!');
                          }}
                          className={`rounded-lg p-2.5 text-xs font-bold border transition-all text-center ${
                            controls.outcomeOverride === 'force_big_win'
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                              : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300'
                          }`}
                        >
                          <div className="text-emerald-400 text-sm">🏆</div>
                          <div>Force Big Win</div>
                        </button>

                        <button
                          onClick={() => {
                            handleUpdateControl('outcomeOverride', 'force_loss');
                            triggerToast('Next unbox FORCED to HOUSE LOSS!');
                          }}
                          className={`rounded-lg p-2.5 text-xs font-bold border transition-all text-center ${
                            controls.outcomeOverride === 'force_loss'
                              ? 'border-red-500 bg-red-500/20 text-red-300'
                              : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-red-500/40 hover:text-red-300'
                          }`}
                        >
                          <div className="text-red-400 text-sm">📉</div>
                          <div>Force Loss (Low)</div>
                        </button>

                        <button
                          onClick={() => {
                            handleUpdateControl('outcomeOverride', 'force_wild_btc');
                            triggerToast('Next unbox FORCED to BTC WILD 10x (1000%)!');
                          }}
                          className={`rounded-lg p-2.5 text-xs font-bold border transition-all text-center ${
                            controls.outcomeOverride === 'force_wild_btc'
                              ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                              : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-amber-500/40 hover:text-amber-300'
                          }`}
                        >
                          <div className="text-amber-400 text-sm">⚡</div>
                          <div>Force BTC Wild 10x</div>
                        </button>

                        <button
                          onClick={() => {
                            handleUpdateControl('outcomeOverride', 'force_jackpot');
                            triggerToast('JACKPOT OVERRIDE TRIGGERED FOR NEXT ROLL!');
                          }}
                          className={`rounded-lg p-2.5 text-xs font-bold border transition-all text-center ${
                            controls.outcomeOverride === 'force_jackpot'
                              ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                              : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-purple-500/40 hover:text-purple-300'
                          }`}
                        >
                          <div className="text-purple-400 text-sm">👑</div>
                          <div>Force Jackpot</div>
                        </button>

                        <button
                          onClick={() => {
                            handleUpdateControl('outcomeOverride', 'force_wild_eth');
                            triggerToast('Next unbox FORCED to ETH Wild 5x!');
                          }}
                          className={`rounded-lg p-2.5 text-xs font-bold border transition-all text-center ${
                            controls.outcomeOverride === 'force_wild_eth'
                              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                              : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-indigo-500/40 hover:text-indigo-300'
                          }`}
                        >
                          <div className="text-indigo-400 text-sm">💎</div>
                          <div>Force ETH Wild 5x</div>
                        </button>

                        <button
                          onClick={() => {
                            handleUpdateControl('outcomeOverride', 'natural');
                            triggerToast('Restored to Provably Fair Natural Odds');
                          }}
                          className={`rounded-lg p-2.5 text-xs font-bold border transition-all text-center ${
                            controls.outcomeOverride === 'natural'
                              ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                              : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300'
                          }`}
                        >
                          <div className="text-cyan-400 text-sm">🎲</div>
                          <div>Natural / Normal</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: WIN / LOSS ENGINE CONTROLS */}
              {activeSection === 'controls' && (
                <div className="space-y-6">
                  {/* Master Sliders and Knobs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* 1. Win/Loss Bias Slider */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-white flex items-center gap-2">
                          <Sliders className="h-4 w-4 text-red-400" />
                          Global Win / Loss Bias Regulator
                        </label>
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            controls.winLossBias > 0
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : controls.winLossBias < 0
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {controls.winLossBias > 0
                            ? `+${controls.winLossBias}% (Player Boost)`
                            : controls.winLossBias < 0
                            ? `${controls.winLossBias}% (House Tighten)`
                            : '0% (Natural)'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">
                        Dynamically shifts the internal roll distribution. Slide left to increase
                        house profit by tightening outcomes, or right to trigger a player winning streak.
                      </p>

                      <input
                        type="range"
                        min="-50"
                        max="50"
                        step="5"
                        value={controls.winLossBias}
                        onChange={(e) =>
                          handleUpdateControl('winLossBias', parseInt(e.target.value))
                        }
                        className="w-full accent-red-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                        <span className="text-red-400">-50% Max House Squeeze</span>
                        <span>0% Pure Fair</span>
                        <span className="text-emerald-400">+50% Whale Rush</span>
                      </div>
                    </div>

                    {/* 2. Target RTP Calibration */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-white flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-cyan-400" />
                          Target Return-to-Player (RTP)
                        </label>
                        <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                          {controls.targetRtp}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">
                        Standard benchmark RTP for all crypto unboxing tiers. Realized RTP dynamically
                        drifts towards this baseline.
                      </p>

                      <input
                        type="range"
                        min="90.0"
                        max="99.0"
                        step="0.5"
                        value={controls.targetRtp}
                        onChange={(e) =>
                          handleUpdateControl('targetRtp', parseFloat(e.target.value))
                        }
                        className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                        <span>90.0% (Tight 10% Margin)</span>
                        <span>96.5% (Vegas Standard)</span>
                        <span>99.0% (Micro House Margin)</span>
                      </div>
                    </div>

                    {/* 3. Wild Multiplier Drop Rate Boost */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-white flex items-center gap-2">
                          <Zap className="h-4 w-4 text-amber-400" />
                          Wild Multiplier Drop Frequency
                        </label>
                        <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          {controls.wildBonusRateMultiplier}x Normal Rate
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">
                        Increases the probability of landing Bitcoin (10x), Ethereum (5x), and Solana
                        (2x) wild cards on the spinning reel boxes.
                      </p>

                      <div className="flex gap-2">
                        {[1.0, 1.5, 2.0, 3.0, 5.0].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => handleUpdateControl('wildBonusRateMultiplier', rate)}
                            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all border ${
                              controls.wildBonusRateMultiplier === rate
                                ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 4. Engine Volatility Mode */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-white flex items-center gap-2">
                          <Activity className="h-4 w-4 text-purple-400" />
                          Volatility Profile
                        </label>
                        <span className="text-xs font-mono font-bold text-purple-300 uppercase">
                          {controls.volatility}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">
                        Modifies the distribution between frequent small prizes versus rare massive
                        jackpot swings.
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        {(['standard', 'low_volatility', 'high_roller', 'frenzy'] as VolatilityMode[]).map(
                          (mode) => (
                            <button
                              key={mode}
                              onClick={() => handleUpdateControl('volatility', mode)}
                              className={`rounded-lg p-2 text-xs font-bold capitalize transition-all border text-left ${
                                controls.volatility === mode
                                  ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                              }`}
                            >
                              <div className="text-white">
                                {mode.replace('_', ' ').toUpperCase()}
                              </div>
                              <div className="text-[10px] text-slate-500 font-normal">
                                {mode === 'standard' && 'Balanced curve'}
                                {mode === 'low_volatility' && 'High hit rate'}
                                {mode === 'high_roller' && 'Steep variance'}
                                {mode === 'frenzy' && 'Wild bonus spikes'}
                              </div>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Safety & Emergency Controls */}
                  <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-5">
                    <h4 className="text-sm font-bold text-red-300 flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      Emergency Master Switches
                    </h4>
                    <p className="text-xs text-slate-400 mb-4">
                      Critical backend fail-safes for platform protection during volatility spikes or audits.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() =>
                          handleUpdateControl('emergencyStop', !controls.emergencyStop)
                        }
                        className={`rounded-xl p-3 text-xs font-bold border transition-all flex items-center justify-between ${
                          controls.emergencyStop
                            ? 'border-red-500 bg-red-600 text-white animate-pulse'
                            : 'border-red-500/40 bg-red-950/40 text-red-300 hover:bg-red-900/40'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-black">Emergency Freeze</div>
                          <div className="text-[10px] opacity-80">Stop unboxing immediately</div>
                        </div>
                        <span className="font-mono text-xs uppercase">
                          {controls.emergencyStop ? 'ACTIVE' : 'OFF'}
                        </span>
                      </button>

                      <button
                        onClick={() =>
                          handleUpdateControl('isMaintenanceMode', !controls.isMaintenanceMode)
                        }
                        className={`rounded-xl p-3 text-xs font-bold border transition-all flex items-center justify-between ${
                          controls.isMaintenanceMode
                            ? 'border-amber-500 bg-amber-600 text-white'
                            : 'border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-900/40'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-black">Maintenance Banner</div>
                          <div className="text-[10px] opacity-80">Notify users of upkeep</div>
                        </div>
                        <span className="font-mono text-xs uppercase">
                          {controls.isMaintenanceMode ? 'ON' : 'OFF'}
                        </span>
                      </button>

                      <button
                        onClick={handleResetControls}
                        className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-500 transition-all flex items-center justify-between"
                      >
                        <div className="text-left">
                          <div className="font-black">Reset to Defaults</div>
                          <div className="text-[10px] text-slate-400">Restore 0% bias / natural</div>
                        </div>
                        <RotateCcw className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: LIVE BETS STREAM */}
              {activeSection === 'live_bets' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">Filter Stream:</span>
                      {(['all', 'wins', 'losses', 'big_wins', 'wilds'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setBetFilter(mode)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize transition-colors ${
                            betFilter === mode
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {mode.replace('_', ' ')}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          clearLiveBetsHistory();
                          setLiveBets([]);
                          triggerToast('Live bets log cleared');
                        }}
                        className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
                      >
                        Clear Stream
                      </button>
                    </div>
                  </div>

                  {/* Bet Stream Table */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                    <div className="overflow-x-auto max-h-[460px]">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-slate-950 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 z-10">
                          <tr>
                            <th className="py-2.5 px-3">Time</th>
                            <th className="py-2.5 px-3">Player</th>
                            <th className="py-2.5 px-3">Box Tier</th>
                            <th className="py-2.5 px-3 text-right">Wager</th>
                            <th className="py-2.5 px-3 text-right">Payout</th>
                            <th className="py-2.5 px-3 text-right">House Net</th>
                            <th className="py-2.5 px-3 text-center">Result</th>
                            <th className="py-2.5 px-3">Prize Won</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {filteredBets.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-8 text-center text-slate-500">
                                No bets found matching current filter criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredBets.map((bet) => {
                              const houseNet = bet.wagerUsd - bet.payoutUsd;
                              return (
                                <tr
                                  key={bet.id}
                                  className="hover:bg-slate-900/80 transition-colors"
                                >
                                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                                    {new Date(bet.timestamp).toLocaleTimeString()}
                                  </td>
                                  <td className="py-2.5 px-3 font-sans">
                                    <div className="flex items-center gap-1.5">
                                      <span>{bet.userAvatar}</span>
                                      <span className="font-semibold text-white">
                                        {bet.username}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 font-sans text-slate-300">
                                    {bet.boxName}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-slate-300">
                                    ${bet.wagerUsd.toFixed(2)}
                                  </td>
                                  <td
                                    className={`py-2.5 px-3 text-right font-bold ${
                                      bet.isWin ? 'text-emerald-400' : 'text-slate-400'
                                    }`}
                                  >
                                    ${bet.payoutUsd.toFixed(2)}
                                  </td>
                                  <td
                                    className={`py-2.5 px-3 text-right font-bold ${
                                      houseNet >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}
                                  >
                                    {houseNet >= 0
                                      ? `+$${houseNet.toFixed(2)}`
                                      : `-$${Math.abs(houseNet).toFixed(2)}`}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    {bet.isBigWin ? (
                                      <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/40">
                                        BIG WIN ({bet.multiplier}x)
                                      </span>
                                    ) : bet.isWin ? (
                                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                                        WIN ({bet.multiplier}x)
                                      </span>
                                    ) : (
                                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                                        LOSS
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 font-sans text-slate-300 truncate max-w-[160px]">
                                    {bet.wildType && (
                                      <span className="mr-1 rounded bg-amber-500/20 px-1 text-[9px] font-bold text-amber-300">
                                        {bet.wildType} WILD
                                      </span>
                                    )}
                                    {bet.wonItemName}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: PLAYER INTERVENTION & RIGGING */}
              {activeSection === 'player_rigging' && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-amber-400" />
                      Live Player Intervention Controls
                    </h4>
                    <p className="text-xs text-slate-400 mb-4">
                      Control luck or credit adjustments for specific high-value VIP players in real time:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getStoredUsers().map((u) => (
                        <div
                          key={u.id}
                          className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{u.avatar}</span>
                            <div>
                              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                                {u.username}
                                <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-mono text-cyan-300">
                                  {u.vipTier}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                Balance: ${u.balanceUsd.toFixed(2)} | Wagered: ${u.totalWageredUsd.toFixed(2)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                adjustUserBalance(
                                  u.id,
                                  100.0,
                                  'admin_adjustment',
                                  'Manager VIP Loyalty Stimulus Grant'
                                );
                                triggerToast(`Granted +$100.00 bonus balance to ${u.username}!`);
                              }}
                              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                              title="Grant +$100 VIP Cash"
                            >
                              +$100 VIP
                            </button>

                            <button
                              onClick={() => {
                                handleUpdateControl('outcomeOverride', 'force_big_win');
                                triggerToast(`Next spin rigged to WIN for ${u.username}!`);
                              }}
                              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20 transition-colors"
                              title="Rig Next Spin to Win"
                            >
                              Rig Win
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
