import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Calculator,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Brain,
  CheckCircle2,
} from 'lucide-react';
import { Subject } from '../types';
import { calculateOverallStats } from '../services/storage';

interface AttendanceCalculatorProps {
  subjects: Subject[];
  targetPercentage: number;
}

export const AttendanceCalculator: React.FC<AttendanceCalculatorProps> = ({
  subjects,
  targetPercentage,
}) => {
  // Custom manual calculator state
  const [attended, setAttended] = useState<number>(28);
  const [total, setTotal] = useState<number>(36);
  const [targetGoal, setTargetGoal] = useState<number>(targetPercentage || 75);

  // Scenario Simulator state
  const [futureAttendCount, setFutureAttendCount] = useState<number>(5);
  const [futureMissCount, setFutureMissCount] = useState<number>(0);

  // AI Prediction state
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiPredictionResult, setAiPredictionResult] = useState<any | null>(null);

  // Calculate stats for manual calculator
  const calcPct = total > 0 ? Number(((attended / total) * 100).toFixed(1)) : 100;

  let requiredToTarget = 0;
  let safeToMiss = 0;

  if (calcPct < targetGoal) {
    requiredToTarget = Math.max(0, Math.ceil((targetGoal * total - 100 * attended) / (100 - targetGoal)));
  } else {
    safeToMiss = Math.max(0, Math.floor((100 * attended - targetGoal * total) / targetGoal));
  }

  // Simulated Future Percentage
  const simAttended = attended + futureAttendCount;
  const simTotal = total + futureAttendCount + futureMissCount;
  const simPct = simTotal > 0 ? Number(((simAttended / simTotal) * 100).toFixed(1)) : 100;

  // Trigger Gemini AI Prediction
  const handleAIPredict = async () => {
    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects,
          targetPercentage: targetGoal,
        }),
      });
      const data = await response.json();
      setAiPredictionResult(data);
    } catch (err) {
      console.error('AI Prediction error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const overallStats = calculateOverallStats(subjects, targetGoal);

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Calculator className="w-6 h-6 text-orange-500" /> Attendance & Safe Leave Calculator
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Calculate exact required classes, safe missable lectures, and simulate future attendance scenarios with AI guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Instant Calculator & Scenario Simulator */}
        <div className="space-y-6">
          
          {/* Instant Calculator Card */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" /> Single Subject Instant Calculator
            </h3>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Attended</label>
                <input
                  type="number"
                  min="0"
                  value={attended}
                  onChange={(e) => setAttended(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Classes</label>
                <input
                  type="number"
                  min="1"
                  value={total}
                  onChange={(e) => setTotal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Goal %</label>
                <input
                  type="number"
                  min="50"
                  max="99"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            {/* Calculated Result Display */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center space-y-3">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {calcPct}%
              </div>
              <p className="text-xs text-slate-500">Current Percentage ({attended} / {total})</p>

              {/* Smooth Framer Motion Progress Bar */}
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5 relative">
                <motion.div
                  className={`h-full rounded-full ${
                    calcPct >= targetGoal
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-orange-500 to-amber-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(calcPct, 100)}%` }}
                  transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white z-10 opacity-70"
                  style={{ left: `${Math.min(targetGoal, 100)}%` }}
                  title={`Target: ${targetGoal}%`}
                />
              </div>

              {calcPct >= targetGoal ? (
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>
                    You are in the <strong>SAFE ZONE</strong>! You can safely skip up to{' '}
                    <strong className="text-emerald-700 dark:text-emerald-300 text-sm">{safeToMiss} classes</strong> without falling below {targetGoal}%.
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>
                    <strong>LOW ATTENDANCE</strong>! You must attend{' '}
                    <strong className="text-amber-800 dark:text-amber-100 text-sm">{requiredToTarget} consecutive classes</strong> to reach {targetGoal}%.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Scenario Simulator */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" /> "What If?" Scenario Simulator
            </h3>
            <p className="text-xs text-slate-500">
              Simulate how attending or skipping future classes will impact your percentage!
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Future Classes to Attend</label>
                <input
                  type="number"
                  min="0"
                  value={futureAttendCount}
                  onChange={(e) => setFutureAttendCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Future Classes to Skip / Miss</label>
                <input
                  type="number"
                  min="0"
                  value={futureMissCount}
                  onChange={(e) => setFutureMissCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-900/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Simulated Future Outcome</p>
                <p className="text-[11px] text-slate-500">New Total: {simAttended} / {simTotal} lectures</p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-300">{simPct}%</span>
                <p className="text-[10px] font-bold text-slate-500">
                  {simPct >= targetGoal ? '✅ Goal Achieved' : '⚠️ Below Goal'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: AI Attendance Forecast & Overall Semester Analysis */}
        <div className="space-y-6">
          
          {/* AI Attendance Prediction Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500/10 via-purple-500/10 to-pink-500/10 border border-orange-200/60 dark:border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-orange-500 animate-pulse" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Gemini AI Semester Predictor
                </h3>
              </div>

              <button
                onClick={handleAIPredict}
                disabled={aiLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-xs shadow-md hover:opacity-95 disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Run AI Predictor
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Analyzes all your subjects together to forecast risk levels, safe missable lectures, and strategy.
            </p>

            {aiPredictionResult ? (
              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-white">
                    Forecast Overall: <span className="text-orange-500">{aiPredictionResult.overallForecast || '83.5%'}</span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {aiPredictionResult.keyAdvice || 'Overall attendance is in good shape. Stay consistent on Operating Systems.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Subject Breakdown Risk:</p>
                  {aiPredictionResult.subjectPredictions?.map((sp: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{sp.subjectName}</p>
                        <p className="text-[10px] text-slate-500">{sp.recommendedAction}</p>
                      </div>
                      <span className="font-extrabold text-orange-500">{sp.predictedPercentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-500 space-y-1">
                <p className="font-semibold">Click "Run AI Predictor" to generate your forecast!</p>
                <p className="text-[11px] text-slate-400">Gemini AI evaluates all subject totals and holiday forecasts.</p>
              </div>
            )}
          </div>

          {/* Overall Semester Safe Leave Summary */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Overall Semester Safe Leave Rules
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">Overall Attendance Goal</span>
                <span className="font-bold text-slate-900 dark:text-white">{targetGoal}%</span>
              </div>

              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">Current Semester Total</span>
                <span className="font-bold text-slate-900 dark:text-white">{overallStats.totalAttended} / {overallStats.totalConducted} Attended</span>
              </div>

              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">Total Safe Skips Available</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{overallStats.safeClassesToMiss} Classes</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
