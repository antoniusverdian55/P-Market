'use client';

import { useState } from 'react';
import {
    Users, Search, Edit2, Trash2, Shield, UserCheck, UserX,
    MoreVertical, ChevronDown
} from 'lucide-react';
import clsx from 'clsx';

// Mock data — in production, fetched from backend
const mockUsers = [
    { id: 'u1', name: 'Alice Smith', email: 'alice@cubetrade.app', role: 'Admin', status: 'Active', lastLogin: '2 mins ago', plan: 'Enterprise', joined: 'Jan 12, 2024' },
    { id: 'u2', name: 'Bob Johnson', email: 'bob@example.com', role: 'Pro', status: 'Active', lastLogin: '1 hour ago', plan: 'Pro', joined: 'Feb 3, 2024' },
    { id: 'u3', name: 'Charlie Dave', email: 'charlie@example.com', role: 'Free', status: 'Inactive', lastLogin: '3 days ago', plan: 'Free', joined: 'Mar 15, 2024' },
    { id: 'u4', name: 'Diana Prince', email: 'diana@example.com', role: 'Pro', status: 'Active', lastLogin: '30 mins ago', plan: 'Pro', joined: 'Jan 28, 2024' },
    { id: 'u5', name: 'Eve Wilson', email: 'eve@example.com', role: 'Free', status: 'Banned', lastLogin: '2 weeks ago', plan: 'Free', joined: 'Apr 1, 2024' },
    { id: 'u6', name: 'Frank Miller', email: 'frank@example.com', role: 'Pro', status: 'Active', lastLogin: '5 hours ago', plan: 'Pro', joined: 'Feb 14, 2024' },
    { id: 'u7', name: 'Grace Lee', email: 'grace@cubetrade.app', role: 'Admin', status: 'Active', lastLogin: '10 mins ago', plan: 'Enterprise', joined: 'Jan 5, 2024' },
    { id: 'u8', name: 'Henry Adams', email: 'henry@example.com', role: 'Free', status: 'Active', lastLogin: '1 day ago', plan: 'Free', joined: 'May 20, 2024' },
];

export default function UsersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('All');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    const filteredUsers = mockUsers.filter((u) => {
        const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchRole = roleFilter === 'All' || u.role === roleFilter;
        const matchStatus = statusFilter === 'All' || u.status === statusFilter;
        return matchSearch && matchRole && matchStatus;
    });

    const stats = {
        total: mockUsers.length,
        active: mockUsers.filter(u => u.status === 'Active').length,
        pro: mockUsers.filter(u => u.role === 'Pro').length,
        admin: mockUsers.filter(u => u.role === 'Admin').length,
    };

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">User Management</h1>
                <p className="text-sm text-[var(--color-muted)] mt-1">Manage user accounts, roles, and access permissions</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: stats.total, icon: Users, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
                    { label: 'Active Now', value: stats.active, icon: UserCheck, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
                    { label: 'Pro Users', value: stats.pro, icon: Shield, color: '#EAB308', bg: 'rgba(234,179,8,0.1)' },
                    { label: 'Admins', value: stats.admin, icon: Shield, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
                ].map(stat => (
                    <div key={stat.label} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-[var(--color-muted-dark)] uppercase tracking-wider">{stat.label}</span>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: stat.bg }}>
                                <stat.icon size={14} style={{ color: stat.color }} />
                            </div>
                        </div>
                        <p className="text-2xl font-semibold font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-foreground)]">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg flex-1 max-w-sm">
                    <Search size={14} className="text-[var(--color-muted)]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or email..."
                        className="bg-transparent text-sm outline-none text-[var(--color-foreground)] placeholder-[var(--color-muted-dark)] flex-1"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-sm text-[var(--color-foreground)] outline-none"
                >
                    <option value="All">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Pro">Pro</option>
                    <option value="Free">Free</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-sm text-[var(--color-foreground)] outline-none"
                >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Banned">Banned</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--color-border)]">
                            {['User', 'Role', 'Plan', 'Status', 'Last Login', 'Joined', 'Actions'].map((h) => (
                                <th key={h} className="text-left text-xs text-[var(--color-muted-dark)] font-medium uppercase tracking-wider py-3 px-5">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-card-hover)] transition-colors">
                                <td className="py-3.5 px-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-white">{user.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[var(--color-foreground)]">{user.name}</p>
                                            <p className="text-xs text-[var(--color-muted-dark)]">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3.5 px-5">
                                    <span className={clsx('text-xs px-2 py-0.5 rounded font-medium',
                                        user.role === 'Admin' ? 'bg-[rgba(239,68,68,0.1)] text-[#EF4444]' :
                                            user.role === 'Pro' ? 'bg-[rgba(234,179,8,0.1)] text-[#EAB308]' :
                                                'bg-[var(--color-border)] text-[var(--color-muted)]'
                                    )}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-3.5 px-5 text-sm text-[var(--color-muted)]">{user.plan}</td>
                                <td className="py-3.5 px-5">
                                    <div className="flex items-center gap-1.5">
                                        <div className={clsx('w-1.5 h-1.5 rounded-full',
                                            user.status === 'Active' ? 'bg-[var(--color-profit)]' :
                                                user.status === 'Banned' ? 'bg-[var(--color-loss)]' :
                                                    'bg-[var(--color-muted-dark)]'
                                        )} />
                                        <span className={clsx('text-sm',
                                            user.status === 'Banned' ? 'text-[var(--color-loss)]' : 'text-[var(--color-muted)]'
                                        )}>{user.status}</span>
                                    </div>
                                </td>
                                <td className="py-3.5 px-5 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-muted-dark)]">{user.lastLogin}</td>
                                <td className="py-3.5 px-5 text-sm text-[var(--color-muted-dark)]">{user.joined}</td>
                                <td className="py-3.5 px-5">
                                    <div className="flex items-center gap-2">
                                        <button className="p-1.5 rounded hover:bg-[var(--color-accent-bg)] text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors" title="Edit">
                                            <Edit2 size={13} />
                                        </button>
                                        {user.status === 'Banned' ? (
                                            <button className="p-1.5 rounded hover:bg-[var(--color-profit-bg)] text-[var(--color-muted)] hover:text-[var(--color-profit)] transition-colors" title="Unban">
                                                <UserCheck size={13} />
                                            </button>
                                        ) : (
                                            <button className="p-1.5 rounded hover:bg-[var(--color-loss-bg)] text-[var(--color-muted)] hover:text-[var(--color-loss)] transition-colors" title="Ban">
                                                <UserX size={13} />
                                            </button>
                                        )}
                                        <button className="p-1.5 rounded hover:bg-[var(--color-loss-bg)] text-[var(--color-muted)] hover:text-[var(--color-loss)] transition-colors" title="Delete">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
