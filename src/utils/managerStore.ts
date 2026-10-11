import {
  ManagerGameControls,
  ManagerStatsRealtime,
  LiveGameBet,
  BoxItem,
  WildBonus,
} from '../types';

const CONTROLS_KEY = 'fairroll_manager_controls_v2';
const LIVE_BETS_KEY = 'fairroll_manager_live_bets_v2';
const MANAGER_SESSION_KEY = 'fairroll_manager_session_v2';

export const DEFAULT_MANAGER_CONTROLS: ManagerGameControls = {
  winLossBias: 0, // 0 = standard fair / natural
  outcomeOverride: 'natural',
  volatility: 'standard',
  targetRtp: 96.5,
  wildBonusRateMultiplier: 1.0,
  houseEdgePct: 3.5,
  isMaintenanceMode: false,
  emergencyStop: false,
  forceJackpotNext: false,
  spinSpeedMultiplier: 1,
};

// Initial realistic live bet history for manager monitoring
const SEED_BETS: LiveGameBet[] = [
  {
    id: 'bet-live-101',
    timestamp: Date.now() - 15000,
    userId: 'user-player-01',
    username: 'CryptoVoyager',
    userAvatar: '🦊',
    boxId: 'sol-surge',
    boxName: 'Solana Surge',
    wagerUsd: 15.0,
    payoutUsd: 38.0,
    profitUsd: 23.0,
    isWin: true,
    isBigWin: false,
    isLoss: false,
    multiplier: 2.53,
    wonItemName: '0.21 SOL [Solana Surge]',
    rollNumber: 88.42,
  },
  {
    id: 'bet-live-102',
    timestamp: Date.now() - 32000,
    userId: 'user-whale-02',
    username: 'MoonWhale_99',
    userAvatar: '🐳',
    boxId: 'btc-titan',
    boxName: 'Bitcoin Titan',
    wagerUsd: 150.0,
    payoutUsd: 1200.0,
    profitUsd: 1050.0,
    isWin: true,
    isBigWin: true,
    isLoss: false,
    multiplier: 8.0,
    wonItemName: '0.013 BTC [Titan Reserve]',
    wildType: 'BTC',
    rollNumber: 99.15,
  },
  {
    id: 'bet-live-103',
    timestamp: Date.now() - 54000,
    userId: 'user-demo-03',
    username: 'SatoshiSeeker',
    userAvatar: '⚡',
    boxId: 'eth-genesis',
    boxName: 'Ethereum Genesis',
    wagerUsd: 45.0,
    payoutUsd: 9.5,
    profitUsd: -35.5,
    isWin: false,
    isBigWin: false,
    isLoss: true,
    multiplier: 0.21,
    wonItemName: '0.0028 ETH (Base Tier)',
    rollNumber: 24.18,
  },
  {
    id: 'bet-live-104',
    timestamp: Date.now() - 88000,
    userId: 'user-whale-02',
    username: 'MoonWhale_99',
    userAvatar: '🐳',
    boxId: 'supernova',
    boxName: 'Supernova Whale',
    wagerUsd: 500.0,
    payoutUsd: 2500.0,
    profitUsd: 2000.0,
    isWin: true,
    isBigWin: true,
    isLoss: false,
    multiplier: 5.0,
    wonItemName: '0.735 ETH [High Roller]',
    wildType: 'ETH',
    rollNumber: 97.4,
  },
  {
    id: 'bet-live-105',
    timestamp: Date.now() - 110000,
    userId: 'user-ninja-04',
    username: 'DeFiNinja',
    userAvatar: '🥷',
    boxId: 'penny-roll',
    boxName: 'Penny Roll',
    wagerUsd: 0.5,
    payoutUsd: 0.15,
    profitUsd: -0.35,
    isWin: false,
    isBigWin: false,
    isLoss: true,
    multiplier: 0.3,
    wonItemName: '0.15 USDC (Dust)',
    rollNumber: 15.3,
  },
  {
    id: 'bet-live-106',
    timestamp: Date.now() - 145000,
    userId: 'user-player-01',
    username: 'CryptoVoyager',
    userAvatar: '🦊',
    boxId: 'cyber-pulse',
    boxName: 'Cyber Pulse',
    wagerUsd: 5.0,
    payoutUsd: 12.5,
    profitUsd: 7.5,
    isWin: true,
    isBigWin: false,
    isLoss: false,
    multiplier: 2.5,
    wonItemName: '0.069 SOL (Overclock)',
    wildType: 'SOL',
    rollNumber: 91.2,
  },
  {
    id: 'bet-live-107',
    timestamp: Date.now() - 180000,
    userId: 'user-demo-03',
    username: 'SatoshiSeeker',
    userAvatar: '⚡',
    boxId: 'eth-genesis',
    boxName: 'Ethereum Genesis',
    wagerUsd: 45.0,
    payoutUsd: 15.0,
    profitUsd: -30.0,
    isWin: false,
    isBigWin: false,
    isLoss: true,
    multiplier: 0.33,
    wonItemName: '0.0044 ETH (Common)',
    rollNumber: 31.8,
  },
];

export function getManagerControls(): ManagerGameControls {
  const saved = localStorage.getItem(CONTROLS_KEY);
  if (saved) {
    try {
      return { ...DEFAULT_MANAGER_CONTROLS, ...JSON.parse(saved) };
    } catch {}
  }
  return DEFAULT_MANAGER_CONTROLS;
}

export function saveManagerControls(controls: ManagerGameControls): void {
  localStorage.setItem(CONTROLS_KEY, JSON.stringify(controls));
  // Dispatch custom window event so listeners can update in real-time
  window.dispatchEvent(new CustomEvent('manager_controls_updated', { detail: controls }));
}

export function updateManagerControlField<K extends keyof ManagerGameControls>(
  key: K,
  value: ManagerGameControls[K]
): ManagerGameControls {
  const current = getManagerControls();
  const updated = { ...current, [key]: value };
  saveManagerControls(updated);
  return updated;
}

export function getLiveBets(): LiveGameBet[] {
  const saved = localStorage.getItem(LIVE_BETS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  return SEED_BETS;
}

export function recordLiveBet(bet: LiveGameBet): LiveGameBet[] {
  const bets = getLiveBets();
  const updated = [bet, ...bets].slice(0, 100); // keep last 100 bets
  localStorage.setItem(LIVE_BETS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('manager_new_live_bet', { detail: bet }));
  return updated;
}

export function clearLiveBetsHistory(): void {
  localStorage.setItem(LIVE_BETS_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('manager_bets_cleared'));
}

export function calculateRealtimeStats(): ManagerStatsRealtime {
  const bets = getLiveBets();
  let totalGrossBetsUsd = 0;
  let totalGrossPayoutsUsd = 0;
  let totalWinsCount = 0;
  let totalLossesCount = 0;
  let biggestWinTodayUsd = 0;
  let biggestWinnerUsername = 'None';

  for (const b of bets) {
    totalGrossBetsUsd += b.wagerUsd;
    totalGrossPayoutsUsd += b.payoutUsd;
    if (b.isWin) {
      totalWinsCount++;
    } else {
      totalLossesCount++;
    }
    if (b.payoutUsd > biggestWinTodayUsd) {
      biggestWinTodayUsd = b.payoutUsd;
      biggestWinnerUsername = b.username;
    }
  }

  // Add historical platform turnover base for high-fidelity stats
  const baseVolume = 85240;
  const basePayouts = 82190;
  const combinedBets = totalGrossBetsUsd + baseVolume;
  const combinedPayouts = totalGrossPayoutsUsd + basePayouts;
  const netHouseProfitUsd = combinedBets - combinedPayouts;

  const totalBetsCount = bets.length + 1420;
  const currentWinRatePct = totalBetsCount > 0
    ? ((totalWinsCount + 680) / totalBetsCount) * 100
    : 48.5;
  const realizedRtpPct = combinedBets > 0
    ? (combinedPayouts / combinedBets) * 100
    : 96.4;

  return {
    totalGrossBetsUsd: Number(combinedBets.toFixed(2)),
    totalGrossPayoutsUsd: Number(combinedPayouts.toFixed(2)),
    netHouseProfitUsd: Number(netHouseProfitUsd.toFixed(2)),
    totalBetsCount,
    totalWinsCount: totalWinsCount + 680,
    totalLossesCount: totalLossesCount + 740,
    currentWinRatePct: Number(currentWinRatePct.toFixed(1)),
    realizedRtpPct: Number(realizedRtpPct.toFixed(2)),
    activeOnlinePlayers: 42,
    biggestWinTodayUsd: Math.max(biggestWinTodayUsd, 2500.0),
    biggestWinnerUsername: biggestWinnerUsername || 'MoonWhale_99',
  };
}

export function checkManagerSession(): boolean {
  return localStorage.getItem(MANAGER_SESSION_KEY) === 'authenticated';
}

export function setManagerSession(active: boolean): void {
  if (active) {
    localStorage.setItem(MANAGER_SESSION_KEY, 'authenticated');
  } else {
    localStorage.removeItem(MANAGER_SESSION_KEY);
  }
}

/**
 * Applies Manager Controls to the outcome calculation
 * If an override or bias is active, adjusts the item or roll result accordingly
 */
export function applyManagerOverrides(
  boxItems: BoxItem[],
  naturalRollNumber: number,
  naturalWonItem: BoxItem,
  naturalWildBonus?: WildBonus
): { rollNumber: number; wonItem: BoxItem; wildBonus?: WildBonus; wasOverridden: boolean } {
  const controls = getManagerControls();

  // 1. Force Specific Outcomes
  if (controls.outcomeOverride === 'force_jackpot') {
    // Sort items by value descending -> pick top tier
    const sorted = [...boxItems].sort((a, b) => b.valueUsd - a.valueUsd);
    const jackpot = sorted[0];
    return {
      rollNumber: 99.85,
      wonItem: jackpot,
      wildBonus: {
        type: 'BTC',
        name: 'Bitcoin Titan Master Wild',
        boostPct: 1000,
        multiplier: 10,
        baseValueUsd: jackpot.valueUsd,
        finalValueUsd: jackpot.valueUsd * 10,
      },
      wasOverridden: true,
    };
  }

  if (controls.outcomeOverride === 'force_big_win') {
    // Pick highest value item in the box
    const sorted = [...boxItems].sort((a, b) => b.valueUsd - a.valueUsd);
    const bestItem = sorted[0] || naturalWonItem;
    return {
      rollNumber: 99.5,
      wonItem: bestItem,
      wildBonus: naturalWildBonus,
      wasOverridden: true,
    };
  }

  if (controls.outcomeOverride === 'force_loss') {
    // Pick lowest value item in the box
    const sorted = [...boxItems].sort((a, b) => a.valueUsd - b.valueUsd);
    const lowestItem = sorted[0] || naturalWonItem;
    return {
      rollNumber: 0.1,
      wonItem: lowestItem,
      wildBonus: undefined,
      wasOverridden: true,
    };
  }

  if (controls.outcomeOverride === 'force_wild_btc') {
    return {
      rollNumber: 99.1,
      wonItem: {
        ...naturalWonItem,
        valueUsd: Number((naturalWonItem.valueUsd * 10).toFixed(2)),
        name: `${naturalWonItem.name} [BTC Wild +1000%]`,
        wildType: 'BTC',
        wildBoostPct: 1000,
      },
      wildBonus: {
        type: 'BTC',
        name: 'Manager Forced Bitcoin Wild (10x)',
        boostPct: 1000,
        multiplier: 10,
        baseValueUsd: naturalWonItem.valueUsd,
        finalValueUsd: Number((naturalWonItem.valueUsd * 10).toFixed(2)),
      },
      wasOverridden: true,
    };
  }

  if (controls.outcomeOverride === 'force_wild_eth') {
    return {
      rollNumber: 98.2,
      wonItem: {
        ...naturalWonItem,
        valueUsd: Number((naturalWonItem.valueUsd * 5).toFixed(2)),
        name: `${naturalWonItem.name} [ETH Wild +500%]`,
        wildType: 'ETH',
        wildBoostPct: 500,
      },
      wildBonus: {
        type: 'ETH',
        name: 'Manager Forced Ethereum Wild (5x)',
        boostPct: 500,
        multiplier: 5,
        baseValueUsd: naturalWonItem.valueUsd,
        finalValueUsd: Number((naturalWonItem.valueUsd * 5).toFixed(2)),
      },
      wasOverridden: true,
    };
  }

  if (controls.outcomeOverride === 'force_wild_sol') {
    return {
      rollNumber: 95.5,
      wonItem: {
        ...naturalWonItem,
        valueUsd: Number((naturalWonItem.valueUsd * 2).toFixed(2)),
        name: `${naturalWonItem.name} [SOL Wild +100%]`,
        wildType: 'SOL',
        wildBoostPct: 100,
      },
      wildBonus: {
        type: 'SOL',
        name: 'Manager Forced Solana Wild (2x)',
        boostPct: 100,
        multiplier: 2,
        baseValueUsd: naturalWonItem.valueUsd,
        finalValueUsd: Number((naturalWonItem.valueUsd * 2).toFixed(2)),
      },
      wasOverridden: true,
    };
  }

  // 2. Win/Loss Bias adjustment
  // Bias is -50 to +50. If bias is positive, shifts roll number towards high items.
  // If bias is negative, shifts roll number towards low items.
  if (controls.winLossBias !== 0) {
    let biasedRoll = naturalRollNumber + (controls.winLossBias * 0.4);
    biasedRoll = Math.max(0.01, Math.min(99.99, biasedRoll));

    // Re-resolve item based on biased roll
    let cumulative = 0;
    let biasedItem = boxItems[boxItems.length - 1];
    for (const it of boxItems) {
      cumulative += it.probability;
      if (biasedRoll < cumulative) {
        biasedItem = it;
        break;
      }
    }

    return {
      rollNumber: Number(biasedRoll.toFixed(4)),
      wonItem: biasedItem,
      wildBonus: naturalWildBonus,
      wasOverridden: true,
    };
  }

  // Natural provably fair
  return {
    rollNumber: naturalRollNumber,
    wonItem: naturalWonItem,
    wildBonus: naturalWildBonus,
    wasOverridden: false,
  };
}
