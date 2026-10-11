import React, { useState } from 'react';
import {
  Wallet,
  X,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  LogOut,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { ConnectedWallet, WalletProvider, CryptoNetwork } from '../types';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectedWallet?: ConnectedWallet;
  onConnect: (wallet: ConnectedWallet) => void;
  onDisconnect: () => void;
  onDepositFromWallet?: (amountUsd: number) => void;
}

const WALLET_OPTIONS: {
  id: WalletProvider;
  name: string;
  badge: string;
  defaultNetwork: CryptoNetwork;
  iconBg: string;
  iconLetter: string;
  description: string;
}[] = [
  {
    id: 'MetaMask',
    name: 'MetaMask',
    badge: 'Popular',
    defaultNetwork: 'Ethereum',
    iconBg: 'bg-gradient-to-tr from-orange-500 to-amber-500',
    iconLetter: '🦊',
    description: 'Connect with Ethereum, Polygon, Arbitrum or Base',
  },
  {
    id: 'Phantom',
    name: 'Phantom',
    badge: 'Solana & Multi-chain',
    defaultNetwork: 'Solana',
    iconBg: 'bg-gradient-to-tr from-purple-600 to-indigo-600',
    iconLetter: '👻',
    description: 'Ultra-fast Solana wallet with low network fees',
  },
  {
    id: 'WalletConnect',
    name: 'WalletConnect',
    badge: 'Mobile & QR',
    defaultNetwork: 'Ethereum',
    iconBg: 'bg-gradient-to-tr from-blue-600 to-cyan-500',
    iconLetter: '🔗',
    description: 'Scan with Trust Wallet, Rainbow, or 300+ mobile wallets',
  },
  {
    id: 'Coinbase',
    name: 'Coinbase Wallet',
    badge: 'Multi-chain',
    defaultNetwork: 'Ethereum',
    iconBg: 'bg-gradient-to-tr from-blue-700 to-indigo-800',
    iconLetter: '🔵',
    description: 'Self-custodial Web3 wallet from Coinbase',
  },
  {
    id: 'Solflare',
    name: 'Solflare',
    badge: 'Solana',
    defaultNetwork: 'Solana',
    iconBg: 'bg-gradient-to-tr from-amber-600 to-orange-700',
    iconLetter: '🔥',
    description: 'Advanced non-custodial Solana wallet',
  },
];

const NETWORKS: { id: CryptoNetwork; label: string; symbol: string }[] = [
  { id: 'Ethereum', label: 'Ethereum Mainnet', symbol: 'ETH' },
  { id: 'Solana', label: 'Solana Mainnet', symbol: 'SOL' },
  { id: 'Polygon', label: 'Polygon PoS', symbol: 'MATIC' },
  { id: 'Arbitrum', label: 'Arbitrum One', symbol: 'ETH' },
  { id: 'Base', label: 'Base L2', symbol: 'ETH' },
];

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  isOpen,
  onClose,
  connectedWallet,
  onConnect,
  onDisconnect,
  onDepositFromWallet,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>(
    connectedWallet?.network || 'Ethereum'
  );
  const [connectingProvider, setConnectingProvider] = useState<WalletProvider | null>(null);
  const [copied, setCopied] = useState(false);
  const [depositAmount, setDepositAmount] = useState('50');
  const [depositSuccess, setDepositSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateRealisticAddress = (provider: WalletProvider, net: CryptoNetwork) => {
    if (net === 'Solana' || provider === 'Phantom' || provider === 'Solflare') {
      const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      let addr = '';
      for (let i = 0; i < 44; i++) addr += chars[Math.floor(Math.random() * chars.length)];
      return addr;
    }
    const hex = '0123456789abcdef';
    let addr = '0x';
    for (let i = 0; i < 40; i++) addr += hex[Math.floor(Math.random() * hex.length)];
    return addr;
  };

  const handleSelectWallet = (provider: WalletProvider, net: CryptoNetwork) => {
    setConnectingProvider(provider);
    setTimeout(() => {
      const address = generateRealisticAddress(provider, net);
      const isSol = net === 'Solana';
      const balanceCrypto = isSol
        ? Number((Math.random() * 8 + 1.5).toFixed(3))
        : Number((Math.random() * 2 + 0.35).toFixed(4));
      const balanceUsd = isSol
        ? Number((balanceCrypto * 172.5).toFixed(2))
        : Number((balanceCrypto * 3240.0).toFixed(2));

      const newWallet: ConnectedWallet = {
        provider,
        address,
        network: net,
        connectedAt: Date.now(),
        balanceCrypto,
        balanceUsd,
      };

      onConnect(newWallet);
      setConnectingProvider(null);
    }, 900);
  };

  const handleDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (amt > 0 && onDepositFromWallet) {
      onDepositFromWallet(amt);
      setDepositSuccess(true);
      setTimeout(() => setDepositSuccess(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-cyan-950/40">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-md shadow-cyan-500/20">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {connectedWallet ? 'Connected Crypto Wallet' : 'Connect Crypto Wallet'}
              </h2>
              <p className="text-xs text-slate-400">
                {connectedWallet
                  ? 'Manage your Web3 wallet, sign transactions, and deposit crypto'
                  : 'Select your preferred Web3 wallet provider to link your crypto balance'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {connectedWallet ? (
          /* Already Connected View */
          <div className="mt-5 space-y-5">
            {/* Wallet Overview Card */}
            <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/40 to-slate-950/80 p-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Connected · {connectedWallet.provider}
                  </span>
                </div>
                <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-cyan-300">
                  {connectedWallet.network}
                </span>
              </div>

              {/* Address with copy */}
              <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2">
                <span className="font-mono text-xs text-slate-200 truncate mr-2 select-all">
                  {connectedWallet.address}
                </span>
                <button
                  onClick={() => handleCopy(connectedWallet.address)}
                  className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors shrink-0"
                  title="Copy Wallet Address"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Wallet Balances */}
              <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Wallet Balance</div>
                  <div className="text-lg font-bold font-mono text-cyan-300">
                    ${connectedWallet.balanceUsd.toFixed(2)} USD
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    ≈ {connectedWallet.balanceCrypto}{' '}
                    {connectedWallet.network === 'Solana' ? 'SOL' : 'ETH'}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-[10px] text-emerald-300">
                    <ShieldCheck className="h-3 w-3" />
                    Gas Optimized
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Deposit to FairRoll */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-200">
                  Instant Deposit from Connected Wallet
                </span>
                <span className="text-[10px] text-slate-400">Zero platform fee</span>
              </div>
              <div className="flex items-center gap-2">
                {['25', '50', '100', '250'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDepositAmount(amt)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-mono font-medium border transition-colors ${
                      depositAmount === amt
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                        : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    +${amt}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
                  placeholder="Amount in USD"
                />
                <button
                  onClick={handleDeposit}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Deposit Funds
                </button>
              </div>

              {depositSuccess && (
                <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 p-2 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Successfully deposited ${depositAmount} USD into your FairRoll balance!
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={onDisconnect}
                className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/20 hover:border-rose-400 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Disconnect Wallet
              </button>
              <button
                onClick={onClose}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Choose Wallet Flow */
          <div className="mt-5 space-y-4">
            {/* Preferred Network Selection */}
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Select Network
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {NETWORKS.map((net) => (
                  <button
                    key={net.id}
                    onClick={() => setSelectedNetwork(net.id)}
                    className={`rounded-lg p-2 text-center border transition-all ${
                      selectedNetwork === net.id
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-sm'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold">{net.symbol}</div>
                    <div className="text-[9px] truncate">{net.id}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet Providers List */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Choose Provider
              </div>
              {WALLET_OPTIONS.map((w) => {
                const isConnecting = connectingProvider === w.id;
                return (
                  <button
                    key={w.id}
                    disabled={Boolean(connectingProvider)}
                    onClick={() => handleSelectWallet(w.id, selectedNetwork)}
                    className="group flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-3 hover:border-cyan-500/50 hover:bg-slate-850 transition-all disabled:opacity-50 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg shadow-sm ${w.iconBg}`}
                      >
                        {w.iconLetter}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                            {w.name}
                          </span>
                          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-medium text-slate-400">
                            {w.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{w.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center pl-2">
                      {isConnecting ? (
                        <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer Trust Info */}
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>
                FairRoll requests read-only public address permission. We never access your private
                keys or seed phrases.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
