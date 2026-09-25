import React, { useState, useEffect } from 'react';
import { ProvablyFairPair, BoxTier, RollResult } from '../types';
import { BOX_TIERS } from '../data/boxes';
import { sha256, calculateRollOutcome, generateRandomSeed } from '../utils/crypto';
import { ShieldCheck, RefreshCw, X, Check, Calculator, Copy, Key, ArrowRight, History } from 'lucide-react';

interface ProvablyFairModalProps {
  pair: ProvablyFairPair;
  onUpdateClientSeed: (newSeed: string) => void;
  onRotateServerSeed: () => void;
  onClose: () => void;
  prefillResult?: RollResult | null;
}

export const ProvablyFairModal: React.FC<ProvablyFairModalProps> = ({
  pair,
  onUpdateClientSeed,
  onRotateServerSeed,
  onClose,
  prefillResult,
}) => {
  const [activeTab, setActiveTab] = useState<'seeds' | 'verifier'>('seeds');

  // Seed settings states
  const [clientSeedInput, setClientSeedInput] = useState(pair.clientSeed);
  const [copiedHash, setCopiedHash] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Verifier calculator states
  const [verifyServerSeed, setVerifyServerSeed] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  const [verifyClientSeed, setVerifyClientSeed] = useState('');
  const [verifyNonce, setVerifyNonce] = useState(1);
  const [verifyBoxId, setVerifyBoxId] = useState<string>(BOX_TIERS[1].id);

  // Verification computed results
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [computedServerSeedHash, setComputedServerSeedHash] = useState<string | null>(null);
  const [computedRoll, setComputedRoll] = useState<number | null>(null);
  const [computedItemName, setComputedItemName] = useState<string | null>(null);
  const [computedItemValue, setComputedItemValue] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (prefillResult) {
      setActiveTab('verifier');
      setVerifyServerSeed(prefillResult.serverSeedRevealed || '');
      setVerifyClientSeed(prefillResult.clientSeed);
      setVerifyNonce(prefillResult.nonce);
      setVerifyBoxId(prefillResult.boxId);
      if (prefillResult.serverSeedRevealed) {
        runVerification(
          prefillResult.serverSeedRevealed,
          prefillResult.clientSeed,
          prefillResult.nonce,
          prefillResult.boxId
        );
      }
    }
  }, [prefillResult]);

  const handleSaveClientSeed = () => {
    if (clientSeedInput.trim()) {
      onUpdateClientSeed(clientSeedInput.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const handleRandomizeClientSeed = () => {
    const rand = generateRandomSeed(8);
    setClientSeedInput(rand);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const runVerification = async (
    sSeed: string,
    cSeed: string,
    nonceVal: number,
    boxId: string
  ) => {
    if (!sSeed.trim()) return;
    setIsVerifying(true);
    try {
      const selectedBox = BOX_TIERS.find((b) => b.id === boxId) || BOX_TIERS[0];
      const sHash = await sha256(sSeed.trim());
      const { hmac, rollNumber, item } = await calculateRollOutcome(
        sSeed.trim(),
        cSeed.trim(),
        nonceVal,
        selectedBox.items
      );

      setComputedServerSeedHash(sHash);
      setComputedHash(hmac);
      setComputedRoll(rollNumber);
      setComputedItemName(item.name);
      setComputedItemValue(item.valueUsd);
    } catch {
      // Error computing hash
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      id="provably-fair-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
    >
      <div
        id="provably-fair-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-6 cursor-default animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Provably Fair Cryptographic System
              </h2>
              <p className="text-xs text-slate-400">HMAC-SHA256 mathematical fairness verification</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
              ESC
            </span>
            <button
              id="btn-close-provably-fair"
              onClick={onClose}
              title="Close modal (Esc or click outside)"
              aria-label="Close modal"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/80 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            id="tab-active-seeds"
            onClick={() => setActiveTab('seeds')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'seeds'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span>Active Seeds & Nonce</span>
          </button>
          <button
            id="tab-verifier-calculator"
            onClick={() => setActiveTab('verifier')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'verifier'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>Independent Verifier & Roll Inspector</span>
          </button>
        </div>

        {/* Tab 1: Active Seeds Management */}
        {activeTab === 'seeds' && (
          <div className="p-6 space-y-5">
            {/* Active Server Seed Hash */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-cyan-400" />
                  Active Server Seed (Hashed)
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">Committed Pre-Roll</span>
              </div>
              <p className="text-xs text-slate-400 mb-2.5">
                The server generates a secret seed and commits its SHA-256 hash publicly before any roll takes place. The operator cannot alter this seed without changing the hash.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 font-mono text-xs text-cyan-300 truncate">
                  {pair.serverSeedHash}
                </div>
                <button
                  id="btn-copy-server-hash"
                  onClick={() => copyToClipboard(pair.serverSeedHash)}
                  className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700"
                >
                  {copiedHash ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Client Seed & Nonce */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Your Client Seed (Customizable)
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Supplied by your browser to ensure the outcome cannot be predicted by the server alone.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    id="input-client-seed"
                    type="text"
                    value={clientSeedInput}
                    onChange={(e) => setClientSeedInput(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    id="btn-randomize-client-seed"
                    onClick={handleRandomizeClientSeed}
                    className="rounded-lg border border-slate-800 bg-slate-800 px-2.5 py-2 text-xs text-slate-300 hover:text-white"
                    title="Generate random client seed"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    id="btn-save-client-seed"
                    onClick={handleSaveClientSeed}
                    className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
                  >
                    {savedSuccess ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200">Current Nonce</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Increments by 1 with every box opened.
                  </p>
                </div>
                <div className="text-2xl font-black font-mono text-white mt-2">
                  #{pair.nonce}
                </div>
              </div>
            </div>

            {/* Rotate Seed Pair Section */}
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-indigo-300">Rotate Server Seed Pair</h4>
                <p className="text-[11px] text-slate-400">
                  Reveals the current active server seed in plain text so you can audit past rolls, and initializes a fresh unrevealed pair.
                </p>
              </div>
              <button
                id="btn-rotate-server-seed"
                onClick={onRotateServerSeed}
                className="shrink-0 flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/20 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/30 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Rotate & Reveal Old Seed</span>
              </button>
            </div>

            {/* Revealed Past Seeds Log */}
            {pair.revealedOldSeeds && pair.revealedOldSeeds.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-slate-400" />
                  Previously Revealed Server Seeds (Ready for Audit)
                </h4>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {pair.revealedOldSeeds.map((old, idx) => (
                    <div key={idx} className="rounded bg-slate-900 p-2 text-[11px] font-mono border border-slate-800/80">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Revealed Plaintext Seed:</span>
                        <button
                          onClick={() => {
                            setVerifyServerSeed(old.serverSeed);
                            setActiveTab('verifier');
                          }}
                          className="text-cyan-400 hover:underline text-[10px]"
                        >
                          Load into Verifier &rarr;
                        </button>
                      </div>
                      <div className="text-emerald-400 truncate mt-0.5">{old.serverSeed}</div>
                      <div className="text-slate-500 truncate text-[10px] mt-0.5">
                        Hash was: {old.serverSeedHash}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Independent Verifier & Calculator */}
        {activeTab === 'verifier' && (
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-400">
              Input any revealed Server Seed, Client Seed, and Nonce to calculate the exact HMAC-SHA256 mathematical outcome independently without relying on the game state.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Revealed Server Seed (Plaintext Hex)
                </label>
                <input
                  id="input-verify-server-seed"
                  type="text"
                  placeholder="Paste revealed server seed here..."
                  value={verifyServerSeed}
                  onChange={(e) => setVerifyServerSeed(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Client Seed
                </label>
                <input
                  id="input-verify-client-seed"
                  type="text"
                  value={verifyClientSeed}
                  onChange={(e) => setVerifyClientSeed(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nonce (Spin Index)
                </label>
                <input
                  id="input-verify-nonce"
                  type="number"
                  min={1}
                  value={verifyNonce}
                  onChange={(e) => setVerifyNonce(parseInt(e.target.value) || 1)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Box Selection
                </label>
                <select
                  id="select-verify-box"
                  value={verifyBoxId}
                  onChange={(e) => setVerifyBoxId(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  {BOX_TIERS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (${b.priceUsd.toFixed(2)} — {b.rtp}% RTP)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              id="btn-execute-verify"
              onClick={() => runVerification(verifyServerSeed, verifyClientSeed, verifyNonce, verifyBoxId)}
              disabled={!verifyServerSeed.trim() || isVerifying}
              className="w-full rounded-lg bg-cyan-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 transition-colors"
            >
              {isVerifying ? 'Calculating Proof...' : 'Compute Deterministic Outcome'}
            </button>

            {/* Calculated Verification Output Box */}
            {computedHash && computedRoll !== null && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold font-sans">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Proof Mathematically Validated</span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <span className="text-slate-400">Server Seed SHA-256: </span>
                    <span className="text-slate-200 truncate block">{computedServerSeedHash}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">HMAC-SHA256 (ServerSeed, ClientSeed:Nonce): </span>
                    <span className="text-cyan-300 truncate block">{computedHash}</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Calculated Roll: </span>
                      <span className="text-cyan-400 font-bold text-sm">{computedRoll.toFixed(6)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Won Item: </span>
                      <span className="text-emerald-300 font-bold text-sm">
                        {computedItemName} (${computedItemValue?.toFixed(2)})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
