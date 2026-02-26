'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

/**
 * ThemeProvider syncs the Zustand theme state with the HTML root class.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useAppStore((s) => s.theme);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(theme);
        localStorage.setItem('cube-trade-theme', theme);
    }, [theme]);

    // Restore theme from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('cube-trade-theme') as 'dark' | 'light' | null;
        if (saved && saved !== useAppStore.getState().theme) {
            useAppStore.getState().toggleTheme();
        }
    }, []);

    return <>{children}</>;
}
