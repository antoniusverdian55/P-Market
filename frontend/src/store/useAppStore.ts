import { create } from 'zustand';
import type { Position, PortfolioMetrics, ChatMessage, Conversation, TabId, ThemeMode, WatchlistItem } from '@/types';

interface AppState {
    // Navigation
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;

    // Theme
    theme: ThemeMode;
    toggleTheme: () => void;

    // Portfolio State
    positions: Position[];
    metrics: PortfolioMetrics | null;
    timeframe: '1W' | '1M' | '3M' | 'YTD' | 'ALL';
    portfolioView: 'overview' | 'risk' | 'dividends' | 'correlation' | 'attribution';
    setPositions: (positions: Position[]) => void;
    setMetrics: (metrics: PortfolioMetrics) => void;
    setTimeframe: (tf: '1W' | '1M' | '3M' | 'YTD' | 'ALL') => void;
    setPortfolioView: (view: 'overview' | 'risk' | 'dividends' | 'correlation' | 'attribution') => void;

    // Watchlist State
    watchlist: WatchlistItem[];
    addToWatchlist: (item: WatchlistItem) => void;
    removeFromWatchlist: (id: string) => void;

    // Discover State
    activeDatasetId: string | null;
    setActiveDataset: (id: string) => void;

    // Research / Chat State
    conversations: Conversation[];
    activeConversationId: string | null;
    chatMessages: ChatMessage[];
    isAiTyping: boolean;
    chatMode: 'simple' | 'advanced';
    setConversations: (convs: Conversation[]) => void;
    setActiveConversation: (id: string | null) => void;
    addChatMessage: (msg: ChatMessage) => void;
    setChatMessages: (msgs: ChatMessage[]) => void;
    setIsAiTyping: (status: boolean) => void;
    setChatMode: (mode: 'simple' | 'advanced') => void;

    // Brief State
    activeBriefSection: string;
    setActiveBriefSection: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Navigation
    activeTab: 'brief',
    setActiveTab: (tab) => set({ activeTab: tab }),

    // Theme
    theme: 'dark',
    toggleTheme: () =>
        set((state) => ({
            theme: state.theme === 'dark' ? 'light' : 'dark',
        })),

    // Portfolio
    positions: [],
    metrics: null,
    timeframe: '1M',
    portfolioView: 'overview',
    setPositions: (positions) => set({ positions }),
    setMetrics: (metrics) => set({ metrics }),
    setTimeframe: (tf) => set({ timeframe: tf }),
    setPortfolioView: (view) => set({ portfolioView: view }),

    // Watchlist
    watchlist: [],
    addToWatchlist: (item) =>
        set((state) => ({ watchlist: [...state.watchlist, item] })),
    removeFromWatchlist: (id) =>
        set((state) => ({
            watchlist: state.watchlist.filter((w) => w.id !== id),
        })),

    // Discover
    activeDatasetId: null,
    setActiveDataset: (id) => set({ activeDatasetId: id }),

    // Research / Chat
    conversations: [],
    activeConversationId: null,
    chatMessages: [],
    isAiTyping: false,
    chatMode: 'simple',
    setConversations: (convs) => set({ conversations: convs }),
    setActiveConversation: (id) => set({ activeConversationId: id }),
    addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
    setChatMessages: (msgs) => set({ chatMessages: msgs }),
    setIsAiTyping: (status) => set({ isAiTyping: status }),
    setChatMode: (mode) => set({ chatMode: mode }),

    // Brief
    activeBriefSection: 'summary',
    setActiveBriefSection: (id) => set({ activeBriefSection: id }),
}));
