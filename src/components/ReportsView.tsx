import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet, Filter, Database, Printer, CheckCircle2, ShieldCheck, AlertTriangle, Layers } from 'lucide-react';
import { Subject, AttendanceRecord, DailyPunchLog, StudentProfile } from '../types';
import { EmptyState } from './EmptyState';
import {
  exportCompleteHistoryCSV,
  exportSubjectSummaryCSV,
  exportSubjectRecordsCSV,
  exportDailyPunchLogsCSV
} from '../services/exportUtils';

interface ReportsViewProps {
  profile: StudentProfile;
  subjects: Subject[];
  records: AttendanceRecord[];
  punchLogs: DailyPunchLog[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  profile,
  subjects,
  records,
  punchLogs,
}) => {
  const [reportType, setReportType] = useState<'summary' | 'daily' | 'subject'>('summary');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Overall attendance calculation across subjects
  const totalClassesCount = subjects.reduce((acc, sub) => acc + (sub.totalClasses || 0), 0);
  const totalAttendedCount = subjects.reduce((acc, sub) => acc + (sub.attendedClasses || 0), 0);
  const overallPercentage = totalClassesCount > 0
    ? Number(((totalAttendedCount / totalClassesCount) * 100).toFixed(1))
    : 100;
  const isOverallSafe = overallPercentage >= profile.targetPercentage;

  // Filter records
  const filteredPunchLogs = punchLogs.filter((log) => {
    if (startDate && log.date < startDate) return false;
    if (endDate && log.date > endDate) return false;
    return true;
  });

  const filteredSubjectRecords = records.filter((rec) => {
    if (selectedSubjectId !== 'all' && rec.subjectId !== selectedSubjectId) return false;
    if (startDate && rec.date < startDate) return false;
    if (endDate && rec.date > endDate) return false;
    return true;
  });

  // Export handlers
  const handleExportFilteredCSV = () => {
    if (reportType === 'summary') {
      exportSubjectSummaryCSV(profile, subjects);
    } else if (reportType === 'daily') {
      if (filteredPunchLogs.length === 0) {
        alert('No daily punch logs available for selected date range.');
        return;
      }
      exportDailyPunchLogsCSV(profile, filteredPunchLogs);
    } else {
      if (filteredSubjectRecords.length === 0) {
        alert('No subject class records available for selected criteria.');
        return;
      }
      exportSubjectRecordsCSV(profile, subjects, filteredSubjectRecords);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header & Quick Export Action Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-500" /> Attendance Reports & Statement Generator
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Export official attendance statements for college submission, medical leave approvals, or personal record-keeping as PDF or CSV files.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            onClick={() => exportCompleteHistoryCSV(profile, subjects, records, punchLogs)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-xs transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            title="Export complete combined attendance history & punch logs to CSV"
          >
            <Database className="w-3.5 h-3.5" /> Full History (CSV)
          </button>

          <button
            onClick={() => exportSubjectSummaryCSV(profile, subjects)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
            title="Export subject percentage breakdown summary to CSV/Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Subject Summary (CSV)
          </button>

          <button
            onClick={handleExportFilteredCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
            title="Export current filtered view to CSV"
          >
            <Download className="w-3.5 h-3.5" /> Export Filtered CSV
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-black text-xs transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            title="Download or Print official PDF statement"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Filter & Format Controls Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 print:hidden">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-500" /> Report Configuration & Date Filters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Report Format</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'summary' | 'daily' | 'subject')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="summary">Subject Summary & Percentage Breakdown</option>
              <option value="daily">Daily Punch Check-In Statement</option>
              <option value="subject">Subject-wise Class Log Statement</option>
            </select>
          </div>

          {reportType === 'subject' && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Filter Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code || 'Sub'})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {(startDate || endDate || (reportType === 'subject' && selectedSubjectId !== 'all')) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <span className="text-slate-500">
              Active Filters: {startDate ? `From ${startDate}` : ''} {endDate ? `To ${endDate}` : ''} {selectedSubjectId !== 'all' ? `Subject ID: ${selectedSubjectId}` : ''}
            </span>
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setSelectedSubjectId('all');
              }}
              className="text-purple-500 font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Official Printable / PDF Document Container */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Printable Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-900 dark:border-slate-700 pb-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-md shrink-0">
              A
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white font-serif tracking-tight">
                AttendAI Official Attendance Statement
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Verified Academic Performance & Attendance Report
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 dark:text-slate-400 font-mono">
            <p className="font-bold text-slate-900 dark:text-white">Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-[11px] text-slate-500">Report Ref: ATD-{Math.floor(100000 + Math.random() * 900000)}</p>
          </div>
        </div>

        {/* Student Profile Info Summary Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Name</p>
            <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{profile.name || 'Student'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Roll / PRN No.</p>
            <p className="font-bold text-slate-900 dark:text-white">{profile.rollNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Institution / College</p>
            <p className="font-bold text-slate-900 dark:text-white truncate">{profile.institutionName || 'College'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Status</p>
            <span className={`inline-flex items-center gap-1 font-extrabold text-xs px-2 py-0.5 rounded-md mt-0.5 ${
              isOverallSafe
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
            }`}>
              {isOverallSafe ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {overallPercentage}% ({isOverallSafe ? 'On Track' : 'Below Target'})
            </span>
          </div>
        </div>

        {/* REPORT CONTENT TYPE 1: SUBJECT SUMMARY & PERCENTAGE BREAKDOWN */}
        {reportType === 'summary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" /> Subject-by-Subject Attendance Summary
              </h3>
              <span className="text-xs text-slate-500 font-bold">Target Threshold: {profile.targetPercentage}%</span>
            </div>

            {subjects.length === 0 ? (
              <EmptyState
                type="reports"
                title="No Subjects Added Yet"
                description="Add your course subjects in the Subject Manager tab to view and export summary attendance statements."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-3">Code</th>
                      <th className="py-3 px-3">Subject Name</th>
                      <th className="py-3 px-3 text-center">Attended</th>
                      <th className="py-3 px-3 text-center">Total</th>
                      <th className="py-3 px-3 text-right">Attendance %</th>
                      <th className="py-3 px-3 text-center">Goal %</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {subjects.map((sub) => {
                      const pct = sub.totalClasses > 0 ? Number(((sub.attendedClasses / sub.totalClasses) * 100).toFixed(1)) : 100;
                      const goal = sub.minAttendance || profile.targetPercentage;
                      const isSafe = pct >= goal;

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-3 font-mono font-bold text-purple-600 dark:text-purple-400">{sub.code || '--'}</td>
                          <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-white">{sub.name}</td>
                          <td className="py-3 px-3 text-center font-semibold">{sub.attendedClasses}</td>
                          <td className="py-3 px-3 text-center text-slate-500">{sub.totalClasses}</td>
                          <td className="py-3 px-3 text-right font-black text-sm">
                            <span className={isSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>
                              {pct}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center text-slate-500">{goal}%</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              isSafe
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}>
                              {isSafe ? 'Meeting Target' : 'Below Threshold'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* REPORT CONTENT TYPE 2: DAILY PUNCH CHECK-IN LOGS */}
        {reportType === 'daily' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Daily Punch Check-In Records</h3>
              <span className="text-xs text-slate-500 font-bold">Total Logs: {filteredPunchLogs.length}</span>
            </div>

            {filteredPunchLogs.length === 0 ? (
              <EmptyState
                type="reports"
                title="No Daily Punch Logs Found"
                description="No punch check-ins match your selected date filter parameters."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Punch In</th>
                      <th className="py-3 px-3">Punch Out</th>
                      <th className="py-3 px-3">Logged Hours</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredPunchLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{log.date}</td>
                        <td className="py-3 px-3 uppercase font-extrabold text-[10px] text-purple-600 dark:text-purple-400">{log.status}</td>
                        <td className="py-3 px-3 font-mono">{log.punchInTime || '--'}</td>
                        <td className="py-3 px-3 font-mono">{log.punchOutTime || '--'}</td>
                        <td className="py-3 px-3 font-bold">{log.totalHours ? `${log.totalHours} hrs` : '--'}</td>
                        <td className="py-3 px-3 text-slate-500">{log.location || 'Campus'}</td>
                        <td className="py-3 px-3 text-slate-500">{log.notes || '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* REPORT CONTENT TYPE 3: SUBJECT CLASS ATTENDANCE RECAP */}
        {reportType === 'subject' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Individual Subject Class Attendance Records</h3>
              <span className="text-xs text-slate-500 font-bold">Total Entries: {filteredSubjectRecords.length}</span>
            </div>

            {filteredSubjectRecords.length === 0 ? (
              <EmptyState
                type="reports"
                title="No Class Attendance Entries Found"
                description="There are no recorded class entries matching your selected subject and date parameters."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Subject Name</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Time Slot / Mode</th>
                      <th className="py-3 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredSubjectRecords.map((rec) => {
                      const sub = subjects.find((s) => s.id === rec.subjectId);
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{rec.date}</td>
                          <td className="py-3 px-3 font-extrabold">{sub ? `${sub.name} (${sub.code || 'Sub'})` : 'Class'}</td>
                          <td className="py-3 px-3 uppercase font-extrabold text-[10px]">
                            <span className={rec.status === 'present' ? 'text-emerald-600' : 'text-red-500'}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500">{rec.timeSlot || rec.mode || 'Offline'}</td>
                          <td className="py-3 px-3 text-slate-500">{rec.notes || '--'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Verification & Signatures Footer for Official College Submission */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <div className="h-10 border-b border-slate-300 dark:border-slate-700 mb-1" />
            <p className="font-extrabold text-slate-900 dark:text-slate-200">Student Signature</p>
            <p className="text-[10px]">{profile.name || 'Student'}</p>
          </div>
          <div className="text-right">
            <div className="h-10 border-b border-slate-300 dark:border-slate-700 mb-1" />
            <p className="font-extrabold text-slate-900 dark:text-slate-200">Authority / HOD Verification Stamp</p>
            <p className="text-[10px]">{profile.institutionName || 'Institution Seal'}</p>
          </div>
        </div>

        {/* Verification Footer Banner */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400">
            <CheckCircle2 className="w-3 h-3" /> System Generated & Verified by AttendAI Platform
          </span>
          <span>Page 1 of 1</span>
        </div>

      </div>
    </div>
  );
};
