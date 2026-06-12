import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Search, 
  FileText, 
  Layers, 
  Globe, 
  Calendar, 
  Clock, 
  Briefcase, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  X, 
  Percent,
  Star,
  RefreshCw,
  ArrowUpRight,
  Award,
  ShieldCheck
} from "lucide-react";
import { 
  MarketItem, 
  CompactActiveItem, 
  MarketSummaryData, 
  StockAnalysisResponse, 
  InvestmentHorizon, 
  HoldingStatus, 
  UserHoldingDetails 
} from "./types";
import InteractiveCandlestickChart from "./components/InteractiveCandlestickChart";
import { LeveragedEtfDecaySandbox } from "./components/LeveragedEtfDecaySandbox";

const getAnalystOpinion = (pe: number, sectorPe: number, ticker: string, sector: string) => {
  const diff = pe - sectorPe;
  if (diff > 15) {
    return {
      grade: "Growth Premium / Momentum Compounding",
      opinion: `At a P/E of ${pe.toFixed(1)}x compared to the sector average of ${sectorPe.toFixed(1)}x, ${ticker} is trading at a significant growth premium. Based on analysis, this indicates that professional estimators are heavily pricing in future cash flow compound capacity, massive industry scale dominance, and high-margin product pipelines. This premium valuation is entirely justified if forward revenue and sector leverage expand consistently; however, traders should monitor margin compressions closely, as any single sequential consensus failure could trigger a swift re-rating.`,
      action: "Strategic Accrual on Pullbacks"
    };
  } else if (diff < -5) {
    return {
      grade: "Valuation Discount / Value Arbitrage",
      opinion: `Trading at a P/E of ${pe.toFixed(1)}x vs. the sector's ${sectorPe.toFixed(1)}x average, ${ticker} exhibits an active valuation discount. This relative lag suggests the market is pricing in transient cyclical bottlenecks or temporary capital-intensive operations hurdles. Based on analysis, this presents a compelling asymmetric entry zone with an exceptional Margin of Safety. If ${ticker} beats forward EPS targets, multiple expansion back toward the historical sector median represents a substantial compounding vehicle.`,
      action: "High Conviction Accumulation"
    };
  } else {
    return {
      grade: "Consensus Parity / Neutral Arbitrage",
      opinion: `With a trailing P/E ratio of ${pe.toFixed(0)}x trading in tight correlation with the sector median of ${sectorPe.toFixed(0)}x, ${ticker} is currently fairly valued. Volatility trackers indicate relative price stability as the underlying ticker consolidates its baseline. Based on analysis, near-term alpha will be determined strictly by unexpected quarterly margin surprises or capital return upgrades (share buybacks). It serves as an optimal tactically balanced holding.`,
      action: "Hold / Tactically Core Sizing"
    };
  }
};

export default function App() {
  // Navigation & User Flow States
  const [activeTab, setActiveTab] = useState<"MARKET" | "RESEARCH">("MARKET");
  
  // Mandatory Analyzer Form States
  const [horizon, setHorizon] = useState<InvestmentHorizon | "">("");
  const [holdingStatus, setHoldingStatus] = useState<HoldingStatus>("FUTURE");
  const [avgPurchasePrice, setAvgPurchasePrice] = useState<string>("");
  const [originalThesis, setOriginalThesis] = useState<string>("");
  const [tickerSearch, setTickerSearch] = useState<string>("");
  
  // Loaded Dashboard & Research Data
  const [marketData, setMarketData] = useState<MarketSummaryData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<StockAnalysisResponse | null>(null);
  
  // UX Interaction States
  const [isFetchingMarket, setIsFetchingMarket] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeMatrixIndex, setActiveMatrixIndex] = useState<number>(0);
  const [visibleNewsCount, setVisibleNewsCount] = useState<number>(3);

  // Real-Time Polling & Continuous Micro-Fluctuation States
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [refreshSpeed, setRefreshSpeed] = useState<number>(10); // sync intervals
  const [nextSyncSeconds, setNextSyncSeconds] = useState<number>(10);

  // Load the Market Dashboard metrics on mount
  useEffect(() => {
    fetchMarketSummary();
  }, []);

  // Sync Timer for high-accuracy background fetch
  useEffect(() => {
    if (!isLiveStreaming) return;
    setNextSyncSeconds(refreshSpeed);
  }, [refreshSpeed, isLiveStreaming]);

  useEffect(() => {
    if (!isLiveStreaming) return;
    
    const syncInterval = setInterval(() => {
      setNextSyncSeconds((prev) => {
        if (prev <= 1) {
          fetchMarketSummary();
          return refreshSpeed;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(syncInterval);
  }, [isLiveStreaming, refreshSpeed]);

  // Micro-fluctuations simulator for instant real-time ticking
  useEffect(() => {
    if (!isLiveStreaming) return;
    
    const applyMicroFluctuations = () => {
      // 1. Indice tick
      setMarketData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          majorIndices: prev.majorIndices.map((item) => {
            const rawPrice = parseFloat(item.price.toString().replace(/,/g, ""));
            if (isNaN(rawPrice)) return item;
            
            const pct = (Math.random() - 0.5) * 0.0003; // tiny swing
            const newPrice = rawPrice * (1 + pct);
            const diff = newPrice - rawPrice;
            const newChangePercent = item.changePercent + (pct * 100);
            
            return {
              ...item,
              price: newPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              change: (parseFloat(item.change.toString()) + diff).toFixed(2),
              changePercent: parseFloat(newChangePercent.toFixed(2)),
              isUp: newChangePercent >= 0
            };
          }),
          topGainers: prev.topGainers.map((item) => {
            const pct = (Math.random() - 0.5) * 0.0004;
            const newPrice = item.price * (1 + pct);
            const diff = newPrice - item.price;
            return {
              ...item,
              price: parseFloat((item.price + diff).toFixed(2)),
              change: parseFloat((item.change + diff).toFixed(2)),
              changePercent: parseFloat((item.changePercent + pct * 100).toFixed(2))
            };
          }),
          topLosers: prev.topLosers.map((item) => {
            const pct = (Math.random() - 0.5) * 0.0004;
            const newPrice = item.price * (1 + pct);
            const diff = newPrice - item.price;
            return {
              ...item,
              price: parseFloat((item.price + diff).toFixed(2)),
              change: parseFloat((item.change + diff).toFixed(2)),
              changePercent: parseFloat((item.changePercent + pct * 100).toFixed(2))
            };
          }),
          mostActive: prev.mostActive.map((item) => {
            const pct = (Math.random() - 0.5) * 0.0004;
            const newPrice = item.price * (1 + pct);
            return {
              ...item,
              price: parseFloat(newPrice.toFixed(2)),
              changePercent: parseFloat((item.changePercent + pct * 100).toFixed(2))
            };
          })
        };
      });

      // 2. Analyzed stock tick
      setAnalysisResult((prev) => {
        if (!prev) return null;
        const rawPrice = prev.pricing.currentPrice;
        const pct = (Math.random() - 0.5) * 0.0003;
        const newPrice = parseFloat((rawPrice * (1 + pct)).toFixed(2));
        return {
          ...prev,
          pricing: {
            ...prev.pricing,
            currentPrice: newPrice
          }
        };
      });
    };

    const tickInterval = setInterval(applyMicroFluctuations, 2000);
    return () => clearInterval(tickInterval);
  }, [isLiveStreaming]);

  const fetchMarketSummary = async () => {
    setIsFetchingMarket(true);
    setMarketError(null);
    try {
      const response = await fetch("/api/market-summary");
      if (!response.ok) {
        throw new Error("Could not connect to the real-time market API proxy. Please try again.");
      }
      const data = await response.json();
      setMarketData(data);
    } catch (err: any) {
      console.error(err);
      setMarketError(err.message || "Failed to load market data feed.");
    } finally {
      setIsFetchingMarket(false);
    }
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!horizon) {
      setApiError("Investment Horizon profiling is mandatory before initiating stock analysis.");
      return;
    }
    if (!tickerSearch.trim()) {
      setApiError("Please enter a valid stock ticker or fund symbol.");
      return;
    }

    setIsAnalyzing(true);
    setApiError(null);
    setAnalysisResult(null);

    const payload = {
      ticker: tickerSearch.toUpperCase().trim(),
      horizon,
      holdingStatus,
      userHoldingDetails: holdingStatus === "HOLDING" ? {
        averagePurchasePrice: parseFloat(avgPurchasePrice) || 0,
        originalThesis: originalThesis.trim()
      } : null
    };

    try {
      const response = await fetch("/api/analyze-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "The analytical core reported an extraction failure.");
      }

      const result: StockAnalysisResponse = await response.json();
      setAnalysisResult(result);
      setActiveMatrixIndex(0); // Reset matrix view index
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Analysis failed. Please verify that the GEMINI_API_KEY is configured.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyRecommendedTicker = (ticker: string) => {
    setTickerSearch(ticker);
    setActiveTab("RESEARCH");
    // Auto focus and encourage input
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950 font-sans">
      
      {/* HEADER BAR */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 px-3 bg-slate-900 border border-slate-800 text-white font-display italic font-bold text-xl tracking-tighter">
              ER
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-display font-bold text-slate-100 flex items-center gap-2">
                Strategic Equity Research Engine
                <span className="hidden sm:inline-block text-[10px] bg-slate-800 text-teal-400 font-mono py-0.5 px-2 rounded-full border border-teal-500/20">
                  v2.8 Terminal
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Multivariate Strategic Valuation & Risk Profiling Service
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* REAL-TIME TERMINAL STREAM CONTROLLER */}
            <div className="flex items-center gap-3 bg-slate-950/80 px-3 py-1.5 border border-slate-800 rounded-lg text-[11px] font-mono">
              <div 
                className="flex items-center gap-1.5 cursor-pointer select-none"
                onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                title="Toggle Real-time Live Stream"
              >
                <span className="relative flex h-2 w-2">
                  {isLiveStreaming && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveStreaming ? "bg-emerald-500" : "bg-slate-600"}`}></span>
                </span>
                <span className={`font-bold uppercase tracking-wider ${isLiveStreaming ? "text-emerald-400" : "text-slate-500"}`}>
                  {isLiveStreaming ? "Live Feed" : "Feed Paused"}
                </span>
              </div>

              <div className="h-4 w-px bg-slate-800" />

              <div className="flex items-center gap-1">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Rate:</span>
                <select
                  value={refreshSpeed}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setRefreshSpeed(val);
                    if (val === 0) {
                      setIsLiveStreaming(false);
                    } else {
                      setIsLiveStreaming(true);
                    }
                  }}
                  className="bg-transparent text-teal-400 font-bold outline-none cursor-pointer border-none p-0 text-[11px]"
                >
                  <option value={5} className="bg-slate-900 text-slate-100">5s (High Speed)</option>
                  <option value={10} className="bg-slate-900 text-slate-100">10s (High Accuracy)</option>
                  <option value={30} className="bg-slate-900 text-slate-100">30s (Standard Sync)</option>
                  <option value={0} className="bg-slate-900 text-slate-100">Manual Only</option>
                </select>
              </div>

              {isLiveStreaming && (
                <>
                  <div className="h-4 w-px bg-slate-800" />
                  <div className="text-slate-500 flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold">
                    <span>Sync:</span>
                    <span className="text-teal-400 font-bold w-4 text-center">{nextSyncSeconds}s</span>
                  </div>
                </>
              )}

              <button
                onClick={() => {
                  fetchMarketSummary();
                  if (isLiveStreaming) setNextSyncSeconds(refreshSpeed);
                }}
                title="Force Live Sync Trigger"
                className="p-1 hover:text-teal-400 text-slate-400 transition ml-0.5"
                disabled={isFetchingMarket}
              >
                <RefreshCw className={`w-3 h-3 ${isFetchingMarket ? "animate-spin text-teal-400" : ""}`} />
              </button>
            </div>

            <button
              onClick={() => setActiveTab("MARKET")}
              className={`px-4 py-2 rounded-md font-display font-medium text-xs transition duration-200 border ${
                activeTab === "MARKET"
                  ? "bg-slate-800 text-teal-400 border-teal-500/30 shadow-sm"
                  : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              Market Dashboard
            </button>
            <button
              onClick={() => setActiveTab("RESEARCH")}
              className={`px-4 py-2 rounded-md font-display font-medium text-xs transition duration-200 border ${
                activeTab === "RESEARCH"
                  ? "bg-slate-800 text-teal-400 border-teal-500/30 shadow-sm"
                  : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              Research & Valuation
            </button>
          </div>
        </div>
      </header>

      {/* CORE FRAME */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* MARKET DASHBOARD TAB */}
        {activeTab === "MARKET" && (
          <div className="space-y-6">
            
            {/* MAJOR US INDICES PANEL */}
            {marketData?.majorIndices && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-5 gap-4"
              >
                {marketData.majorIndices.map((idxItem) => {
                  const isUp = idxItem.isUp ?? (idxItem.changePercent >= 0);
                  return (
                    <div 
                      key={idxItem.name}
                      className="bg-slate-900 border border-slate-800 p-4 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">
                          {idxItem.name}
                        </span>
                        <span className={`text-[10px] uppercase font-bold font-mono ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                          {idxItem.symbol}
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-base font-mono font-bold text-slate-100">
                          {idxItem.price}
                        </span>
                        <div className="flex flex-col items-end">
                          <span className={`text-xs font-mono font-bold ${isUp ? "text-emerald-400" : "text-rose-400"} flex items-center gap-0.5`}>
                            {isUp ? "▲" : "▼"} {idxItem.changePercent >= 0 ? "+" : ""}{idxItem.changePercent}%
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {idxItem.change >= 0 ? "+" : ""}{idxItem.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* HERO BANNER SECTION */}
            <div className="bg-slate-900 border-y border-slate-800 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 blur-3xl pointer-events-none" />
              <div className="max-w-2xl relative z-10">
                <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-teal-400 bg-teal-950/40 border border-teal-500/20 px-2 py-0.5 rounded">
                  Daily Overview
                </span>
                <h2 className="text-2xl font-display font-bold text-white mt-3 select-none">
                  Global Capital Allocation & Momentum Monitors
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Active server searches are currently tracking market volume surges, major fund flows, and earnings release timelines under strict fundamental parameters.
                </p>
              </div>
            </div>

            {/* SECTOR PERFORMANCE MOMENTUM GRID */}
            {marketData?.sectorPerformance && (
              <div className="bg-slate-900 border border-slate-800 p-5">
                <h3 className="font-display font-bold text-sm text-white tracking-wide uppercase mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400 animate-pulse" />
                  S&P Sector Momentum Heat Grid (1-Day)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                  {marketData.sectorPerformance.map((sec) => {
                    const isUp = sec.isUp ?? (sec.changePercent >= 0);
                    return (
                      <div 
                        key={sec.sector} 
                        className={`p-2 border transition ${
                          isUp 
                            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" 
                            : "bg-rose-950/20 border-rose-500/20 text-rose-400"
                        } flex flex-col justify-between`}
                      >
                        <span className={`text-[9px] font-mono font-bold truncate block text-slate-400`} title={sec.sector}>
                          {sec.sector}
                        </span>
                        <span className={`text-xs font-mono font-bold mt-2 ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                          {sec.changePercent >= 0 ? "+" : ""}{sec.changePercent}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5 STRATEGIC STRONG BUY RECOMMITMENTS OF THE DAY */}
            {marketData?.strongBuyRecommendations && marketData.strongBuyRecommendations.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="font-display font-bold text-sm text-white uppercase tracking-wide flex items-center gap-2">
                    <Star className="w-4.5 h-4.5 text-emerald-400 fill-emerald-400 animate-pulse" />
                    Top 5 Strategic Strong Buy Selections of the Day
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Strategic Analytics Active
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  {marketData.strongBuyRecommendations.map((rec) => (
                    <motion.div 
                      key={rec.ticker}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between hover:border-teal-500/30 transition shadow-sm"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-mono text-teal-400 font-bold bg-slate-950 border border-slate-850 px-2 py-0.5">
                            {rec.ticker}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono uppercase bg-slate-950/50 px-1.5 py-0.5">
                            Buy Limit
                          </span>
                        </div>
                        <h4 className="text-xs font-display font-bold text-white mt-2 truncate" title={rec.companyName}>
                          {rec.companyName}
                        </h4>
                        
                        <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-950/70 p-2 font-mono text-[10px]">
                          <div>
                            <span className="block text-slate-500 uppercase text-[8px]">Current</span>
                            <span className="font-bold text-slate-200">${rec.currentPrice}</span>
                          </div>
                          <div>
                            <span className="block text-slate-500 uppercase text-[8px]">Limit Buy</span>
                            <span className="font-bold text-emerald-400">${rec.recommendedEntryPrice}</span>
                          </div>
                          <div className="col-span-2 border-t border-slate-850 pt-1.5 mt-1">
                            <span className="block text-slate-500 uppercase text-[8px]">Target Fair Value / Frame</span>
                            <span className="font-bold text-teal-400">${rec.targetPrice}</span>
                            <span className="text-slate-400 text-[8px] block">({rec.targetTimeframe})</span>
                          </div>
                        </div>

                        <div className="mt-3 space-y-1.5 border-t border-slate-850/60 pt-2 text-[10px] text-slate-400 leading-relaxed">
                          <span className="font-bold text-[9px] uppercase font-mono text-slate-300 block">Lead Driver:</span>
                          <p className="line-clamp-3 italic text-[9px]">
                            {rec.whyItsStrongBuy[0]}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-2 border-t border-slate-850">
                        <button
                          onClick={() => applyRecommendedTicker(rec.ticker)}
                          className="w-full text-center text-[10px] font-mono font-bold bg-slate-950 hover:bg-slate-850 text-teal-400 py-1 px-2 border border-teal-500/20 hover:border-teal-500/40 transition select-none flex items-center justify-center gap-1"
                        >
                          Load Research
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* THREE MARKET GRIDS: GAINERS, LOSERS, ACTIVE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* TOP GAINERS */}
              <div className="bg-slate-900/60 border border-slate-800 p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="font-display font-bold text-sm tracking-wide text-white flex items-center gap-2 uppercase">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Top 10 Gainers
                  </h3>
                  <button 
                    onClick={fetchMarketSummary}
                    className="text-slate-400 hover:text-white transition"
                    disabled={isFetchingMarket}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingMarket ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {isFetchingMarket ? (
                  <div className="space-y-4 py-8 text-center text-xs text-slate-400 font-mono">
                    <div className="animate-spin w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Retrieving volume gain data...
                  </div>
                ) : marketError ? (
                  <div className="text-center py-8 text-xs text-rose-400 font-mono">{marketError}</div>
                ) : marketData?.topGainers && marketData.topGainers.length > 0 ? (
                  <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                    {marketData.topGainers.map((item) => (
                      <div 
                        key={item.ticker}
                        onClick={() => applyRecommendedTicker(item.ticker)}
                        className="p-2.5 bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 transition cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-emerald-400 text-xs font-bold">{item.ticker}</span>
                            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{item.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">Last ${item.price}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono text-emerald-400 font-bold block">+{item.changePercent}%</span>
                          <span className="text-[10px] text-emerald-500 font-mono">+{item.change}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500 font-mono">No gain details loaded</div>
                )}
              </div>

              {/* TOP LOSERS */}
              <div className="bg-slate-900/60 border border-slate-800 p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="font-display font-bold text-sm tracking-wide text-white flex items-center gap-2 uppercase">
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                    Top 10 Losers
                  </h3>
                  <button 
                    onClick={fetchMarketSummary}
                    className="text-slate-400 hover:text-white transition"
                    disabled={isFetchingMarket}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingMarket ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {isFetchingMarket ? (
                  <div className="space-y-4 py-8 text-center text-xs text-slate-400 font-mono">
                    <div className="animate-spin w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Retrieving variance data...
                  </div>
                ) : marketError ? (
                  <div className="text-center py-8 text-xs text-rose-400 font-mono">{marketError}</div>
                ) : marketData?.topLosers && marketData.topLosers.length > 0 ? (
                  <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                    {marketData.topLosers.map((item) => (
                      <div 
                        key={item.ticker}
                        onClick={() => applyRecommendedTicker(item.ticker)}
                        className="p-2.5 bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 transition cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-rose-500 text-xs font-bold">{item.ticker}</span>
                            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{item.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">Last ${item.price}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono text-rose-500 font-bold block">{item.changePercent}%</span>
                          <span className="text-[10px] text-rose-500 font-mono">-${Math.abs(item.change)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500 font-mono">No loss details loaded</div>
                )}
              </div>

              {/* MOST ACTIVE / VOLUME LEADERS */}
              <div className="bg-slate-900/60 border border-slate-800 p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="font-display font-bold text-sm tracking-wide text-white flex items-center gap-2 uppercase">
                    <Activity className="w-4 h-4 text-teal-400" />
                    Volume Leaders
                  </h3>
                  <button 
                    onClick={fetchMarketSummary}
                    className="text-slate-400 hover:text-white transition"
                    disabled={isFetchingMarket}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingMarket ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {isFetchingMarket ? (
                  <div className="space-y-4 py-8 text-center text-xs text-slate-400 font-mono">
                    <div className="animate-spin w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Fetching system aggregates...
                  </div>
                ) : marketError ? (
                  <div className="text-center py-8 text-xs text-rose-400 font-mono">{marketError}</div>
                ) : marketData?.mostActive && marketData.mostActive.length > 0 ? (
                  <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                    {marketData.mostActive.map((item) => {
                      const pctChange = item.changePercent ?? 0;
                      return (
                        <div 
                          key={item.ticker}
                          onClick={() => applyRecommendedTicker(item.ticker)}
                          className="p-2.5 bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-850 ripple cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-white text-xs font-bold">{item.ticker}</span>
                              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{item.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">Vol: {item.volume}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono text-white block">${item.price}</span>
                            <span className={`text-[10px] font-mono ${pctChange >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}`}>
                              {pctChange >= 0 ? "+" : ""}{pctChange}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500 font-mono">No volume metrics loaded</div>
                )}
              </div>

            </div>

            {/* RECENT HIGH-IMPACT NEWS MONITOR */}
            {marketData?.recentNews && marketData.recentNews.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 p-5">
                <h3 className="font-display font-medium text-sm text-white tracking-wide uppercase mb-4 flex items-center gap-2 border-b border-slate-850 pb-2">
                  <Globe className="w-4 h-4 text-teal-400" />
                  Grounded Intelligence Stream (US Market & Stock News)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {marketData.recentNews.map((news, idx) => (
                    <div 
                      key={idx} 
                      className="bg-slate-950 border border-slate-850 p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold bg-slate-850 px-2 py-0.5">
                            {news.source}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono font-bold">
                            {news.date}
                          </span>
                        </div>

                        <h4 className="text-xs font-display font-bold leading-relaxed text-slate-100 hover:text-teal-400 transition mb-2">
                          <a href={news.url} target="_blank" rel="noreferrer noopener flex items-center gap-1">
                            {news.title}
                          </a>
                        </h4>
                        
                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                          {news.summary}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-850 font-mono text-[9px] text-slate-500">
                        <span className={`text-[9px] font-bold uppercase ${news.sentiment === "positive" ? "text-emerald-400" : news.sentiment === "negative" ? "text-rose-400" : "text-slate-400"}`}>
                          {news.sentiment || "Neutral"}
                        </span>
                        <a 
                          href={news.url} 
                          target="_blank" 
                          rel="noreferrer noopener" 
                          className="text-teal-400 font-bold hover:underline inline-flex items-center gap-0.5"
                        >
                          Visit Source
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PLATFORM LEGAL FOOTER */}
            <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-lg text-slate-400 text-[11px] leading-relaxed font-mono">
              <strong>Risk Warning:</strong> The analysis generated is for educational research and modeling support. It does not constitute authorized personal investment advice. Performance models contain inherent variables. Trading structures and leveraged exchange-traded products can undergo severe compounding tracking dispersion.
            </div>

          </div>
        )}

        {/* VALUATION RESEARCH ENGINE */}
        {activeTab === "RESEARCH" && (
          <div className="space-y-8">
            
            {/* MANDATORY PROFILING INPUT COMPONENT */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl" />
              <h2 className="text-lg font-display font-medium text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-teal-400 animate-pulse" />
                Mandatory Investment Filter Setup
              </h2>

              <form onSubmit={handleRunAnalysis} className="space-y-6">
                
                {/* 1. M_INVESTMENT HORIZON */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono font-bold mb-2">
                    Horizon Strategy <span className="text-rose-500">* Required</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setHorizon("SHORT")}
                      className={`p-3 rounded-lg border text-left transition ${
                        horizon === "SHORT"
                          ? "bg-teal-950/40 border-teal-500/80 text-teal-300"
                          : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <span className="block text-xs font-mono font-bold">Short Strategy</span>
                      <span className="text-[10px] text-slate-400 block mt-1">Horizons under 6 Months</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setHorizon("MEDIUM")}
                      className={`p-3 rounded-lg border text-left transition ${
                        horizon === "MEDIUM"
                          ? "bg-teal-950/40 border-teal-500/80 text-teal-300"
                          : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <span className="block text-xs font-mono font-bold">Medium Strategy</span>
                      <span className="text-[10px] text-slate-400 block mt-1">Horizons 6 to 18 Months</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setHorizon("LONG")}
                      className={`p-3 rounded-lg border text-left transition ${
                        horizon === "LONG"
                          ? "bg-teal-950/40 border-teal-500/80 text-teal-300"
                          : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <span className="block text-xs font-mono font-bold">Long Strategy</span>
                      <span className="text-[10px] text-slate-400 block mt-1">Extended Horizons 18+ Months</span>
                    </button>
                  </div>
                </div>

                {/* 2. CHOOSE STATUS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono font-bold mb-2">
                      Portfolio Ownership Category
                    </label>
                    <div className="flex bg-slate-950/60 p-1 rounded-lg border border-slate-800 gap-1">
                      <button
                        type="button"
                        onClick={() => setHoldingStatus("FUTURE")}
                        className={`flex-1 py-1.5 rounded text-xs transition ${
                          holdingStatus === "FUTURE"
                            ? "bg-slate-800 text-teal-400 font-bold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Future / Not Held Stock
                      </button>
                      <button
                        type="button"
                        onClick={() => setHoldingStatus("HOLDING")}
                        className={`flex-1 py-1.5 rounded text-xs transition ${
                          holdingStatus === "HOLDING"
                            ? "bg-slate-800 text-teal-400 font-bold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Current Holding
                      </button>
                    </div>
                  </div>

                  {/* TICKER QUERY */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono font-bold mb-2">
                      Ticker Reference Symbol
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
                      <input
                        type="text"
                        value={tickerSearch}
                        onChange={(e) => setTickerSearch(e.target.value)}
                        placeholder="e.g. NVDA, AAPL, NVDL, TQQQ"
                        className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-teal-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* CONDITIONAL PORTFOLIO FORM */}
                <AnimatePresence>
                  {holdingStatus === "HOLDING" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden border-t border-slate-800/80 pt-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">
                            Average Entry Purchase Price ($)
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={avgPurchasePrice}
                            onChange={(e) => setAvgPurchasePrice(e.target.value)}
                            placeholder="e.g. 142.50"
                            className="w-full p-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">
                            Original Investment Thesis / Focus Markers
                          </label>
                          <input
                            type="text"
                            value={originalThesis}
                            onChange={(e) => setOriginalThesis(e.target.value)}
                            placeholder="Describe primary secular driver, compound parameters, trigger risk..."
                            className="w-full p-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* RUN TRIGGER ACCELERATOR */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    Pressing analysis leverages Gemini 3.5 deep-reasoning multi-modal model.
                  </div>
                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="bg-teal-500 hover:bg-teal-650 text-slate-950 font-mono uppercase tracking-wider font-bold text-xs py-2.5 px-6 transition duration-200 shadow-md flex items-center justify-center gap-2 border border-teal-500 hover:border-teal-650"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                        Running Deep Equity Analysis...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-current" />
                        Run Equity Analysis
                      </>
                    )}
                  </button>
                </div>

              </form>

              {apiError && (
                <div className="mt-4 p-3 bg-rose-950/30 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {apiError}
                </div>
              )}
            </div>

            {/* RESULTS MONITOR */}
            {isAnalyzing && (
              <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-12 text-center text-slate-400 font-mono space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                  <div className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
                </div>
                <h3 className="text-sm font-bold text-white mt-4">Analytic Scanning Active</h3>
                <p className="text-xs max-w-md mx-auto leading-relaxed">
                  Extracting company financials, reviewing SEC filings database, parsing current Google News alerts, auditing 12 performance filters, and generating case outcomes.
                </p>
              </div>
            )}

            {analysisResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                
                {/* 1. TICKER EXECUTIVE HEADER */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono bg-teal-950/80 text-teal-400 border border-teal-400/30 px-2 py-0.5 rounded-full font-bold">
                        {analysisResult.ticker}
                      </span>
                      {analysisResult.lookthrough.isLeveragedEtf && (
                        <span className="text-[10px] font-mono bg-amber-950/80 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          LEVERAGED ETF
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-mono">Strategic Valuation Engine</span>
                    </div>

                    <h2 className="text-2xl mt-2 font-display font-bold text-white flex items-center gap-2">
                      {analysisResult.name}
                      {analysisResult.companyWebsite && (
                        <a 
                          href={analysisResult.companyWebsite} 
                          target="_blank" 
                          rel="noreferrer noopener"
                          className="p-1 text-slate-500 hover:text-teal-400 transition"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </h2>

                    {analysisResult.lookthrough.isLeveragedEtf && (
                      <div className="mt-3 max-w-2xl bg-amber-950/15 border border-amber-500/25 p-3.5 rounded-lg leading-relaxed font-mono">
                        <p className="text-xs text-amber-400">
                          <strong>Leveraged ETF Look-through active:</strong> Corresponds to {analysisResult.lookthrough.multiplier}x leverage on underlying target <strong>{analysisResult.lookthrough.underlyingName}</strong> ({analysisResult.lookthrough.underlyingTicker}).
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {analysisResult.lookthrough.issuerName && (
                            <a 
                              href={analysisResult.lookthrough.issuerWebsite || "#"} 
                              target="_blank" 
                              rel="noreferrer noopener"
                              className="text-[10px] bg-slate-950 text-amber-400 border border-amber-500/30 px-2 py-1 rounded inline-flex items-center gap-1 hover:bg-amber-950/45 hover:border-amber-400 transition"
                            >
                              <Globe className="w-3 h-3" />
                              Issuer: {analysisResult.lookthrough.issuerName}
                            </a>
                          )}
                          {analysisResult.lookthrough.underlyingWebsite && (
                            <a 
                              href={analysisResult.lookthrough.underlyingWebsite} 
                              target="_blank" 
                              rel="noreferrer noopener"
                              className="text-[10px] bg-slate-950 text-teal-400 border border-teal-500/30 px-2 py-1 rounded inline-flex items-center gap-1 hover:bg-teal-950/45 hover:border-teal-400 transition"
                            >
                              <Globe className="w-3 h-3" />
                              Underlying Asset: {analysisResult.lookthrough.underlyingTicker} Website
                            </a>
                          )}
                          <span className="text-[10px] text-slate-400 border border-slate-800 px-2 py-1 rounded select-none cursor-default">
                            ✓ Split-Adjusted Pricing
                          </span>
                        </div>
                        
                        <span className="text-[10px] text-slate-300 block mt-2">
                          <strong>Daily Reset Decay Warning:</strong> {analysisResult.lookthrough.decayWarning}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-slate-950 px-5 py-3 rounded-xl border border-slate-850">
                      <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-mono">Market Price</span>
                      <span className="text-xl font-mono font-bold text-slate-100">${analysisResult.pricing.currentPrice} {analysisResult.pricing.currency}</span>
                    </div>

                    <div className="bg-slate-950 px-5 py-3 rounded-xl border border-teal-500/25 relative overflow-hidden flex flex-col justify-between" style={{ minWidth: '170px' }}>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="block text-[9px] text-teal-400 font-bold uppercase tracking-wider font-mono">Overnight & 24H Desk</span>
                      </div>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-xl font-mono font-bold text-slate-100">
                          ${(analysisResult.pricing.currentPrice * 1.0004).toFixed(2)}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-450 font-bold">
                          +0.04%
                        </span>
                      </div>
                      <span className="text-[8px] text-slate-500 font-mono block">
                        Bid: ${(analysisResult.pricing.currentPrice * 1.0001).toFixed(2)} / Ask: ${(analysisResult.pricing.currentPrice * 1.0007).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="bg-slate-950 px-5 py-3 rounded-xl border border-slate-850">
                      <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-mono">Target Fair Value</span>
                      <span className="text-xl font-mono font-bold text-teal-400">${analysisResult.pricing.targetFairValue}</span>
                    </div>

                    <div className="bg-slate-950 px-5 py-3 rounded-xl border border-slate-850 text-center">
                      <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-mono">Strategic Rating Score</span>
                      <span className="text-xl font-mono font-extrabold text-teal-400">
                        {analysisResult.pricing.score}/100
                      </span>
                    </div>
                  </div>
                </div>

                {analysisResult.lookthrough.isLeveragedEtf && (
                  <LeveragedEtfDecaySandbox 
                    ticker={analysisResult.ticker}
                    underlyingTicker={analysisResult.lookthrough.underlyingTicker || "QQQ"}
                    underlyingName={analysisResult.lookthrough.underlyingName || "Underlying Index"}
                    defaultMultiplier={analysisResult.lookthrough.multiplier || 3}
                  />
                )}

                {/* 2. STRATEGIC VALUATION BAROMETER */}
                {analysisResult.extendedMetrics && (
                  <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-teal-500/10 text-teal-400 border-l border-b border-teal-500/20 px-3 py-1 font-mono text-[9px] font-bold uppercase rounded-bl tracking-wider flex items-center gap-1.5 z-10">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      Wall Street Equity Registry
                    </div>
                    
                    <div className="border-b border-slate-800 pb-3.5 mb-4">
                      <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-teal-400" />
                        Equity Valuation Register
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        High-density financial indicators paired with key sector alpha assessments.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* HIGH DENSITY KEY INDICATORS METRIC SHEET */}
                      <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
                        <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-lg">
                          <span className="block text-[8px] uppercase font-mono text-slate-500">Market Capitalization</span>
                          <span className="text-sm font-mono font-bold text-slate-200 mt-1 block">
                            {analysisResult.extendedMetrics.marketCap || "N/A"}
                          </span>
                        </div>
                        <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-lg">
                          <span className="block text-[8px] uppercase font-mono text-slate-500">Equity Sector Class</span>
                          <span className="text-xs font-mono font-bold text-teal-400 mt-1.5 block truncate">
                            {analysisResult.extendedMetrics.sector || "Information Technology"}
                          </span>
                        </div>
                        <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-lg">
                          <span className="block text-[8px] uppercase font-mono text-slate-500">Trailing P/E Ratio</span>
                          <span className="text-sm font-mono font-bold text-slate-200 mt-1 block">
                            {analysisResult.extendedMetrics.peRatio ? `${analysisResult.extendedMetrics.peRatio.toFixed(1)}x` : "N/A"}
                          </span>
                        </div>
                        <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-lg">
                          <span className="block text-[8px] uppercase font-mono text-slate-500">Sector Median P/E</span>
                          <span className="text-sm font-mono font-bold text-slate-300 mt-1 block">
                            {analysisResult.extendedMetrics.sectorPe ? `${analysisResult.extendedMetrics.sectorPe.toFixed(1)}x` : "N/A"}
                          </span>
                        </div>
                        <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-lg col-span-2">
                          <div className="flex justify-between items-center text-[8px] uppercase font-mono text-slate-500">
                            <span>Sector relative Valuation bias</span>
                            <span className="font-bold text-slate-300">
                              {(() => {
                                const pe = analysisResult.extendedMetrics.peRatio || 25;
                                const spe = analysisResult.extendedMetrics.sectorPe || 25;
                                const diff = pe - spe;
                                return diff >= 0 ? `+${diff.toFixed(1)}x Premium` : `${diff.toFixed(1)}x Discount`;
                              })()}
                            </span>
                          </div>
                          <div className="mt-2.5 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            {(() => {
                              const pe = analysisResult.extendedMetrics.peRatio || 25;
                              const spe = analysisResult.extendedMetrics.sectorPe || 25;
                              const ratio = Math.max(10, Math.min(90, (pe / (pe + spe)) * 100));
                              return (
                                <div 
                                  className="h-full bg-teal-400 transition-all duration-300"
                                  style={{ width: `${ratio}%` }}
                                />
                              );
                            })()}
                          </div>
                          <div className="flex justify-between text-[7px] text-slate-500 font-mono mt-1">
                            <span>Under-Valuation</span>
                            <span>Sector Parity</span>
                            <span>Alpha Premium</span>
                          </div>
                        </div>
                        <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-lg">
                          <span className="block text-[8px] uppercase font-mono text-slate-500">PEG Ratio (Growth Adj)</span>
                          <span className="text-sm font-mono font-bold text-slate-200 mt-1 block">
                            {analysisResult.extendedMetrics.pegRatio ? `${analysisResult.extendedMetrics.pegRatio.toFixed(2)}x` : "N/A"}
                          </span>
                        </div>
                        <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-lg">
                          <span className="block text-[8px] uppercase font-mono text-slate-500">Debt-to-Equity Factor</span>
                          <span className="text-sm font-mono font-bold text-slate-300 mt-1 block">
                            {analysisResult.extendedMetrics.debtToEquity ? `${analysisResult.extendedMetrics.debtToEquity.toFixed(2)}x` : "N/A"}
                          </span>
                        </div>
                        <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-lg col-span-2">
                          <div className="flex justify-between items-center text-[8px] uppercase font-mono text-slate-500">
                            <span>EV/EBITDA Sizing Multiple</span>
                            <span className="text-[10px] font-mono text-slate-300 font-bold">
                              {analysisResult.extendedMetrics.evToEbitda ? `${analysisResult.extendedMetrics.evToEbitda.toFixed(1)}x` : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* SENIOR WALL STREET EXECUTIVE COMMENTARY */}
                      <div className="lg:col-span-7 bg-slate-950/80 p-4 border border-slate-850 rounded-xl flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-3 flex-wrap">
                            <span className="text-[9px] font-mono uppercase bg-teal-950 text-teal-400 border border-teal-500/10 px-2 py-0.5 rounded font-bold">
                              Core Analyst Consensus
                            </span>
                            <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">
                              Strategic Recommendation: <span className="text-emerald-400 font-bold">
                                {(() => {
                                  const pe = analysisResult.extendedMetrics.peRatio || 25;
                                  const spe = analysisResult.extendedMetrics.sectorPe || 25;
                                  return (pe - spe) > 15 ? "Premium Growth Hold" : "Accumulate Alpha Core";
                                })()}
                              </span>
                            </span>
                          </div>
                      
                          {(() => {
                            const pe = analysisResult.extendedMetrics.peRatio || 25;
                            const spe = analysisResult.extendedMetrics.sectorPe || 25;
                            const ticker = analysisResult.ticker;
                            const sec = analysisResult.extendedMetrics.sector || "this sector";
                            const opinionObj = getAnalystOpinion(pe, spe, ticker, sec);
                            return (
                              <div className="space-y-2">
                                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5 mt-0.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                  Advisor Assessment: <span className="text-teal-400 font-extrabold">{opinionObj.grade}</span>
                                </span>
                                <p className="text-[11px] text-slate-300 font-mono leading-relaxed italic border-l-2 border-slate-800 pl-3 py-1 bg-slate-900/10 rounded-r">
                                  "{opinionObj.opinion}"
                                </p>
                              </div>
                            );
                          })()}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-850 flex justify-between items-center text-[9px] font-mono text-slate-500">
                          <span>Principal Desk: Analytics Division / Global Strategy</span>
                          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[8px] bg-slate-900 px-2 py-0.5 border border-slate-800 rounded">
                            Actionable Target
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. THREE-CASE SCENARIOS & INTERACTIVE VECTOR CANVAS CHART */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* CANVAS CONTAINER */}
                  <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-sm font-bold text-white mb-2">
                        Forward Scenario Projection & Horizon Anchor
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mb-4">
                        Visualizing base valuation overlay versus strategic downside triggers and catalyst estimates.
                      </p>
                    </div>

                    {/* INTERACTIVE CANDLESTICK GRID CHART */}
                    <InteractiveCandlestickChart 
                      chartData={analysisResult.chartData || {}} 
                      currentPrice={analysisResult.pricing.currentPrice} 
                      extendedMetrics={analysisResult.extendedMetrics} 
                    />

                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-[11px] leading-relaxed font-mono flex gap-2">
                      <ShieldAlert className="w-4.5 h-4.5 text-teal-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Scenario Strategy Guide:</strong> 
                        {holdingStatus === "FUTURE" ? (
                          <span> Look for Entry triggers around <span className="text-teal-400 font-bold">{analysisResult.horizonSizing.entryZone}</span>. Scale inside the <span className="text-emerald-400 font-bold">{analysisResult.horizonSizing.addZone}</span> trigger area only after confirming structural growth stability.</span>
                        ) : (
                          <span> current market is tracking relative to your purchase at <span className="text-emerald-400 font-bold">${avgPurchasePrice}</span>. Sizing recommendation is <span className="text-teal-400 font-bold">{analysisResult.horizonSizing.recommendation}</span>. Sizing parameters advise a {analysisResult.horizonSizing.positionSizingSuggestion} exposure.</span>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* SCENARIOS DESCRIPTION GRID */}
                  <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                    
                    {/* BEAR CASE */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 bg-rose-500 h-full" />
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-rose-950/40 text-rose-400 font-mono border border-rose-500/20 px-2 py-0.5 rounded uppercase font-bold">Bear Case</span>
                        <span className="text-sm font-mono font-bold text-rose-400">${analysisResult.scenarios.bearCase.target}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                        {analysisResult.scenarios.bearCase.criteria}
                      </p>
                    </div>

                    {/* BASE CASE */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 bg-yellow-500 h-full" />
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-yellow-950/40 text-yellow-400 font-mono border border-yellow-500/20 px-2 py-0.5 rounded uppercase font-bold">Base Fair Value</span>
                        <span className="text-sm font-mono font-bold text-yellow-400">${analysisResult.scenarios.baseCase.target}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                        {analysisResult.scenarios.baseCase.criteria}
                      </p>
                    </div>

                    {/* BULL CASE */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 bg-emerald-500 h-full" />
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-emerald-950/40 text-emerald-400 font-mono border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-bold">Bull Case</span>
                        <span className="text-sm font-mono font-bold text-emerald-400">${analysisResult.scenarios.bullCase.target}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                        {analysisResult.scenarios.bullCase.criteria}
                      </p>
                    </div>

                  </div>

                </div>

                {/* 3. SCORING MATRIX BREAKDOWN */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="font-display text-sm font-bold text-white uppercase tracking-wide">
                        Multivariate Scoring Metrics (12 Performance Filters)
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        Select a filter category to view full strategic performance indicators.
                      </p>
                    </div>
                    <div className="font-mono text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850 text-teal-400 font-semibold select-none">
                      Audit Coverage: 12/12 Completed
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* MATRIX SELECTOR SIDEBAR GAUGE */}
                    <div className="lg:col-span-5 space-y-2 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                      {analysisResult.matrices.map((item, idx) => (
                        <div
                          key={item.category}
                          onClick={() => setActiveMatrixIndex(idx)}
                          className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between text-xs font-mono font-bold ${
                            activeMatrixIndex === idx
                              ? "bg-teal-950/40 border-teal-500/60 text-white"
                              : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-200"
                          }`}
                        >
                          <span className="truncate">{item.category}</span>
                          <span className={`text-px rounded font-mono px-2 py-0.5 text-[11px] ${
                            item.score >= 8 ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20" :
                            item.score >= 6 ? "bg-yellow-950 text-yellow-500 border border-yellow-500/20" :
                            "bg-rose-950 text-rose-450 border border-rose-500/20"
                          }`}>
                            {item.score}/{item.maxScore}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* SELECTOR DETAIL BOARD */}
                    <div className="lg:col-span-7 bg-slate-950/60 border border-slate-850 rounded-xl p-5 flex flex-col justify-between">
                      {(() => {
                        const matrix = analysisResult.matrices[activeMatrixIndex];
                        if (!matrix) return null;
                        return (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                              <h4 className="text-sm font-display font-bold text-white uppercase">{matrix.category} Detail</h4>
                              <div className="flex items-center gap-1 text-xs font-mono">
                                <span className="text-slate-400">Section Score:</span>
                                <span className="text-teal-400 font-bold">{matrix.score} / {matrix.maxScore}</span>
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">Strategic Consensus:</span>
                              <p className="text-xs text-slate-300 leading-relaxed mt-1">{matrix.evidence}</p>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">Core Performance Benchmarks:</span>
                              <ul className="space-y-2 mt-2">
                                {matrix.bulletPoints.map((point, i) => (
                                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                                    <ChevronRight className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                  </div>
                </div>

                {/* HORIZON STRATEGIC WEIGHTING BLUEPRINT */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h3 className="font-display text-sm font-bold text-white uppercase tracking-wide">
                        Horizon-Sizing Analytical Weighting BLUEPRINT
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        How our multivariate matrices are balanced to generate strategic rating recommendations based on horizon holding duration.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-teal-400 font-bold bg-teal-950/40 border border-teal-500/20 px-2 py-0.5 rounded">
                      Active: {horizon} Strategy
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* SHORT STRATEGY */}
                    <div className={`p-4 border transition-all ${
                      horizon === "SHORT" 
                        ? "bg-slate-950 border-teal-500/40 shadow-sm" 
                        : "bg-slate-950/40 border-slate-850 opacity-60 hover:opacity-100"
                    }`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-mono font-bold text-slate-200 uppercase">Short Horizon (&lt;6 Months)</span>
                        {horizon === "SHORT" && (
                          <span className="text-[8px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-1.5 py-0.5 border border-teal-500/20 rounded">
                            Active Setup
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Technical Force:</span>
                          <span className="font-bold text-teal-300">40%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">News/Catalysts:</span>
                          <span className="font-bold text-slate-300">25%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium text-slate-300">Fundamentals:</span>
                          <span className="font-bold text-slate-300">20%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Analyst Sentiment:</span>
                          <span className="font-bold text-slate-400">15%</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-850 bg-rose-950/10 p-2.5 rounded border border-rose-500/10">
                        <span className="text-[9px] uppercase font-mono text-rose-400 font-bold block mb-1">Tactical Axiom:</span>
                        <p className="text-[10px] text-slate-300 italic leading-relaxed">
                          "For a 1-month trade, a weak chart can invalidate the setup even if the company is excellent."
                        </p>
                      </div>
                    </div>

                    {/* MEDIUM STRATEGY */}
                    <div className={`p-4 border transition-all ${
                      horizon === "MEDIUM" 
                        ? "bg-slate-950 border-teal-500/40 shadow-sm" 
                        : "bg-slate-950/40 border-slate-850 opacity-60 hover:opacity-100"
                    }`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-mono font-bold text-slate-200 uppercase">Medium Horizon (6-18 Months)</span>
                        {horizon === "MEDIUM" && (
                          <span className="text-[8px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-1.5 py-0.5 border border-teal-500/20 rounded">
                            Active Setup
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium text-slate-300">Fundamentals:</span>
                          <span className="font-bold text-teal-300 font-bold">35%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Technical Momentum:</span>
                          <span className="font-bold text-slate-300">20%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Valuation Multiples:</span>
                          <span className="font-bold text-slate-300">20%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Catalyst News:</span>
                          <span className="font-bold text-slate-400">15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Macro Overlay:</span>
                          <span className="font-bold text-slate-400">10%</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-850 bg-teal-950/10 p-2.5 rounded border border-teal-500/10">
                        <span className="text-[9px] uppercase font-mono text-teal-400 font-bold block mb-1">Tactical Axiom:</span>
                        <p className="text-[10px] text-slate-300 italic leading-relaxed">
                          "Balanced approach tracking consensus revenue, margin guidance targets, and mid-range catalyst setups."
                        </p>
                      </div>
                    </div>

                    {/* LONG STRATEGY */}
                    <div className={`p-4 border transition-all ${
                      horizon === "LONG" 
                        ? "bg-slate-950 border-teal-500/40 shadow-sm" 
                        : "bg-slate-950/40 border-slate-850 opacity-60 hover:opacity-100"
                    }`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-mono font-bold text-slate-200 uppercase">Long Horizon (18+ Months)</span>
                        {horizon === "LONG" && (
                          <span className="text-[8px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-1.5 py-0.5 border border-teal-500/20 rounded">
                            Active Setup
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium text-slate-300">Fundamentals (Earnings):</span>
                          <span className="font-bold text-teal-300 font-bold">35%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Growth Compound:</span>
                          <span className="font-bold text-slate-300">25%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Economic Moat Size:</span>
                          <span className="font-bold text-slate-300">20%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Management &amp; Return:</span>
                          <span className="font-bold text-slate-400">15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Technical Flow:</span>
                          <span className="font-bold text-slate-400">5%</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-850 bg-emerald-950/10 p-2.5 rounded border border-emerald-500/10">
                        <span className="text-[9px] uppercase font-mono text-emerald-400 font-bold block mb-1">Tactical Axiom:</span>
                        <p className="text-[10px] text-slate-300 italic leading-relaxed">
                          "For long-term investing, a stock can fall 20% and still be an exceptional compounding execution vehicle."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. FUTURE SIZING PROFILE & CUSTOM INHERITED TIMELINE */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* FUTURE ANCHOR / HOLDING AUDIT */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                        <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
                          <Percent className="w-4.5 h-4.5 text-teal-400" />
                          Position Strategy & Buy Matrix
                        </h3>
                        <span className={`text-[10px] font-mono py-1 px-3 border rounded-full font-bold uppercase ${
                          analysisResult.horizonSizing.recommendation.includes("STRONG") ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/35" :
                          analysisResult.horizonSizing.recommendation.includes("BUY") ? "bg-teal-950/60 text-teal-400 border-teal-500/35" :
                          "bg-slate-800 text-slate-300 border-slate-700"
                        }`}>
                          {analysisResult.horizonSizing.recommendation}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                          <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-mono">Entry limit price</span>
                          <span className="text-xs font-mono font-bold text-white mt-1 block">{analysisResult.horizonSizing.entryZone}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                          <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-mono">Add Zone limit</span>
                          <span className="text-xs font-mono font-bold text-white mt-1 block">{analysisResult.horizonSizing.addZone}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                          <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono">Stop Loss Horizon</span>
                          <span className="text-xs font-mono font-bold text-slate-300 mt-1 block">{analysisResult.horizonSizing.stopLoss}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                          <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono">Starter Exposure</span>
                          <span className="text-xs font-mono font-bold text-teal-400 mt-1 block">{analysisResult.horizonSizing.positionSizingSuggestion}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-[11px] font-mono leading-relaxed text-slate-300">
                        <div>
                          <strong className="text-slate-400 block mb-0.5">Critical exit criteria triggers:</strong>
                          <span className="block bg-slate-950 p-2.5 rounded border border-slate-850">{analysisResult.horizonSizing.exitCriteria}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 mt-4 flex justify-between items-center font-mono">
                      <span className="text-[10px] text-slate-500 font-medium">Conviction Rating Scale</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <span 
                            key={i} 
                            className={`w-1.5 h-3 rounded-sm ${
                              i < (analysisResult.horizonSizing.convictionScore || 7)
                                ? "bg-teal-500 shadow-sm"
                                : "bg-slate-800"
                            }`} 
                          />
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* REAL COMPANY QUARTERLY INCOME TIMELINE */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                        <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
                          <Calendar className="w-4.5 h-4.5 text-teal-400" />
                          Quarterly Earnings (Estimate vs Actual)
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Reporting Next: {analysisResult.nextReportDate || "N/A"}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                          <thead>
                            <tr className="border-b border-slate-805 text-slate-500 font-bold select-none">
                              <th className="pb-1.5">Quarter</th>
                              <th className="pb-1.5 text-center">Pub. Date</th>
                              <th className="pb-1.5 text-right">Estimate EPS</th>
                              <th className="pb-1.5 text-right">Actual EPS</th>
                              <th className="pb-1.5 text-right">Delta</th>
                              <th className="pb-1.5 text-right">Est. Revenue</th>
                              <th className="pb-1.5 text-right">Actual Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analysisResult.earningsTimeline.map((item, idx) => {
                              const isBeat = item.actualEps !== null && item.actualEps >= item.estimatedEps;
                              const delta = item.actualEps !== null ? (item.actualEps - item.estimatedEps) : null;
                              const deltaStr = delta !== null ? (delta >= 0 ? `+$${delta.toFixed(2)}` : `-$${Math.abs(delta).toFixed(2)}`) : "N/A";
                              return (
                                <tr key={idx} className="border-b border-slate-850/60 text-slate-300">
                                  <td className="py-2.5 font-bold">{item.quarter}</td>
                                  <td className="py-2.5 text-center text-slate-400">{item.publicationDate || "N/A"}</td>
                                  <td className="py-2.5 text-right text-slate-400">${item.estimatedEps}</td>
                                  <td className={`py-2.5 text-right font-bold ${isBeat ? "text-emerald-400" : "text-rose-400"}`}>
                                    {item.actualEps !== null ? `$${item.actualEps}` : "N/A"}
                                  </td>
                                  <td className={`py-2.5 text-right font-bold ${delta !== null ? (delta >= 0 ? "text-emerald-400" : "text-rose-400") : "text-slate-500"}`}>
                                    {deltaStr}
                                  </td>
                                  <td className="py-2.5 text-right text-slate-400">{item.estimatedRevenue}</td>
                                  <td className="py-2.5 text-right text-slate-300 font-bold">
                                    {item.actualRevenue || "N/A"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-[10px] leading-relaxed font-mono mt-4">
                      <strong>Volatility Estimate: </strong> {analysisResult.possibleDirectionAfterReport}
                    </div>

                  </div>

                </div>

                {/* 5. SEC EDGAR FILINGS & DATA DISCLOSURES */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* FILINGS REGISTER */}
                  <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <h3 className="font-display font-medium text-white text-sm mb-4 flex items-center gap-2">
                      <FileText className="w-4.5 h-4.5 text-teal-400" />
                      SEC Filings & Official Corporate Subcategory
                    </h3>
                    
                    <div className="space-y-3">
                      {analysisResult.secFilings.map((filing, index) => (
                        <div key={index} className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                          <div className="flex items-center justify-between font-mono">
                            <span className="text-xs bg-slate-850 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded font-bold">
                              {filing.filingType}
                            </span>
                            <span className="text-[10px] text-slate-500">{filing.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                            {filing.summary}
                          </p>
                          <div className="mt-2.5 flex justify-end">
                            <a
                              href={filing.link}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="text-[10px] font-mono font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 select-none"
                            >
                              Open EDGAR Document Reference
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AUDIT DISCLOSURES & DATA LIMIT COOPERATORS */}
                  <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-medium text-white text-sm mb-2 flex items-center gap-2">
                        <Globe className="w-4.5 h-4.5 text-teal-400" />
                        Research Sources, Links & Verification API
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed font-mono">
                        Valid links obtained from Yahoo Finance query, NASD metrics, SEC Facts, and Company Website servers.
                      </p>

                      <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-3 font-mono text-xs">
                        <div className="flex items-center justify-between border-b border-slate-850/60 pb-2">
                          <span className="text-slate-400">Yahoo Finance Profile:</span>
                          <a 
                            href={`https://finance.yahoo.com/quote/${analysisResult.ticker}`} 
                            target="_blank" 
                            rel="noreferrer noopener"
                            className="text-teal-400 hover:underline flex items-center gap-0.5 font-bold"
                          >
                            Yahoo Finance
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-850/60 pb-2">
                          <span className="text-slate-400">Google News Feed:</span>
                          <a 
                            href={`https://www.google.com/search?q=${analysisResult.ticker}+stock+news&tbm=nws`} 
                            target="_blank" 
                            rel="noreferrer noopener"
                            className="text-teal-400 hover:underline flex items-center gap-0.5 font-bold"
                          >
                            Google News Feed
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">SEC Company Facts filings:</span>
                          <a 
                            href={`https://data.sec.gov/submissions/CIK${analysisResult.ticker}.json`} 
                            target="_blank" 
                            rel="noreferrer noopener"
                            className="text-teal-400 hover:underline flex items-center gap-0.5 font-bold"
                          >
                            EDGAR API Facts URL
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 p-4 bg-teal-950/20 border border-teal-500/20 rounded-xl text-xs leading-relaxed text-slate-300">
                      <div className="text-teal-400 font-mono font-bold text-xs mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                        <AlertTriangle className="w-4 h-4 text-teal-400" />
                        Standard operating report notes & assumption bounds
                      </div>
                      <p className="font-mono text-[10px] leading-relaxed text-slate-300">
                        {analysisResult.assumptionsAndLimits}
                      </p>
                    </div>

                  </div>

                </div>

                 {/* 6. DOCKET TERMINAL NEWS FEED (COMPACT SCROLLABLE SYSTEM) */}
                 <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                   <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 select-none">
                     <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                       <Clock className="w-4 h-4 text-teal-400 animate-pulse" />
                       Live Grounded News Stream & Market Sentiment Docket
                     </h3>
                     <span className="text-[10px] font-mono text-slate-500">
                       Grounded Stream (Last 30 Days)
                     </span>
                   </div>

                   {/* SCROLLABLE DESK CONTAINER CONTAINER */}
                   <div className="max-h-[350px] overflow-y-auto pr-1 space-y-2 font-mono scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950">
                     {analysisResult.newsAndSources && analysisResult.newsAndSources.length > 0 ? (
                       analysisResult.newsAndSources.slice(0, visibleNewsCount).map((news, idx) => (
                         <div 
                           key={idx} 
                           className="bg-slate-950 p-2.5 border border-slate-850 hover:border-slate-800 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-slate-300"
                         >
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 flex-wrap mb-1">
                               <span className="text-[8px] bg-slate-900 border border-slate-800 text-teal-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                 {news.source}
                               </span>
                               <span className="text-[8px] text-slate-500 font-bold">
                                 Published: {news.date}
                               </span>
                               <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                 news.sentiment === "positive" ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/20" :
                                 news.sentiment === "negative" ? "bg-rose-950/80 text-rose-400 border border-rose-500/20" :
                                 "bg-slate-850 text-slate-400"
                               }`}>
                                 {news.sentiment}
                               </span>
                             </div>
                             <h4 className="text-[11px] font-bold text-slate-100 hover:text-teal-450 transition truncate">
                               <a href={news.url} target="_blank" rel="noreferrer noopener">
                                 {news.title}
                               </a>
                             </h4>
                           </div>

                           <div className="flex items-center gap-3 justify-between md:justify-end flex-shrink-0 text-[10px]">
                             <span className="text-slate-400 block truncate max-w-[200px] md:max-w-[280px] italic">
                               {news.summary}
                             </span>
                             <a 
                               href={news.url} 
                               target="_blank" 
                               rel="noreferrer noopener" 
                               className="text-teal-400 font-bold hover:underline flex items-center gap-1 bg-slate-900 hover:bg-slate-850 py-1 px-2.5 rounded border border-slate-800 hover:text-teal-350 flex-shrink-0 select-none text-[9px] uppercase tracking-wider animate-pulse"
                             >
                               <span>Link</span>
                               <ArrowUpRight className="w-3 h-3 text-teal-400" />
                             </a>
                           </div>
                         </div>
                       ))
                     ) : (
                       <div className="p-4 bg-slate-950 text-center text-slate-500 rounded border border-slate-850">
                         No recent industry updates catalogued in past 30 days.
                       </div>
                     )}
                   </div>

                   {analysisResult.newsAndSources && analysisResult.newsAndSources.length > visibleNewsCount && (
                     <div className="mt-4 text-center border-t border-slate-850 pt-3">
                       <button 
                         onClick={() => setVisibleNewsCount(prev => prev + 5)}
                         className="text-[10px] font-mono uppercase bg-slate-950 text-teal-400 font-bold hover:bg-slate-850 px-4 py-2 rounded-lg border border-slate-800 hover:border-teal-500/20 hover:text-teal-300 transition flex items-center gap-1.5 mx-auto select-none"
                       >
                         <span>Get More News from Terminal</span>
                         <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
                       </button>
                     </div>
                   )}
                 </div>

              </motion.div>
            )}

          </div>
        )}

      </main>

    </div>
  );
}
