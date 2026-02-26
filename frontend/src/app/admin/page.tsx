'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Database, Activity, Server, Clock, RefreshCw, ArrowUpRight,
    TrendingUp, HardDrive, Zap, BarChart3
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/admin';

interface OverviewData {
    total_tickers: number;
    total_data_points: number;
    total_market_cap: number;
    total_db_size_mb: number;
    last_sync: string;
    sectors: Record<string, number>;
    recent_logs: Array<{
        timestamp: string;
        level: string;
        message: string;
        ticker: string;
    }>;
}

function formatMarketCap(value: number): string {
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

export default function AdminOverviewPage() {
    const [overview, setOverview] = useState<OverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const fetchOverview = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/overview`);
            if (res.ok) {
                const data = await res.json();
                setOverview(data);
            }
        } catch (err) {
            console.error('Failed to fetch overview:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    const handleQuickSync = async () => {
        setSyncing(true);
        try {
            await fetch(`${API_BASE}/sync/preset/us_tech`, { method: 'POST' });
            await fetchOverview();
        } catch (err) {
            console.error('Quick sync failed:', err);
        } finally {
            setSyncing(false);
        }
    };

    const kpiCards = [
        {
            label: 'Synced Tickers',
            value: overview?.total_tickers ?? 0,
            icon: Database,
            color: '#3B82F6',
            bg: 'rgba(59,130,246,0.1)',
        },
        {
            label: 'Data Points',
            value: overview?.total_data_points?.toLocaleString() ?? '0',
            icon: BarChart3,
            color: '#22C55E',
            bg: 'rgba(34,197,94,0.1)',
        },
        {
            label: 'Total Market Cap',
            value: formatMarketCap(overview?.total_market_cap ?? 0),
            icon: TrendingUp,
            color: '#EAB308',
            bg: 'rgba(234,179,8,0.1)',
        },
        {
            label: 'DB Size',
            value: `${overview?.total_db_size_mb ?? 0} MB`,
            icon: HardDrive,
            color: '#8B5CF6',
            bg: 'rgba(139,92,246,0.1)',
        },
    ];

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
                        Admin Overview
                    </h1>
                    <p className="text-sm text-[var(--color-muted)] mt-1">
                        Monitor your data pipeline and system health
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchOverview}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-border-focus)] transition-all"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                    <button
                        onClick={handleQuickSync}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#EF4444] to-[#F97316] text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        <Zap size={14} />
                        {syncing ? 'Syncing...' : 'Quick Sync US Tech'}
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-5">
                {kpiCards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-border-focus)] transition-colors group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-[var(--color-muted-dark)] uppercase tracking-wider">
                                {card.label}
                            </span>
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: card.bg }}
                            >
                                <card.icon size={16} style={{ color: card.color }} />
                            </div>
                        </div>
                        <p className="text-3xl font-semibold font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-foreground)]">
                            {loading ? '—' : card.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Last Sync + Sectors */}
            <div className="grid grid-cols-3 gap-5">
                {/* Last Sync */}
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={16} className="text-[var(--color-muted-dark)]" />
                        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Last Sync</h3>
                    </div>
                    <p className="text-lg font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-foreground)]">
                        {loading ? '—' : formatTimeAgo(overview?.last_sync ?? '')}
                    </p>
                    <p className="text-xs text-[var(--color-muted-dark)] mt-1 font-[family-name:var(--font-jetbrains-mono)]">
                        {overview?.last_sync ? new Date(overview.last_sync).toLocaleString() : 'No syncs yet'}
                    </p>
                </div>

                {/* API Status */}
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity size={16} className="text-[var(--color-profit)]" />
                        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">API Status</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--color-profit)] animate-pulse" />
                        <span className="text-lg font-medium text-[var(--color-profit)]">All Systems Go</span>
                    </div>
                    <p className="text-xs text-[var(--color-muted-dark)] mt-1">
                        YFinance • FastAPI • JSON DB
                    </p>
                </div>

                {/* Quick Links */}
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Server size={16} className="text-[var(--color-muted-dark)]" />
                        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Quick Actions</h3>
                    </div>
                    <div className="space-y-2">
                        <a href="/admin/data" className="flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline">
                            <ArrowUpRight size={12} /> Manage Data
                        </a>
                        <a href="/admin/logs" className="flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline">
                            <ArrowUpRight size={12} /> View Logs
                        </a>
                    </div>
                </div>
            </div>

            {/* Sectors + Recent Logs */}
            <div className="grid grid-cols-2 gap-5">
                {/* Sectors Breakdown */}
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-4">Sectors Breakdown</h3>
                    {!overview?.sectors || Object.keys(overview.sectors).length === 0 ? (
                        <p className="text-sm text-[var(--color-muted-dark)]">No data yet. Sync some tickers to see sector breakdown.</p>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(overview.sectors).map(([sector, count]) => {
                                const total = overview.total_tickers || 1;
                                const pct = Math.round((count / total) * 100);
                                return (
                                    <div key={sector}>
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-[var(--color-muted)]">{sector}</span>
                                            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted-dark)]">{count} ({pct}%)</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Logs */}
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-[var(--color-border)]">
                        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Recent Activity</h3>
                    </div>
                    {!overview?.recent_logs || overview.recent_logs.length === 0 ? (
                        <p className="p-5 text-sm text-[var(--color-muted-dark)]">No activity yet.</p>
                    ) : (
                        <div className="max-h-[280px] overflow-y-auto">
                            {overview.recent_logs.map((log, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3 px-5 py-3 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-card-hover)] transition-colors"
                                >
                                    <div
                                        className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${log.level === 'error' ? 'bg-[var(--color-loss)]' :
                                                log.level === 'warn' ? 'bg-[var(--color-gold)]' :
                                                    'bg-[var(--color-profit)]'
                                            }`}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-[var(--color-foreground)] truncate">{log.message}</p>
                                        <p className="text-xs text-[var(--color-muted-dark)] font-[family-name:var(--font-jetbrains-mono)] mt-0.5">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
