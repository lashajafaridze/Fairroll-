import { BoxItem, WildBonus } from '../types';

/**
 * Converts ArrayBuffer to Hex string
 */
export function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

/**
 * Computes SHA-256 hash of a string using Web Crypto API
 */
export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  return bufferToHex(hashBuffer);
}

/**
 * Computes HMAC-SHA256 of message using secret key
 */
export async function hmacSha256(keyStr: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(keyStr);
  const msgData = enc.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return bufferToHex(signature);
}

/**
 * Generates a random secure hexadecimal seed
 */
export function generateRandomSeed(bytesCount: number = 32): string {
  const array = new Uint8Array(bytesCount);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Converts HMAC output to a provably fair roll percentage in range [0.0000, 100.0000)
 */
export function hmacToRollNumber(hmacHex: string): number {
  // Take first 8 hex characters (32 bits)
  const subHex = hmacHex.slice(0, 8);
  const intVal = parseInt(subHex, 16);
  // Normalize to 0 to 100
  const roll = (intVal / 0x100000000) * 100;
  return Number(roll.toFixed(6));
}

/**
 * Given a roll number (0-100) and an array of BoxItems with probabilities that sum to 100,
 * finds which item falls within the cumulative probability interval.
 */
export function getWonItemFromRoll(items: BoxItem[], rollNumber: number): BoxItem {
  let cumulative = 0;
  for (const item of items) {
    cumulative += item.probability;
    if (rollNumber < cumulative) {
      return item;
    }
  }
  // Fallback to last item in case of rounding
  return items[items.length - 1];
}

/**
 * Computes both the roll number and the item for given seeds and nonce,
 * including rare provably-fair crypto wild multipliers (BTC 1000%, ETH 500%, SOL 100%).
 */
export async function calculateRollOutcome(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  items: BoxItem[]
): Promise<{ hmac: string; rollNumber: number; item: BoxItem; wildBonus?: WildBonus }> {
  const message = `${clientSeed}:${nonce}`;
  const hmac = await hmacSha256(serverSeed, message);
  const rollNumber = hmacToRollNumber(hmac);
  const baseItem = getWonItemFromRoll(items, rollNumber);

  // Provably fair wild derivation using next 8 hex characters (32 bits) of HMAC
  const wildHex = hmac.slice(8, 16);
  const wildInt = parseInt(wildHex, 16);
  const wildRoll = (wildInt / 0x100000000) * 100; // 0.0000 to 100.0000

  let wildBonus: WildBonus | undefined;
  // Bitcoin Wild: Rarest (0.5% chance) -> 1000% Multiplier Boost (10x)
  if (wildRoll < 0.5) {
    const mult = 10;
    wildBonus = {
      type: 'BTC',
      name: 'Bitcoin Mining Wild',
      boostPct: 1000,
      multiplier: mult,
      baseValueUsd: baseItem.valueUsd,
      finalValueUsd: Number((baseItem.valueUsd * mult).toFixed(2)),
    };
  }
  // Ethereum Wild: Rare (1.5% chance) -> 500% Multiplier Boost (5x)
  else if (wildRoll < 2.0) {
    const mult = 5;
    wildBonus = {
      type: 'ETH',
      name: 'Ethereum Mining Wild',
      boostPct: 500,
      multiplier: mult,
      baseValueUsd: baseItem.valueUsd,
      finalValueUsd: Number((baseItem.valueUsd * mult).toFixed(2)),
    };
  }
  // Solana Wild: Uncommon (3.0% chance) -> 100% Boost / Doubles Sum (2x)
  else if (wildRoll < 5.0) {
    const mult = 2;
    wildBonus = {
      type: 'SOL',
      name: 'Solana Mining Wild',
      boostPct: 100,
      multiplier: mult,
      baseValueUsd: baseItem.valueUsd,
      finalValueUsd: Number((baseItem.valueUsd * mult).toFixed(2)),
    };
  }

  // If wild triggered, enrich the won item with the boosted sum
  const item: BoxItem = wildBonus
    ? {
        ...baseItem,
        id: `${baseItem.id}-wild-${wildBonus.type.toLowerCase()}`,
        name: `${baseItem.name} [${wildBonus.type} Wild +${wildBonus.boostPct}%]`,
        valueUsd: wildBonus.finalValueUsd,
        wildType: wildBonus.type,
        wildBoostPct: wildBonus.boostPct,
        cryptoEquivalent: {
          SOL: Number((baseItem.cryptoEquivalent.SOL * wildBonus.multiplier).toFixed(4)),
          ETH: Number((baseItem.cryptoEquivalent.ETH * wildBonus.multiplier).toFixed(5)),
          BTC: Number((baseItem.cryptoEquivalent.BTC * wildBonus.multiplier).toFixed(6)),
        },
      }
    : baseItem;

  return { hmac, rollNumber, item, wildBonus };
}
