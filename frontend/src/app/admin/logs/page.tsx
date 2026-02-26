'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    ScrollText, RefreshCw, Filter, CheckCircle2, AlertTriangle,
    XCircle, Clock, Trash2
} from 'lucide-react';
import clsx from 'clsx';

const API_BASE = 'http://localhost:8000/api/admin';

interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    ticker: string;
}

export default function LogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [levelFilter, setLevelFilter] = useState<string>('all');
    const [autoRefresh, setAutoRefresh] = useState(false);

    const fetchLogs = useCallback(async () => {
        try {
            const params = new URLSearchParams({ limit: '100' });
            if (levelFilter !== 'all') params.set('level', levelFilter);
            const res = await fetch(`${API_BASE}/logs?${params}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs || []);
            }
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        } finally {
            setLoading(false);
        }
    }, [levelFilter]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, [autoRefresh, fetchLogs]);

    const getIcon = (level: string) => {
        switch (level) {
            case 'error': return <XCircle size={14} className="text-[var(--color-loss)]" />;
            case 'warn': return <AlertTriangle size={14} className="text-[var(--color-gold)]" />;
            default: return <CheckCircle2 size={14} className="text-[var(--color-profit)]" />;
        }
    };

    const infoCount = logs.filter(l => l.level === 'info').length;
    const warnCount = logs.filter(l => l.level === 'warn').length;
    const errorCount = logs.filter(l => l.level === 'error').length;

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">System Logs</h1>
                    <p className="text-sm text-[var(--color-muted)] mt-1">Monitor sync activity and system events</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setAutoRefresh(prev => !prev)}
                        className={clsx(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                            autoRefresh
                                ? 'bg-[var(--color-profit-bg)] border-[rgba(34,197,94,0.2)] text-[var(--color-profit)]'
                                : 'bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
                        )}
                    >
                        <RefreshCw size={14} className={autoRefresh ? 'animate-spin' : ''} />
                        {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh'}
                    </button>
                    <button
                        onClick={fetchLogs}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-all"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats + Filter */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {[
                        { label: 'All', value: 'all', count: logs.length, color: 'var(--color-accent)' },
                        { label: 'Info', value: 'info', count: infoCount, color: 'var(--color-profit)' },
                        { label: 'Warn', value: 'warn', count: warnCount, color: 'var(--color-gold)' },
                        { label: 'Error', value: 'error', count: errorCount, color: 'var(--color-loss)' },
                    ].map(f => (
                        <button
                            key={f.value}
                            onClick={() => setLevelFilter(f.value)}
                            className={clsx(
                                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                                levelFilter === f.value
                                    ? 'bg-[var(--color-card)] border border-[var(--color-border-focus)] text-[var(--color-foreground)]'
                                    : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
                            )}
                        >
                            <div className="w-2 h-2 rounded-full" style={{ background: f.color }} />
                            {f.label}
                            <span className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted-dark)]">{f.count}</span>
                        </button>
                    ))}
                </div>
                <span className="text-xs text-[var(--color-muted-dark)]">{logs.length} entries</span>
            </div>

            {/* Log Table */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-16 text-sm text-[var(--color-muted-dark)]">Loading logs...</div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-16">
                            <ScrollText size={32} className="text-[var(--color-muted-dark)] mx-auto mb-3" />
                            <p className="text-sm text-[var(--color-muted-dark)]">No logs yet. Sync some tickers to generate activity.</p>
                        </div>
                    ) : (
                        logs.map((log, i) => (
                            <div
                                key={i}
                                className={clsx(
                                    'flex items-start gap-4 px-5 py-3 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-card-hover)] transition-colors',
                                    log.level === 'error' && 'bg-[rgba(239,68,68,0.03)]'
                                )}
                            >
                                <div className="mt-0.5 flex-shrink-0">{getIcon(log.level)}</div>
                                <div className="flex-1 min-w-0">
                                    <p className={clsx(
                                        'text-sm',
                                        log.level === 'error' ? 'text-[var(--color-loss)]' : 'text-[var(--color-foreground)]'
                                    )}>
                                        {log.message}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted-dark)]">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </span>
                                        {log.ticker && (
                                            <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-border)] text-[var(--color-muted)] font-[family-name:var(--font-jetbrains-mono)]">
                                                {log.ticker}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className={clsx(
                                    'text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded',
                                    log.level === 'error' ? 'bg-[var(--color-loss-bg)] text-[var(--color-loss)]' :
                                        log.level === 'warn' ? 'bg-[var(--color-gold-bg)] text-[var(--color-gold)]' :
                                            'bg-[var(--color-profit-bg)] text-[var(--color-profit)]'
                                )}>
                                    {log.level}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
