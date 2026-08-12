import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  AlertCircle,
  TrendingDown,
  ShieldAlert,
  Zap,
  Calculator,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Plus,
  ArrowRight,
  Settings,
  Bell,
  Sparkles,
  RefreshCw,
  Flame,
  BookOpen,
} from 'lucide-react';
import { StudentProfile, Subject, DailyPunchLog } from '../types';
import {
  calculateDailyPunchStats,
  calculateOverallStats,
  calculateSubjectPercentage,
  calculateRequiredForSubject,
} from '../services/storage';

interface AttendanceAlertNotificationProps {
  profile: StudentProfile;
  subjects: Subject[];
  punchLogs: DailyPunchLog[];
  setActiveTab: (tab: string) => void;
  onUpdateTarget?: (newTarget: number) => void;
  onMarkSubjectAttendance?: (subjectId: string, status: 'present' | 'absent') => void;
}

export const AttendanceAlertNotification: React.FC<AttendanceAlertNotificationProps> = ({
  profile,
  subjects,
  punchLogs,
  setActiveTab,
  onUpdateTarget,
  onMarkSubjectAttendance,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showAdjustTargetModal, setShowAdjustTargetModal] = useState<boolean>(false);
  const [customTarget, setCustomTarget] = useState<number>(profile.targetPercentage);
  const [quickMarkSuccess, setQuickMarkSuccess] = useState<string | null>(null);

  const target = profile.targetPercentage;
  const punchStats = calculateDailyPunchStats(punchLogs, target);
  const subjectOverallStats = calculateOverallStats(subjects, target);

  // Subject-level calculations
  const deficientSubjects = subjects
    .map((sub) => {
      const { required, safe, pct } = calculateRequiredForSubject(
        sub.attendedClasses,
        sub.totalClasses,
        target
      );
      return {
        ...sub,
        currentPct: pct,
        requiredClasses: required,
        isDeficient: pct < target,
        isWarning: pct >= target - 3 && pct < target,
      };
    })
    .filter((sub) => sub.isDeficient || sub.isWarning);

  const criticalSubjects = deficientSubjects.filter((s) => s.isDeficient);
  const warningSubjects = deficientSubjects.filter((s) => s.isWarning);

  // Trigger conditions
  const isPunchLow = punchStats.overallPercentage < target;
  const isOverallSubjectLow = subjectOverallStats.overallPercentage < target;
  const isAnySubjectLow = criticalSubjects.length > 0;

  const hasAlert = isPunchLow || isOverallSubjectLow || isAnySubjectLow;

  if (!hasAlert) {
    return null; // All good! No alert needed.
  }

  if (isDismissed) {
    return (
      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between font-medium animate-in fade-in">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Attendance Shortage Alert Snoozed:</strong> You have {criticalSubjects.length} subject(s) below your {target}% target.
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-bold border border-amber-500/30 transition-all shrink-0"
        >
          Restore Alert
        </button>
      </div>
    );
  }

  const handleSaveTarget = () => {
    if (onUpdateTarget && customTarget > 0 && customTarget <= 100) {
      onUpdateTarget(customTarget);
      setShowAdjustTargetModal(false);
    }
  };

  const handleQuickMarkPresent = (subjectId: string, subjectName: string) => {
    if (onMarkSubjectAttendance) {
      onMarkSubjectAttendance(subjectId, 'present');
      setQuickMarkSuccess(`Logged 1 present class for ${subjectName}!`);
      setTimeout(() => setQuickMarkSuccess(null), 3000);
    }
  };

  // Primary shortage math
  const maxRequiredClasses = Math.max(
    ...criticalSubjects.map((s) => s.requiredClasses),
    subjectOverallStats.requiredClassesToTarget,
    0
  );

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/90 via-slate-900 to-amber-950/90 border-2 border-red-500/50 text-white shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
      
      {/* Top Urgent Alert Bar */}
      <div className="p-5 sm:p-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-500/30 border border-white/20 shrink-0">
                <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-slate-900 animate-ping" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/30 border border-red-500/50 text-red-200 text-[10px] font-black uppercase tracking-wider">
                  Critical Attendance Shortage Alert
                </span>
                <span className="text-[11px] text-slate-300 font-bold hidden sm:inline">
                  Target Goal: {target}%
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5 flex items-center gap-2 font-serif">
                Attendance Dropped Below Target!
              </h2>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAdjustTargetModal(!showAdjustTargetModal)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 flex items-center gap-1.5 transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Adjust Target</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
              title={isExpanded ? 'Collapse Alert Details' : 'Expand Alert Details'}
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-red-500/30 text-slate-400 hover:text-red-300 transition-all"
              title="Snooze Alert"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Adjust Target Modal / Popover */}
        {showAdjustTargetModal && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-amber-400" /> Adjust Target Percentage
              </span>
              <button
                onClick={() => setShowAdjustTargetModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={customTarget}
                onChange={(e) => setCustomTarget(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 font-black text-amber-200 text-sm font-mono shrink-0">
                {customTarget}%
              </span>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={handleSaveTarget}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-extrabold text-xs shadow-md hover:scale-105 transition-all"
              >
                Update Target Goal
              </button>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {quickMarkSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 font-bold text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{quickMarkSuccess}</span>
          </div>
        )}

        {/* Summary Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Card 1: Subject Attendance Shortfall */}
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/30 space-y-1">
            <div className="flex items-center justify-between text-red-300 text-[11px] font-bold">
              <span>Overall Subject Attendance</span>
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {subjectOverallStats.overallPercentage}%
              </span>
              <span className="text-xs text-red-300 font-semibold">
                (Shortage: {(target - subjectOverallStats.overallPercentage).toFixed(1)}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Need <strong>{subjectOverallStats.requiredClassesToTarget} consecutive classes</strong> overall.
            </p>
          </div>

          {/* Card 2: Punch Log Attendance Shortfall */}
          <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/30 space-y-1">
            <div className="flex items-center justify-between text-amber-300 text-[11px] font-bold">
              <span>Daily Punch Attendance</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {punchStats.overallPercentage}%
              </span>
              <span className="text-xs text-amber-300 font-semibold">
                (Target: {target}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Need <strong>{punchStats.requiredDaysToTarget} consecutive punch-in days</strong>.
            </p>
          </div>

          {/* Card 3: Deficient Subjects Count */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
            <div className="flex items-center justify-between text-purple-300 text-[11px] font-bold">
              <span>At-Risk Subjects</span>
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {criticalSubjects.length}
              </span>
              <span className="text-xs text-slate-400">
                of {subjects.length} Subjects
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {criticalSubjects.length > 0
                ? `${criticalSubjects.map((s) => s.name).slice(0, 2).join(', ')}${criticalSubjects.length > 2 ? '...' : ''}`
                : 'All individual subjects meeting target'}
            </p>
          </div>

        </div>

        {/* Expandable Breakdown Drawer */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-red-500/20">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
              <span className="flex items-center gap-1.5 text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-400" /> Subject-by-Subject Recovery Analysis
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                Target: {target}%
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {criticalSubjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm">{sub.name}</span>
                      <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 font-mono font-bold text-[10px]">
                        {sub.code || 'SUB'}
                      </span>
                    </div>
                    <div className="text-slate-300 text-[11px] flex items-center gap-2">
                      <span>Attended: <strong>{sub.attendedClasses} / {sub.totalClasses}</strong> classes</span>
                      <span>•</span>
                      <span className="text-red-300 font-bold">Current: {sub.currentPct}%</span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(sub.currentPct, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white z-10 opacity-70"
                        style={{ left: `${Math.min(target, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right sm:text-right">
                      <span className="px-2.5 py-1 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 font-extrabold text-[11px] block">
                        Must attend +{sub.requiredClasses} consecutive classes
                      </span>
                    </div>

                    {onMarkSubjectAttendance && (
                      <button
                        onClick={() => handleQuickMarkPresent(sub.id, sub.name)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-md transition-all shrink-0"
                        title="Quick log 1 present class for this subject"
                      >
                        <Plus className="w-3.5 h-3.5" /> +1 Present
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {warningSubjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white">{sub.name}</span>
                      <span className="text-amber-200 text-[11px] ml-2">
                        Near Risk Zone: {sub.currentPct}% (Target: {target}%)
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                    Warning
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-red-500/20">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('calculator')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 hover:scale-105 transition-all"
                >
                  <Calculator className="w-4 h-4 text-purple-200" />
                  <span>Simulate in Bunk Predictor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Zap className="w-4 h-4" />
                  <span>Punch Station</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400 italic">
                Attendance updates automatically recalculate target recovery.
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
