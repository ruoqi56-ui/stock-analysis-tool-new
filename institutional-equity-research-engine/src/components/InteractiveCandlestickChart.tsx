import React, { useState, useRef, useEffect } from "react";
import { Clock, TrendingUp, TrendingDown, Eye } from "lucide-react";

interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isUp: boolean;
  ema20?: number;
  sma50?: number;
}

interface InteractiveCandlestickChartProps {
  chartData: Record<string, CandlestickData[]>;
  currentPrice: number;
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
  };
}

export default function InteractiveCandlestickChart({
  chartData,
  currentPrice,
  extendedMetrics
}: InteractiveCandlestickChartProps) {
  const [range, setRange] = useState<string>("3M");
  const [hoveredCandle, setHoveredCandle] = useState<CandlestickData | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Fallback to empty array if specific range is missing
  const activeSeries = chartData[range] || [];

  // Get boundaries for plotting
  const pricesList = activeSeries.flatMap(c => [
    c.low, 
    c.high, 
    c.ema20 || c.close, 
    c.sma50 || c.close
  ]);
  const minPrice = pricesList.length > 0 ? Math.min(...pricesList) * 0.99 : currentPrice * 0.9;
  const maxPrice = pricesList.length > 0 ? Math.max(...pricesList) * 1.01 : currentPrice * 1.1;
  const priceRange = maxPrice - minPrice;

  const maxVolume = activeSeries.length > 0 ? Math.max(...activeSeries.map(c => c.volume)) : 1;

  // Chart Canvas Dimensions
  const width = 800;
  const height = 300;
  const paddingLeft = 55;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Coordinate conversion functions
  const getX = (index: number) => {
    if (activeSeries.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (activeSeries.length - 1)) * chartWidth;
  };

  const getY = (price: number) => {
    if (priceRange === 0) return paddingTop + chartHeight / 2;
    const ratio = (price - minPrice) / priceRange;
    return height - paddingBottom - ratio * chartHeight;
  };

  // Build the line paths for EMAs & SMAs
  let emaPath = "";
  let smaPath = "";

  activeSeries.forEach((c, idx) => {
    const xCoord = getX(idx);
    if (c.ema20 !== undefined) {
      const yCoord = getY(c.ema20);
      emaPath += `${idx === 0 ? "M" : "L"} ${xCoord} ${yCoord} `;
    }
    if (c.sma50 !== undefined) {
      const yCoord = getY(c.sma50);
      smaPath += `${idx === 0 ? "M" : "L"} ${xCoord} ${yCoord} `;
    }
  });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current || activeSeries.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    
    // Scale clientX to SVG internal coordinate space (viewBox is 0 0 800 300)
    const scaleFactor = width / rect.width;
    const svgX = clientX * scaleFactor;

    // Find the closest candle element
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < activeSeries.length; i++) {
      const candleX = getX(i);
      const distance = Math.abs(svgX - candleX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    setHoveredCandle(activeSeries[closestIndex]);
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
  };

  // Determine current active metrics or hovered candle metrics for HUD
  const hudSource = hoveredCandle || (activeSeries.length > 0 ? activeSeries[activeSeries.length - 1] : null);

  // Generate ticks for Y Axis
  const tickCount = 4;
  const ticks = Array.from({ length: tickCount }).map((_, i) => {
    return minPrice + (i / (tickCount - 1)) * priceRange;
  });

  // Calculate 52-Week Range position percentage
  const high52 = extendedMetrics?.high52w || currentPrice * 1.15;
  const low52 = extendedMetrics?.low52w || currentPrice * 0.85;
  const pctOf52w = Math.max(0, Math.min(100, ((currentPrice - low52) / (high52 - low52)) * 100));

  return (
    <div className="space-y-6">
      
      {/* 2-ROW STRATEGIC TERMINAL METRICS GRID */}
      {extendedMetrics && (
        <div className="bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Strategic Equity Valuation & Volatility Register (10 Filters)
            </h4>
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              US Exchange Real-Time Sync Proxy
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* ROW 1 */}
            <div className="bg-slate-950 p-3 border border-slate-850">
              <span className="block text-[8px] uppercase font-mono text-slate-500">Previous Close</span>
              <span className="text-sm font-mono font-bold text-slate-200 mt-1 block">
                ${extendedMetrics.prevClose.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-950 p-3 border border-slate-850">
              <span className="block text-[8px] uppercase font-mono text-slate-500">52-Week High</span>
              <span className="text-sm font-mono font-bold text-slate-200 mt-1 block">
                ${extendedMetrics.high52w.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-950 p-3 border border-slate-850">
              <span className="block text-[8px] uppercase font-mono text-slate-500">52-Week Low</span>
              <span className="text-sm font-mono font-bold text-slate-200 mt-1 block">
                ${extendedMetrics.low52w.toFixed(2)}
              </span>
            </div>

            {/* 52W RANGE GAUGE BAR */}
            <div className="bg-slate-950 p-3 border border-slate-850 col-span-2 md:col-span-1">
              <div className="flex justify-between items-center">
                <span className="block text-[8px] uppercase font-mono text-slate-500">52-Week Position</span>
                <span className="text-[9px] font-mono text-teal-400 font-bold">{pctOf52w.toFixed(0)}%</span>
              </div>
              <div className="mt-2.5 relative">
                <div className="h-1.5 bg-slate-800 w-full rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-400 rounded-full transition-all duration-300"
                    style={{ width: `${pctOf52w}%` }}
                  />
                </div>
                <div className="flex justify-between text-[7px] text-slate-500 font-mono mt-1">
                  <span>${low52.toFixed(1)}</span>
                  <span>${high52.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-3 border border-slate-850">
              <span className="block text-[8px] uppercase font-mono text-slate-500">% From 52W High</span>
              <span className={`text-sm font-mono font-bold mt-1 block ${extendedMetrics.fromHigh52w < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {extendedMetrics.fromHigh52w >= 0 ? "+" : ""}{extendedMetrics.fromHigh52w.toFixed(2)}%
              </span>
            </div>

            {/* ROW 2 */}
            <div className="bg-slate-950 p-3 border border-slate-850">
              <span className="block text-[8px] uppercase font-mono text-slate-500">Beta (Market Vol Factor)</span>
              <span className="text-sm font-mono font-bold text-slate-200 mt-1 block">
                {extendedMetrics.beta.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-950 p-3 border border-slate-850">
              <span className="block text-[8px] uppercase font-mono text-slate-500">ATR 14 (Avg Vol Range)</span>
              <span className="text-sm font-mono font-bold text-slate-300 mt-1 block">
                ${extendedMetrics.atr14.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-950 p-3 border border-slate-850">
              <span className="block text-[8px] uppercase font-mono text-slate-500">20-Day Avg Volume</span>
              <span className="text-sm font-mono font-bold text-slate-300 mt-1 block">
                {extendedMetrics.volAvg20}
              </span>
            </div>

            <div className="bg-slate-950 p-3 border border-slate-850">
              <span className="block text-[8px] uppercase font-mono text-slate-500">Relative Strength vs S&P</span>
              <span className={`text-sm font-mono font-bold mt-1 block ${extendedMetrics.rsVsSpy6m >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {extendedMetrics.rsVsSpy6m >= 0 ? "+" : ""}{extendedMetrics.rsVsSpy6m.toFixed(1)}%
              </span>
            </div>

            <div className="bg-slate-950 p-3 border border-slate-850">
              <span className="block text-[8px] uppercase font-mono text-slate-500">Dividend Yield</span>
              <span className="text-sm font-mono font-bold text-slate-200 mt-1 block">
                {extendedMetrics.divYield > 0 ? `${extendedMetrics.divYield.toFixed(2)}%` : "0.00%"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CANDLESTICK PLOT CARD */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-4">
          <div>
            <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
              Active Chart Range: {range}
            </span>
            <h4 className="text-sm font-display font-bold text-white mt-1">
              Historical Candlestick Matrix Overlay
            </h4>
          </div>

          {/* Timeframe Selectors */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-850 rounded">
            {["1M", "3M", "6M", "1Y", "ALL"].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRange(r);
                  setHoveredCandle(null);
                }}
                className={`py-1 px-2.5 font-mono text-[10px] font-bold transition rounded ${
                  range === r
                    ? "bg-slate-800 text-teal-400 border border-teal-500/25"
                    : "text-slate-500 hover:text-slate-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* HUD OVERLAY TRACKER DISPLAY BAR */}
        {hudSource && (
          <div className="bg-slate-950/70 p-3 border border-slate-850 text-[10px] font-mono grid grid-cols-2 md:grid-cols-7 gap-3 mb-3 text-slate-400">
            <div>
              <span className="text-slate-500 uppercase text-[8px] block">Date Tag</span>
              <span className="font-bold text-slate-200 text-xs flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-teal-400" />
                {hudSource.date}
              </span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[8px] block">Open</span>
              <span className="font-bold text-slate-300">${hudSource.open.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[8px] block">High</span>
              <span className="font-bold text-slate-200">${hudSource.high.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[8px] block">Low</span>
              <span className="font-bold text-slate-200">${hudSource.low.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[8px] block">Close</span>
              <span className="font-extrabold" style={{ color: hudSource.isUp ? "#22c55e" : "#ef4444" }}>
                ${hudSource.close.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[8px] block">Volume</span>
              <span className="font-bold text-slate-300">
                {hudSource.volume >= 1000000 
                  ? `${(hudSource.volume / 1000000).toFixed(2)}M` 
                  : hudSource.volume.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[8px] block">Indicators</span>
              <div className="flex flex-col text-[8px] mt-0.5">
                {hudSource.ema20 && <span className="text-teal-400 leading-none">EMA20: ${hudSource.ema20.toFixed(1)}</span>}
                {hudSource.sma50 && <span className="text-slate-400 leading-none">SMA50: ${hudSource.sma50.toFixed(1)}</span>}
              </div>
            </div>
          </div>
        )}

        {/* CANDLESTICK CANVASS */}
        <div className="relative w-full overflow-hidden bg-slate-950/60 border border-slate-850">
          {activeSeries.length > 0 ? (
            <svg
              ref={svgRef}
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full select-none cursor-crosshair overflow-visible"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Horizontal Gridlines & Y-Axis Labels */}
              {ticks.map((tickVal, tickIdx) => {
                const tickY = getY(tickVal);
                return (
                  <g key={tickIdx}>
                    <line
                      x1={paddingLeft}
                      y1={tickY}
                      x2={width - paddingRight}
                      y2={tickY}
                      stroke="#1e293b"
                      strokeWidth={1}
                      strokeDasharray="4 6"
                      opacity={0.4}
                    />
                    <text
                      x={paddingLeft - 8}
                      y={tickY + 3.5}
                      fill="#64748b"
                      fontSize="9px"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      ${tickVal.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Vertical dotted track projection if hovering */}
              {hoveredCandle && (
                <line
                  x1={getX(activeSeries.indexOf(hoveredCandle))}
                  y1={paddingTop}
                  x2={getX(activeSeries.indexOf(hoveredCandle))}
                  y2={height - paddingBottom}
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="2 3"
                  opacity={0.65}
                />
              )}

              {/* Volume Bars plotted at bottom area (max height 42px) */}
              {activeSeries.map((c, idx) => {
                const volHeight = (c.volume / maxVolume) * 42;
                const candleX = getX(idx);
                const rectWidth = Math.max(1.5, chartWidth / activeSeries.length * 0.7);
                const isPositive = c.isUp;
                return (
                  <rect
                    key={`v-${idx}`}
                    x={candleX - rectWidth / 2}
                    y={height - paddingBottom - volHeight}
                    width={rectWidth}
                    height={volHeight}
                    fill={isPositive ? "#22c55e" : "#ef4444"}
                    fillOpacity="0.16"
                  />
                );
              })}

              {/* Drawing Candlestick candles */}
              {activeSeries.map((c, idx) => {
                const candleX = getX(idx);
                const closedY = getY(c.close);
                const openY = getY(c.open);
                const highY = getY(c.high);
                const lowY = getY(c.low);

                const bodyHeight = Math.max(1.5, Math.abs(closedY - openY));
                const topY = Math.min(closedY, openY);

                const rectWidth = Math.max(3.5, chartWidth / activeSeries.length * 0.65);
                const isPositive = c.isUp;

                return (
                  <g key={`candle-${idx}`}>
                    {/* Wick Line */}
                    <line
                      x1={candleX}
                      y1={highY}
                      x2={candleX}
                      y2={lowY}
                      stroke={isPositive ? "#22c55e" : "#ef4444"}
                      strokeWidth={1.5}
                    />
                    {/* Candle Body */}
                    <rect
                      x={candleX - rectWidth / 2}
                      y={topY}
                      width={rectWidth}
                      height={bodyHeight}
                      fill={isPositive ? "#22c55e" : "#ef4444"}
                      stroke={isPositive ? "#22c55e" : "#ef4444"}
                      strokeWidth={1}
                    />
                  </g>
                );
              })}

              {/* EMA 20 & SMA 50 paths overlays */}
              {emaPath && (
                <path
                  d={emaPath}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  opacity={0.8}
                />
              )}
              {smaPath && (
                <path
                  d={smaPath}
                  fill="none"
                  stroke="#64748b"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  opacity={0.84}
                />
              )}
            </svg>
          ) : (
            <div className="h-64 flex items-center justify-center font-mono text-xs text-slate-500">
              No daily candlestick variance loaded
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between font-mono text-[9px] text-slate-500 mt-3 px-1 border-t border-slate-850 pt-3">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 px-1 bg-[#22c55e] inline-block" /> Pos Candle
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 px-1 bg-[#ef4444] inline-block" /> Neg Candle
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-[#38bdf8] inline-block" /> EMA 20
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-[#64748b] inline-block" /> SMA 50
            </span>
          </div>
          <span>Swipe or Hover to Inspect Particular Candlesticks</span>
        </div>
      </div>

    </div>
  );
}
