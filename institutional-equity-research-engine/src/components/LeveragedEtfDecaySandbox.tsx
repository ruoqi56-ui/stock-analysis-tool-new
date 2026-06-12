import React, { useState, useMemo } from "react";
import { AlertTriangle, TrendingUp, Info, HelpCircle, Activity } from "lucide-react";

interface LeveragedEtfDecaySandboxProps {
  ticker: string;
  underlyingTicker: string;
  underlyingName: string;
  defaultMultiplier: number;
}

export const LeveragedEtfDecaySandbox: React.FC<LeveragedEtfDecaySandboxProps> = ({
  ticker,
  underlyingTicker,
  underlyingName,
  defaultMultiplier,
}) => {
  // Simulator inputs
  const [dailyVolatility, setDailyVolatility] = useState<number>(3.5); // 0.5% to 15%
  const [simulatedDays, setSimulatedDays] = useState<number>(30); // 5 to 120 days
  const [indexDrift, setIndexDrift] = useState<number>(0.1); // -2% to +2% daily trend
  const [leverageOption, setLeverageOption] = useState<number>(defaultMultiplier);

  // Compute daily compounding sequence
  const simulation = useMemo(() => {
    const v = dailyVolatility / 100;
    const d = indexDrift / 100;
    const m = leverageOption;

    let indexValue = 100;
    let etfValue = 100;

    const points: Array<{
      day: number;
      index: number;
      etf: number;
      decay: number;
    }> = [{ day: 0, index: 100, etf: 100, decay: 0 }];

    for (let t = 1; t <= simulatedDays; t++) {
      // Alternate return behavior to model daily volatility around drift
      // Odd days: drift + volatility
      // Even days: drift - volatility
      const r_t = t % 2 === 1 ? d + v : d - v;
      
      indexValue = indexValue * (1 + r_t);
      etfValue = etfValue * (1 + m * r_t);

      // Linear benchmark return (theoretical return if NO daily reset / compounding decay occurred)
      // e.g. leverage multiplier * cumulative index percent return
      const cumulativeIndexPct = (indexValue / 100) - 1;
      const indexFinalValueNoDecay = 100 * (1 + m * cumulativeIndexPct);
      const decayLoss = indexFinalValueNoDecay - etfValue;

      points.push({
        day: t,
        index: parseFloat(indexValue.toFixed(2)),
        etf: parseFloat(Math.max(0, etfValue).toFixed(2)),
        decay: parseFloat(decayLoss.toFixed(2)),
      });
    }

    const indexFinalReturn = indexValue - 100;
    const etfFinalReturn = etfValue - 100;
    // Expected return if we just did multiplier * underlying return
    const expectedReturnNoDecay = indexFinalReturn * m;
    const netDecayDrag = expectedReturnNoDecay - etfFinalReturn;

    return {
      points,
      indexFinalReturn,
      etfFinalReturn,
      expectedReturnNoDecay,
      netDecayDrag,
      varianceDragTheoretical: 100 * 0.5 * (m * m - m) * (v * v) * simulatedDays,
    };
  }, [dailyVolatility, indexDrift, simulatedDays, leverageOption]);

  const dragSeverityColor = 
    simulation.netDecayDrag > 20 ? "text-rose-450 bg-rose-950/30 border-rose-500/20" :
    simulation.netDecayDrag > 5 ? "text-amber-500 bg-amber-950/30 border-amber-500/20" :
    "text-emerald-400 bg-emerald-950/30 border-emerald-500/20";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5" id="etf-decay-sandbox">
      {/* HEADER SECTION */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-950/50 text-amber-500 border border-amber-550/30">
              <Activity className="w-4 h-4 text-amber-500" />
            </span>
            <h3 className="font-display font-bold text-sm text-slate-100 uppercase tracking-wide">
              Volatility Decay & Slippage Sandbox
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
            Leveraged ETFs reset exposure <span className="text-teal-400 font-semibold">daily</span>. This compounding requirement forces a mathematical drag known as <strong className="text-amber-500">volatility decay (beta slippage)</strong>. Over time, volatile sideways markets destroy capital even if the underlying index ends flat.
          </p>
        </div>
        <span className="text-[10px] bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-400 font-mono">
          Model: compounded-variance
        </span>
      </div>

      {/* THREE COLUMN DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* COL 1: CONTROL PARAMETERS */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-4">
          <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider block border-b border-slate-850 pb-1.5">
            1. Simulation Parameters
          </span>

          {/* Slider 1: Volatility */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Daily Index Volatility</span>
              <span className="text-teal-400 font-bold">{dailyVolatility}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={dailyVolatility}
              onChange={(e) => setDailyVolatility(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
            <div className="flex justify-between text-[8px] text-slate-500 font-mono">
              <span>0.5% (Very Calm)</span>
              <span>15% (Hyper Choppy)</span>
            </div>
          </div>

          {/* Slider 2: Holding Days */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Holding Period</span>
              <span className="text-teal-400 font-bold">{simulatedDays} Trading Days</span>
            </div>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={simulatedDays}
              onChange={(e) => setSimulatedDays(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
            <div className="flex justify-between text-[8px] text-slate-500 font-mono">
              <span>5 Days (Short Loop)</span>
              <span>120 Days (Half Year)</span>
            </div>
          </div>

          {/* Slider 3: Daily Drift */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Daily Multi-Day Trend</span>
              <span className="text-teal-400 font-bold">
                {indexDrift > 0 ? `+${indexDrift}%` : `${indexDrift}%`}
              </span>
            </div>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={indexDrift}
              onChange={(e) => setIndexDrift(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
            <div className="flex justify-between text-[8px] text-slate-500 font-mono">
              <span>-2% (Bear Drift)</span>
              <span>0% (Perfect Flat)</span>
              <span>+2% (Bull Drift)</span>
            </div>
          </div>

          {/* Leverage Factor selector */}
          <div className="space-y-2 pt-2 border-t border-slate-850">
            <label className="text-[10px] text-slate-400 font-mono block">Multiplier Selection:</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[2, 3, -1, -3].map((val) => (
                <button
                  key={val}
                  onClick={() => setLeverageOption(val)}
                  className={`py-1 text-[10px] font-mono rounded font-bold transition border ${
                    leverageOption === val
                      ? "bg-amber-950/40 text-amber-400 border-amber-500/40"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {val > 0 ? `+${val}x` : `${val}x`}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* COL 2: REAL-TIME SIMULATION METRICS */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider block border-b border-slate-850 pb-1.5">
              2. Simulation Outcomes
            </span>

            <div className="mt-3 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Underlying Index Net:</span>
                <span className={`font-bold ${simulation.indexFinalReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {simulation.indexFinalReturn >= 0 ? "+" : ""}
                  {simulation.indexFinalReturn.toFixed(2)}%
                </span>
              </div>

              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Expected Linear Return:</span>
                <span className={`font-bold ${simulation.expectedReturnNoDecay >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {simulation.expectedReturnNoDecay >= 0 ? "+" : ""}
                  {simulation.expectedReturnNoDecay.toFixed(2)}%
                </span>
              </div>

              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Actual Compound Return:</span>
                <span className={`font-bold ${simulation.etfFinalReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {simulation.etfFinalReturn >= 0 ? "+" : ""}
                  {simulation.etfFinalReturn.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className={`p-2.5 rounded border mt-4 text-[11px] font-mono ${dragSeverityColor}`}>
            <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Decay Loss/Drag: {simulation.netDecayDrag.toFixed(2)}%</span>
            </div>
            <p className="text-[9px] mt-1 text-slate-300 leading-relaxed font-sans">
              Due to daily reset variance, your real holding suffers a compounding drag of{" "}
              <strong>{simulation.netDecayDrag.toFixed(2)}%</strong> relative to simple underlying target performance.
            </p>
          </div>
        </div>

        {/* COL 3: MATHEMATICAL EXPLANATION & ACCURACY NOTES */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 text-[11px] font-mono flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider block border-b border-slate-850 pb-1.5">
              3. The Math (Why prices seem "inaccurate")
            </span>
            
            <p className="text-[10px] text-slate-300 leading-relaxed font-sans mt-3">
              Daily reset leverage creates an inherent formulaic offset:
            </p>
            
            <div className="my-2 bg-slate-900 border border-slate-800 p-2 rounded text-center text-slate-100 select-all text-xs font-bold leading-normal">
              Variance Drag ≈ ½ · (m² - m) · σ² · N
            </div>

            <p className="text-[9px] text-slate-400 leading-relaxed font-sans">
              Where <code className="text-teal-400 font-mono">m</code> is leverage multiplier ({leverageOption}x),{" "}
              <code className="text-teal-400 font-mono">σ</code> is daily volatility ({dailyVolatility}%), and{" "}
              <code className="text-teal-400 font-mono">N</code> is holding cycles ({simulatedDays} days).
            </p>

            <p className="text-[10px] text-slate-300 font-sans mt-2">
              For a 3x Bull ETF ({leverageOption}x), a sideways index with {dailyVolatility}% daily volatility will yield a theoretical variance drag of{" "}
              <strong className="text-amber-400 font-mono">{(simulation.varianceDragTheoretical).toFixed(2)}%</strong> over {simulatedDays} days even if the index finishes with 0% total returns.
            </p>
          </div>

          <div className="border-t border-slate-850 pt-2 mt-2 flex items-center gap-1.5 text-slate-400 text-[10px]">
            <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="font-sans leading-tight">
              Hence, long-term charts of {ticker} do not match {underlyingTicker} multiplied directly.
            </span>
          </div>
        </div>

      </div>

      {/* QUICK TABLE SPARK COMPANION */}
      <div className="bg-slate-950 rounded-lg p-3 border border-slate-850 overflow-x-auto">
        <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider block mb-2">
          Geometric Compounding Steps Sparkline (Interday Progression)
        </span>
        <div className="flex gap-2 min-w-[600px] text-[10px] font-mono leading-none py-1">
          {simulation.points.filter((_, idx) => idx % Math.max(1, Math.floor(simulatedDays / 8)) === 0 || idx === simulatedDays).map((pt) => {
            const etfChg = pt.etf - 100;
            const indexChg = pt.index - 100;
            return (
              <div key={pt.day} className="flex-1 bg-slate-900/60 p-2 border border-slate-850 rounded flex flex-col justify-between">
                <span className="text-slate-500 text-[8px] font-bold">DAY {pt.day}</span>
                <span className="mt-1.5 text-slate-200">Index: {pt.index}</span>
                <span className={`text-[9px] ${indexChg >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  ({indexChg >= 0 ? "+" : ""}{indexChg.toFixed(1)}%)
                </span>
                <span className="mt-2 text-slate-100 font-bold">{ticker}: {pt.etf}</span>
                <span className={`text-[9.5px] font-bold ${etfChg >= 0 ? "text-emerald-400" : "text-rose-450"}`}>
                  ({etfChg >= 0 ? "+" : ""}{etfChg.toFixed(1)}%)
                </span>
                <span className="mt-1 text-[8px] text-rose-350 bg-rose-950/20 border border-rose-500/10 px-1 py-0.5 rounded text-center">
                  Drag: {pt.decay}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
