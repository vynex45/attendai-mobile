import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Settings2,
  Lock,
  Unlock,
  Flag,
  School,
  GraduationCap,
  Building2,
  Award,
  AlertTriangle,
  Sun,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { AttendanceRecord, Subject, AcademicSession, AcademicHoliday } from '../types';
import {
  getHolidayStatusForDate,
  calculateAcademicSessionStats,
  HOLIDAY_CATEGORY_META,
} from '../services/academicCalendar';
import { EmptyState } from './EmptyState';

interface CalendarViewProps {
  records: AttendanceRecord[];
  subjects: Subject[];
  session: AcademicSession;
  holidays: AcademicHoliday[];
  onOpenCalendarModal?: () => void;
  onSaveHolidays?: (holidays: AcademicHoliday[]) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  records,
  subjects,
  session,
  holidays,
  onOpenCalendarModal,
  onSaveHolidays,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 1)); // Default August 2026 inside session
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const stats = calculateAcademicSessionStats(session, holidays);

  // Get record status for a specific date
  const getDateRecordStatus = (dayNum: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayRecords = records.filter((r) => r.date === formattedDate);

    if (dayRecords.length === 0) return null;

    const presentCount = dayRecords.filter((r) => r.status === 'present').length;
    const absentCount = dayRecords.filter((r) => r.status === 'absent').length;

    if (presentCount > 0 && absentCount === 0) return 'present';
    if (absentCount > 0 && presentCount === 0) return 'absent';
    if (presentCount > 0 && absentCount > 0) return 'partial';
    return 'leave';
  };

  // Generate 120-day heatmap
  const generateHeatmapDays = () => {
    const days = [];
    const baseDate = new Date('2026-11-15'); // Anchor date inside session
    for (let i = 119; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const holStatus = getHolidayStatusForDate(dateStr, session, holidays);
      const dayRecs = records.filter((r) => r.date === dateStr);
      const present = dayRecs.filter((r) => r.status === 'present').length;

      let level = 0;
      if (holStatus.isHoliday) {
        level = -1; // Holiday
      } else if (dayRecs.length > 0) {
        const ratio = present / dayRecs.length;
        if (ratio === 1) level = 4;
        else if (ratio >= 0.75) level = 3;
        else if (ratio >= 0.5) level = 2;
        else level = 1;
      }

      days.push({ dateStr, level, count: present, holTitle: holStatus.title });
    }
    return days;
  };

  const heatmapDays = generateHeatmapDays();

  // Selected date status & records
  const selectedHolidayStatus = selectedDateStr
    ? getHolidayStatusForDate(selectedDateStr, session, holidays)
    : null;

  const selectedRecords = selectedDateStr ? records.filter((r) => r.date === selectedDateStr) : [];

  // Toggle Working Override from Calendar drawer
  const handleToggleOverride = (dateStr: string) => {
    if (!onSaveHolidays) return;
    const existingIndex = holidays.findIndex((h) => h.date === dateStr);
    let updated: AcademicHoliday[] = [];

    if (existingIndex >= 0) {
      updated = holidays.map((h, idx) => {
        if (idx === existingIndex) return { ...h, isWorkingOverride: !h.isWorkingOverride };
        return h;
      });
    } else {
      // Add custom holiday entry marked with override
      updated = [
        ...holidays,
        {
          id: `hol-override-${Date.now()}`,
          title: 'Class Conducted Override',
          date: dateStr,
          type: 'custom',
          isWorkingOverride: true,
          description: 'Class conducted on non-working day by institution',
        },
      ];
    }
    onSaveHolidays(updated);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* HEADER WITH SESSION BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-purple-500" /> Academic Calendar & Heatmap
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official Session: <span className="font-extrabold text-purple-400">{session.startDate}</span> to{' '}
            <span className="font-extrabold text-purple-400">{session.endDate}</span> • Automatic Non-Working Holidays Enabled
          </p>
        </div>

        {onOpenCalendarModal && (
          <button
            onClick={onOpenCalendarModal}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-105 transition-all self-start md:self-auto border border-purple-400/30"
          >
            <Settings2 className="w-4 h-4" /> Manage Academic Calendar
          </button>
        )}
      </div>

      {/* SESSION METRICS SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-slate-900 dark:text-white">
          <p className="text-[10px] uppercase font-black text-purple-400">Teaching Days</p>
          <p className="text-2xl font-black mt-1">{stats.totalWorkingTeachingDays}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Excludes all holidays</p>
        </div>

        <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-slate-900 dark:text-white">
          <p className="text-[10px] uppercase font-black text-indigo-400">Sundays Off</p>
          <p className="text-2xl font-black mt-1">{stats.totalSundays}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Auto locked</p>
        </div>

        <div className="p-4 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 text-slate-900 dark:text-white">
          <p className="text-[10px] uppercase font-black text-cyan-400">2nd Saturdays</p>
          <p className="text-2xl font-black mt-1">{stats.totalSecondSaturdays}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Monthly non-working</p>
        </div>

        <div className="p-4 rounded-3xl bg-pink-500/10 border border-pink-500/20 text-slate-900 dark:text-white">
          <p className="text-[10px] uppercase font-black text-pink-400">Public Holidays</p>
          <p className="text-2xl font-black mt-1">{stats.totalPublicHolidays}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Gazetted & festivals</p>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-slate-900 dark:text-white col-span-2 sm:col-span-1">
          <p className="text-[10px] uppercase font-black text-emerald-400">Remaining Days</p>
          <p className="text-2xl font-black mt-1">{stats.remainingWorkingDays}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Teaching days left</p>
        </div>
      </div>

      {/* HEATMAP CARD */}
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-purple-500 fill-purple-500" /> 120-Day Session Consistency Heatmap
          </h3>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span>Holiday</span>
            <div className="w-3 h-3 rounded-sm bg-purple-500/30 border border-purple-500/50" />
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
              <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-950" />
              <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-500" />
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-2">
          {heatmapDays.map((hd, idx) => (
            <div
              key={idx}
              title={
                hd.level === -1
                  ? `${hd.dateStr}: Non-working Holiday (${hd.holTitle})`
                  : `${hd.dateStr}: ${hd.count} classes attended`
              }
              onClick={() => setSelectedDateStr(hd.dateStr)}
              className={`w-4 h-4 rounded-md cursor-pointer transition-transform hover:scale-125 ${
                hd.level === -1
                  ? 'bg-purple-950 border border-purple-500/40'
                  : hd.level === 4
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30'
                  : hd.level === 3
                  ? 'bg-emerald-400 dark:bg-emerald-600'
                  : hd.level === 2
                  ? 'bg-amber-400 dark:bg-amber-600'
                  : hd.level === 1
                  ? 'bg-red-400 dark:bg-red-700'
                  : 'bg-slate-100 dark:bg-slate-800/80'
              }`}
            />
          ))}
        </div>
      </div>

      {/* MONTHLY CALENDAR GRID */}
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        
        {/* Month Header controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
              {monthNames[month]} {year}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Color legend */}
          <div className="hidden sm:flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Absent</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Holiday</span>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500">
          <span className="text-indigo-400">Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 sm:h-24 rounded-2xl bg-slate-50/30 dark:bg-slate-950/20" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const recStatus = getDateRecordStatus(dayNum);
            const holStatus = getHolidayStatusForDate(dateStr, session, holidays);
            const isSelected = selectedDateStr === dateStr;

            const catMeta = holStatus.category ? HOLIDAY_CATEGORY_META[holStatus.category] : null;

            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`h-20 sm:h-24 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden relative ${
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-500/30 bg-purple-50/50 dark:bg-purple-950/40'
                    : holStatus.isHoliday
                    ? 'border-purple-500/30 bg-purple-500/10 dark:bg-purple-950/20'
                    : 'border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-xs ${holStatus.isHoliday ? 'text-purple-300 font-black' : 'text-slate-900 dark:text-white'}`}>
                    {dayNum}
                  </span>

                  {holStatus.isHoliday && (
                    <span className="p-0.5 rounded bg-purple-500/20 text-purple-300" title={holStatus.title}>
                      <Lock className="w-3 h-3 text-purple-400" />
                    </span>
                  )}
                </div>

                {/* Holiday Badge or Attendance Dot */}
                {holStatus.isHoliday ? (
                  <div className="mt-1">
                    <span
                      className={`text-[9px] font-black leading-tight block truncate px-1.5 py-0.5 rounded-md ${
                        catMeta?.badgeBg || 'bg-purple-500/20'
                      } ${catMeta?.textCol || 'text-purple-300'}`}
                      title={holStatus.title}
                    >
                      🎉 {holStatus.title}
                    </span>
                  </div>
                ) : recStatus ? (
                  <div className="flex items-center justify-end">
                    {recStatus === 'present' && <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />}
                    {recStatus === 'absent' && <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />}
                    {recStatus === 'partial' && <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />}
                    {recStatus === 'leave' && <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm" />}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

      </div>

      {/* SELECTED DATE DETAILS DRAWER */}
      {selectedDateStr && (
        <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-2xl space-y-4 animate-in slide-in-from-bottom border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-base flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-purple-400" /> Date Details: {selectedDateStr}
            </h4>
            <button onClick={() => setSelectedDateStr(null)} className="text-xs text-slate-400 hover:text-white">
              Close
            </button>
          </div>

          {selectedHolidayStatus?.isHoliday && (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Non-Working Holiday
                </span>
                <button
                  onClick={() => handleToggleOverride(selectedDateStr)}
                  className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-sm transition-all"
                >
                  <Unlock className="w-3 h-3" /> Toggle Class Conducted Override
                </button>
              </div>
              <h5 className="font-extrabold text-sm text-white">{selectedHolidayStatus.title}</h5>
              <p className="text-xs text-slate-300">{selectedHolidayStatus.reason}</p>
              <p className="text-[11px] text-purple-300 italic">
                * Holidays are automatically excluded from attendance percentage calculations.
              </p>
            </div>
          )}

          {selectedRecords.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center space-y-1">
              <p className="font-bold text-xs text-slate-200">
                {selectedHolidayStatus?.isHoliday ? 'Holiday / Non-Working Day' : `No Classes Logged On ${selectedDateStr}`}
              </p>
              <p className="text-[11px] text-slate-400">
                {selectedHolidayStatus?.isHoliday
                  ? 'Attendance marking is locked for holidays unless overridden.'
                  : 'You haven’t recorded individual subject attendance for this day.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {selectedRecords.map((r) => {
                const sub = subjects.find((s) => s.id === r.subjectId);
                return (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="font-bold">{sub?.name || 'Subject'}</p>
                      <p className="text-[10px] text-slate-400">{r.mode || 'offline'} class</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                      r.status === 'present' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
