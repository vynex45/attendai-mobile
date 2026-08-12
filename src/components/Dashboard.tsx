import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Flame,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Bot,
  Plus,
  LogIn,
  LogOut,
  FileText,
  Search,
  Filter,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Building,
  X,
  BookOpen,
  Slash,
  Check,
} from 'lucide-react';
import { StudentProfile, Subject, DailyPunchLog, TimetableSlot, AIInsight, AcademicSession, AcademicHoliday, AttendanceRecord } from '../types';
import { EmptyState } from './EmptyState';
import { calculateDailyPunchStats } from '../services/storage';
import { getHolidayStatusForDate, calculateAcademicSessionStats, HOLIDAY_CATEGORY_META } from '../services/academicCalendar';
import { AttendanceAlertNotification } from './AttendanceAlertNotification';

interface DashboardProps {
  profile: StudentProfile;
  subjects: Subject[];
  punchLogs: DailyPunchLog[];
  timetable: TimetableSlot[];
  insights: AIInsight[];
  session: AcademicSession;
  holidays: AcademicHoliday[];
  onPunchIn: (location?: DailyPunchLog['location'], notes?: string) => void;
  onPunchOut: () => void;
  onMarkDailyStatus: (date: string, status: DailyPunchLog['status'], notes?: string) => void;
  setActiveTab: (tab: string) => void;
  onOpenCalendarModal?: () => void;
  onUpdateTarget?: (newTarget: number) => void;
  onMarkSubjectAttendance?: (subjectId: string, status: AttendanceRecord['status'], date?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  subjects,
  punchLogs,
  timetable,
  insights,
  session,
  holidays,
  onPunchIn,
  onPunchOut,
  onMarkDailyStatus,
  setActiveTab,
  onOpenCalendarModal,
  onUpdateTarget,
  onMarkSubjectAttendance,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<DailyPunchLog['location']>('Campus');
  const [punchNote, setPunchNote] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('Friday');
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [manualStatus, setManualStatus] = useState<DailyPunchLog['status']>('present');
  const [manualNote, setManualNote] = useState<string>('');

  // Quick Add Subject Attendance state
  const [showQuickAddModal, setShowQuickAddModal] = useState<boolean>(false);
  const [quickAddSubjectId, setQuickAddSubjectId] = useState<string>('');
  const [quickAddStatus, setQuickAddStatus] = useState<AttendanceRecord['status']>('present');
  const [quickAddDate, setQuickAddDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [quickAddToast, setQuickAddToast] = useState<string | null>(null);

  useEffect(() => {
    if (subjects.length > 0 && !quickAddSubjectId) {
      setQuickAddSubjectId(subjects[0].id);
    }
  }, [subjects, quickAddSubjectId]);

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddSubjectId) return;

    if (onMarkSubjectAttendance) {
      onMarkSubjectAttendance(quickAddSubjectId, quickAddStatus, quickAddDate);
      const sub = subjects.find((s) => s.id === quickAddSubjectId);
      const subName = sub ? sub.name : 'Subject';
      setQuickAddToast(`Logged ${quickAddStatus.toUpperCase()} for ${subName} on ${quickAddDate}! (+10 XP)`);
      setTimeout(() => {
        setQuickAddToast(null);
        setShowQuickAddModal(false);
      }, 1100);
    }
  };

  // Update live clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = punchLogs.find((p) => p.date === todayStr);

  const stats = calculateDailyPunchStats(punchLogs, profile.targetPercentage);
  const sessionStats = calculateAcademicSessionStats(session, holidays);
  const todayHolidayStatus = getHolidayStatusForDate(todayStr, session, holidays);
  const todaySlots = timetable.filter((t) => t.day === selectedDay);

  // Filtered punch logs history
  const filteredLogs = punchLogs.filter((log) => {
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesSearch =
      log.date.includes(searchTerm) ||
      (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.location && log.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMarkDailyStatus(manualDate, manualStatus, manualNote);
    setShowManualModal(false);
    setManualNote('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Prominent High-Priority Attendance Shortage Alert Notification */}
      <AttendanceAlertNotification
        profile={profile}
        subjects={subjects}
        punchLogs={punchLogs}
        setActiveTab={setActiveTab}
        onUpdateTarget={onUpdateTarget}
        onMarkSubjectAttendance={onMarkSubjectAttendance}
      />

      {/* Academic Year 2026-2027 Fresh Start Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 border border-emerald-500/30 text-emerald-950 dark:text-emerald-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-600 dark:text-emerald-300 text-lg shrink-0">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200">
                Academic Session 2026–2027 Active
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white tracking-wide uppercase">
                August 1 Start
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
              Fresh academic month started on <strong>August 1, 2026</strong>. All attendance records prior to August 1 have been cleared. Mark your attendance for today!
            </p>
          </div>
        </div>
      </div>

      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-600/10 dark:from-orange-950/40 dark:via-pink-950/40 dark:to-purple-950/40 border border-orange-200/60 dark:border-slate-800 backdrop-blur-xl shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-sm">
                {profile.degree || profile.classGrade || 'Student Profile'}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {profile.institutionName}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back, <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">{profile.name}</span>!
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Overall Punch Attendance: <strong className="text-slate-900 dark:text-white font-bold text-base">{stats.overallPercentage}%</strong> • Target Goal: {profile.targetPercentage}%
            </p>

            {/* Smooth Framer Motion Progress Bar */}
            <div className="space-y-1 pt-1 max-w-md">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                <span>Progress to Goal</span>
                <span>{stats.overallPercentage}% / {profile.targetPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-slate-200/80 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-300/50 dark:border-slate-700/50 relative">
                <motion.div
                  className={`h-full rounded-full shadow-sm ${
                    stats.overallPercentage >= profile.targetPercentage
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400'
                      : 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(stats.overallPercentage, 100)}%` }}
                  transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
                />
                {/* Target percentage marker indicator */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white z-10 opacity-70"
                  style={{ left: `${Math.min(profile.targetPercentage, 100)}%` }}
                  title={`Target Goal: ${profile.targetPercentage}%`}
                />
              </div>
            </div>

            {/* Attendance Status Pill */}
            <div className="pt-1">
              {stats.overallPercentage >= profile.targetPercentage ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Safe Zone! You can safely skip up to <strong>{stats.safeDaysToSkip} full days</strong>.</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300/60 text-amber-900 dark:text-amber-200 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce" />
                  <span>Low Attendance Warning! Must punch in for <strong>{stats.requiredDaysToTarget} consecutive days</strong>.</span>
                </div>
              )}
            </div>
          </div>

          {/* Metric Gauge Card */}
          <div className="flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm w-full lg:w-auto">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-800" fill="transparent" />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={201}
                  initial={{ strokeDashoffset: 201 }}
                  animate={{ strokeDashoffset: 201 - (201 * Math.min(stats.overallPercentage, 100)) / 100 }}
                  transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
                  strokeLinecap="round"
                  className={stats.overallPercentage >= profile.targetPercentage ? "text-emerald-500" : "text-amber-500"}
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-sm font-extrabold text-slate-900 dark:text-white">
                {stats.overallPercentage}%
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-orange-500">
                <Flame className="w-4 h-4 fill-orange-500" />
                <span>{profile.streak} Days Streak</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                {stats.presentDaysCount} Present / {stats.totalWorkingDays} Days
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={() => setActiveTab('calculator')}
                  className="font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 text-[11px]"
                >
                  Predictor <ChevronRight className="w-3 h-3" />
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  onClick={() => {
                    if (subjects.length > 0 && !quickAddSubjectId) {
                      setQuickAddSubjectId(subjects[0].id);
                    }
                    setShowQuickAddModal(true);
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 text-[11px]"
                >
                  <Plus className="w-3 h-3" /> Quick Add
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Primary Daily Attendance Punch Station */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Punch In / Out Control Station */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Daily Punch Attendance Station
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mark your daily check-in with live timestamping
              </p>
            </div>

            {/* Digital Clock Badge */}
            <div className="px-4 py-2 rounded-2xl bg-slate-900 text-orange-400 font-mono font-bold text-sm tracking-wider shadow-inner flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500 animate-spin" />
              <span>{currentTime || '09:15:00 AM'}</span>
            </div>
          </div>

          {/* Active Punch Banner or Holiday Banner */}
          {todayHolidayStatus.isHoliday && !todayHolidayStatus.isOverride ? (
            <div className="p-4 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                  🎉
                </div>
                <div>
                  <p className="font-extrabold text-sm text-white">
                    Today is a Non-Working Holiday: {todayHolidayStatus.title}
                  </p>
                  <p className="text-xs text-purple-300 mt-0.5">
                    {todayHolidayStatus.reason || 'Automatically locked non-working holiday.'}
                  </p>
                </div>
              </div>

              {onOpenCalendarModal && (
                <button
                  onClick={onOpenCalendarModal}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-bold text-xs border border-purple-500/40 transition-all shrink-0"
                >
                  View Calendar Rules
                </button>
              )}
            </div>
          ) : (
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              todayLog?.isPunchedIn
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                : todayLog?.punchOutTime
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-950 dark:text-purple-200'
                : 'bg-orange-500/10 border-orange-500/30 text-orange-950 dark:text-orange-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
                  todayLog?.isPunchedIn ? 'bg-emerald-500' : todayLog?.punchOutTime ? 'bg-purple-600' : 'bg-orange-500'
                }`}>
                  {todayLog?.isPunchedIn ? <LogIn className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-sm">
                    {todayLog?.isPunchedIn
                      ? `Punched In at ${todayLog.punchInTime}`
                      : todayLog?.punchOutTime
                      ? `Punched Out at ${todayLog.punchOutTime} (${todayLog.totalHours || 7.5} hrs logged)`
                      : 'Not Punched In Yet Today'}
                  </p>
                  <p className="text-xs opacity-80 mt-0.5">
                    Date: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800">
                  {todayLog ? todayLog.status.replace('_', ' ') : 'Pending'}
                </span>
              </div>
            </div>
          )}

          {/* Prominent Single-Tap Punch In / Out Button Hero Section */}
          <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-800/80 dark:to-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-md">
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                Single-Tap Daily Punch Station
              </div>
            </div>

            {/* Giant Single-Tap Punch Button */}
            <button
              disabled={todayHolidayStatus.isHoliday && !todayHolidayStatus.isOverride}
              onClick={() => {
                if (todayLog?.isPunchedIn) {
                  onPunchOut();
                } else {
                  onPunchIn(selectedLocation, punchNote);
                }
              }}
              className={`group relative w-full max-w-md py-6 px-8 rounded-3xl font-extrabold text-lg sm:text-xl shadow-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 ${
                todayHolidayStatus.isHoliday && !todayHolidayStatus.isOverride
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none'
                  : todayLog?.isPunchedIn
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02]'
                  : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02]'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
                {todayHolidayStatus.isHoliday && !todayHolidayStatus.isOverride ? (
                  <Calendar className="w-7 h-7 text-purple-300" />
                ) : todayLog?.isPunchedIn ? (
                  <LogOut className="w-7 h-7" />
                ) : (
                  <LogIn className="w-7 h-7" />
                )}
              </div>

              <div className="text-left">
                <span className="block tracking-wide font-black">
                  {todayHolidayStatus.isHoliday && !todayHolidayStatus.isOverride
                    ? 'HOLIDAY - NON-WORKING DAY'
                    : todayLog?.isPunchedIn
                    ? 'TAP TO PUNCH OUT'
                    : 'TAP TO PUNCH IN'}
                </span>
                <span className="text-xs font-medium opacity-90 block">
                  {todayHolidayStatus.isHoliday && !todayHolidayStatus.isOverride
                    ? 'Attendance marking locked for today'
                    : todayLog?.isPunchedIn
                    ? `Punched in at ${todayLog.punchInTime || '09:00 AM'} • Click to finish day`
                    : `Check in for ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </span>
              </div>
            </button>

            {/* Status Subtitle */}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">
              {todayLog?.punchOutTime
                ? `Completed today: Punched Out at ${todayLog.punchOutTime} (${todayLog.totalHours || 7.5} hrs total)`
                : todayLog?.isPunchedIn
                ? 'Your daily timer is currently active. Tap above when your classes/work finish.'
                : 'Single tap records your check-in time with location tracking.'}
            </p>
          </div>

          {/* Location & Quick Status Options */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500" /> Location / Mode:
              </span>
              <div className="flex gap-1.5">
                {(['Campus', 'Online', 'Library', 'Lab'] as const).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocation(loc)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                      selectedLocation === loc
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Optional daily punch note (e.g. Attended physics lab & morning lecture)..."
                value={punchNote}
                onChange={(e) => setPunchNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* One-Click Quick Daily Status Override */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Quick Mark Status For Today:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onMarkDailyStatus(todayStr, 'present', 'Full day present')}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 font-bold text-xs hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Present
              </button>

              <button
                onClick={() => onMarkDailyStatus(todayStr, 'late', 'Arrived late')}
                className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 font-bold text-xs hover:bg-amber-500 hover:text-white transition-all flex items-center gap-1"
              >
                <Clock className="w-3.5 h-3.5" /> Late Check-in
              </button>

              <button
                onClick={() => onMarkDailyStatus(todayStr, 'half_day', 'Half day logged')}
                className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 font-bold text-xs hover:bg-purple-500 hover:text-white transition-all flex items-center gap-1"
              >
                Half Day
              </button>

              <button
                onClick={() => onMarkDailyStatus(todayStr, 'absent', 'Absent today')}
                className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200/60 font-bold text-xs hover:bg-red-500 hover:text-white transition-all flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" /> Absent
              </button>

              <button
                onClick={() => onMarkDailyStatus(todayStr, 'leave', 'Approved leave')}
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 font-bold text-xs hover:bg-blue-500 hover:text-white transition-all flex items-center gap-1"
              >
                Leave
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Daily Schedule Reference & AI Guidance */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI Attendance Assistant Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-600/10 to-indigo-600/10 border border-purple-200/60 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  AI Attendance Predictor
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('ai-assistant')}
                className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                Ask AI →
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-xs space-y-2">
              <p className="font-bold text-slate-900 dark:text-white">
                💡 Smart Daily Strategy:
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                You have an overall daily punch attendance of <strong>{stats.overallPercentage}%</strong>.
                {stats.overallPercentage >= profile.targetPercentage
                  ? ` Excellent job! You are safe to miss up to ${stats.safeDaysToSkip} working days without dropping below ${profile.targetPercentage}%.`
                  : ` Punch in for the next ${stats.requiredDaysToTarget} days to bring your attendance back to your ${profile.targetPercentage}% goal.`}
              </p>
            </div>
          </div>

          {/* Smart Academic Session & Holiday Tracker Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-purple-950/60 border border-purple-500/30 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Academic Session 2026–2027
                </span>
                <h3 className="font-extrabold text-sm text-white mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" /> Academic Calendar & Holidays
                </h3>
              </div>

              {onOpenCalendarModal && (
                <button
                  onClick={onOpenCalendarModal}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md transition-all shrink-0"
                >
                  Manage
                </button>
              )}
            </div>

            {/* Quick Session Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-purple-950/80 border border-purple-500/20">
                <p className="text-[10px] text-purple-300 font-bold uppercase">Teaching Days</p>
                <p className="text-base font-black text-white mt-0.5">{sessionStats.totalWorkingTeachingDays} Days</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-purple-950/80 border border-purple-500/20">
                <p className="text-[10px] text-purple-300 font-bold uppercase">Remaining Days</p>
                <p className="text-base font-black text-emerald-400 mt-0.5">{sessionStats.remainingWorkingDays} Days</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-purple-950/80 border border-purple-500/20">
                <p className="text-[10px] text-purple-300 font-bold uppercase">Sundays & 2nd Sat</p>
                <p className="text-base font-black text-indigo-300 mt-0.5">
                  {sessionStats.totalSundays + sessionStats.totalSecondSaturdays} Off Days
                </p>
              </div>
              <div className="p-2.5 rounded-2xl bg-purple-950/80 border border-purple-500/20">
                <p className="text-[10px] text-purple-300 font-bold uppercase">Public Holidays</p>
                <p className="text-base font-black text-pink-300 mt-0.5">{sessionStats.totalPublicHolidays} Days</p>
              </div>
            </div>

            {/* Upcoming Holidays Widget */}
            <div className="space-y-2 pt-1 border-t border-purple-500/20">
              <p className="text-[11px] font-extrabold text-purple-300 uppercase tracking-wider">
                Upcoming Public & Festival Holidays
              </p>
              <div className="space-y-1.5">
                {sessionStats.upcomingHolidays.slice(0, 3).map((hol) => {
                  const catMeta = HOLIDAY_CATEGORY_META[hol.category] || HOLIDAY_CATEGORY_META.custom;
                  return (
                    <div
                      key={`${hol.title}-${hol.date}`}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white text-xs">{hol.title}</p>
                        <p className="text-[10px] text-purple-300">
                          📅 {hol.date} {hol.daysLeft === 0 ? '(Today)' : `(In ${hol.daysLeft} days)`}
                        </p>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${catMeta.badgeBg} ${catMeta.textCol}`}
                      >
                        {catMeta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Today's Timetable Reference */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" /> Today's Schedule Guide
                </h3>
                <p className="text-[11px] text-slate-500">Classes scheduled for {selectedDay}</p>
              </div>

              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-semibold">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-2 py-0.5 rounded-lg transition-colors ${
                      selectedDay === d
                        ? 'bg-orange-500 text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {todaySlots.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">No classes scheduled for {selectedDay}.</p>
            ) : (
              <div className="space-y-2.5">
                {todaySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{slot.subjectName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {slot.time} • Room {slot.room || 'TBA'} • {slot.teacher}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-semibold text-[10px]">
                      {slot.type || 'Lecture'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Daily Punch Logs History Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" /> Daily Punch Attendance Log
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              View, filter, and modify past daily punch records
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search date, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="half_day">Half Day</option>
              <option value="absent">Absent</option>
              <option value="leave">Leave</option>
              <option value="holiday">Holiday</option>
            </select>

            <button
              onClick={() => setShowManualModal(true)}
              className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Log Past Date
            </button>
          </div>
        </div>

        {/* Punch Log List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 font-bold">Date</th>
                <th className="py-3 px-3 font-bold">Status</th>
                <th className="py-3 px-3 font-bold">Punch In</th>
                <th className="py-3 px-3 font-bold">Punch Out</th>
                <th className="py-3 px-3 font-bold">Total Hours</th>
                <th className="py-3 px-3 font-bold">Location</th>
                <th className="py-3 px-3 font-bold">Notes</th>
                <th className="py-3 px-3 font-bold text-right">Quick Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 px-2">
                    <EmptyState
                      type="logs"
                      title="No Punch Logs Recorded Yet"
                      description="Your daily punch log history is currently empty. Mark today's campus check-in or log a past date to start tracking your streak."
                      primaryAction={{
                        label: 'Mark Today Present',
                        onClick: () => onMarkDailyStatus(todayStr, 'present', 'Full day present'),
                        icon: CheckCircle2,
                      }}
                      secondaryAction={{
                        label: 'Log Past Date',
                        onClick: () => setShowManualModal(true),
                        icon: Plus,
                      }}
                    />
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, 15).map((log) => {
                const isToday = log.date === todayStr;
                return (
                  <tr
                    key={log.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      isToday ? 'bg-orange-50/50 dark:bg-orange-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {log.date} {isToday && <span className="ml-1 px-1.5 py-0.2 text-[9px] bg-orange-500 text-white rounded-full">TODAY</span>}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                          log.status === 'present'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                            : log.status === 'late'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                            : log.status === 'absent'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                            : log.status === 'half_day'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {log.status === 'present' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        {log.status === 'absent' && <XCircle className="w-3 h-3 text-red-500" />}
                        {log.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {log.punchInTime || '--:--'}
                    </td>

                    <td className="py-3 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {log.punchOutTime || '--:--'}
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {log.totalHours ? `${log.totalHours} hrs` : '--'}
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {log.location || 'Campus'}
                    </td>

                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {log.notes || 'No notes'}
                    </td>

                    <td className="py-3 px-3 text-right space-x-1">
                      <button
                        onClick={() => onMarkDailyStatus(log.date, 'present', log.notes)}
                        className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold hover:bg-emerald-500 hover:text-white"
                      >
                        P
                      </button>
                      <button
                        onClick={() => onMarkDailyStatus(log.date, 'absent', log.notes)}
                        className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[10px] font-bold hover:bg-red-500 hover:text-white"
                      >
                        A
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Date Punch Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" /> Log / Edit Daily Punch Record
            </h3>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Date</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as DailyPunchLog['status'])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="present">Present (Full Day)</option>
                  <option value="late">Late Check-in</option>
                  <option value="half_day">Half Day</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Approved Leave</option>
                  <option value="holiday">Holiday / Weekend</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Note / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Attended morning classes"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 shadow-md"
                >
                  Save Punch Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            if (subjects.length > 0 && !quickAddSubjectId) {
              setQuickAddSubjectId(subjects[0].id);
            }
            setShowQuickAddModal(true);
          }}
          className="group relative flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-[0_10px_35px_rgba(124,58,237,0.5)] hover:shadow-[0_15px_45px_rgba(124,58,237,0.7)] border border-purple-400/40 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          title="Quick Add Subject Attendance Record"
        >
          <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300 shadow-inner">
            <Plus className="w-4 h-4 text-white stroke-[3]" />
          </div>
          <span className="tracking-wide hidden sm:inline">Quick Add Attendance</span>
          <span className="tracking-wide sm:hidden">Quick Add</span>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
          </span>
        </button>
      </div>

      {/* Quick Add Attendance Modal */}
      {showQuickAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 dark:bg-slate-950 p-6 sm:p-7 rounded-3xl max-w-lg w-full shadow-2xl border border-purple-500/30 text-white space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            {/* Top ambient glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 border border-purple-400/30">
                  <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    Quick Add Attendance
                  </h3>
                  <p className="text-xs text-slate-400">Log class attendance instantly for any subject</p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickAddModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Toast Success Alert */}
            {quickAddToast && (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 shadow-lg animate-in slide-in-from-top duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{quickAddToast}</span>
              </div>
            )}

            {subjects.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-300 font-semibold">No subjects available yet!</p>
                <button
                  onClick={() => {
                    setShowQuickAddModal(false);
                    setActiveTab('subjects');
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500"
                >
                  Go to Subject Manager
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuickAddSubmit} className="space-y-4 text-xs">
                {/* Subject Selection Grid */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Select Subject <span className="text-purple-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 pr-1 custom-scrollbar">
                    {subjects.map((sub) => {
                      const pct = sub.totalClasses > 0 ? Math.round((sub.attendedClasses / sub.totalClasses) * 100) : 100;
                      const isSelected = quickAddSubjectId === sub.id;
                      return (
                        <div
                          key={sub.id}
                          onClick={() => setQuickAddSubjectId(sub.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-purple-600/30 border-purple-400 text-white ring-2 ring-purple-500/40 shadow-lg'
                              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white/10 text-purple-300">
                              {sub.code}
                            </span>
                            <span className={`text-[10px] font-bold ${pct >= profile.targetPercentage ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {pct}%
                            </span>
                          </div>
                          <p className="font-bold text-xs mt-1 truncate">{sub.name}</p>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {sub.attendedClasses} / {sub.totalClasses} attended
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Attendance Status Selection */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Attendance Status</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'present', label: 'Present', icon: CheckCircle2, color: 'emerald' },
                      { id: 'absent', label: 'Absent', icon: XCircle, color: 'red' },
                      { id: 'late', label: 'Late', icon: Clock, color: 'amber' },
                      { id: 'cancelled', label: 'Cancelled', icon: Slash, color: 'slate' },
                    ].map((st) => {
                      const Icon = st.icon;
                      const isSelected = quickAddStatus === st.id;
                      return (
                        <button
                          type="button"
                          key={st.id}
                          onClick={() => setQuickAddStatus(st.id as AttendanceRecord['status'])}
                          className={`p-2.5 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            isSelected
                              ? st.id === 'present'
                                ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/40 shadow-md'
                                : st.id === 'absent'
                                ? 'bg-red-600/30 border-red-400 text-red-300 ring-2 ring-red-500/40 shadow-md'
                                : st.id === 'late'
                                ? 'bg-amber-600/30 border-amber-400 text-amber-300 ring-2 ring-amber-500/40 shadow-md'
                                : 'bg-slate-700 border-slate-400 text-white'
                              : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-300">Date</label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setQuickAddDate(new Date().toISOString().split('T')[0])}
                        className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-[10px] font-bold"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const yest = new Date();
                          yest.setDate(yest.getDate() - 1);
                          setQuickAddDate(yest.toISOString().split('T')[0]);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-[10px] font-bold"
                      >
                        Yesterday
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    value={quickAddDate}
                    onChange={(e) => setQuickAddDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white font-bold"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!quickAddSubjectId}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Record</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
