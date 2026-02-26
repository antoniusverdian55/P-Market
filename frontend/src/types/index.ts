// ===== Cube Trade — Type Definitions =====

// 1. Portfolio & Position Types
export interface Position {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  costBasis: number;
  currentPrice: number;
  percentChange: number;
  dailyPnL: number;
  totalPnL: number;
  sector?: string;
  dividendYield?: number;
  nextDividendDate?: string;
  annualDividend?: number;
}

export interface PortfolioMetrics {
  netLiquidity: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  volatility: number;
  beta: number;
  totalReturn: number;
  totalReturnPercent: number;
}

// 2. Equity Curve / Chart Data
export interface EquityCurvePoint {
  date: string;
  portfolio: number;
  benchmark: number;
}

// 3. Risk Dashboard Types
export interface RiskMetrics {
  var95_1d: number;
  var99_1d: number;
  var95_10d: number;
  var99_10d: number;
  sectorExposure: SectorExposure[];
  positionSizing: PositionWeight[];
}

export interface SectorExposure {
  sector: string;
  weight: number;
  value: number;
  color: string;
}

export interface PositionWeight {
  symbol: string;
  weight: number;
  recommended: number;
}

export interface CorrelationEntry {
  pair: [string, string];
  correlation: number;
}

// 4. Dividend Tracking Types
export interface DividendSummary {
  totalAnnualIncome: number;
  portfolioYield: number;
  nextPayout: { symbol: string; date: string; amount: number } | null;
  history: DividendPayment[];
}

export interface DividendPayment {
  symbol: string;
  date: string;
  amount: number;
  shares: number;
  total: number;
}

// 5. Watchlist Types
export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  dailyChange: number;
  dailyChangePercent: number;
  week52High: number;
  week52Low: number;
  volume: number;
  addedAt: string;
}

// 6. Earnings Calendar Types
export interface EarningsEvent {
  id: string;
  symbol: string;
  name: string;
  date: string;
  epsEstimate: number | null;
  epsActual: number | null;
  surprise: number | null;
  status: 'upcoming' | 'reported';
}

// 7. Chat / Research Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  hasChart?: boolean;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}

// 8. Today's Brief Types
export interface MarketBrief {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  readTime: string;
  timeOfDay: string;
  date: string;
  sections: BriefSection[];
}

export interface BriefSection {
  id: string;
  title: string;
  content: string;
}

// 9. Discover / Data Hub Types
export interface DataCategory {
  id: string;
  label: string;
  icon: string;
  children?: DataItem[];
}

export interface DataItem {
  id: string;
  label: string;
  country?: string;
  flag?: string;
  dataPoints?: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  yoyGrowth?: number;
}

// 10. AI Insights
export interface AIInsight {
  id: string;
  type: 'pattern' | 'alert' | 'opportunity' | 'risk';
  title: string;
  description: string;
  confidence: number;
  ticker?: string;
  timestamp: string;
}

// 11. Sentiment Analysis
export interface SentimentData {
  ticker: string;
  score: number; // -1 to 1
  label: 'Bullish' | 'Bearish' | 'Neutral';
  sources: number;
  trending: 'up' | 'down' | 'stable';
  headlines: SentimentHeadline[];
}

export interface SentimentHeadline {
  title: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: string;
}

// 12. News
export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  timestamp: string;
  tickers: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

// 13. Insider Trading
export interface InsiderTrade {
  id: string;
  ticker: string;
  insiderName: string;
  title: string;
  transactionType: 'Buy' | 'Sell';
  shares: number;
  pricePerShare: number;
  totalValue: number;
  date: string;
}

// 14. Institutional Ownership
export interface InstitutionalHolder {
  name: string;
  shares: number;
  percentOwnership: number;
  valueUSD: number;
  changePercent: number;
}

// 15. ESG
export interface ESGScore {
  ticker: string;
  name: string;
  environmental: number;
  social: number;
  governance: number;
  total: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Severe';
}

// 16. Performance Attribution
export interface AttributionEntry {
  label: string;
  contribution: number;
  weight: number;
  returnPercent: number;
  color: string;
}

// 17. Trade Journal
export interface JournalEntry {
  id: string;
  date: string;
  ticker: string;
  side: 'Long' | 'Short';
  entryPrice: number;
  exitPrice: number | null;
  shares: number;
  pnl: number | null;
  pnlPercent: number | null;
  status: 'Open' | 'Closed' | 'Stopped';
  notes: string;
  tags: string[];
  strategy: string;
  setup: string;
}

// 18. Crypto Asset
export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  sparkline: number[];
}

// 19. Research Workspace
export interface ResearchWorkspace {
  id: string;
  title: string;
  conversationId: string;
  lastActive: string;
}

// 20. Theme
export type ThemeMode = 'dark' | 'light';

// 21. Navigation
export type TabId = 'brief' | 'portfolio' | 'watchlist' | 'journal' | 'research' | 'discover';
