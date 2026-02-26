'use client';

import { useState } from 'react';
import {
    Settings, Save, Clock, Database, Shield, Bell,
    Globe, HardDrive, ToggleLeft, ToggleRight
} from 'lucide-react';
import clsx from 'clsx';

interface SettingGroup {
    id: string;
    title: string;
    icon: typeof Settings;
    settings: Setting[];
}

interface Setting {
    key: string;
    label: string;
    description: string;
    type: 'toggle' | 'select' | 'input';
    value: string | boolean;
    options?: string[];
}

const settingGroups: SettingGroup[] = [
    {
        id: 'data', title: 'Data Sync', icon: Database,
        settings: [
            { key: 'sync_interval', label: 'Default Sync Interval', description: 'How often to auto-sync ticker data', type: 'select', value: '1h', options: ['15m', '30m', '1h', '4h', '12h', '24h'] },
            { key: 'auto_sync', label: 'Auto Sync Enabled', description: 'Automatically sync data at the defined interval', type: 'toggle', value: false },
            { key: 'max_concurrent', label: 'Max Concurrent Syncs', description: 'Maximum number of tickers to sync simultaneously', type: 'select', value: '5', options: ['1', '3', '5', '10', '20'] },
            { key: 'retry_failed', label: 'Retry Failed Syncs', description: 'Automatically retry syncs that fail', type: 'toggle', value: true },
        ]
    },
    {
        id: 'cache', title: 'Cache & Storage', icon: HardDrive,
        settings: [
            { key: 'cache_ttl', label: 'In-Memory Cache TTL', description: 'Time-to-live for in-memory cached data', type: 'select', value: '15m', options: ['5m', '15m', '30m', '1h', '4h'] },
            { key: 'max_db_size', label: 'Max Database Size', description: 'Maximum total size of JSON database files', type: 'select', value: '500MB', options: ['100MB', '250MB', '500MB', '1GB', '5GB'] },
            { key: 'cleanup_old', label: 'Auto Cleanup Stale Data', description: 'Remove data older than retention period', type: 'toggle', value: false },
            { key: 'retention', label: 'Data Retention Period', description: 'How long to keep historical data', type: 'select', value: '1y', options: ['3mo', '6mo', '1y', '2y', '5y', 'forever'] },
        ]
    },
    {
        id: 'security', title: 'Security', icon: Shield,
        settings: [
            { key: 'admin_auth', label: 'Admin Authentication', description: 'Require authentication for admin panel access', type: 'toggle', value: false },
            { key: 'api_rate_limit', label: 'API Rate Limit', description: 'Max requests per minute from a single client', type: 'select', value: '60', options: ['30', '60', '120', '300', 'unlimited'] },
            { key: 'cors_origin', label: 'CORS Origin', description: 'Allowed origins for API access', type: 'input', value: 'http://localhost:3000' },
        ]
    },
    {
        id: 'notifications', title: 'Notifications', icon: Bell,
        settings: [
            { key: 'sync_alerts', label: 'Sync Failure Alerts', description: 'Get notified when a sync operation fails', type: 'toggle', value: true },
            { key: 'storage_alerts', label: 'Storage Capacity Alerts', description: 'Alert when database approaches size limit', type: 'toggle', value: true },
            { key: 'api_alerts', label: 'API Limit Alerts', description: 'Alert when API usage reaches threshold', type: 'toggle', value: true },
        ]
    },
];

export default function SettingsPage() {
    const [settings, setSettings] = useState<Record<string, string | boolean>>(() => {
        const initial: Record<string, string | boolean> = {};
        settingGroups.forEach(g => g.settings.forEach(s => { initial[s.key] = s.value; }));
        return initial;
    });
    const [saved, setSaved] = useState(false);

    const updateSetting = (key: string, value: string | boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        // In production, save to backend
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="p-8 space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">Settings</h1>
                    <p className="text-sm text-[var(--color-muted)] mt-1">Configure system behavior, data policies, and preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    className={clsx(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                        saved
                            ? 'bg-[var(--color-profit-bg)] text-[var(--color-profit)] border border-[rgba(34,197,94,0.2)]'
                            : 'bg-gradient-to-r from-[#EF4444] to-[#F97316] text-white hover:opacity-90'
                    )}
                >
                    <Save size={14} />
                    {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Setting Groups */}
            {settingGroups.map((group) => (
                <div key={group.id} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)]">
                        <group.icon size={16} className="text-[var(--color-muted-dark)]" />
                        <h2 className="text-sm font-semibold text-[var(--color-foreground)]">{group.title}</h2>
                    </div>
                    <div className="divide-y divide-[var(--color-border)]">
                        {group.settings.map((setting) => (
                            <div key={setting.key} className="flex items-center justify-between px-5 py-4 hover:bg-[var(--color-card-hover)] transition-colors">
                                <div className="flex-1 pr-8">
                                    <p className="text-sm font-medium text-[var(--color-foreground)]">{setting.label}</p>
                                    <p className="text-xs text-[var(--color-muted-dark)] mt-0.5">{setting.description}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    {setting.type === 'toggle' ? (
                                        <button
                                            onClick={() => updateSetting(setting.key, !settings[setting.key])}
                                            className="transition-colors"
                                        >
                                            {settings[setting.key] ? (
                                                <ToggleRight size={32} className="text-[var(--color-profit)]" />
                                            ) : (
                                                <ToggleLeft size={32} className="text-[var(--color-muted-dark)]" />
                                            )}
                                        </button>
                                    ) : setting.type === 'select' ? (
                                        <select
                                            value={settings[setting.key] as string}
                                            onChange={(e) => updateSetting(setting.key, e.target.value)}
                                            className="px-3 py-1.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-foreground)] outline-none font-[family-name:var(--font-jetbrains-mono)]"
                                        >
                                            {setting.options?.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={settings[setting.key] as string}
                                            onChange={(e) => updateSetting(setting.key, e.target.value)}
                                            className="px-3 py-1.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-foreground)] outline-none font-[family-name:var(--font-jetbrains-mono)] w-[220px]"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
