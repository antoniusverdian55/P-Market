'use client';

import { useState, useMemo } from 'react';
import {
    mockPositions, mockMetrics, mockEquityCurve,
    mockRiskMetrics, mockCorrelationMatrix, mockDividendSummary, mockAttribution,
} from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import {
    Plus, ArrowUpRight, ArrowDownRight, TrendingUp, Shield,
    DollarSign, Grid3X3, Download, BarChart2,
} from 'lucide-react';
import clsx from 'clsx';

const timeframes = ['1W', '1M', '3M', 'YTD', 'ALL'] as const;
const portfolioViews = [
    { id: 'overview' as const, label: 'Overview', icon: TrendingUp },
    { id: 'risk' as const, label: 'Risk', icon: Shield },
    { id: 'dividends' as const, label: 'Dividends', icon: DollarSign },
    { id: 'correlation' as const, label: 'Correlation', icon: Grid3X3 },
    { id: 'attribution' as const, label: 'Attribution', icon: BarChart2 },
];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
}

function formatPercent(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

// ===== Overview Tab =====
function OverviewTab() {
    const { timeframe, setTimeframe } = useAppStore();
    const [sortBy, setSortBy] = useState<'symbol' | 'percentChange' | 'totalPnL'>('totalPnL');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const positions = mockPositions;
    const metrics = mockMetrics;

    const sortedPositions = useMemo(() => {
        return [...positions].sort((a, b) => {
            const aVal = a[sortBy] as number | string;
            const bVal = b[sortBy] as number | string;
            if (typeof aVal === 'string' && typeof bVal === 'string')
                return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
        });
    }, [positions, sortBy, sortDir]);

    const handleSort = (col: typeof sortBy) => {
        if (sortBy === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortDir('desc'); }
    };

    const filteredCurve = useMemo(() => {
        const now = mockEquityCurve.length;
        const map: Record<string, number> = { '1W': 7, '1M': 30, '3M': 90, YTD: 60, ALL: now };
        return mockEquityCurve.slice(-(map[timeframe] || now));
    }, [timeframe]);

    return (
        <>
            {/* Equity Curve */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <TrendingUp size={20} className="text-[var(--color-gold)]" />
                    <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Equity Curve</h2>
                </div>
                <div className="flex items-center gap-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-1">
                    {timeframes.map((tf) => (
                        <button key={tf} onClick={() => setTimeframe(tf)}
                            className={clsx('px-3 py-1 text-xs font-medium rounded-md transition-all duration-200',
                                timeframe === tf ? 'bg-[var(--color-border)] text-[var(--color-foreground)]' : 'text-[var(--color-muted-dark)] hover:text-[var(--color-muted)]'
                            )}>
                            {tf}
                        </button>
                    ))}
                </div>
            </div>
            <div className="chart-container mb-8">
                <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={filteredCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#EAB308" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#EAB308" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="benchmarkGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#71717A" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="#71717A" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="date" stroke="var(--color-border-focus)" tick={{ fill: 'var(--color-muted-dark)', fontSize: 11 }}
                            tickFormatter={(val) => { const d = new Date(val); return `${d.getMonth() + 1}/${d.getDate()}`; }} interval="preserveStartEnd" />
                        <YAxis stroke="var(--color-border-focus)" tick={{ fill: 'var(--color-muted-dark)', fontSize: 11 }}
                            tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} width={60} />
                        <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)', fontFamily: 'var(--font-jetbrains-mono)', fontSize: '12px' }}
                            formatter={(value) => [formatCurrency(Number(value))]} labelFormatter={(label) => new Date(label).toLocaleDateString()} />
                        <Area type="monotone" dataKey="benchmark" stroke="#71717A" strokeWidth={1.5} fill="url(#benchmarkGrad)" name="S&P 500" />
                        <Area type="monotone" dataKey="portfolio" stroke="#EAB308" strokeWidth={2} fill="url(#portfolioGrad)" name="Portfolio" />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-6 mt-4 px-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-[2px] bg-[#EAB308] rounded" /><span className="text-xs text-[var(--color-muted)]">Your Portfolio</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-[2px] bg-[#71717A] rounded" /><span className="text-xs text-[var(--color-muted-dark)]">S&P 500</span></div>
                </div>
            </div>

            {/* Key Statistics */}
            <h3 className="text-sm text-[var(--color-muted-dark)] uppercase tracking-wider mb-4">Key Statistics</h3>
            <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Sharpe Ratio', value: metrics.sharpeRatio.toFixed(2), color: 'text-[var(--color-foreground)]' },
                    { label: 'Sortino Ratio', value: metrics.sortinoRatio.toFixed(2), color: 'text-[var(--color-foreground)]' },
                    { label: 'Max Drawdown', value: `${metrics.maxDrawdown}%`, color: 'text-[var(--color-loss)]' },
                    { label: 'Volatility', value: `${metrics.volatility}%`, color: 'text-[var(--color-foreground)]' },
                    { label: 'Beta', value: metrics.beta.toFixed(2), color: 'text-[var(--color-foreground)]' },
                    { label: 'Total Return', value: formatCurrency(metrics.totalReturn), color: 'text-[var(--color-profit)]' },
                    { label: 'Return %', value: formatPercent(metrics.totalReturnPercent), color: 'text-[var(--color-profit)]' },
                    { label: 'Daily P/L', value: formatCurrency(metrics.dailyPnL), color: 'text-[var(--color-profit)]' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-border-focus)] transition-colors duration-200">
                        <p className="text-xs text-[var(--color-muted-dark)] mb-1">{stat.label}</p>
                        <p className={clsx('text-lg font-[family-name:var(--font-jetbrains-mono)] font-semibold', stat.color)}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Positions Table */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-[var(--color-muted-dark)] uppercase tracking-wider">Active Positions</h3>
                <button className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">
                    <Download size={12} /> Export CSV
                </button>
            </div>
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--color-border)]">
                            {[
                                { key: 'symbol' as const, label: 'Symbol' },
                                { key: 'symbol' as const, label: 'Shares' },
                                { key: 'symbol' as const, label: 'Cost Basis' },
                                { key: 'symbol' as const, label: 'Current' },
                                { key: 'percentChange' as const, label: '% Chg' },
                                { key: 'totalPnL' as const, label: 'Total P/L' },
                            ].map((col, i) => (
                                <th key={i} onClick={() => i === 0 || i === 4 || i === 5 ? handleSort(col.key) : null}
                                    className={clsx('text-left text-xs text-[var(--color-muted-dark)] font-medium uppercase tracking-wider py-3 px-4',
                                        (i === 0 || i === 4 || i === 5) && 'cursor-pointer hover:text-[var(--color-muted)]')}>
                                    {col.label}
                                    {sortBy === col.key && i !== 1 && i !== 2 && i !== 3 && <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPositions.map((pos) => (
                            <tr key={pos.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-card-hover)] transition-colors duration-150 cursor-pointer">
                                <td className="py-3 px-4"><div><p className="text-sm font-medium text-[var(--color-foreground)]">{pos.symbol}</p><p className="text-xs text-[var(--color-muted-dark)]">{pos.name}</p></div></td>
                                <td className="py-3 px-4 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted)]">{pos.shares}</td>
                                <td className="py-3 px-4 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted)]">{formatCurrency(pos.costBasis)}</td>
                                <td className="py-3 px-4 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-foreground)]">{formatCurrency(pos.currentPrice)}</td>
                                <td className="py-3 px-4">
                                    <span className={clsx('text-sm font-[family-name:var(--font-jetbrains-mono)] px-2 py-0.5 rounded',
                                        pos.percentChange >= 0 ? 'text-[var(--color-profit)] bg-[var(--color-profit-bg)]' : 'text-[var(--color-loss)] bg-[var(--color-loss-bg)]')}>
                                        {formatPercent(pos.percentChange)}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <span className={clsx('text-sm font-[family-name:var(--font-jetbrains-mono)] font-medium',
                                        pos.totalPnL >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]')}>
                                        {formatCurrency(pos.totalPnL)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// ===== Risk Dashboard Tab =====
function RiskTab() {
    const risk = mockRiskMetrics;

    return (
        <>
            <div className="flex items-center gap-3 mb-6">
                <Shield size={20} className="text-[var(--color-loss)]" />
                <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Risk Dashboard</h2>
            </div>

            {/* VaR Cards */}
            <h3 className="text-sm text-[var(--color-muted-dark)] uppercase tracking-wider mb-4">Value at Risk (VaR)</h3>
            <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'VaR 95% (1-Day)', value: risk.var95_1d },
                    { label: 'VaR 99% (1-Day)', value: risk.var99_1d },
                    { label: 'VaR 95% (10-Day)', value: risk.var95_10d },
                    { label: 'VaR 99% (10-Day)', value: risk.var99_10d },
                ].map((item) => (
                    <div key={item.label} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-border-focus)] transition-colors">
                        <p className="text-xs text-[var(--color-muted-dark)] mb-1">{item.label}</p>
                        <p className="text-lg font-[family-name:var(--font-jetbrains-mono)] font-semibold text-[var(--color-loss)]">
                            {formatCurrency(item.value)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Sector Exposure + Position Sizing */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Sector Donut */}
                <div className="chart-container">
                    <h3 className="text-sm text-[var(--color-muted-dark)] uppercase tracking-wider mb-4">Sector Exposure</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={risk.sectorExposure} dataKey="weight" nameKey="sector" cx="50%" cy="50%"
                                innerRadius={55} outerRadius={85} paddingAngle={2} strokeWidth={0}>
                                {risk.sectorExposure.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)', fontSize: '12px' }}
                                formatter={(value) => [`${Number(value).toFixed(1)}%`]} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 mt-2 justify-center">
                        {risk.sectorExposure.map((s) => (
                            <div key={s.sector} className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                                <span className="text-xs text-[var(--color-muted)]">{s.sector} ({s.weight}%)</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Position Sizing */}
                <div className="chart-container">
                    <h3 className="text-sm text-[var(--color-muted-dark)] uppercase tracking-wider mb-4">Position Sizing vs Recommended</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={risk.positionSizing} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                            <XAxis type="number" tick={{ fill: 'var(--color-muted-dark)', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                            <YAxis type="category" dataKey="symbol" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} width={50} />
                            <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)', fontSize: '12px' }}
                                formatter={(value) => [`${Number(value).toFixed(1)}%`]} />
                            <Bar dataKey="weight" fill="var(--color-accent)" name="Current" radius={[0, 4, 4, 0]} barSize={10} />
                            <Bar dataKey="recommended" fill="var(--color-muted-dark)" name="Recommended" radius={[0, 4, 4, 0]} barSize={10} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
}

// ===== Dividends Tab =====
function DividendsTab() {
    const div = mockDividendSummary;
    const positions = mockPositions.filter((p) => (p.annualDividend ?? 0) > 0);

    return (
        <>
            <div className="flex items-center gap-3 mb-6">
                <DollarSign size={20} className="text-[var(--color-profit)]" />
                <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Dividend Tracking</h2>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-5">
                    <p className="text-xs text-[var(--color-muted-dark)] mb-1">Annual Dividend Income</p>
                    <p className="text-2xl font-[family-name:var(--font-jetbrains-mono)] font-semibold text-[var(--color-profit)]">
                        {formatCurrency(div.totalAnnualIncome)}
                    </p>
                </div>
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-5">
                    <p className="text-xs text-[var(--color-muted-dark)] mb-1">Portfolio Yield</p>
                    <p className="text-2xl font-[family-name:var(--font-jetbrains-mono)] font-semibold text-[var(--color-foreground)]">
                        {div.portfolioYield.toFixed(2)}%
                    </p>
                </div>
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-5">
                    <p className="text-xs text-[var(--color-muted-dark)] mb-1">Next Payout</p>
                    {div.nextPayout ? (
                        <div>
                            <p className="text-lg font-[family-name:var(--font-jetbrains-mono)] font-semibold text-[var(--color-gold)]">
                                {div.nextPayout.symbol} — {formatCurrency(div.nextPayout.amount)}
                            </p>
                            <p className="text-xs text-[var(--color-muted-dark)] mt-0.5">{div.nextPayout.date}</p>
                        </div>
                    ) : (
                        <p className="text-lg text-[var(--color-muted-dark)]">—</p>
                    )}
                </div>
            </div>

            {/* Dividend Yielding Positions */}
            <h3 className="text-sm text-[var(--color-muted-dark)] uppercase tracking-wider mb-4">Dividend-Paying Holdings</h3>
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg overflow-hidden mb-8">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--color-border)]">
                            {['Symbol', 'Shares', 'Yield', 'Annual Div/Share', 'Annual Income', 'Next Payout'].map((h) => (
                                <th key={h} className="text-left text-xs text-[var(--color-muted-dark)] font-medium uppercase tracking-wider py-3 px-4">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {positions.map((pos) => (
                            <tr key={pos.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-card-hover)] transition-colors">
                                <td className="py-3 px-4"><p className="text-sm font-medium text-[var(--color-foreground)]">{pos.symbol}</p><p className="text-xs text-[var(--color-muted-dark)]">{pos.name}</p></td>
                                <td className="py-3 px-4 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted)]">{pos.shares}</td>
                                <td className="py-3 px-4 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-profit)]">{(pos.dividendYield ?? 0).toFixed(2)}%</td>
                                <td className="py-3 px-4 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted)]">{formatCurrency(pos.annualDividend ?? 0)}</td>
                                <td className="py-3 px-4 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-profit)]">{formatCurrency((pos.annualDividend ?? 0) * pos.shares)}</td>
                                <td className="py-3 px-4 text-sm text-[var(--color-muted)]">{pos.nextDividendDate || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Dividend History */}
            <h3 className="text-sm text-[var(--color-muted-dark)] uppercase tracking-wider mb-4">Recent Payments</h3>
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--color-border)]">
                            {['Date', 'Symbol', 'Div/Share', 'Shares', 'Total Received'].map((h) => (
                                <th key={h} className="text-left text-xs text-[var(--color-muted-dark)] font-medium uppercase tracking-wider py-3 px-4">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {div.history.map((p, i) => (
                            <tr key={i} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-card-hover)] transition-colors">
                                <td className="py-3 px-4 text-sm text-[var(--color-muted)]">{p.date}</td>
                                <td className="py-3 px-4 text-sm font-medium text-[var(--color-foreground)]">{p.symbol}</td>
                                <td className="py-3 px-4 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted)]">{formatCurrency(p.amount)}</td>
                                <td className="py-3 px-4 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted)]">{p.shares}</td>
                                <td className="py-3 px-4 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-profit)]">{formatCurrency(p.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// ===== Correlation Matrix Tab =====
function CorrelationTab() {
    const symbols = ['AAPL', 'MSFT', 'NVDA', 'VOO', 'GOOGL', 'AMZN'];

    const getCorrelation = (a: string, b: string): number => {
        if (a === b) return 1.0;
        const entry = mockCorrelationMatrix.find(
            (e) => (e.pair[0] === a && e.pair[1] === b) || (e.pair[0] === b && e.pair[1] === a)
        );
        return entry?.correlation ?? 0;
    };

    const getColor = (val: number): string => {
        if (val >= 0.85) return '#EF4444';
        if (val >= 0.7) return '#F97316';
        if (val >= 0.5) return '#EAB308';
        if (val >= 0.3) return '#22C55E';
        return '#3B82F6';
    };

    return (
        <>
            <div className="flex items-center gap-3 mb-6">
                <Grid3X3 size={20} className="text-[var(--color-accent)]" />
                <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Correlation Matrix</h2>
            </div>

            <p className="text-sm text-[var(--color-muted-dark)] mb-6">
                Shows 90-day rolling correlation between portfolio positions. High correlation ({'>'}0.85) indicates concentration risk.
            </p>

            <div className="chart-container overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="py-2 px-3 text-xs text-[var(--color-muted-dark)]"></th>
                            {symbols.map((s) => (
                                <th key={s} className="py-2 px-3 text-xs font-medium text-[var(--color-foreground)] text-center">{s}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {symbols.map((row) => (
                            <tr key={row}>
                                <td className="py-2 px-3 text-xs font-medium text-[var(--color-foreground)]">{row}</td>
                                {symbols.map((col) => {
                                    const val = getCorrelation(row, col);
                                    return (
                                        <td key={col} className="py-1 px-1 text-center">
                                            <div
                                                className="heatmap-cell rounded-lg py-3 px-2 mx-auto cursor-default"
                                                style={{
                                                    backgroundColor: row === col ? 'var(--color-border)' : `${getColor(val)}20`,
                                                    minWidth: '56px',
                                                }}
                                                title={`${row} × ${col}: ${val.toFixed(2)}`}
                                            >
                                                <span
                                                    className="text-xs font-[family-name:var(--font-jetbrains-mono)] font-semibold"
                                                    style={{ color: row === col ? 'var(--color-muted-dark)' : getColor(val) }}
                                                >
                                                    {val.toFixed(2)}
                                                </span>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-6 justify-center">
                    {[
                        { label: 'High Risk (>0.85)', color: '#EF4444' },
                        { label: 'Moderate (0.7–0.85)', color: '#F97316' },
                        { label: 'Medium (0.5–0.7)', color: '#EAB308' },
                        { label: 'Low (<0.5)', color: '#22C55E' },
                    ].map((l) => (
                        <div key={l.label} className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: l.color }} />
                            <span className="text-xs text-[var(--color-muted)]">{l.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

// ===== Attribution Tab =====
function AttributionTab() {
    const attribution = mockAttribution;
    const totalContribution = attribution.reduce((sum, a) => sum + a.contribution, 0);

    return (
        <>
            <div className="flex items-center gap-3 mb-6">
                <BarChart2 size={20} className="text-[var(--color-accent)]" />
                <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Performance Attribution</h2>
            </div>

            <p className="text-sm text-[var(--color-muted-dark)] mb-6">
                Break down portfolio returns by individual position. Shows each position&apos;s contribution to total return.
            </p>

            {/* Total Return Banner */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-5 mb-8">
                <p className="text-xs text-[var(--color-muted-dark)] mb-1">Total Portfolio Contribution</p>
                <p className="text-3xl font-[family-name:var(--font-jetbrains-mono)] font-semibold text-[var(--color-profit)]">
                    +{totalContribution.toFixed(1)}%
                </p>
            </div>

            {/* Attribution Waterfall */}
            <div className="chart-container mb-8">
                <h3 className="text-sm text-[var(--color-muted-dark)] uppercase tracking-wider mb-4">Contribution by Position</h3>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={attribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} />
                        <YAxis tick={{ fill: 'var(--color-muted-dark)', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)', fontSize: '12px' }}
                            formatter={(value) => [`${Number(value).toFixed(1)}%`]} />
                        <Bar dataKey="contribution" name="Contribution" radius={[4, 4, 0, 0]} barSize={40}>
                            {attribution.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Attribution Table */}
            <h3 className="text-sm text-[var(--color-muted-dark)] uppercase tracking-wider mb-4">Detailed Breakdown</h3>
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--color-border)]">
                            {['Position', 'Weight', 'Return', 'Contribution'].map((h) => (
                                <th key={h} className="text-left text-xs text-[var(--color-muted-dark)] font-medium uppercase tracking-wider py-3 px-4">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {attribution.map((a) => (
                            <tr key={a.label} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-card-hover)] transition-colors">
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded" style={{ backgroundColor: a.color }} />
                                        <span className="text-sm font-medium text-[var(--color-foreground)]">{a.label}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted)]">{a.weight.toFixed(1)}%</td>
                                <td className="py-3 px-4">
                                    <span className="text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-profit)]">
                                        +{a.returnPercent.toFixed(1)}%
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-[family-name:var(--font-jetbrains-mono)] font-medium text-[var(--color-profit)]">
                                            +{a.contribution.toFixed(1)}%
                                        </span>
                                        <div className="w-20 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${(a.contribution / totalContribution) * 100}%`, backgroundColor: a.color }} />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// ===== Main Portfolio Page =====
export default function PortfolioPage() {
    const { portfolioView, setPortfolioView } = useAppStore();
    const metrics = mockMetrics;
    const positions = mockPositions;

    return (
        <div className="flex h-[calc(100vh-64px)] w-full">
            {/* Sidebar */}
            <aside className="w-[320px] h-full overflow-y-auto border-r border-[var(--color-border)] p-5 flex flex-col gap-6 flex-shrink-0">
                {/* Net Liquidity */}
                <div>
                    <p className="text-xs text-[var(--color-muted-dark)] uppercase tracking-wider mb-1">Net Liquidity</p>
                    <p className="text-3xl font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-foreground)] font-semibold">
                        {formatCurrency(metrics.netLiquidity)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        {metrics.dailyPnL >= 0 ? <ArrowUpRight size={14} className="text-[var(--color-profit)]" /> : <ArrowDownRight size={14} className="text-[var(--color-loss)]" />}
                        <span className={clsx('text-sm font-[family-name:var(--font-jetbrains-mono)]', metrics.dailyPnL >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]')}>
                            {formatCurrency(metrics.dailyPnL)} ({formatPercent(metrics.dailyPnLPercent)})
                        </span>
                    </div>
                </div>

                <div className="h-[1px] bg-[var(--color-border)]" />

                {/* Portfolio View Tabs */}
                <div className="flex flex-col gap-0.5">
                    {portfolioViews.map((view) => (
                        <button
                            key={view.id}
                            onClick={() => setPortfolioView(view.id)}
                            className={clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                portfolioView === view.id
                                    ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]'
                                    : 'text-[var(--color-muted)] hover:bg-[var(--color-card)] hover:text-[var(--color-foreground)]'
                            )}
                        >
                            <view.icon size={16} />
                            {view.label}
                        </button>
                    ))}
                </div>

                <div className="h-[1px] bg-[var(--color-border)]" />

                {/* Active Positions */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-[var(--color-muted-dark)] uppercase tracking-wider">Active Positions</p>
                        <span className="text-xs text-[var(--color-muted-dark)] bg-[var(--color-border)] px-2 py-0.5 rounded-full">{positions.length}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        {positions.map((pos) => (
                            <div key={pos.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-[var(--color-card)] transition-colors duration-150 cursor-pointer group">
                                <div>
                                    <p className="text-sm font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-foreground)]">{pos.symbol}</p>
                                    <p className="text-xs text-[var(--color-muted-dark)]">{pos.shares} shares</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-foreground)]">{formatCurrency(pos.currentPrice)}</p>
                                    <p className={clsx('text-xs font-[family-name:var(--font-jetbrains-mono)]', pos.percentChange >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]')}>
                                        {formatPercent(pos.percentChange)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add Position */}
                <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-dashed border-[var(--color-border-focus)] rounded-lg text-sm text-[var(--color-muted)] hover:border-[var(--color-foreground)] hover:text-[var(--color-foreground)] transition-colors duration-200 mt-auto">
                    <Plus size={16} />
                    Add Position
                </button>
            </aside>

            {/* Main Content */}
            <section className="flex-1 h-full overflow-y-auto p-8">
                {portfolioView === 'overview' && <OverviewTab />}
                {portfolioView === 'risk' && <RiskTab />}
                {portfolioView === 'dividends' && <DividendsTab />}
                {portfolioView === 'correlation' && <CorrelationTab />}
                {portfolioView === 'attribution' && <AttributionTab />}
            </section>
        </div>
    );
}
