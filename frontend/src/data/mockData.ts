import type {
    Position,
    PortfolioMetrics,
    EquityCurvePoint,
    Conversation,
    ChatMessage,
    MarketBrief,
    DataCategory,
    ChartDataPoint,
    RiskMetrics,
    DividendSummary,
    WatchlistItem,
    EarningsEvent,
    CorrelationEntry,
    AIInsight,
    SentimentData,
    NewsArticle,
    InsiderTrade,
    InstitutionalHolder,
    ESGScore,
    AttributionEntry,
    JournalEntry,
    CryptoAsset,
    ResearchWorkspace,
} from '@/types';

// ===== PORTFOLIO MOCK DATA =====
export const mockPositions: Position[] = [
    {
        id: '1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        shares: 150,
        costBasis: 142.5,
        currentPrice: 189.84,
        percentChange: 2.34,
        dailyPnL: 432.0,
        totalPnL: 7101.0,
        sector: 'Technology',
        dividendYield: 0.52,
        nextDividendDate: '2025-05-14',
        annualDividend: 1.0,
    },
    {
        id: '2',
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        shares: 80,
        costBasis: 310.25,
        currentPrice: 415.56,
        percentChange: 1.12,
        dailyPnL: 362.4,
        totalPnL: 8424.8,
        sector: 'Technology',
        dividendYield: 0.72,
        nextDividendDate: '2025-06-12',
        annualDividend: 3.0,
    },
    {
        id: '3',
        symbol: 'NVDA',
        name: 'NVIDIA Corp.',
        shares: 45,
        costBasis: 450.0,
        currentPrice: 878.37,
        percentChange: -0.87,
        dailyPnL: -343.35,
        totalPnL: 19276.65,
        sector: 'Technology',
        dividendYield: 0.02,
        nextDividendDate: '2025-06-28',
        annualDividend: 0.16,
    },
    {
        id: '4',
        symbol: 'VOO',
        name: 'Vanguard S&P 500 ETF',
        shares: 60,
        costBasis: 380.0,
        currentPrice: 502.14,
        percentChange: 0.45,
        dailyPnL: 135.78,
        totalPnL: 7328.4,
        sector: 'Index Fund',
        dividendYield: 1.31,
        nextDividendDate: '2025-03-28',
        annualDividend: 6.58,
    },
    {
        id: '5',
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        shares: 100,
        costBasis: 105.0,
        currentPrice: 174.13,
        percentChange: 1.67,
        dailyPnL: 286.0,
        totalPnL: 6913.0,
        sector: 'Technology',
        dividendYield: 0.46,
        nextDividendDate: '2025-06-16',
        annualDividend: 0.80,
    },
    {
        id: '6',
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        shares: 55,
        costBasis: 127.5,
        currentPrice: 207.89,
        percentChange: -0.23,
        dailyPnL: -26.29,
        totalPnL: 4421.45,
        sector: 'Consumer',
        dividendYield: 0,
        annualDividend: 0,
    },
];

export const mockMetrics: PortfolioMetrics = {
    netLiquidity: 247831.52,
    dailyPnL: 846.54,
    dailyPnLPercent: 0.34,
    sharpeRatio: 1.87,
    sortinoRatio: 2.41,
    maxDrawdown: -12.4,
    volatility: 18.6,
    beta: 1.12,
    totalReturn: 53465.3,
    totalReturnPercent: 27.5,
};

export const mockEquityCurve: EquityCurvePoint[] = (() => {
    const points: EquityCurvePoint[] = [];
    const startDate = new Date('2024-01-01');
    let portfolioValue = 194000;
    let benchmarkValue = 194000;

    for (let i = 0; i < 365; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        portfolioValue *= 1 + (Math.random() * 0.006 - 0.002);
        benchmarkValue *= 1 + (Math.random() * 0.004 - 0.0015);

        points.push({
            date: date.toISOString().split('T')[0],
            portfolio: Math.round(portfolioValue * 100) / 100,
            benchmark: Math.round(benchmarkValue * 100) / 100,
        });
    }
    return points;
})();

// ===== RISK DASHBOARD MOCK DATA =====
export const mockRiskMetrics: RiskMetrics = {
    var95_1d: -3842.15,
    var99_1d: -5891.23,
    var95_10d: -12152.68,
    var99_10d: -18627.89,
    sectorExposure: [
        { sector: 'Technology', weight: 68.4, value: 169517.96, color: '#3B82F6' },
        { sector: 'Index Fund', weight: 12.2, value: 30128.4, color: '#22C55E' },
        { sector: 'Consumer', weight: 4.6, value: 11433.95, color: '#EAB308' },
        { sector: 'Cash', weight: 14.8, value: 36751.21, color: '#71717A' },
    ],
    positionSizing: [
        { symbol: 'AAPL', weight: 11.5, recommended: 10 },
        { symbol: 'MSFT', weight: 13.4, recommended: 12 },
        { symbol: 'NVDA', weight: 16.0, recommended: 10 },
        { symbol: 'VOO', weight: 12.2, recommended: 20 },
        { symbol: 'GOOGL', weight: 7.0, recommended: 10 },
        { symbol: 'AMZN', weight: 4.6, recommended: 8 },
    ],
};

export const mockCorrelationMatrix: CorrelationEntry[] = [
    { pair: ['AAPL', 'MSFT'], correlation: 0.82 },
    { pair: ['AAPL', 'NVDA'], correlation: 0.71 },
    { pair: ['AAPL', 'VOO'], correlation: 0.89 },
    { pair: ['AAPL', 'GOOGL'], correlation: 0.78 },
    { pair: ['AAPL', 'AMZN'], correlation: 0.65 },
    { pair: ['MSFT', 'NVDA'], correlation: 0.74 },
    { pair: ['MSFT', 'VOO'], correlation: 0.91 },
    { pair: ['MSFT', 'GOOGL'], correlation: 0.85 },
    { pair: ['MSFT', 'AMZN'], correlation: 0.69 },
    { pair: ['NVDA', 'VOO'], correlation: 0.63 },
    { pair: ['NVDA', 'GOOGL'], correlation: 0.72 },
    { pair: ['NVDA', 'AMZN'], correlation: 0.58 },
    { pair: ['VOO', 'GOOGL'], correlation: 0.87 },
    { pair: ['VOO', 'AMZN'], correlation: 0.83 },
    { pair: ['GOOGL', 'AMZN'], correlation: 0.76 },
];

// ===== DIVIDEND MOCK DATA =====
export const mockDividendSummary: DividendSummary = {
    totalAnnualIncome: 1019.48,
    portfolioYield: 0.41,
    nextPayout: { symbol: 'VOO', date: '2025-03-28', amount: 394.80 },
    history: [
        { symbol: 'VOO', date: '2024-12-24', amount: 1.635, shares: 60, total: 98.1 },
        { symbol: 'AAPL', date: '2024-11-14', amount: 0.25, shares: 150, total: 37.5 },
        { symbol: 'MSFT', date: '2024-11-21', amount: 0.75, shares: 80, total: 60.0 },
        { symbol: 'GOOGL', date: '2024-12-16', amount: 0.20, shares: 100, total: 20.0 },
        { symbol: 'VOO', date: '2024-09-27', amount: 1.635, shares: 60, total: 98.1 },
        { symbol: 'AAPL', date: '2024-08-15', amount: 0.25, shares: 150, total: 37.5 },
    ],
};

// ===== WATCHLIST MOCK DATA =====
export const mockWatchlist: WatchlistItem[] = [
    {
        id: 'w1',
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        currentPrice: 196.37,
        dailyChange: 4.23,
        dailyChangePercent: 2.2,
        week52High: 299.29,
        week52Low: 138.8,
        volume: 87430000,
        addedAt: '2025-01-15',
    },
    {
        id: 'w2',
        symbol: 'META',
        name: 'Meta Platforms Inc.',
        currentPrice: 631.17,
        dailyChange: -3.58,
        dailyChangePercent: -0.56,
        week52High: 645.51,
        week52Low: 390.42,
        volume: 23540000,
        addedAt: '2025-02-01',
    },
    {
        id: 'w3',
        symbol: 'AMD',
        name: 'Advanced Micro Devices',
        currentPrice: 164.52,
        dailyChange: 5.12,
        dailyChangePercent: 3.21,
        week52High: 227.3,
        week52Low: 120.55,
        volume: 41230000,
        addedAt: '2025-02-10',
    },
    {
        id: 'w4',
        symbol: 'JPM',
        name: 'JPMorgan Chase & Co.',
        currentPrice: 246.78,
        dailyChange: 1.34,
        dailyChangePercent: 0.55,
        week52High: 257.97,
        week52Low: 182.89,
        volume: 9870000,
        addedAt: '2025-01-20',
    },
    {
        id: 'w5',
        symbol: 'V',
        name: 'Visa Inc.',
        currentPrice: 324.56,
        dailyChange: -0.89,
        dailyChangePercent: -0.27,
        week52High: 336.77,
        week52Low: 252.7,
        volume: 6540000,
        addedAt: '2025-02-18',
    },
];

// ===== EARNINGS CALENDAR MOCK DATA =====
export const mockEarningsCalendar: EarningsEvent[] = [
    {
        id: 'e1',
        symbol: 'NVDA',
        name: 'NVIDIA Corp.',
        date: '2025-02-26',
        epsEstimate: 5.59,
        epsActual: null,
        surprise: null,
        status: 'upcoming',
    },
    {
        id: 'e2',
        symbol: 'CRM',
        name: 'Salesforce Inc.',
        date: '2025-02-26',
        epsEstimate: 2.61,
        epsActual: null,
        surprise: null,
        status: 'upcoming',
    },
    {
        id: 'e3',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        date: '2025-02-06',
        epsEstimate: 2.35,
        epsActual: 2.40,
        surprise: 2.13,
        status: 'reported',
    },
    {
        id: 'e4',
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        date: '2025-01-29',
        epsEstimate: 3.11,
        epsActual: 3.23,
        surprise: 3.86,
        status: 'reported',
    },
    {
        id: 'e5',
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        date: '2025-02-04',
        epsEstimate: 2.12,
        epsActual: 2.15,
        surprise: 1.42,
        status: 'reported',
    },
    {
        id: 'e6',
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        date: '2025-02-06',
        epsEstimate: 1.49,
        epsActual: 1.86,
        surprise: 24.83,
        status: 'reported',
    },
    {
        id: 'e7',
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        date: '2025-03-12',
        epsEstimate: 0.74,
        epsActual: null,
        surprise: null,
        status: 'upcoming',
    },
    {
        id: 'e8',
        symbol: 'META',
        name: 'Meta Platforms',
        date: '2025-02-05',
        epsEstimate: 6.73,
        epsActual: 8.02,
        surprise: 19.17,
        status: 'reported',
    },
];

// ===== CHAT / RESEARCH MOCK DATA =====
export const mockConversations: Conversation[] = [
    {
        id: 'conv-1',
        title: 'Portfolio Performance Analysis',
        lastMessage: 'Your portfolio has outperformed the S&P 500 by 3.2%...',
        timestamp: '2025-02-25T06:30:00Z',
        messageCount: 12,
    },
    {
        id: 'conv-2',
        title: 'AAPL Technical Analysis',
        lastMessage: 'Based on the current price action, AAPL shows signs of...',
        timestamp: '2025-02-24T14:20:00Z',
        messageCount: 8,
    },
    {
        id: 'conv-3',
        title: 'Macro Outlook Q1 2025',
        lastMessage: 'The Fed is expected to maintain rates at the March...',
        timestamp: '2025-02-23T09:15:00Z',
        messageCount: 15,
    },
    {
        id: 'conv-4',
        title: 'NVDA Earnings Preview',
        lastMessage: 'NVIDIA is expected to report record revenue driven by...',
        timestamp: '2025-02-22T16:45:00Z',
        messageCount: 6,
    },
];

export const mockChatMessages: ChatMessage[] = [
    {
        id: 'msg-1',
        role: 'user',
        content: 'How is my portfolio performing compared to the market?',
        timestamp: '2025-02-25T06:25:00Z',
    },
    {
        id: 'msg-2',
        role: 'assistant',
        content:
            "Your portfolio has shown remarkable resilience this quarter. With a **net liquidity of $247,831.52** and a daily P/L of **+$846.54 (+0.34%)**, you're outperforming the S&P 500 benchmark.\n\n### Key Highlights:\n\n- **Sharpe Ratio: 1.87** — This is well above the 1.0 threshold, indicating strong risk-adjusted returns\n- **Sortino Ratio: 2.41** — Your downside deviation is well-managed\n- **Beta: 1.12** — Slightly more volatile than the market, primarily driven by your NVDA position\n\n### Sector Breakdown:\nYour portfolio is heavily concentrated in **Technology (68.4%)**, which has been the primary driver of outperformance. Consider diversifying into Healthcare or Energy for better risk distribution.\n\n> 💡 *Recommendation:* Your max drawdown of -12.4% is within acceptable range, but adding 2-3 defensive positions could improve your Sortino ratio further.",
        timestamp: '2025-02-25T06:25:30Z',
    },
];

// ===== TODAY'S BRIEF MOCK DATA =====
export const mockBrief: MarketBrief = {
    id: 'brief-2025-02-25',
    title: 'Markets Open Higher as Tech Earnings Season Delivers',
    subtitle: 'Wall Street rallies on strong semiconductor guidance and resilient consumer spending data',
    content: '',
    readTime: '4 min read',
    timeOfDay: 'Morning',
    date: 'February 25, 2025',
    sections: [
        {
            id: 'summary',
            title: 'Summary',
            content:
                "Markets opened sharply higher on Tuesday as investors digested a wave of positive earnings reports from the technology sector. The S&P 500 futures pointed to a 0.8% gain at the open, while Nasdaq futures surged 1.2%, driven by exceptionally strong guidance from semiconductor companies.\n\nThe rally comes amid growing confidence that artificial intelligence spending will continue to accelerate through 2025, with several major cloud providers announcing expanded capital expenditure plans. This marks the third consecutive week of gains for the technology-heavy Nasdaq Composite, which has now recovered all of its January losses.",
        },
        {
            id: 'market-pulse',
            title: 'Market Pulse',
            content:
                "The bond market told a more nuanced story overnight. The 10-year Treasury yield edged up to 4.32%, reflecting expectations that the Federal Reserve will maintain its patient approach to rate cuts. Traders are now pricing in just two rate cuts for 2025, down from three at the start of the year.\n\nCommodities saw mixed action. Crude oil fell 1.3% to $76.40/barrel on reports of rising U.S. inventories, while gold held steady near $2,030/oz as geopolitical tensions provided a floor. The dollar index weakened slightly against major currencies, providing a tailwind for multinational corporations.",
        },
        {
            id: 'portfolio-impact',
            title: 'Portfolio Impact',
            content:
                'Your portfolio is positioned to benefit from today\'s tech-led rally. **NVDA** (+3.2% pre-market) and **AAPL** (+1.8% pre-market) are both seeing significant buying pressure. Your **VOO** position provides broad market exposure to capture the overall uptrend.\n\nHowever, keep an eye on your **AMZN** position — the stock has underperformed peers recently due to concerns about AWS growth deceleration. Consider reviewing your cost basis and evaluating whether to add on any pullback to the $195-$200 support zone.',
        },
        {
            id: 'looking-ahead',
            title: 'Looking Ahead',
            content:
                "Wednesday brings the latest FOMC minutes release at 2:00 PM ET, which could provide further clarity on the Fed's rate path. Thursday features weekly jobless claims and the second estimate of Q4 GDP. Earnings season continues with reports from major retailers, which will be closely watched for signs of consumer health.\n\n**Key levels to watch:** S&P 500 resistance at 5,120 (all-time high), Nasdaq support at 16,200, and the VIX currently at 14.2 — suggesting complacency that could fuel a short-term pullback.",
        },
    ],
};

// ===== DISCOVER MOCK DATA =====
export const mockDataCategories: DataCategory[] = [
    {
        id: 'macro',
        label: 'Macro & Government Data',
        icon: '🏛️',
        children: [
            { id: 'macro_us', label: 'United States', flag: '🇺🇸', dataPoints: 2847 },
            { id: 'macro_jp', label: 'Japan', flag: '🇯🇵', dataPoints: 1923 },
            { id: 'macro_gb', label: 'United Kingdom', flag: '🇬🇧', dataPoints: 1645 },
            { id: 'macro_de', label: 'Germany', flag: '🇩🇪', dataPoints: 1432 },
            { id: 'macro_cn', label: 'China', flag: '🇨🇳', dataPoints: 1876 },
            { id: 'macro_id', label: 'Indonesia', flag: '🇮🇩', dataPoints: 987 },
        ],
    },
    {
        id: 'financials',
        label: 'Company Financials',
        icon: '📊',
        children: [
            { id: 'fin_aapl', label: 'Apple Inc. (AAPL)', dataPoints: 156 },
            { id: 'fin_msft', label: 'Microsoft Corp. (MSFT)', dataPoints: 156 },
            { id: 'fin_nvda', label: 'NVIDIA Corp. (NVDA)', dataPoints: 148 },
            { id: 'fin_googl', label: 'Alphabet Inc. (GOOGL)', dataPoints: 156 },
            { id: 'fin_amzn', label: 'Amazon.com (AMZN)', dataPoints: 152 },
        ],
    },
    {
        id: 'sectors',
        label: 'Sector Analysis',
        icon: '🏭',
        children: [
            { id: 'sec_tech', label: 'Technology', dataPoints: 3421 },
            { id: 'sec_health', label: 'Healthcare', dataPoints: 2156 },
            { id: 'sec_finance', label: 'Financials', dataPoints: 1987 },
            { id: 'sec_energy', label: 'Energy', dataPoints: 1234 },
            { id: 'sec_consumer', label: 'Consumer Discretionary', dataPoints: 1654 },
        ],
    },
    {
        id: 'fixed-income',
        label: 'Fixed Income & Rates',
        icon: '📈',
        children: [
            { id: 'fi_treasury', label: 'U.S. Treasuries', dataPoints: 890 },
            { id: 'fi_corporate', label: 'Corporate Bonds', dataPoints: 567 },
            { id: 'fi_muni', label: 'Municipal Bonds', dataPoints: 432 },
        ],
    },
    {
        id: 'intl-markets',
        label: 'International Markets',
        icon: '🌍',
        children: [
            { id: 'intl_nikkei', label: 'Nikkei 225 (Japan)', flag: '🇯🇵', dataPoints: 1240 },
            { id: 'intl_ftse', label: 'FTSE 100 (UK)', flag: '🇬🇧', dataPoints: 980 },
            { id: 'intl_dax', label: 'DAX (Germany)', flag: '🇩🇪', dataPoints: 870 },
            { id: 'intl_hsi', label: 'Hang Seng (HK)', flag: '🇭🇰', dataPoints: 1100 },
            { id: 'intl_sse', label: 'Shanghai Composite', flag: '🇨🇳', dataPoints: 960 },
            { id: 'intl_kospi', label: 'KOSPI (Korea)', flag: '🇰🇷', dataPoints: 780 },
            { id: 'intl_sensex', label: 'SENSEX (India)', flag: '🇮🇳', dataPoints: 850 },
        ],
    },
    {
        id: 'earnings',
        label: 'Earnings Calendar',
        icon: '📅',
        children: [
            { id: 'earn_thisweek', label: 'This Week', dataPoints: 47 },
            { id: 'earn_nextweek', label: 'Next Week', dataPoints: 53 },
            { id: 'earn_portfolio', label: 'My Holdings', dataPoints: 6 },
        ],
    },
];

export const mockDiscoverChart: ChartDataPoint[] = (() => {
    const points: ChartDataPoint[] = [];
    const startDate = new Date('2020-01-01');
    let value = 21.5; // Trillions

    for (let i = 0; i < 20; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i * 3);
        value *= 1 + (Math.random() * 0.06 - 0.01);

        points.push({
            date: date.toISOString().split('T')[0],
            value: Math.round(value * 100) / 100,
            yoyGrowth: Math.round((Math.random() * 12 - 2) * 10) / 10,
        });
    }
    return points;
})();

// ===== AI INSIGHTS MOCK DATA =====
export const mockAIInsights: AIInsight[] = [
    {
        id: 'ins-1',
        type: 'pattern',
        title: 'NVDA Golden Cross Detected',
        description: 'NVIDIA\'s 50-day moving average has crossed above the 200-day MA, a historically bullish signal. Over the past 5 years, this pattern has preceded an average 18% gain within 90 days.',
        confidence: 0.87,
        ticker: 'NVDA',
        timestamp: '2025-02-25T06:00:00Z',
    },
    {
        id: 'ins-2',
        type: 'risk',
        title: 'Tech Concentration Warning',
        description: 'Your portfolio has 68.4% allocation in Technology. Recommended maximum is 40%. Consider rebalancing into Healthcare, Utilities, or Consumer Staples to reduce sector risk.',
        confidence: 0.95,
        timestamp: '2025-02-25T05:30:00Z',
    },
    {
        id: 'ins-3',
        type: 'opportunity',
        title: 'AMZN Near Support Zone',
        description: 'Amazon is trading 2.3% above its 200-day MA support at $203.20. RSI at 42 suggests the stock is approaching oversold territory — potential entry point for adding to your position.',
        confidence: 0.72,
        ticker: 'AMZN',
        timestamp: '2025-02-25T05:00:00Z',
    },
    {
        id: 'ins-4',
        type: 'alert',
        title: 'Unusual Volume in GOOGL',
        description: 'Alphabet traded 2.4x its average daily volume yesterday. Institutional buying detected with large block orders above $172. This often precedes significant price moves.',
        confidence: 0.81,
        ticker: 'GOOGL',
        timestamp: '2025-02-24T20:00:00Z',
    },
    {
        id: 'ins-5',
        type: 'pattern',
        title: 'S&P 500 Approaching Resistance',
        description: 'The S&P 500 is within 0.8% of its all-time high at 5,120. Historically, the index breaks through on the 3rd attempt 67% of the time. Watch for a decisive close above this level.',
        confidence: 0.69,
        timestamp: '2025-02-25T04:00:00Z',
    },
];

// ===== SENTIMENT ANALYSIS MOCK DATA =====
export const mockSentimentData: SentimentData[] = [
    {
        ticker: 'AAPL',
        score: 0.62,
        label: 'Bullish',
        sources: 47,
        trending: 'up',
        headlines: [
            { title: 'Apple Vision Pro sales exceed analyst expectations in Q1', source: 'Bloomberg', sentiment: 'positive', timestamp: '2025-02-25T08:30:00Z' },
            { title: 'Apple reportedly developing foldable iPhone for 2026 launch', source: 'Reuters', sentiment: 'positive', timestamp: '2025-02-25T06:15:00Z' },
            { title: 'Apple faces EU fine over App Store practices', source: 'FT', sentiment: 'negative', timestamp: '2025-02-24T14:00:00Z' },
        ],
    },
    {
        ticker: 'NVDA',
        score: 0.85,
        label: 'Bullish',
        sources: 82,
        trending: 'up',
        headlines: [
            { title: 'NVIDIA Blackwell GPUs seeing "insatiable demand" — CEO Jensen Huang', source: 'CNBC', sentiment: 'positive', timestamp: '2025-02-25T09:00:00Z' },
            { title: 'Cloud providers triple AI accelerator orders for 2025', source: 'The Information', sentiment: 'positive', timestamp: '2025-02-25T07:00:00Z' },
            { title: 'NVDA earnings preview: Street expects $5.59 EPS, raised guidance likely', source: 'Barron\'s', sentiment: 'positive', timestamp: '2025-02-24T16:00:00Z' },
        ],
    },
    {
        ticker: 'AMZN',
        score: -0.15,
        label: 'Neutral',
        sources: 34,
        trending: 'down',
        headlines: [
            { title: 'AWS growth slows to 13% as cloud competition intensifies', source: 'WSJ', sentiment: 'negative', timestamp: '2025-02-25T07:30:00Z' },
            { title: 'Amazon expands same-day delivery to 15 new markets', source: 'Reuters', sentiment: 'positive', timestamp: '2025-02-24T11:00:00Z' },
            { title: 'Analysts cut Amazon price targets amid cloud concerns', source: 'MarketWatch', sentiment: 'negative', timestamp: '2025-02-24T09:00:00Z' },
        ],
    },
    {
        ticker: 'MSFT',
        score: 0.48,
        label: 'Bullish',
        sources: 56,
        trending: 'stable',
        headlines: [
            { title: 'Microsoft Copilot adoption accelerates across enterprise', source: 'Bloomberg', sentiment: 'positive', timestamp: '2025-02-25T08:00:00Z' },
            { title: 'Azure AI revenue growing at triple-digit rate', source: 'CNBC', sentiment: 'positive', timestamp: '2025-02-24T15:00:00Z' },
        ],
    },
];

// ===== NEWS AGGREGATION MOCK DATA =====
export const mockNews: NewsArticle[] = [
    { id: 'n1', title: 'Fed Minutes Reveal Cautious Approach to Rate Cuts in 2025', source: 'Bloomberg', url: '#', timestamp: '2025-02-25T09:30:00Z', tickers: [], sentiment: 'neutral' },
    { id: 'n2', title: 'NVIDIA Earnings Preview: AI Demand Remains "Insatiable"', source: 'CNBC', url: '#', timestamp: '2025-02-25T08:45:00Z', tickers: ['NVDA'], sentiment: 'positive' },
    { id: 'n3', title: 'Apple Vision Pro Sales Beat Expectations in First Full Quarter', source: 'Reuters', url: '#', timestamp: '2025-02-25T08:15:00Z', tickers: ['AAPL'], sentiment: 'positive' },
    { id: 'n4', title: 'AWS Growth Concerns Weigh on Amazon Stock', source: 'WSJ', url: '#', timestamp: '2025-02-25T07:30:00Z', tickers: ['AMZN'], sentiment: 'negative' },
    { id: 'n5', title: 'S&P 500 Futures Point to Higher Open on Tech Strength', source: 'MarketWatch', url: '#', timestamp: '2025-02-25T06:00:00Z', tickers: [], sentiment: 'positive' },
    { id: 'n6', title: 'Microsoft Copilot Enterprise Adoption Reaches 60% of Fortune 500', source: 'The Verge', url: '#', timestamp: '2025-02-24T20:00:00Z', tickers: ['MSFT'], sentiment: 'positive' },
    { id: 'n7', title: 'Treasury Yields Edge Higher as Inflation Concerns Persist', source: 'FT', url: '#', timestamp: '2025-02-24T18:30:00Z', tickers: [], sentiment: 'negative' },
    { id: 'n8', title: 'Google Unveils Gemini 2.0 with Advanced Reasoning Capabilities', source: 'TechCrunch', url: '#', timestamp: '2025-02-24T16:00:00Z', tickers: ['GOOGL'], sentiment: 'positive' },
];

// ===== INSIDER TRADING MOCK DATA =====
export const mockInsiderTrades: InsiderTrade[] = [
    { id: 'it1', ticker: 'AAPL', insiderName: 'Tim Cook', title: 'CEO', transactionType: 'Sell', shares: 50000, pricePerShare: 188.50, totalValue: 9425000, date: '2025-02-20' },
    { id: 'it2', ticker: 'NVDA', insiderName: 'Jensen Huang', title: 'CEO', transactionType: 'Sell', shares: 29000, pricePerShare: 865.00, totalValue: 25085000, date: '2025-02-18' },
    { id: 'it3', ticker: 'MSFT', insiderName: 'Brad Smith', title: 'Vice Chair', transactionType: 'Sell', shares: 8000, pricePerShare: 412.30, totalValue: 3298400, date: '2025-02-15' },
    { id: 'it4', ticker: 'GOOGL', insiderName: 'Ruth Porat', title: 'CFO', transactionType: 'Sell', shares: 15000, pricePerShare: 171.80, totalValue: 2577000, date: '2025-02-12' },
    { id: 'it5', ticker: 'JPM', insiderName: 'Jamie Dimon', title: 'CEO', transactionType: 'Buy', shares: 25000, pricePerShare: 243.50, totalValue: 6087500, date: '2025-02-10' },
    { id: 'it6', ticker: 'AMZN', insiderName: 'Andy Jassy', title: 'CEO', transactionType: 'Sell', shares: 12000, pricePerShare: 205.40, totalValue: 2464800, date: '2025-02-08' },
];

// ===== INSTITUTIONAL OWNERSHIP MOCK DATA =====
export const mockInstitutionalHolders: Record<string, InstitutionalHolder[]> = {
    AAPL: [
        { name: 'Vanguard Group', shares: 1340000000, percentOwnership: 8.7, valueUSD: 254460000000, changePercent: 0.3 },
        { name: 'BlackRock', shares: 1020000000, percentOwnership: 6.6, valueUSD: 193680000000, changePercent: -0.1 },
        { name: 'Berkshire Hathaway', shares: 905000000, percentOwnership: 5.9, valueUSD: 171810000000, changePercent: 0 },
        { name: 'State Street', shares: 619000000, percentOwnership: 4.0, valueUSD: 117490000000, changePercent: 0.2 },
        { name: 'FMR LLC (Fidelity)', shares: 350000000, percentOwnership: 2.3, valueUSD: 66440000000, changePercent: 1.1 },
    ],
    NVDA: [
        { name: 'Vanguard Group', shares: 192000000, percentOwnership: 7.8, valueUSD: 168600000000, changePercent: 0.5 },
        { name: 'BlackRock', shares: 155000000, percentOwnership: 6.3, valueUSD: 136150000000, changePercent: 0.2 },
        { name: 'State Street', shares: 97000000, percentOwnership: 3.9, valueUSD: 85200000000, changePercent: -0.3 },
        { name: 'FMR LLC (Fidelity)', shares: 78000000, percentOwnership: 3.2, valueUSD: 68510000000, changePercent: 2.4 },
        { name: 'T. Rowe Price', shares: 52000000, percentOwnership: 2.1, valueUSD: 45670000000, changePercent: 0.8 },
    ],
};

// ===== ESG SCORING MOCK DATA =====
export const mockESGScores: ESGScore[] = [
    { ticker: 'AAPL', name: 'Apple Inc.', environmental: 72, social: 68, governance: 81, total: 74, riskLevel: 'Low' },
    { ticker: 'MSFT', name: 'Microsoft Corp.', environmental: 85, social: 78, governance: 88, total: 84, riskLevel: 'Low' },
    { ticker: 'NVDA', name: 'NVIDIA Corp.', environmental: 61, social: 65, governance: 71, total: 66, riskLevel: 'Medium' },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', environmental: 78, social: 62, governance: 58, total: 66, riskLevel: 'Medium' },
    { ticker: 'AMZN', name: 'Amazon.com', environmental: 45, social: 42, governance: 55, total: 47, riskLevel: 'High' },
    { ticker: 'VOO', name: 'Vanguard S&P 500', environmental: 65, social: 60, governance: 70, total: 65, riskLevel: 'Medium' },
];

// ===== PERFORMANCE ATTRIBUTION MOCK DATA =====
export const mockAttribution: AttributionEntry[] = [
    { label: 'NVDA', contribution: 12.8, weight: 16.0, returnPercent: 95.2, color: '#3B82F6' },
    { label: 'MSFT', contribution: 5.6, weight: 13.4, returnPercent: 33.9, color: '#8B5CF6' },
    { label: 'AAPL', contribution: 4.7, weight: 11.5, returnPercent: 33.2, color: '#22C55E' },
    { label: 'GOOGL', contribution: 3.2, weight: 7.0, returnPercent: 65.8, color: '#EAB308' },
    { label: 'VOO', contribution: 2.1, weight: 12.2, returnPercent: 32.1, color: '#71717A' },
    { label: 'AMZN', contribution: 1.3, weight: 4.6, returnPercent: 63.1, color: '#F97316' },
];

// ===== TRADE JOURNAL MOCK DATA =====
export const mockJournalEntries: JournalEntry[] = [
    { id: 'j1', date: '2025-02-24', ticker: 'NVDA', side: 'Long', entryPrice: 845.00, exitPrice: 878.50, shares: 50, pnl: 1675, pnlPercent: 3.96, status: 'Closed', notes: 'Entered on golden cross breakout with strong volume confirmation. Hit target at resistance zone.', tags: ['swing', 'momentum'], strategy: 'Breakout', setup: 'Golden Cross + Volume Surge' },
    { id: 'j2', date: '2025-02-22', ticker: 'AAPL', side: 'Long', entryPrice: 186.20, exitPrice: null, shares: 100, pnl: null, pnlPercent: null, status: 'Open', notes: 'Bought dip at 200 SMA support. Targeting $195 resistance.', tags: ['swing', 'support'], strategy: 'Mean Reversion', setup: '200 SMA Bounce' },
    { id: 'j3', date: '2025-02-20', ticker: 'MSFT', side: 'Long', entryPrice: 405.80, exitPrice: 415.30, shares: 30, pnl: 285, pnlPercent: 2.34, status: 'Closed', notes: 'Azure earnings play — held through report. Strong cloud numbers drove the move.', tags: ['earnings', 'event'], strategy: 'Earnings Momentum', setup: 'Pre-Earnings Accumulation' },
    { id: 'j4', date: '2025-02-18', ticker: 'TSLA', side: 'Short', entryPrice: 198.50, exitPrice: 191.20, shares: 40, pnl: 292, pnlPercent: 3.68, status: 'Closed', notes: 'Short at resistance wedge rejection. Covered before support at $190.', tags: ['swing', 'resistance'], strategy: 'Reversal', setup: 'Rising Wedge Breakdown' },
    { id: 'j5', date: '2025-02-15', ticker: 'GOOGL', side: 'Long', entryPrice: 168.40, exitPrice: 162.10, shares: 60, pnl: -378, pnlPercent: -3.74, status: 'Stopped', notes: 'Stop loss hit at -4%. Gemini AI event was already priced in — lesson learned.', tags: ['event', 'lesson'], strategy: 'Event-Driven', setup: 'Catalyst Play' },
    { id: 'j6', date: '2025-02-12', ticker: 'AMZN', side: 'Long', entryPrice: 203.50, exitPrice: 210.80, shares: 45, pnl: 328.5, pnlPercent: 3.59, status: 'Closed', notes: 'AWS re-acceleration thesis played out. Held for breakout above $208.', tags: ['swing', 'thesis'], strategy: 'Breakout', setup: 'Base Breakout' },
    { id: 'j7', date: '2025-02-10', ticker: 'META', side: 'Long', entryPrice: 595.00, exitPrice: null, shares: 15, pnl: null, pnlPercent: null, status: 'Open', notes: 'Reels monetization improving. Scaling into position.', tags: ['position', 'growth'], strategy: 'Trend Following', setup: 'Strong Uptrend Continuation' },
    { id: 'j8', date: '2025-02-08', ticker: 'SPY', side: 'Short', entryPrice: 504.20, exitPrice: 501.80, shares: 100, pnl: 240, pnlPercent: 0.48, status: 'Closed', notes: 'Quick mean reversion short at ATH resistance. Small position, quick scalp.', tags: ['scalp', 'index'], strategy: 'Mean Reversion', setup: 'Overbought At Resistance' },
];

// ===== CRYPTO MOCK DATA =====
function generateSparkline(base: number, volatility: number): number[] {
    const points: number[] = [];
    let val = base;
    for (let i = 0; i < 24; i++) {
        val += (Math.random() - 0.48) * volatility;
        points.push(Math.round(val * 100) / 100);
    }
    return points;
}

export const mockCryptoAssets: CryptoAsset[] = [
    { id: 'btc', symbol: 'BTC', name: 'Bitcoin', price: 97245.30, change24h: 2.87, marketCap: 1912000000000, volume24h: 42300000000, sparkline: generateSparkline(97245, 800) },
    { id: 'eth', symbol: 'ETH', name: 'Ethereum', price: 3312.50, change24h: -1.24, marketCap: 398000000000, volume24h: 18700000000, sparkline: generateSparkline(3312, 45) },
    { id: 'sol', symbol: 'SOL', name: 'Solana', price: 178.20, change24h: 5.42, marketCap: 82000000000, volume24h: 4200000000, sparkline: generateSparkline(178, 6) },
    { id: 'bnb', symbol: 'BNB', name: 'BNB', price: 645.80, change24h: 0.93, marketCap: 94000000000, volume24h: 2100000000, sparkline: generateSparkline(645, 10) },
    { id: 'xrp', symbol: 'XRP', name: 'XRP', price: 2.48, change24h: -0.65, marketCap: 134000000000, volume24h: 8900000000, sparkline: generateSparkline(2.48, 0.04) },
    { id: 'ada', symbol: 'ADA', name: 'Cardano', price: 0.782, change24h: 3.15, marketCap: 27400000000, volume24h: 890000000, sparkline: generateSparkline(0.782, 0.015) },
    { id: 'avax', symbol: 'AVAX', name: 'Avalanche', price: 38.90, change24h: -2.18, marketCap: 15200000000, volume24h: 560000000, sparkline: generateSparkline(38.9, 1.2) },
    { id: 'dot', symbol: 'DOT', name: 'Polkadot', price: 7.45, change24h: 1.73, marketCap: 10200000000, volume24h: 340000000, sparkline: generateSparkline(7.45, 0.15) },
];

// ===== RESEARCH WORKSPACES MOCK DATA =====
export const mockWorkspaces: ResearchWorkspace[] = [
    { id: 'ws-1', title: 'Portfolio Analysis', conversationId: 'conv-1', lastActive: '2025-02-25T09:00:00Z' },
    { id: 'ws-2', title: 'Macro Research', conversationId: 'conv-2', lastActive: '2025-02-24T16:30:00Z' },
    { id: 'ws-3', title: 'AI Sector Deep Dive', conversationId: 'conv-3', lastActive: '2025-02-23T14:00:00Z' },
];
