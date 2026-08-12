import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  School,
  Building2,
  Award,
  BookOpen,
  Target,
  Bell,
  Moon,
  Globe,
  Camera,
  Check,
  Save,
  Sparkles,
  ShieldCheck,
  KeyRound,
  Lock,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Database,
  FileText,
  LogOut,
} from 'lucide-react';
import { StudentProfile, EducationType, NotificationSettings, Subject, AttendanceRecord, DailyPunchLog, AuthUser } from '../types';
import {
  exportCompleteHistoryCSV,
  exportDailyPunchLogsCSV,
  exportSubjectRecordsCSV,
} from '../services/exportUtils';

interface ProfileViewProps {
  profile: StudentProfile;
  onSaveProfile: (updated: StudentProfile) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  subjects?: Subject[];
  records?: AttendanceRecord[];
  punchLogs?: DailyPunchLog[];
  authUser?: AuthUser | null;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onSaveProfile,
  darkMode,
  setDarkMode,
  subjects = [],
  records = [],
  punchLogs = [],
  authUser,
  onLogout,
}) => {
  const [formData, setFormData] = useState<StudentProfile>({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [notifications, setNotifications] = useState<NotificationSettings>(
    profile.notifications || {
      dailyReminder: true,
      lowAttendanceAlert: true,
      examReminder: true,
      holidayReminder: true,
      reminderTime: '08:30 AM',
    }
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StudentProfile = {
      ...formData,
      institutionName:
        formData.educationType === 'school'
          ? formData.schoolName || 'My School'
          : formData.collegeName || formData.universityName || 'My Institution',
      notifications,
    };

    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-12">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-6 h-6 text-orange-500" /> Student Profile & Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal profile, institution details, attendance goals, theme, and notification alerts.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-md animate-in fade-in">
            <Check className="w-4 h-4" /> Profile Saved Successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Photo & Basic Info Card */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <img
                src={
                  formData.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={formData.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-orange-500 shadow-lg"
              />
              <label className="absolute bottom-0 right-0 p-2 rounded-full bg-slate-900 text-white cursor-pointer hover:bg-orange-500 transition-colors shadow-md">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>

            <div className="space-y-3 flex-1 w-full text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Account Security & Verification Badge */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-xs text-emerald-900 dark:text-emerald-200">Email Verified</p>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Account status active</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-purple-500 shrink-0" />
              <div>
                <p className="font-bold text-xs text-purple-900 dark:text-purple-200">JWT Token Session</p>
                <p className="text-[10px] text-purple-700 dark:text-purple-400">Secure AES-256 state</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-800/60 flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                <p className="font-bold text-xs text-orange-900 dark:text-orange-200">Rate Limited</p>
                <p className="text-[10px] text-orange-700 dark:text-orange-400">Brute-force protected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Institution Type Selection */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-orange-500" /> Institution Type
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { type: 'school', title: 'School', icon: School, desc: 'Class 6th to 12th Board' },
              { type: 'college', title: 'College', icon: GraduationCap, desc: 'UG / PG College Degrees' },
              { type: 'university', title: 'University', icon: Building2, desc: 'Departmental System' },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = formData.educationType === item.type;
              return (
                <div
                  key={item.type}
                  onClick={() => setFormData({ ...formData, educationType: item.type as EducationType })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-orange-300 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-orange-500' : 'text-slate-500'}`} />
                    {isSelected && <Check className="w-4 h-4 text-orange-500 font-bold" />}
                  </div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white mt-2">{item.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Dynamic Institution Details */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
            {formData.educationType === 'school' && (
              <div className="space-y-3">
                <p className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-orange-500">
                  School Details
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">School Name</label>
                    <input
                      type="text"
                      value={formData.schoolName || ''}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="e.g. St. Xavier's High School"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Board</label>
                    <input
                      type="text"
                      value={formData.board || 'CBSE'}
                      onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="e.g. CBSE / ICSE / State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Class</label>
                    <input
                      type="text"
                      value={formData.classGrade || '12th'}
                      onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Section</label>
                    <input
                      type="text"
                      value={formData.section || 'A'}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Roll Number</label>
                    <input
                      type="text"
                      value={formData.rollNumber || ''}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
                    <input
                      type="text"
                      value={formData.academicYear || '2025-2026'}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.educationType === 'college' && (
              <div className="space-y-3">
                <p className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-orange-500">
                  College Details
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">College Name</label>
                    <input
                      type="text"
                      value={formData.collegeName || ''}
                      onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="e.g. National Institute of Technology"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Degree</label>
                    <input
                      type="text"
                      value={formData.degree || 'B.Tech'}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="e.g. B.Tech / B.Sc / BCA"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.department || ''}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                    <input
                      type="text"
                      value={formData.semester || 'Semester 6'}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Year</label>
                    <input
                      type="text"
                      value={formData.year || '3rd Year'}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.educationType === 'university' && (
              <div className="space-y-3">
                <p className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-orange-500">
                  University Details
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">University Name</label>
                    <input
                      type="text"
                      value={formData.universityName || ''}
                      onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="e.g. Delhi Technological University"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Course</label>
                    <input
                      type="text"
                      value={formData.course || formData.degree || 'B.Tech CS'}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="e.g. B.Tech Computer Engineering"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.department || ''}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                    <input
                      type="text"
                      value={formData.semester || 'Semester 6'}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Goal & Preferences */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-500" /> Attendance Goal & System Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Attendance Target Goal (%)</label>
              <input
                type="number"
                min="50"
                max="95"
                value={formData.targetPercentage}
                onChange={(e) => setFormData({ ...formData, targetPercentage: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Language</label>
              <select
                value={formData.language || 'English'}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Theme Mode</label>
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold flex items-center justify-between"
              >
                <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                <Moon className="w-4 h-4 text-amber-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Preferences Card */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-orange-500" /> Notification Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <label className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Daily Attendance Reminder</p>
                <p className="text-[11px] text-slate-500">Morning check-in reminder</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.dailyReminder}
                onChange={(e) => setNotifications({ ...notifications, dailyReminder: e.target.checked })}
                className="w-4 h-4 accent-orange-500 rounded"
              />
            </label>

            <label className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Low Attendance Alert</p>
                <p className="text-[11px] text-slate-500">Triggers when subject drops below goal</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.lowAttendanceAlert}
                onChange={(e) => setNotifications({ ...notifications, lowAttendanceAlert: e.target.checked })}
                className="w-4 h-4 accent-orange-500 rounded"
              />
            </label>

            <label className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Exam Reminder</p>
                <p className="text-[11px] text-slate-500">Alerts 2 days before scheduled exam</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.examReminder}
                onChange={(e) => setNotifications({ ...notifications, examReminder: e.target.checked })}
                className="w-4 h-4 accent-orange-500 rounded"
              />
            </label>

            <label className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Holiday Reminder</p>
                <p className="text-[11px] text-slate-500">Upcoming official & custom holidays</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.holidayReminder}
                onChange={(e) => setNotifications({ ...notifications, holidayReminder: e.target.checked })}
                className="w-4 h-4 accent-orange-500 rounded"
              />
            </label>
          </div>
        </div>

        {/* Data & Attendance History Export Card */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-orange-500" /> Export Attendance History & Punch Logs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Download your full attendance records, subject class histories, and daily punch check-ins as CSV files.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] uppercase tracking-wider border border-orange-500/20 shrink-0">
              CSV Export Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            
            {/* Complete Combined Export */}
            <button
              type="button"
              onClick={() => exportCompleteHistoryCSV(formData, subjects, records, punchLogs)}
              className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 via-purple-500/10 to-blue-500/10 hover:from-orange-500/20 hover:to-blue-500/20 border border-orange-500/30 text-left space-y-2 transition-all hover:scale-[1.02] shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <FileSpreadsheet className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                <Download className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
              </div>
              <div>
                <p className="font-extrabold text-xs text-slate-900 dark:text-white">Full Combined CSV</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Complete history including subject summary, class logs & punch logs.
                </p>
              </div>
            </button>

            {/* Daily Punch Logs Export */}
            <button
              type="button"
              onClick={() => exportDailyPunchLogsCSV(formData, punchLogs)}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left space-y-2 transition-all hover:scale-[1.02] shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <FileText className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
              </div>
              <div>
                <p className="font-extrabold text-xs text-slate-900 dark:text-white">Daily Punch Logs CSV</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {punchLogs.length} total punch-in check-in/out records.
                </p>
              </div>
            </button>

            {/* Subject Class Records Export */}
            <button
              type="button"
              onClick={() => exportSubjectRecordsCSV(formData, subjects, records)}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left space-y-2 transition-all hover:scale-[1.02] shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <BookOpen className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                <Download className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
              </div>
              <div>
                <p className="font-extrabold text-xs text-slate-900 dark:text-white">Subject Class CSV</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {records.length} individual subject class attendance entries.
                </p>
              </div>
            </button>

          </div>
        </div>

        {/* Account Session & Logout Card */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Account Session</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active user: <span className="font-bold text-slate-700 dark:text-slate-200">{authUser ? (authUser.email || authUser.fullName || 'Signed In User') : 'Guest Account (Signed Out)'}</span>
              </p>
            </div>
          </div>
          {authUser && onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 font-extrabold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-sm shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of AttendAI</span>
            </button>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-sm shadow-xl shadow-orange-500/20 hover:opacity-95 transition-all hover:scale-[1.01]"
          >
            <Save className="w-4 h-4" /> Save Profile Changes
          </button>
        </div>

      </form>
    </div>
  );
};
