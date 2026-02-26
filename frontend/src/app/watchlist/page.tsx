'use client';

import { useState } from 'react';
import { mockWatchlist } from '@/data/mockData';
import {
    Star,
    TrendingUp,
    TrendingDown,
    Trash2,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
} from 'lucide-react';
import clsx from 'clsx';

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(value);
}

function formatVolume(value: number): string {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
}

export default function WatchlistPage() {
    const [watchlist, setWatchlist] = useState(mockWatchlist);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTicker, setNewTicker] = useState('');

    const removeItem = (id: string) => {
        setWatchlist((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <div className="h-[calc(100vh-64px)] w-full overflow-y-auto p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Star size={22} className="text-[var(--color-gold)]" />
                    <div>
                        <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">Watchlist</h1>
                        <p className="text-sm text-[var(--color-muted-dark)]">
                            {watchlist.length} stocks being monitored
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowAddModal(!showAddModal)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Plus size={16} />
                    Add Stock
                </button>
            </div>

            {/* Add Stock Input */}
            {showAddModal && (
                <div className="mb-6 flex items-center gap-3">
                    <input
                        type="text"
                        value={newTicker}
                        onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                        placeholder="Enter ticker symbol (e.g. TSLA)"
                        className="flex-1 max-w-sm px-4 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted-dark)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                    />
                    <button
                        onClick={() => {
                            if (newTicker.trim()) {
                                setNewTicker('');
                                setShowAddModal(false);
                            }
                        }}
                        className="px-4 py-2.5 bg-[var(--color-profit)] text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Add
                    </button>
                    <button
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Watchlist Table */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--color-border)]">
                            {['Symbol', 'Price', 'Change', '52W High', '52W Low', '52W Range', 'Volume', ''].map(
                                (header, i) => (
                                    <th
                                        key={i}
                                        className="text-left text-xs text-[var(--color-muted-dark)] font-medium uppercase tracking-wider py-3 px-5"
                                    >
                                        {header}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {watchlist.map((item) => {
                            const rangePercent =
                                ((item.currentPrice - item.week52Low) /
                                    (item.week52High - item.week52Low)) *
                                100;

                            return (
                                <tr
                                    key={item.id}
                                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-card-hover)] transition-colors duration-150 group"
                                >
                                    {/* Symbol */}
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-bg)] flex items-center justify-center">
                                                <BarChart3 size={14} className="text-[var(--color-accent)]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[var(--color-foreground)]">
                                                    {item.symbol}
                                                </p>
                                                <p className="text-xs text-[var(--color-muted-dark)] truncate max-w-[140px]">
                                                    {item.name}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Price */}
                                    <td className="py-4 px-5 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-foreground)]">
                                        {formatCurrency(item.currentPrice)}
                                    </td>

                                    {/* Change */}
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-1.5">
                                            {item.dailyChangePercent >= 0 ? (
                                                <ArrowUpRight size={14} className="text-[var(--color-profit)]" />
                                            ) : (
                                                <ArrowDownRight size={14} className="text-[var(--color-loss)]" />
                                            )}
                                            <span
                                                className={clsx(
                                                    'text-sm font-[family-name:var(--font-jetbrains-mono)] px-2 py-0.5 rounded',
                                                    item.dailyChangePercent >= 0
                                                        ? 'text-[var(--color-profit)] bg-[var(--color-profit-bg)]'
                                                        : 'text-[var(--color-loss)] bg-[var(--color-loss-bg)]'
                                                )}
                                            >
                                                {item.dailyChangePercent >= 0 ? '+' : ''}
                                                {item.dailyChangePercent.toFixed(2)}%
                                            </span>
                                        </div>
                                    </td>

                                    {/* 52W High */}
                                    <td className="py-4 px-5 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted)]">
                                        {formatCurrency(item.week52High)}
                                    </td>

                                    {/* 52W Low */}
                                    <td className="py-4 px-5 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted)]">
                                        {formatCurrency(item.week52Low)}
                                    </td>

                                    {/* 52W Range Bar */}
                                    <td className="py-4 px-5">
                                        <div className="w-28">
                                            <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-loss)] via-[var(--color-gold)] to-[var(--color-profit)]"
                                                    style={{ width: `${rangePercent}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-[var(--color-muted-dark)] mt-1 text-center">
                                                {rangePercent.toFixed(0)}% of range
                                            </p>
                                        </div>
                                    </td>

                                    {/* Volume */}
                                    <td className="py-4 px-5 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted)]">
                                        {formatVolume(item.volume)}
                                    </td>

                                    {/* Actions */}
                                    <td className="py-4 px-5">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-1.5 rounded-lg text-[var(--color-muted-dark)] hover:text-[var(--color-loss)] hover:bg-[var(--color-loss-bg)] transition-all duration-200 opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {watchlist.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center mb-4">
                        <Star size={28} className="text-[var(--color-muted-dark)]" />
                    </div>
                    <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
                        No stocks in your watchlist
                    </h2>
                    <p className="text-sm text-[var(--color-muted-dark)] max-w-sm">
                        Add stocks to your watchlist to monitor their prices, volume, and 52-week range without owning them.
                    </p>
                </div>
            )}
        </div>
    );
}
