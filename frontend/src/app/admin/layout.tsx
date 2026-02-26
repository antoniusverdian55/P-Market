'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard, Database, Users, Key, ScrollText, Settings,
    Shield, ChevronRight, LogOut
} from 'lucide-react';
import clsx from 'clsx';

const adminNav = [
    { id: 'overview', label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { id: 'data', label: 'Data Manager', href: '/admin/data', icon: Database },
    { id: 'users', label: 'Users', href: '/admin/users', icon: Users },
    { id: 'api', label: 'API & Integrations', href: '/admin/api', icon: Key },
    { id: 'logs', label: 'System Logs', href: '/admin/logs', icon: ScrollText },
    { id: 'settings', label: 'Settings', href: '/admin/settings', icon: Settings },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const getActiveId = () => {
        if (pathname === '/admin') return 'overview';
        const segment = pathname.split('/')[2];
        return segment || 'overview';
    };

    const activeId = getActiveId();

    return (
        <div className="flex h-screen w-full bg-[var(--color-background)] overflow-hidden" style={{ paddingTop: 0 }}>
            {/* Admin Sidebar */}
            <aside className="w-[280px] h-full flex flex-col border-r border-[var(--color-border)] bg-[#030303] flex-shrink-0">
                {/* Logo Area */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-[var(--color-border)]">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#EF4444] to-[#F97316] flex items-center justify-center">
                        <Shield size={16} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[var(--color-foreground)] tracking-wider uppercase">
                            CUBE TRADE
                        </span>
                        <span className="text-[10px] font-medium text-[var(--color-loss)] tracking-[0.2em] uppercase">
                            Admin Panel
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 overflow-y-auto">
                    <p className="text-[10px] font-semibold text-[var(--color-muted-dark)] uppercase tracking-[0.15em] px-3 mb-3">
                        Management
                    </p>
                    <div className="flex flex-col gap-0.5">
                        {adminNav.map((item) => {
                            const isActive = activeId === item.id;
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={clsx(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                                        isActive
                                            ? 'bg-gradient-to-r from-[rgba(239,68,68,0.12)] to-[rgba(249,115,22,0.08)] text-[#F97316] shadow-[inset_0_0_0_1px_rgba(249,115,22,0.15)]'
                                            : 'text-[var(--color-muted)] hover:bg-[var(--color-card)] hover:text-[var(--color-foreground)]'
                                    )}
                                >
                                    <item.icon size={16} className={clsx(
                                        isActive ? 'text-[#F97316]' : 'text-[var(--color-muted-dark)] group-hover:text-[var(--color-muted)]'
                                    )} />
                                    <span className="flex-1">{item.label}</span>
                                    {isActive && <ChevronRight size={14} className="text-[#F97316]/50" />}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Bottom Section */}
                <div className="p-3 border-t border-[var(--color-border)]">
                    <Link
                        href="/brief"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-muted)] hover:bg-[var(--color-card)] hover:text-[var(--color-foreground)] transition-all duration-200"
                    >
                        <LogOut size={16} className="text-[var(--color-muted-dark)]" />
                        <span>Exit to App</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-hidden flex flex-col">
                {/* Admin Top Bar */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-[var(--color-border)] bg-[var(--color-background)] flex-shrink-0">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-[var(--color-muted-dark)]">Admin</span>
                        <ChevronRight size={12} className="text-[var(--color-muted-dark)]" />
                        <span className="text-[var(--color-foreground)] font-medium capitalize">
                            {activeId === 'api' ? 'API & Integrations' : adminNav.find(n => n.id === activeId)?.label || 'Overview'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-profit)] animate-pulse" />
                            <span className="text-xs font-medium text-[var(--color-profit)]">System Online</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#EF4444] to-[#F97316] flex items-center justify-center">
                            <span className="text-xs font-bold text-white">A</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
