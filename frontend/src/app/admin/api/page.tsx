'use client';

import { useState } from 'react';
import {
    Key, CheckCircle2, AlertTriangle, XCircle, Wifi,
    RefreshCw, ExternalLink, Eye, EyeOff
} from 'lucide-react';
import clsx from 'clsx';

interface ApiProvider {
    id: string;
    name: string;
    description: string;
    status: 'connected' | 'warning' | 'disconnected' | 'inactive';
    calls: number;
    limit: number | string;
    keyConfigured: boolean;
    docs: string;
}

const providers: ApiProvider[] = [
    {
        id: 'yfinance', name: 'Yahoo Finance', description: 'Primary market data provider. Free, unlimited access via yfinance Python library.',
        status: 'connected', calls: 89300, limit: 'Unlimited', keyConfigured: true, docs: 'https://pypi.org/project/yfinance/',
    },
    {
        id: 'glm4', name: 'GLM-4 (ZhipuAI)', description: 'AI language model for chat, analysis, and market intelligence features.',
        status: 'connected', calls: 12450, limit: 100000, keyConfigured: true, docs: 'https://open.bigmodel.cn/',
    },
    {
        id: 'alphavantage', name: 'Alpha Vantage', description: 'Alternative financial data provider with fundamentals and technicals.',
        status: 'warning', calls: 450, limit: 500, keyConfigured: true, docs: 'https://www.alphavantage.co/documentation/',
    },
    {
        id: 'quandl', name: 'Quandl (Nasdaq)', description: 'Nasdaq Data Link for alternative datasets and macro economic data.',
        status: 'inactive', calls: 0, limit: 50000, keyConfigured: false, docs: 'https://data.nasdaq.com/',
    },
    {
        id: 'openbb', name: 'OpenBB', description: 'Open-source financial data aggregator with premium analytics.',
        status: 'inactive', calls: 0, limit: 10000, keyConfigured: false, docs: 'https://openbb.co/',
    },
    {
        id: 'newsapi', name: 'NewsAPI', description: 'News aggregation service for market sentiment and breaking news.',
        status: 'inactive', calls: 0, limit: 1000, keyConfigured: false, docs: 'https://newsapi.org/',
    },
];

export default function ApiPage() {
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [testing, setTesting] = useState<string | null>(null);

    const toggleKeyVisibility = (id: string) => {
        setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleTest = async (id: string) => {
        setTesting(id);
        // Simulate connection test
        await new Promise(resolve => setTimeout(resolve, 1500));
        setTesting(null);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'connected': return <CheckCircle2 size={14} className="text-[var(--color-profit)]" />;
            case 'warning': return <AlertTriangle size={14} className="text-[var(--color-gold)]" />;
            case 'disconnected': return <XCircle size={14} className="text-[var(--color-loss)]" />;
            default: return <div className="w-3.5 h-3.5 rounded-full border border-[var(--color-muted-dark)]" />;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'connected': return 'bg-[var(--color-profit-bg)] text-[var(--color-profit)] border-[rgba(34,197,94,0.2)]';
            case 'warning': return 'bg-[var(--color-gold-bg)] text-[var(--color-gold)] border-[rgba(234,179,8,0.2)]';
            case 'disconnected': return 'bg-[var(--color-loss-bg)] text-[var(--color-loss)] border-[rgba(239,68,68,0.2)]';
            default: return 'bg-[var(--color-border)] text-[var(--color-muted-dark)] border-[var(--color-border)]';
        }
    };

    const connectedCount = providers.filter(p => p.status === 'connected').length;

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">API & Integrations</h1>
                    <p className="text-sm text-[var(--color-muted)] mt-1">Manage data providers, API keys, and monitor usage</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ background: 'rgba(34,197,94,0.05)', borderColor: 'rgba(34,197,94,0.15)' }}>
                    <Wifi size={14} className="text-[var(--color-profit)]" />
                    <span className="text-xs font-medium text-[var(--color-profit)]">{connectedCount}/{providers.length} Connected</span>
                </div>
            </div>

            {/* Provider Cards */}
            <div className="grid grid-cols-2 gap-5">
                {providers.map((provider) => {
                    const usagePercent = typeof provider.limit === 'number'
                        ? Math.round((provider.calls / provider.limit) * 100)
                        : 5;

                    return (
                        <div
                            key={provider.id}
                            className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-border-focus)] transition-colors"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        'w-10 h-10 rounded-xl flex items-center justify-center',
                                        provider.status === 'connected' ? 'bg-[var(--color-profit-bg)]' :
                                            provider.status === 'warning' ? 'bg-[var(--color-gold-bg)]' :
                                                'bg-[var(--color-border)]'
                                    )}>
                                        <Key size={18} className={clsx(
                                            provider.status === 'connected' ? 'text-[var(--color-profit)]' :
                                                provider.status === 'warning' ? 'text-[var(--color-gold)]' :
                                                    'text-[var(--color-muted-dark)]'
                                        )} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{provider.name}</h3>
                                        <p className="text-xs text-[var(--color-muted-dark)] mt-0.5 max-w-[280px]">{provider.description}</p>
                                    </div>
                                </div>
                                <span className={clsx(
                                    'flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium',
                                    getStatusStyle(provider.status)
                                )}>
                                    {getStatusIcon(provider.status)}
                                    {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                                </span>
                            </div>

                            {/* API Key */}
                            <div className="mb-4">
                                <label className="text-[10px] text-[var(--color-muted-dark)] uppercase tracking-wider mb-1 block">API Key</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 flex items-center gap-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-3 py-2">
                                        <input
                                            type={showKeys[provider.id] ? 'text' : 'password'}
                                            value={provider.keyConfigured ? '••••••••••••••••' : ''}
                                            placeholder="Enter API key..."
                                            readOnly
                                            className="bg-transparent text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted-dark)] outline-none flex-1 font-[family-name:var(--font-jetbrains-mono)]"
                                        />
                                        <button onClick={() => toggleKeyVisibility(provider.id)} className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
                                            {showKeys[provider.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    <button className="px-3 py-2 bg-[var(--color-border)] text-sm font-medium rounded-lg hover:bg-[var(--color-border-focus)] transition-colors text-[var(--color-foreground)]">
                                        Update
                                    </button>
                                </div>
                            </div>

                            {/* Usage */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between text-xs text-[var(--color-muted-dark)] mb-1.5">
                                    <span>Monthly Usage</span>
                                    <span className="font-[family-name:var(--font-jetbrains-mono)]">
                                        {provider.calls.toLocaleString()} / {typeof provider.limit === 'number' ? provider.limit.toLocaleString() : provider.limit}
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                                    <div
                                        className={clsx('h-full rounded-full transition-all',
                                            usagePercent >= 85 ? 'bg-[var(--color-loss)]' :
                                                usagePercent >= 70 ? 'bg-[var(--color-gold)]' :
                                                    'bg-[var(--color-accent)]'
                                        )}
                                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleTest(provider.id)}
                                    disabled={testing === provider.id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent-bg)] text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-all disabled:opacity-50"
                                >
                                    {testing === provider.id ? <RefreshCw size={12} className="animate-spin" /> : <Wifi size={12} />}
                                    {testing === provider.id ? 'Testing...' : 'Test Connection'}
                                </button>
                                <a
                                    href={provider.docs}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-card-hover)] transition-all"
                                >
                                    <ExternalLink size={12} />
                                    Docs
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
