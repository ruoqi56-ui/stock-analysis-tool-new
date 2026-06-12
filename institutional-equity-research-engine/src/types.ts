/**
 * Shared Type Definitions for the Strategic Equity Research Engine
 */

export interface MarketItem {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface CompactActiveItem {
  ticker: string;
  name: string;
  price: number;
  volume: string;
  changePercent: number;
}

export interface RecommendedStrongBuy {
  ticker: string;
  companyName: string;
  currentPrice: number;
  recommendedEntryPrice: number;
  targetPrice: number;
  targetTimeframe: string;
  whyItsStrongBuy: string[];
}

export interface MarketSummaryData {
  topGainers: MarketItem[];
  topLosers: MarketItem[];
  mostActive: CompactActiveItem[];
  strongBuyRecommendations: RecommendedStrongBuy[];
  majorIndices: {
    name: string;
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    isUp: boolean;
  }[];
  sectorPerformance: {
    sector: string;
    changePercent: number;
    isUp: boolean;
  }[];
  recentNews: NewsItem[];
  lastUpdated: string;
}

export interface MatrixItem {
  category: string; // E.g., Growth, Quality, Balance Sheet, Valuation, Technicals, Momentum, etc.
  score: number;      // scored out of 10 or 100
  maxScore: number;   // E.g., 10
  bulletPoints: string[];
  evidence: string;
}

export interface ScenarioDetail {
  target: number;
  criteria: string;
}

export interface ScenarioAnalysis {
  bearCase: ScenarioDetail;
  baseCase: ScenarioDetail;
  bullCase: ScenarioDetail;
}

export interface SECFiling {
  filingType: string; // E.g., "10-K", "10-Q", "8-K"
  date: string;
  link: string;
  summary: string;
}

export interface EarningsData {
  quarter: string;
  estimatedEps: number;
  actualEps: number | null;
  estimatedRevenue: string; // E.g., "84.5B"
  actualRevenue: string | null;
  publicationDate?: string;
}

export interface NewsItem {
  title: string;
  source: string;
  date: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
}

export interface FutureStockSizing {
  entryZone: string;
  addZone: string;
  stopLoss: string;
  exitCriteria: string;
  positionSizingSuggestion: string;
  convictionScore: number; // scored out of 10
  recommendation: string;  // WATCHLIST, STRONG BUY, BUY, HOLD, etc.
}

export interface UnderlyingStockLookthrough {
  isLeveragedEtf: boolean;
  underlyingTicker?: string;
  underlyingName?: string;
  multiplier?: number; // E.g. 2x, 1.5x, -1x
  decayWarning?: string;
}

export interface StockAnalysisResponse {
  ticker: string;
  name: string;
  companyWebsite: string;
  pricing: {
    currentPrice: number;
    currency: string;
    targetFairValue: number;
    score: number; // Strategic score out of 100
  };
  lookthrough: UnderlyingStockLookthrough;
  matrices: MatrixItem[];
  scenarios: ScenarioAnalysis;
  secFilings: SECFiling[];
  earningsTimeline: EarningsData[];
  nextReportDate: string | null;
  possibleDirectionAfterReport: string;
  newsAndSources: NewsItem[];
  horizonSizing: FutureStockSizing;
  assumptionsAndLimits: string;
  lastAnalysisDate: string;
  chartData?: Record<string, any[]>;
  extendedMetrics?: {
    prevClose: number;
    high52w: number;
    low52w: number;
    position52w: number;
    fromHigh52w: number;
    beta: number;
    atr14: number;
    volAvg20: string;
    rsVsSpy6m: number;
    divYield: number;
    peRatio?: number;
    sectorPe?: number;
    marketCap?: string;
    sector?: string;
    pegRatio?: number;
    debtToEquity?: number;
    evToEbitda?: number;
  };
}

/**
 * Client-Side Investment Context
 */
export type InvestmentHorizon = 'SHORT' | 'MEDIUM' | 'LONG'; // <6 months, 6-18 months, 18+ months
export type HoldingStatus = 'FUTURE' | 'HOLDING';

export interface UserHoldingDetails {
  averagePurchasePrice: number;
  originalThesis: string;
}
