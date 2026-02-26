'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Search, RefreshCw, Trash2, Download, Plus, Zap,
    CheckCircle2, XCircle, Clock, Database, ArrowUpDown,
    Eye, ChevronDown
} from 'lucide-react';
import clsx from 'clsx';

const API_BASE = 'http://localhost:8000/api/admin';

interface SyncedTicker {
    ticker: string;
    name: string;
    sector: string;
    data_points: number;
    current_price: number | null;
    market_cap: number;
    synced_at: string;
    file_size: number;
}

interface SearchResult {
    symbol: string;
    name: string;
    exchange: string;
    type: string;
    sector: string;
    already_synced: boolean;
}

interface Preset {
    name: string;
    tickers: string[];
    count: number;
}

function formatMarketCap(value: number): string {
    if (!value) return '—';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
}

function formatTimeAgo(isoString: string): string {
    if (!isoString) return 'Never';
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function formatBytes(bytes: number): string {
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`;
    return `${bytes} B`;
}

export default function DataManagerPage() {
    const [tickers, setTickers] = useState<SyncedTicker[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [syncingTicker, setSyncingTicker] = useState<string | null>(null);
    const [bulkInput, setBulkInput] = useState('');
    const [bulkSyncing, setBulkSyncing] = useState(false);
    const [bulkProgress, setBulkProgress] = useState('');
    const [presets, setPresets] = useState<Record<string, Preset>>({});
    const [showPresets, setShowPresets] = useState(false);
    const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
    const [tickerDetail, setTickerDetail] = useState<Record<string, unknown> | null>(null);
    const [sortField, setSortField] = useState<'ticker' | 'synced_at' | 'market_cap'>('synced_at');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const fetchTickers = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/status`);
            if (res.ok) {
                const data = await res.json();
                setTickers(data.tickers || []);
            }
        } catch (err) {
            console.error('Failed to fetch tickers:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPresets = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/presets`);
            if (res.ok) {
                const data = await res.json();
                setPresets(data.presets || {});
            }
        } catch (err) {
            console.error('Failed to fetch presets:', err);
        }
    }, []);

    useEffect(() => {
        fetchTickers();
        fetchPresets();
    }, [fetchTickers, fetchPresets]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(`${API_BASE}/search-yf/${encodeURIComponent(searchQuery.trim())}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.results || []);
            }
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setSearching(false);
        }
    };

    const handleSyncOne = async (ticker: string) => {
        setSyncingTicker(ticker);
        try {
            const res = await fetch(`${API_BASE}/sync/${ticker}`, { method: 'POST' });
            if (res.ok) {
                await fetchTickers();
                setSearchResults(prev => prev.map(r =>
                    r.symbol === ticker ? { ...r, already_synced: true } : r
                ));
            }
        } catch (err) {
            console.error('Sync failed:', err);
        } finally {
            setSyncingTicker(null);
        }
    };

    const handleBulkSync = async () => {
        const tickerList = bulkInput.split(/[,\s\n]+/).map(t => t.trim().toUpperCase()).filter(Boolean);
        if (!tickerList.length) return;
        setBulkSyncing(true);
        setBulkProgress(`Syncing ${tickerList.length} tickers...`);
        try {
            const res = await fetch(`${API_BASE}/sync/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tickers: tickerList }),
            });
            if (res.ok) {
                const data = await res.json();
                setBulkProgress(`Done! ${data.success} success, ${data.errors} errors`);
                await fetchTickers();
                setBulkInput('');
            }
        } catch (err) {
            setBulkProgress('Bulk sync failed');
            console.error('Bulk sync failed:', err);
        } finally {
            setBulkSyncing(false);
        }
    };

    const handlePresetSync = async (presetName: string) => {
        setBulkSyncing(true);
        setBulkProgress(`Syncing preset: ${presetName}...`);
        try {
            const res = await fetch(`${API_BASE}/sync/preset/${presetName}`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setBulkProgress(`Done! ${data.success} success, ${data.errors} errors`);
                await fetchTickers();
            }
        } catch (err) {
            setBulkProgress('Preset sync failed');
        } finally {
            setBulkSyncing(false);
            setShowPresets(false);
        }
    };

    const handleDelete = async (ticker: string) => {
        try {
            const res = await fetch(`${API_BASE}/ticker/${ticker}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchTickers();
                if (selectedTicker === ticker) {
                    setSelectedTicker(null);
                    setTickerDetail(null);
                }
            }
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleViewDetail = async (ticker: string) => {
        setSelectedTicker(ticker);
        try {
            const res = await fetch(`${API_BASE}/ticker/${ticker}`);
            if (res.ok) {
                const data = await res.json();
                setTickerDetail(data);
            }
        } catch (err) {
            console.error('Failed to fetch detail:', err);
        }
    };

    const handleSort = (field: 'ticker' | 'synced_at' | 'market_cap') => {
        if (sortField === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    const sortedTickers = [...tickers].sort((a, b) => {
        let cmp = 0;
        if (sortField === 'ticker') cmp = a.ticker.localeCompare(b.ticker);
        else if (sortField === 'synced_at') cmp = (a.synced_at || '').localeCompare(b.synced_at || '');
        else if (sortField === 'market_cap') cmp = (a.market_cap || 0) - (b.market_cap || 0);
        return sortDir === 'asc' ? cmp : -cmp;
    });

    const detail = tickerDetail as { company?: { name?: string; sector?: string; industry?: string; description?: string }; stats?: Record<string, unknown>; current_price?: number; data_points?: number; synced_at?: string } | null;

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">Data Manager</h1>
                    <p className="text-sm text-[var(--color-muted)] mt-1">Fetch and manage market data from Yahoo Finance</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchTickers} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-all">
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowPresets(prev => !prev)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#EF4444] to-[#F97316] text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                        >
                            <Zap size={14} />
                            Sync Preset
                            <ChevronDown size={14} />
                        </button>
                        {showPresets && (
                            <div className="absolute right-0 top-11 w-64 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-2xl z-50 overflow-hidden">
                                {Object.entries(presets).map(([key, preset]) => (
                                    <button
                                        key={key}
                                        onClick={() => handlePresetSync(key)}
                                        disabled={bulkSyncing}
                                        className="w-full text-left px-4 py-3 hover:bg-[var(--color-card-hover)] transition-colors border-b border-[var(--color-border)] last:border-0"
                                    >
                                        <div className="text-sm font-medium text-[var(--color-foreground)]">{preset.name}</div>
                                        <div className="text-xs text-[var(--color-muted-dark)] mt-0.5">{preset.count} tickers</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search + Bulk Sync */}
            <div className="grid grid-cols-2 gap-5">
                {/* Search YFinance */}
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                        <Search size={14} className="text-[var(--color-accent)]" />
                        Search Yahoo Finance
                    </h3>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Enter ticker symbol (e.g. AAPL, BBCA)"
                            className="flex-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted-dark)] outline-none focus:border-[var(--color-border-focus)]"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={searching}
                            className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                        >
                            {searching ? '...' : 'Search'}
                        </button>
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {searchResults.map((r) => (
                            <div key={r.symbol} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]">
                                <div>
                                    <span className="text-sm font-semibold font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-foreground)]">{r.symbol}</span>
                                    <span className="text-xs text-[var(--color-muted)] ml-2">{r.name}</span>
                                    <div className="text-xs text-[var(--color-muted-dark)] mt-0.5">{r.exchange} · {r.type}</div>
                                </div>
                                {r.already_synced ? (
                                    <span className="flex items-center gap-1 text-xs text-[var(--color-profit)]">
                                        <CheckCircle2 size={12} /> Synced
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleSyncOne(r.symbol)}
                                        disabled={syncingTicker === r.symbol}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-accent-bg)] text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-all disabled:opacity-50"
                                    >
                                        {syncingTicker === r.symbol ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
                                        {syncingTicker === r.symbol ? 'Syncing...' : 'Sync'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bulk Sync */}
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                        <Database size={14} className="text-[var(--color-gold)]" />
                        Bulk Sync
                    </h3>
                    <textarea
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                        placeholder="Enter tickers separated by commas, spaces, or newlines:&#10;AAPL, MSFT, GOOGL, AMZN&#10;NVDA&#10;META"
                        className="w-full h-[120px] bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-foreground)] placeholder-[var(--color-muted-dark)] outline-none focus:border-[var(--color-border-focus)] resize-none mb-3"
                    />
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleBulkSync}
                            disabled={bulkSyncing || !bulkInput.trim()}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-gold)] text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                            <Download size={14} />
                            {bulkSyncing ? 'Syncing...' : 'Sync All'}
                        </button>
                        {bulkProgress && (
                            <span className="text-xs text-[var(--color-muted)] font-[family-name:var(--font-jetbrains-mono)]">{bulkProgress}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Data Table + Detail Panel */}
            <div className="grid grid-cols-3 gap-5">
                {/* Table */}
                <div className={clsx('bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden', selectedTicker ? 'col-span-2' : 'col-span-3')}>
                    <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                            Synced Tickers ({tickers.length})
                        </h3>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-[var(--color-card)]">
                                <tr className="border-b border-[var(--color-border)]">
                                    <th className="text-left text-xs text-[var(--color-muted-dark)] font-medium uppercase tracking-wider py-2.5 px-5 cursor-pointer hover:text-[var(--color-foreground)]" onClick={() => handleSort('ticker')}>
                                        <span className="flex items-center gap-1">Ticker <ArrowUpDown size={10} /></span>
                                    </th>
                                    <th className="text-left text-xs text-[var(--color-muted-dark)] font-medium uppercase tracking-wider py-2.5 px-5">Name</th>
                                    <th className="text-left text-xs text-[var(--color-muted-dark)] font-medium uppercase tracking-wider py-2.5 px-5">Sector</th>
                                    <th className="text-right text-xs text-[var(--color-muted-dark)] font-medium uppercase tracking-wider py-2.5 px-5">Price</th>
                                    <th className="text-right text-xs text-[var(--color-muted-dark)] font-medium uppercase tracking-wider py-2.5 px-5 cursor-pointer hover:text-[var(--color-foreground)]" onClick={() => handleSort('market_cap')}>
                                        <span className="flex items-center justify-end gap-1">Mkt Cap <ArrowUpDown size={10} /></span>
                                    </th>
                                    <th className="text-right text-xs text-[var(--color-muted-dark)] font-medium uppercase tracking-wider py-2.5 px-5">Points</th>
                                    <th className="text-right text-xs text-[var(--color-muted-dark)] font-medium uppercase tracking-wider py-2.5 px-5 cursor-pointer hover:text-[var(--color-foreground)]" onClick={() => handleSort('synced_at')}>
                                        <span className="flex items-center justify-end gap-1">Synced <ArrowUpDown size={10} /></span>
                                    </th>
                                    <th className="text-right text-xs text-[var(--color-muted-dark)] font-medium uppercase tracking-wider py-2.5 px-5">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={8} className="text-center py-12 text-sm text-[var(--color-muted-dark)]">Loading...</td></tr>
                                ) : sortedTickers.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center py-12 text-sm text-[var(--color-muted-dark)]">No tickers synced yet. Use search or presets above to add data.</td></tr>
                                ) : sortedTickers.map((t) => (
                                    <tr
                                        key={t.ticker}
                                        className={clsx(
                                            'border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-card-hover)] transition-colors cursor-pointer',
                                            selectedTicker === t.ticker && 'bg-[var(--color-card-hover)]'
                                        )}
                                        onClick={() => handleViewDetail(t.ticker)}
                                    >
                                        <td className="py-3 px-5 text-sm font-semibold font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-accent)]">{t.ticker}</td>
                                        <td className="py-3 px-5 text-sm text-[var(--color-foreground)] max-w-[180px] truncate">{t.name}</td>
                                        <td className="py-3 px-5">
                                            <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-border)] text-[var(--color-muted)]">{t.sector}</span>
                                        </td>
                                        <td className="py-3 px-5 text-sm text-right font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-foreground)]">
                                            {t.current_price ? `$${t.current_price.toLocaleString()}` : '—'}
                                        </td>
                                        <td className="py-3 px-5 text-sm text-right font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted)]">
                                            {formatMarketCap(t.market_cap)}
                                        </td>
                                        <td className="py-3 px-5 text-sm text-right font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted-dark)]">
                                            {t.data_points}
                                        </td>
                                        <td className="py-3 px-5 text-xs text-right text-[var(--color-muted-dark)]">
                                            {formatTimeAgo(t.synced_at)}
                                        </td>
                                        <td className="py-3 px-5">
                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleSyncOne(t.ticker)}
                                                    disabled={syncingTicker === t.ticker}
                                                    className="p-1.5 rounded hover:bg-[var(--color-accent-bg)] text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
                                                    title="Re-sync"
                                                >
                                                    <RefreshCw size={13} className={syncingTicker === t.ticker ? 'animate-spin' : ''} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(t.ticker)}
                                                    className="p-1.5 rounded hover:bg-[var(--color-loss-bg)] text-[var(--color-muted)] hover:text-[var(--color-loss)] transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail Panel */}
                {selectedTicker && detail && (
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden col-span-1">
                        <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-accent)]">{selectedTicker}</h3>
                                <p className="text-xs text-[var(--color-muted)] mt-0.5">{detail?.company?.name}</p>
                            </div>
                            <button onClick={() => { setSelectedTicker(null); setTickerDetail(null); }} className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
                                <XCircle size={16} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4 max-h-[440px] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Price', value: detail?.current_price ? `$${detail.current_price}` : '—' },
                                    { label: 'Data Points', value: detail?.data_points },
                                    { label: 'Sector', value: detail?.company?.sector || '—' },
                                    { label: 'Industry', value: detail?.company?.industry || '—' },
                                ].map(item => (
                                    <div key={item.label} className="bg-[var(--color-background)] rounded-lg p-3">
                                        <p className="text-[10px] text-[var(--color-muted-dark)] uppercase tracking-wider">{item.label}</p>
                                        <p className="text-sm font-medium text-[var(--color-foreground)] mt-1">{String(item.value)}</p>
                                    </div>
                                ))}
                            </div>
                            {detail?.stats && (
                                <>
                                    <p className="text-xs font-semibold text-[var(--color-muted-dark)] uppercase tracking-wider">Key Statistics</p>
                                    <div className="space-y-1.5">
                                        {Object.entries(detail.stats as Record<string, unknown>).slice(0, 15).map(([k, v]) => (
                                            <div key={k} className="flex items-center justify-between text-xs py-1 border-b border-[var(--color-border)] last:border-0">
                                                <span className="text-[var(--color-muted)]">{k.replace(/_/g, ' ')}</span>
                                                <span className="font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-foreground)]">
                                                    {v === null ? '—' : typeof v === 'number' ? v.toLocaleString() : String(v)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            <p className="text-[10px] text-[var(--color-muted-dark)] font-[family-name:var(--font-jetbrains-mono)]">
                                Synced: {detail?.synced_at ? new Date(detail.synced_at).toLocaleString() : '—'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
