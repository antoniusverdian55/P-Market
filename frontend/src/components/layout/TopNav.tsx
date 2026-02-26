'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, Sun, Moon } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import clsx from 'clsx';

const tabs = [
    { id: 'brief', label: "Today's Brief", href: '/brief' },
    { id: 'portfolio', label: 'Portfolio', href: '/portfolio' },
    { id: 'watchlist', label: 'Watchlist', href: '/watchlist' },
    { id: 'journal', label: 'Journal', href: '/journal' },
    { id: 'research', label: 'Research', href: '/research' },
    { id: 'discover', label: 'Discover', href: '/discover' },
] as const;

export default function TopNav() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useAppStore();

    const activeTab = tabs.find((tab) => pathname.startsWith(tab.href))?.id || 'brief';

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-[var(--color-background)] border-b border-[var(--color-border)]">
            {/* Logo */}
            <div className="flex items-center gap-1">
                <span className="text-[var(--color-foreground)] text-lg font-light tracking-[0.35em] uppercase">
                    C U B E
                </span>
                <span className="text-[var(--color-muted)] text-sm font-light tracking-wider ml-1">
                    trade
                </span>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1">
                {tabs.map((tab) => (
                    <Link
                        key={tab.id}
                        href={tab.href}
                        className={clsx(
                            'px-4 py-2 text-sm font-medium transition-colors duration-200 relative',
                            activeTab === tab.id
                                ? 'text-[var(--color-foreground)]'
                                : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
                        )}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--color-foreground)] rounded-full" />
                        )}
                    </Link>
                ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-border-focus)] transition-colors duration-200">
                    <Search size={14} className="text-[var(--color-muted)]" />
                    <span className="text-sm text-[var(--color-muted)]">Search...</span>
                    <kbd className="text-xs text-[var(--color-muted-dark)] bg-[var(--color-border)] px-1.5 py-0.5 rounded">⌘K</kbd>
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-8 h-8 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-border-focus)] transition-all duration-200"
                    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {theme === 'dark' ? (
                        <Sun size={14} className="text-[var(--color-gold)]" />
                    ) : (
                        <Moon size={14} className="text-[var(--color-accent)]" />
                    )}
                </button>

                {/* User Avatar */}
                <button className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center hover:opacity-90 transition-opacity">
                    <User size={14} className="text-white" />
                </button>
            </div>
        </header>
    );
}
