'use client';

import { useState, useMemo } from 'react';
import { mockDataCategories, mockDiscoverChart, mockInsiderTrades, mockESGScores, mockCryptoAssets } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
    ChevronRight, Database, Layers, UserCheck, Leaf,
    ArrowUpRight, ArrowDownRight, Bitcoin,
} from 'lucide-react';
import clsx from 'clsx';

function formatValue(value: number): string {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toFixed(2)}`;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
}

const esgRiskColors: Record<string, string> = {
    Low: 'text-[var(--color-profit)] bg-[var(--color-profit-bg)]',
    Medium: 'text-[var(--color-gold)] bg-[var(--color-gold-bg)]',
    High: 'text-[var(--color-loss)] bg-[var(--color-loss-bg)]',
    Severe: 'text-red-500 bg-red-500/10',
};

export default function DiscoverPage() {
    const { activeDatasetId, setActiveDataset } = useAppStore();
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['macro']));
    const [discoverView, setDiscoverView] = useState<'data' | 'insider' | 'esg' | 'crypto'>('data');

    const toggleCategory = (id: string) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const activeItem = useMemo(() => {
        for (const cat of mockDataCategories) {
            const item = cat.children?.find((c) => c.id === activeDatasetId);
            if (item) return { ...item, category: cat.label };
        }
        return null;
    }, [activeDatasetId]);

    const chartData = mockDiscoverChart;

    return (
        <div className="flex h-[calc(100vh-64px)] w-full">
            {/* Data Explorer Sidebar */}
            <aside className="w-[300px] h-full overflow-y-auto border-r border-[var(--color-border)] p-4 flex-shrink-0">
                <div className="flex items-center gap-2 mb-4">
                    <Database size={16} className="text-[var(--color-muted)]" />
                    <h2 className="text-sm font-semibold text-[var(--color-foreground)] uppercase tracking-wider">Data Collections</h2>
                </div>

                {/* View Switcher */}
                <div className="flex items-center gap-1 mb-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-1">
                    {[
                        { id: 'data' as const, label: 'Data', icon: Database },
                        { id: 'crypto' as const, label: 'Crypto', icon: Bitcoin },
                        { id: 'insider' as const, label: 'Insider', icon: UserCheck },
                        { id: 'esg' as const, label: 'ESG', icon: Leaf },
                    ].map((v) => (
                        <button key={v.id} onClick={() => setDiscoverView(v.id)}
                            className={clsx('flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
                                discoverView === v.id ? 'bg-[var(--color-border)] text-[var(--color-foreground)]' : 'text-[var(--color-muted-dark)] hover:text-[var(--color-muted)]')}>
                            <v.icon size={12} />{v.label}
                        </button>
                    ))}
                </div>

                {/* Sidebar items for data view */}
                {discoverView === 'data' && (
                    <div className="flex flex-col gap-0.5">
                        {mockDataCategories.map((cat) => (
                            <div key={cat.id}>
                                <button onClick={() => toggleCategory(cat.id)}
                                    className="w-full flex items-center gap-2 py-2.5 px-2 rounded-lg hover:bg-[var(--color-card)] transition-colors duration-150 group">
                                    <ChevronRight size={14} className={clsx('text-[var(--color-muted-dark)] transition-transform duration-200 flex-shrink-0', expandedCategories.has(cat.id) && 'rotate-90')} />
                                    <span className="text-base mr-1">{cat.icon}</span>
                                    <span className="text-sm text-[var(--color-muted)] group-hover:text-[var(--color-foreground)] transition-colors truncate">{cat.label}</span>
                                </button>
                                {expandedCategories.has(cat.id) && cat.children && (
                                    <div className="ml-6 flex flex-col gap-0.5 mb-1">
                                        {cat.children.map((item) => (
                                            <button key={item.id} onClick={() => setActiveDataset(item.id)}
                                                className={clsx('w-full text-left flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-150',
                                                    activeDatasetId === item.id ? 'bg-[var(--color-accent-bg)] text-[var(--color-foreground)]' : 'text-[var(--color-muted)] hover:bg-[var(--color-card)] hover:text-[var(--color-foreground)]')}>
                                                <span className="text-sm flex items-center gap-2">
                                                    {item.flag && <span>{item.flag}</span>}
                                                    <span className="truncate">{item.label}</span>
                                                </span>
                                                {item.dataPoints && <span className="text-xs text-[var(--color-muted-dark)] flex-shrink-0">{item.dataPoints.toLocaleString()}</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Insider sidebar summary */}
                {discoverView === 'insider' && (
                    <div className="flex flex-col gap-2">
                        <p className="text-xs text-[var(--color-muted-dark)] mb-2">Recent insider transactions across your portfolio and watchlist</p>
                        {mockInsiderTrades.map((trade) => (
                            <div key={trade.id} className="p-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-border-focus)] transition-colors cursor-pointer">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-[var(--color-foreground)]">{trade.ticker}</span>
                                    <span className={clsx('text-xs px-2 py-0.5 rounded',
                                        trade.transactionType === 'Buy' ? 'text-[var(--color-profit)] bg-[var(--color-profit-bg)]' : 'text-[var(--color-loss)] bg-[var(--color-loss-bg)]')}>
                                        {trade.transactionType}
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--color-muted-dark)]">{trade.insiderName} • {trade.title}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ESG sidebar summary */}
                {discoverView === 'esg' && (
                    <div className="flex flex-col gap-2">
                        <p className="text-xs text-[var(--color-muted-dark)] mb-2">Environmental, Social, & Governance scores for your portfolio holdings</p>
                        {mockESGScores.map((esg) => (
                            <div key={esg.ticker} className="p-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-border-focus)] transition-colors cursor-pointer">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-[var(--color-foreground)]">{esg.ticker}</span>
                                    <span className={clsx('text-xs px-2 py-0.5 rounded font-medium', esgRiskColors[esg.riskLevel])}>{esg.riskLevel} Risk</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1.5">
                                    <div className="flex-1 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                                        <div className="h-full bg-[var(--color-profit)] rounded-full" style={{ width: `${esg.total}%` }} />
                                    </div>
                                    <span className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted)]">{esg.total}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Crypto sidebar summary */}
                {discoverView === 'crypto' && (
                    <div className="flex flex-col gap-2">
                        <p className="text-xs text-[var(--color-muted-dark)] mb-2">Top cryptocurrencies by market cap</p>
                        {mockCryptoAssets.map((coin) => (
                            <div key={coin.id} className="p-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-border-focus)] transition-colors cursor-pointer">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-[var(--color-foreground)]">{coin.symbol}</span>
                                    <span className={clsx('text-xs font-[family-name:var(--font-jetbrains-mono)]',
                                        coin.change24h >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]')}>
                                        {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--color-muted-dark)]">{coin.name}</p>
                            </div>
                        ))}
                    </div>
                )}
            </aside>

            {/* Visualization Area */}
            <section className="flex-1 h-full overflow-y-auto p-8">
                {/* Data View */}
                {discoverView === 'data' && activeItem && (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <Layers size={20} className="text-[var(--color-accent)]" />
                            <div>
                                <h2 className="text-xl font-semibold text-[var(--color-foreground)]">{activeItem.label}</h2>
                                <p className="text-sm text-[var(--color-muted-dark)]">{activeItem.category} • {activeItem.dataPoints?.toLocaleString()} data points</p>
                            </div>
                        </div>

                        <div className="chart-container mb-6">
                            <h3 className="text-xs text-[var(--color-muted-dark)] uppercase tracking-wider mb-4">Total Value (USD Trillions)</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis dataKey="date" stroke="var(--color-border-focus)" tick={{ fill: 'var(--color-muted-dark)', fontSize: 11 }}
                                        tickFormatter={(val) => { const d = new Date(val); return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear().toString().slice(2)}`; }} />
                                    <YAxis stroke="var(--color-border-focus)" tick={{ fill: 'var(--color-muted-dark)', fontSize: 11 }} tickFormatter={(val) => `$${val.toFixed(0)}T`} width={55} />
                                    <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)', fontFamily: 'var(--font-jetbrains-mono)', fontSize: '12px' }}
                                        formatter={(value) => [`$${Number(value).toFixed(2)}T`, 'Value']} labelFormatter={(label) => new Date(label).toLocaleDateString()} />
                                    <Line type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={2}
                                        dot={{ fill: 'var(--color-accent)', r: 3 }} activeDot={{ r: 5, stroke: 'var(--color-accent)', strokeWidth: 2, fill: 'var(--color-background)' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-container">
                            <h3 className="text-xs text-[var(--color-muted-dark)] uppercase tracking-wider mb-4">Year-over-Year Growth (%)</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis dataKey="date" stroke="var(--color-border-focus)" tick={{ fill: 'var(--color-muted-dark)', fontSize: 11 }}
                                        tickFormatter={(val) => { const d = new Date(val); return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear().toString().slice(2)}`; }} />
                                    <YAxis stroke="var(--color-border-focus)" tick={{ fill: 'var(--color-muted-dark)', fontSize: 11 }} tickFormatter={(val) => `${val}%`} width={45} />
                                    <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)', fontFamily: 'var(--font-jetbrains-mono)', fontSize: '12px' }}
                                        formatter={(value) => [`${Number(value).toFixed(1)}%`, 'YoY Growth']} />
                                    <Bar dataKey="yoyGrowth" fill="var(--color-profit)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}

                {discoverView === 'data' && !activeItem && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center mb-4">
                            <Database size={28} className="text-[var(--color-border-focus)]" />
                        </div>
                        <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">Select a Dataset</h2>
                        <p className="text-sm text-[var(--color-muted-dark)] max-w-sm">Browse the data collections on the left and select a dataset to visualize its historical trends and growth patterns.</p>
                    </div>
                )}

                {/* Insider Trading View */}
                {discoverView === 'insider' && (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <UserCheck size={20} className="text-[var(--color-gold)]" />
                            <div>
                                <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Insider Trading Activity</h2>
                                <p className="text-sm text-[var(--color-muted-dark)]">SEC Form 4 filings from corporate insiders</p>
                            </div>
                        </div>

                        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--color-border)]">
                                        {['Date', 'Ticker', 'Insider', 'Type', 'Shares', 'Price', 'Total Value'].map((h) => (
                                            <th key={h} className="text-left text-xs text-[var(--color-muted-dark)] font-medium uppercase tracking-wider py-3 px-5">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockInsiderTrades.map((trade) => (
                                        <tr key={trade.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-card-hover)] transition-colors">
                                            <td className="py-3.5 px-5 text-sm text-[var(--color-muted)]">{trade.date}</td>
                                            <td className="py-3.5 px-5 text-sm font-medium text-[var(--color-foreground)]">{trade.ticker}</td>
                                            <td className="py-3.5 px-5">
                                                <p className="text-sm text-[var(--color-foreground)]">{trade.insiderName}</p>
                                                <p className="text-xs text-[var(--color-muted-dark)]">{trade.title}</p>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-1.5">
                                                    {trade.transactionType === 'Buy' ? <ArrowUpRight size={14} className="text-[var(--color-profit)]" /> : <ArrowDownRight size={14} className="text-[var(--color-loss)]" />}
                                                    <span className={clsx('text-sm px-2 py-0.5 rounded',
                                                        trade.transactionType === 'Buy' ? 'text-[var(--color-profit)] bg-[var(--color-profit-bg)]' : 'text-[var(--color-loss)] bg-[var(--color-loss-bg)]')}>
                                                        {trade.transactionType}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted)]">{trade.shares.toLocaleString()}</td>
                                            <td className="py-3.5 px-5 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted)]">{formatCurrency(trade.pricePerShare)}</td>
                                            <td className="py-3.5 px-5 text-sm font-[family-name:var(--font-jetbrains-mono)] font-medium text-[var(--color-foreground)]">{formatCurrency(trade.totalValue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ESG Scoring View */}
                {discoverView === 'esg' && (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <Leaf size={20} className="text-[var(--color-profit)]" />
                            <div>
                                <h2 className="text-xl font-semibold text-[var(--color-foreground)]">ESG Scoring</h2>
                                <p className="text-sm text-[var(--color-muted-dark)]">Environmental, Social, and Governance risk assessment</p>
                            </div>
                        </div>

                        {/* ESG Cards Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {mockESGScores.map((esg) => (
                                <div key={esg.ticker} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-border-focus)] transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-lg font-semibold text-[var(--color-foreground)]">{esg.ticker}</p>
                                            <p className="text-xs text-[var(--color-muted-dark)]">{esg.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-[family-name:var(--font-jetbrains-mono)] font-semibold text-[var(--color-foreground)]">{esg.total}</p>
                                            <span className={clsx('text-xs px-2 py-0.5 rounded font-medium', esgRiskColors[esg.riskLevel])}>{esg.riskLevel} Risk</span>
                                        </div>
                                    </div>

                                    {/* Score Bars */}
                                    <div className="flex flex-col gap-2.5 mt-4">
                                        {[
                                            { label: 'Environmental', value: esg.environmental, color: 'bg-green-500' },
                                            { label: 'Social', value: esg.social, color: 'bg-blue-500' },
                                            { label: 'Governance', value: esg.governance, color: 'bg-purple-500' },
                                        ].map((dim) => (
                                            <div key={dim.label} className="flex items-center gap-3">
                                                <span className="text-xs text-[var(--color-muted-dark)] w-24 flex-shrink-0">{dim.label}</span>
                                                <div className="flex-1 h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                                                    <div className={clsx('h-full rounded-full transition-all duration-500', dim.color)} style={{ width: `${dim.value}%` }} />
                                                </div>
                                                <span className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted)] w-6 text-right">{dim.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {/* Crypto View */}
                {discoverView === 'crypto' && (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <Bitcoin size={20} className="text-[var(--color-gold)]" />
                            <div>
                                <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Cryptocurrency Markets</h2>
                                <p className="text-sm text-[var(--color-muted-dark)]">Top assets by market capitalization</p>
                            </div>
                        </div>

                        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--color-border)]">
                                        {['#', 'Asset', 'Price', '24h Change', 'Market Cap', 'Volume (24h)', 'Trend'].map((h) => (
                                            <th key={h} className="text-left text-xs text-[var(--color-muted-dark)] font-medium uppercase tracking-wider py-3 px-5">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockCryptoAssets.map((coin, i) => (
                                        <tr key={coin.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-card-hover)] transition-colors">
                                            <td className="py-3.5 px-5 text-sm text-[var(--color-muted-dark)]">{i + 1}</td>
                                            <td className="py-3.5 px-5">
                                                <p className="text-sm font-semibold text-[var(--color-foreground)]">{coin.symbol}</p>
                                                <p className="text-xs text-[var(--color-muted-dark)]">{coin.name}</p>
                                            </td>
                                            <td className="py-3.5 px-5 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-foreground)]">
                                                ${coin.price >= 1 ? coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : coin.price.toFixed(4)}
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-1">
                                                    {coin.change24h >= 0 ? <ArrowUpRight size={14} className="text-[var(--color-profit)]" /> : <ArrowDownRight size={14} className="text-[var(--color-loss)]" />}
                                                    <span className={clsx('text-sm font-[family-name:var(--font-jetbrains-mono)] px-2 py-0.5 rounded',
                                                        coin.change24h >= 0 ? 'text-[var(--color-profit)] bg-[var(--color-profit-bg)]' : 'text-[var(--color-loss)] bg-[var(--color-loss-bg)]')}>
                                                        {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted)]">{formatValue(coin.marketCap)}</td>
                                            <td className="py-3.5 px-5 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted)]">{formatValue(coin.volume24h)}</td>
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-end gap-[2px] h-5">
                                                    {coin.sparkline.slice(-12).map((val, idx, arr) => {
                                                        const min = Math.min(...arr);
                                                        const max = Math.max(...arr);
                                                        const height = max === min ? 50 : ((val - min) / (max - min)) * 100;
                                                        return (
                                                            <div key={idx} className="w-1 rounded-sm" style={{
                                                                height: `${Math.max(height, 10)}%`,
                                                                backgroundColor: coin.change24h >= 0 ? 'var(--color-profit)' : 'var(--color-loss)',
                                                                opacity: 0.4 + (idx / arr.length) * 0.6,
                                                            }} />
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
