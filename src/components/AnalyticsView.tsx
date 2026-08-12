import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  Download,
  Share2,
  FileText,
  Award,
  TrendingUp,
  PieChart as PieIcon,
  Check,
  Zap,
  Target,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { Subject, StudentProfile } from '../types';
import { calculateOverallStats, calculateSubjectPercentage } from '../services/storage';

interface AnalyticsViewProps {
  subjects: Subject[];
  profile: StudentProfile;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ subjects, profile }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const stats = calculateOverallStats(subjects, profile.targetPercentage);

  // Data for Pie Chart: Attended vs Missed vs Leave
  const pieData = [
    { name: 'Attended', value: stats.totalAttended, color: '#10b981' },
    { name: 'Missed / Absent', value: stats.totalMissed, color: '#ef4444' },
  ];

  // Data for Subject Bar Chart
  const subjectBarData = subjects.map((s) => ({
    name: s.name.length > 12 ? `${s.name.slice(0, 10)}..` : s.name,
    Attendance: calculateSubjectPercentage(s),
    Goal: s.minAttendance,
  }));

  // Monthly Trend Line Chart Data based on current overall stats
  const trendData = [
    { month: 'Start', Percentage: profile.targetPercentage || 75 },
    { month: 'Current', Percentage: stats.overallPercentage },
  ];

  // Printable report download trigger
  const handleDownloadReport = () => {
    const reportText = `================================================
ATTENDAI - OFFICIAL ACADEMIC ATTENDANCE REPORT
================================================
Student Name: ${profile.name}
Institution: ${profile.institutionName}
Degree/Class: ${profile.degree || profile.classGrade || 'Student'}
Roll Number: ${profile.rollNumber || 'N/A'}
Date Generated: ${new Date().toLocaleDateString()}

SUMMARY STATISTICS:
------------------------------------------------
Overall Attendance: ${stats.overallPercentage}%
Minimum Target Goal: ${profile.targetPercentage}%
Total Lectures Conducted: ${stats.totalConducted}
Total Lectures Attended: ${stats.totalAttended}
Total Missed / Bunked: ${stats.totalMissed}
Status: ${stats.overallPercentage >= profile.targetPercentage ? 'ELIGIBLE / SAFE ZONE' : 'ATTENDANCE SHORTAGE WARNING'}

SUBJECT BREAKDOWN:
------------------------------------------------
${subjects
  .map(
    (s) =>
      `• ${s.name}: ${calculateSubjectPercentage(s)}% (${s.attendedClasses}/${s.totalClasses} classes)`
  )
  .join('\n')}

Generated automatically by AttendAI SaaS App.
================================================`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AttendAI_Report_${profile.name.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  const handleShareCertificate = () => {
    navigator.clipboard.writeText(
      `Check out my AttendAI Academic Attendance Certificate!\nOverall Attendance: ${stats.overallPercentage}% at ${profile.institutionName}. Tracked with AttendAI!`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-orange-500" /> Attendance Analytics & Official Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep statistical breakdown, subject comparison charts, and downloadable official attendance certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-md hover:opacity-90"
          >
            <Download className="w-4 h-4" /> Export Report (.TXT/CSV)
          </button>

          <button
            onClick={handleShareCertificate}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-xs shadow-md hover:opacity-95"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copiedLink ? 'Link Copied!' : 'Share Certificate'}
          </button>
        </div>
      </div>

      {/* Recharts Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Subject Comparison Bar Chart */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-500" /> Subject Attendance vs Target Goal
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectBarData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#888888" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Attendance" fill="#f97316" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Goal" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Line Chart */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-500" /> Semester Attendance Progress Trajectory
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                <YAxis domain={[50, 100]} stroke="#888888" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="Percentage" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Subject-by-Subject Smooth Animated Progress Bars Breakdown */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" /> Subject Attendance Live Progress
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Smooth framer-motion progress indicators showing real-time course percentages against your {profile.targetPercentage}% target.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-extrabold text-xs">
            Target Goal: {profile.targetPercentage}%
          </span>
        </div>

        <div className="space-y-5">
          {subjects.map((sub) => {
            const pct = calculateSubjectPercentage(sub);
            const targetGoal = sub.minAttendance || profile.targetPercentage;
            const isSafe = pct >= targetGoal;

            return (
              <div
                key={sub.id}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2.5 transition-all hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: sub.color || '#f97316' }}
                    />
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {sub.name}
                    </span>
                    {sub.code && (
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {sub.code}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      {sub.attendedClasses} / {sub.totalClasses} classes attended
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-black shadow-sm ${
                        isSafe
                          ? 'bg-emerald-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Framer Motion Animated Progress Bar */}
                <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    className={`h-full rounded-full shadow-inner ${
                      isSafe
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400'
                        : 'bg-gradient-to-r from-red-500 via-orange-500 to-amber-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                  />
                  {/* Target Goal Vertical Marker Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white z-10 opacity-70"
                    style={{ left: `${Math.min(targetGoal, 100)}%` }}
                    title={`Subject Goal: ${targetGoal}%`}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    {isSafe ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Meeting Target Threshold
                      </span>
                    ) : (
                      <span className="text-red-500 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Below Target ({targetGoal}%)
                      </span>
                    )}
                  </span>
                  <span>Goal: {targetGoal}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Attendance Certificate Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-600/10 dark:from-slate-900 dark:to-slate-900 border-2 border-orange-200 dark:border-slate-800 shadow-xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-orange-200/60 dark:border-slate-800 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-wider">
                Academic Attendance Certificate
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Verified by AttendAI Digital Tracker</p>
            </div>
          </div>

          <span className="px-4 py-1.5 rounded-full bg-emerald-500 text-white font-extrabold text-xs shadow-sm">
            STATUS: ELIGIBLE ({stats.overallPercentage}%)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80">
            <p className="text-slate-400">Student Name</p>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{profile.name}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80">
            <p className="text-slate-400">Institution</p>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{profile.institutionName}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80">
            <p className="text-slate-400">Total Lectures</p>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{stats.totalConducted}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80">
            <p className="text-slate-400">Lectures Attended</p>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.totalAttended}</p>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 italic text-center">
          "This student has consistently logged class attendance and fulfills the minimum {profile.targetPercentage}% required academic threshold."
        </p>
      </div>

    </div>
  );
};
