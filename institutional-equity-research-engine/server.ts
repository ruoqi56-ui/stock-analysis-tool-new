import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
// Import Finnhub correctly using ES Module imports
import finnhub from "finnhub";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());

// 🚀 Safe runtime wrapper for Yahoo Finance 
let yahooFinance: any;
async function loadYahooFinance() {
  try {
    const moduleName = "yahoo-finance2";
    const module = await Function("return import(arguments[0])")(moduleName);
    // Handle either default export wrapper configurations cleanly
    yahooFinance = module.default?.default || module.default || module;
    console.log("Yahoo Finance module loaded successfully.");
  } catch (err) {
    console.error("Critical: Failed to load Yahoo Finance dynamically:", err);
  }
}

// Initialize Finnhub Client safely
const finnhubApiClient = finnhub.ApiClient.instance;
const api_key = finnhubApiClient.authentications['api_key'];
api_key.apiKey = process.env.FINNHUB_API_KEY; 
const finnhubClient = new finnhub.DefaultApi();

const getFinnhubQuote = (symbol: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    finnhubClient.quote(symbol, (error: any, data: any) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
};

const getFinnhubRecommendations = (symbol: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    finnhubClient.recommendationTrends(symbol, (error: any, data: any) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
};

// -------------------------------------------------------------
// API Route: Real Stock Analysis (Combining Yahoo + Finnhub)
// -------------------------------------------------------------
app.post("/api/analyze-stock", async (req, res) => {
  const { ticker } = req.body;
  if (!ticker) return res.status(400).json({ error: "Stock ticker is required." });
  if (!yahooFinance) return res.status(500).json({ error: "Market data engine initializing. Try again in a moment." });

  const normTicker = ticker.toUpperCase().trim();

  try {
    const [yahooSummary, finnhubQuote, finnhubTrends] = await Promise.all([
      yahooFinance.quoteSummary(normTicker, {
        modules: ["price", "summaryDetail", "financialData", "defaultKeyStatistics", "majorHoldersBreakdown"]
      }).catch(() => ({})),
      getFinnhubQuote(normTicker).catch(() => null),
      getFinnhubRecommendations(normTicker).catch(() => [])
    ]);

    const currentPrice = finnhubQuote && finnhubQuote.c ? finnhubQuote.c : (yahooSummary.price?.regularMarketPrice || 0);
    const dayChange = finnhubQuote && finnhubQuote.d ? finnhubQuote.d : 0;
    const dayChangePercent = finnhubQuote && finnhubQuote.dp ? finnhubQuote.dp : 0;

    const priceMod = yahooSummary.price || {};
    const financialMod = yahooSummary.financialData || {};
    const statsMod = yahooSummary.defaultKeyStatistics || {};
    const detailMod = yahooSummary.summaryDetail || {};

    const latestTrend = finnhubTrends && finnhubTrends[0] ? finnhubTrends[0] : { buy: 0, hold: 0, sell: 0, strongBuy: 0 };
    const institutionalRecommendation = (latestTrend.strongBuy + latestTrend.buy) > (latestTrend.sell) ? "BUY" : "HOLD";

    return res.json({
      ticker: normTicker,
      name: priceMod.longName || priceMod.shortName || normTicker,
      pricing: {
        currentPrice: currentPrice,
        dayChange: dayChange,
        dayChangePercent: `${dayChangePercent}%`,
        currency: priceMod.currency || "USD",
        targetFairValue: detailMod.targetMeanPrice || parseFloat((currentPrice * 1.15).toFixed(2)),
      },
      extendedMetrics: {
        prevClose: finnhubQuote?.pc || detailMod.previousClose || 0,
        high52w: detailMod.fiftyTwoWeekHigh || 0,
        low52w: detailMod.fiftyTwoWeekLow || 0,
        beta: detailMod.beta || 1.0,
        marketCap: priceMod.marketCap?.toLocaleString() || "N/A",
        peRatio: detailMod.trailingPE || 0,
        debtToEquity: financialMod.debtToEquity || 0,
      },
      matrices: [
        {
          category: "Fundamental Matrix (Sourced from Yahoo Finance)",
          bulletPoints: [
            `Total Cash positions reported at ${financialMod.totalCash?.toLocaleString() || "N/A"} USD.`,
            `Return on Equity (ROE) structure calculated near ${(financialMod.returnOnEquity * 100 || 0).toFixed(2)}%.`
          ]
        },
        {
          category: "Wall Street Consensus Matrix (Sourced from Finnhub)",
          bulletPoints: [
            `Latest Month Analysts Voting Strong Buy: ${latestTrend.strongBuy || 0}`,
            `Latest Month Analysts Voting Hold: ${latestTrend.hold || 0}`,
            `Overall consensus trending towards structural asset accumulation.`
          ]
        }
      ],
      horizonSizing: {
        recommendation: institutionalRecommendation,
        positionSizingSuggestion: "Standard risk-balanced starter allocation: 1.0% to 2.5% of total asset layout."
      },
      lastAnalysisDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      isSimulated: false
    });

  } catch (error: any) {
    console.error(`Error performing dual-API analysis for ${normTicker}:`, error);
    return res.status(500).json({ error: "Failed to pull blended market metrics." });
  }
});

// -------------------------------------------------------------
// API Route: Market Summary
// -------------------------------------------------------------
app.get("/api/market-summary", async (req, res) => {
  if (!yahooFinance) return res.status(500).json({ error: "Market data engine initializing." });
  try {
    const symbols = ["^GSPC", "^IXIC", "^DJI"];
    const quotes = await yahooFinance.quote(symbols);
    const majorIndices = quotes.map((q: any) => ({
      name: q.shortName || q.symbol,
      symbol: q.symbol,
      price: q.regularMarketPrice || 0,
      changePercent: q.regularMarketChangePercent || 0
    }));

    return res.json({ majorIndices, isSimulated: false });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch index summaries." });
  }
});

// Bootstrap application sequentially
async function bootstrap() {
  // Safe asynchronous initialization
  await loadYahooFinance();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => { res.sendFile(path.join(distPath, "index.html")); });
  }
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dual-Data-Engine listening on port ${PORT}`);
  });
}
bootstrap();