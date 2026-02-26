'use client';

import { useState, useMemo } from 'react';
import { mockJournalEntries } from '@/data/mockData';
import {
    BookOpen, Plus, Filter, TrendingUp, TrendingDown,
    ArrowUpRight, ArrowDownRight, Tag, Calendar,
    BarChart3, CheckCircle2, Clock, XCircle,
} from 'lucide-react';
import clsx from 'clsx';

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
}

const statusConfig = {
    Open: { icon: Clock, color: 'text-[var(--color-accent)]', bg: 'bg-[var(--color-accent-bg)]' },
    Closed: { icon: CheckCircle2, color: 'text-[var(--color-profit)]', bg: 'bg-[var(--color-profit-bg)]' },
    Stopped: { icon: XCircle, color: 'text-[var(--color-loss)]', bg: 'bg-[var(--color-loss-bg)]' },
};

export default function JournalPage() {
    const [entries] = useState(mockJournalEntries);
    const [filter, setFilter] = useState<'all' | 'Open' | 'Closed' | 'Stopped'>('all');
    const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

    const filtered = useMemo(() => {
        if (filter === 'all') return entries;
        return entries.filter((e) => e.status === filter);
    }, [entries, filter]);

    // Stats
    const closedTrades = entries.filter((e) => e.status === 'Closed' || e.status === 'Stopped');
    const totalPnl = closedTrades.reduce((sum, e) => sum + (e.pnl ?? 0), 0);
    const winRate = closedTrades.length > 0
        ? (closedTrades.filter((e) => (e.pnl ?? 0) > 0).length / closedTrades.length) * 100
        : 0;
    const avgWin = closedTrades.filter((e) => (e.pnl ?? 0) > 0).reduce((s, e) => s + (e.pnl ?? 0), 0) / (closedTrades.filter((e) => (e.pnl ?? 0) > 0).length || 1);
    const avgLoss = closedTrades.filter((e) => (e.pnl ?? 0) < 0).reduce((s, e) => s + (e.pnl ?? 0), 0) / (closedTrades.filter((e) => (e.pnl ?? 0) < 0).length || 1);

    return (
        <div className="flex h-[calc(100vh-64px)] w-full">
            {/* Stats Sidebar */}
            <aside className="w-[300px] h-full overflow-y-auto border-r border-[var(--color-border)] p-5 flex flex-col gap-6 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-[var(--color-gold)]" />
                    <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Trade Journal</h2>
                </div>

                {/* Stats Cards */}
                <div className="flex flex-col gap-3">
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
                        <p className="text-xs text-[var(--color-muted-dark)] mb-1">Total P&L</p>
                        <p className={clsx('text-2xl font-[family-name:var(--font-jetbrains-mono)] font-semibold',
                            totalPnl >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]')}>
                            {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-3">
                            <p className="text-xs text-[var(--color-muted-dark)] mb-0.5">Win Rate</p>
                            <p className="text-lg font-[family-name:var(--font-jetbrains-mono)] font-semibold text-[var(--color-foreground)]">{winRate.toFixed(0)}%</p>
                        </div>
                        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-3">
                            <p className="text-xs text-[var(--color-muted-dark)] mb-0.5">Total Trades</p>
                            <p className="text-lg font-[family-name:var(--font-jetbrains-mono)] font-semibold text-[var(--color-foreground)]">{closedTrades.length}</p>
                        </div>
                        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-3">
                            <p className="text-xs text-[var(--color-muted-dark)] mb-0.5">Avg Win</p>
                            <p className="text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-profit)]">+{formatCurrency(avgWin)}</p>
                        </div>
                        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-3">
                            <p className="text-xs text-[var(--color-muted-dark)] mb-0.5">Avg Loss</p>
                            <p className="text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-loss)]">{formatCurrency(avgLoss)}</p>
                        </div>
                    </div>
                </div>

                <div className="h-[1px] bg-[var(--color-border)]" />

                {/* Filters */}
                <div>
                    <p className="text-xs text-[var(--color-muted-dark)] uppercase tracking-wider mb-3">Filter by Status</p>
                    <div className="flex flex-col gap-1">
                        {['all', 'Open', 'Closed', 'Stopped'].map((f) => (
                            <button key={f} onClick={() => setFilter(f as typeof filter)}
                                className={clsx('text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                    filter === f ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:bg-[var(--color-card)] hover:text-[var(--color-foreground)]')}>
                                {f === 'all' ? 'All Trades' : f} {f !== 'all' && `(${entries.filter((e) => e.status === f).length})`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[1px] bg-[var(--color-border)]" />

                {/* Strategy Breakdown */}
                <div>
                    <p className="text-xs text-[var(--color-muted-dark)] uppercase tracking-wider mb-3">By Strategy</p>
                    {Array.from(new Set(entries.map((e) => e.strategy))).map((strat) => {
                        const count = entries.filter((e) => e.strategy === strat).length;
                        return (
                            <div key={strat} className="flex items-center justify-between py-1.5 px-1">
                                <span className="text-sm text-[var(--color-muted)]">{strat}</span>
                                <span className="text-xs text-[var(--color-muted-dark)] bg-[var(--color-border)] px-2 py-0.5 rounded-full">{count}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Add Trade Button */}
                <button className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--color-accent)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity mt-auto">
                    <Plus size={16} />
                    Log New Trade
                </button>
            </aside>

            {/* Journal Entries */}
            <section className="flex-1 h-full overflow-y-auto p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
                        {filter === 'all' ? 'All Trades' : `${filter} Trades`}
                        <span className="text-sm text-[var(--color-muted-dark)] ml-2">({filtered.length})</span>
                    </h2>
                </div>

                <div className="flex flex-col gap-3">
                    {filtered.map((entry) => {
                        const isExpanded = expandedEntry === entry.id;
                        const StatusIcon = statusConfig[entry.status].icon;

                        return (
                            <div key={entry.id}
                                className={clsx('bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden transition-all duration-200',
                                    isExpanded && 'border-[var(--color-border-focus)]')}>
                                {/* Entry Header */}
                                <button onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                                    className="w-full text-left p-5 hover:bg-[var(--color-card-hover)] transition-colors">
                                    <div className="flex items-center gap-4">
                                        {/* Ticker + Side */}
                                        <div className="flex items-center gap-2 min-w-[100px]">
                                            <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center',
                                                entry.side === 'Long' ? 'bg-[var(--color-profit-bg)]' : 'bg-[var(--color-loss-bg)]')}>
                                                {entry.side === 'Long' ? <TrendingUp size={14} className="text-[var(--color-profit)]" /> : <TrendingDown size={14} className="text-[var(--color-loss)]" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[var(--color-foreground)]">{entry.ticker}</p>
                                                <p className="text-xs text-[var(--color-muted-dark)]">{entry.side}</p>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted-dark)] min-w-[90px]">
                                            <Calendar size={12} />
                                            {entry.date}
                                        </div>

                                        {/* Strategy */}
                                        <span className="text-xs text-[var(--color-accent)] bg-[var(--color-accent-bg)] px-2 py-0.5 rounded font-medium">
                                            {entry.strategy}
                                        </span>

                                        {/* Entry/Exit */}
                                        <div className="flex items-center gap-4 ml-auto">
                                            <div className="text-right">
                                                <p className="text-xs text-[var(--color-muted-dark)]">Entry</p>
                                                <p className="text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-foreground)]">{formatCurrency(entry.entryPrice)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-[var(--color-muted-dark)]">Exit</p>
                                                <p className="text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-foreground)]">
                                                    {entry.exitPrice ? formatCurrency(entry.exitPrice) : '—'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* P/L */}
                                        <div className="text-right min-w-[90px]">
                                            {entry.pnl !== null ? (
                                                <>
                                                    <p className={clsx('text-sm font-[family-name:var(--font-jetbrains-mono)] font-semibold',
                                                        entry.pnl >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]')}>
                                                        {entry.pnl >= 0 ? '+' : ''}{formatCurrency(entry.pnl)}
                                                    </p>
                                                    <p className={clsx('text-xs font-[family-name:var(--font-jetbrains-mono)]',
                                                        entry.pnl >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]')}>
                                                        {entry.pnlPercent !== null && `${entry.pnlPercent >= 0 ? '+' : ''}${entry.pnlPercent.toFixed(2)}%`}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-sm text-[var(--color-muted-dark)]">—</p>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div className={clsx('flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
                                            statusConfig[entry.status].color, statusConfig[entry.status].bg)}>
                                            <StatusIcon size={12} />
                                            {entry.status}
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="px-5 pb-5 pt-0 border-t border-[var(--color-border)]">
                                        <div className="grid grid-cols-2 gap-6 pt-4">
                                            <div>
                                                <p className="text-xs text-[var(--color-muted-dark)] uppercase tracking-wider mb-2">Trade Notes</p>
                                                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{entry.notes}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-[var(--color-muted-dark)] uppercase tracking-wider mb-2">Setup</p>
                                                <p className="text-sm text-[var(--color-foreground)] font-medium mb-3">{entry.setup}</p>

                                                <p className="text-xs text-[var(--color-muted-dark)] uppercase tracking-wider mb-2">Tags</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {entry.tags.map((tag) => (
                                                        <span key={tag} className="flex items-center gap-1 text-xs text-[var(--color-muted)] bg-[var(--color-border)] px-2 py-1 rounded">
                                                            <Tag size={10} />{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center mb-4">
                            <BookOpen size={28} className="text-[var(--color-muted-dark)]" />
                        </div>
                        <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">No trades found</h2>
                        <p className="text-sm text-[var(--color-muted-dark)] max-w-sm">No trades match the current filter. Try selecting a different status.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
