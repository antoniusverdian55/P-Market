'use client';

import { usePathname } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith('/admin');

    if (isAdmin) {
        // Admin pages render their own layout — no TopNav, no padding
        return <>{children}</>;
    }

    return (
        <>
            <TopNav />
            <main className="pt-16">{children}</main>
        </>
    );
}
