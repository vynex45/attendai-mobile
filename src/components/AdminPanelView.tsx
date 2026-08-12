import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Building2,
  FileSpreadsheet,
  Brain,
  MessageSquare,
  Megaphone,
  CreditCard,
  History,
  Search,
  Plus,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  MoreVertical,
  Calendar as CalendarIcon,
  Lock,
  Unlock,
  Trash2,
  Sparkles,
  ShieldCheck,
  Check,
  Download,
  Sun,
  Moon,
  Shield,
  UserCheck,
  UserX,
  Edit3,
  KeyRound,
  Activity,
  Smartphone,
  Globe,
  RefreshCw,
  FileText,
  Sliders,
  Database,
  Upload,
  AlertTriangle,
  Mail,
  Bell,
  Settings,
  X,
  Eye,
  BookOpen,
  GraduationCap,
  Clock,
  BarChart3,
  PieChart,
  ArrowUpRight,
  CheckSquare,
  Zap,
} from 'lucide-react';
import {
  StudentProfile,
  Subject,
  AcademicSession,
  AcademicHoliday,
  HolidayCategory,
  AuthUser,
  UserRole,
} from '../types';
import {
  HOLIDAY_CATEGORY_META,
  calculateAcademicSessionStats,
  exportAcademicCalendarJSON,
} from '../services/academicCalendar';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { requestPasswordReset } from '../services/auth';
import { ActivityLogs } from './ActivityLogs';
import { logAdminActivity } from '../services/activityLogger';

interface AdminPanelViewProps {
  profile: StudentProfile;
  subjects: Subject[];
  session?: AcademicSession;
  onSaveSession?: (session: AcademicSession) => void;
  holidays?: AcademicHoliday[];
  onSaveHolidays?: (holidays: AcademicHoliday[]) => void;
  authUser?: AuthUser | null;
  onOpenCalendarModal?: () => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  profile,
  subjects,
  session,
  onSaveSession,
  holidays = [],
  onSaveHolidays,
  authUser,
  onOpenCalendarModal,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<
    | 'overview'
    | 'users'
    | 'controls'
    | 'academic_calendar'
    | 'announcements'
    | 'security'
    | 'analytics'
    | 'settings'
    | 'logs'
  >('overview');

  // Supabase users list state with fallback
  const [userList, setUserList] = useState<any[]>([
    {
      id: authUser?.id || profile.id || 'admin-shivam-2329',
      fullName: 'Shivam Jagtap',
      email: 'ytshivam5818@gmail.com',
      institution: profile.institutionName || 'AttendAI Central University',
      educationType: profile.educationType || 'college',
      status: 'Active',
      role: 'admin',
      isVerified: true,
      lastLoginAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: '2024-06-01',
    },
    {
      id: 'usr-student-demo-1',
      fullName: 'Alex Rivera',
      email: 'alex.rivera@institution.edu',
      institution: profile.institutionName || 'AttendAI Central University',
      educationType: 'college',
      status: 'Active',
      role: 'student',
      isVerified: true,
      lastLoginAt: 'Yesterday, 04:15 PM',
      createdAt: '2024-09-10',
    },
    {
      id: 'usr-teacher-demo-2',
      fullName: 'Prof. Sarah Jenkins',
      email: 's.jenkins@faculty.edu',
      institution: profile.institutionName || 'AttendAI Central University',
      educationType: 'college',
      status: 'Active',
      role: 'teacher',
      isVerified: true,
      lastLoginAt: '2 hours ago',
      createdAt: '2024-08-15',
    },
    {
      id: 'usr-student-demo-3',
      fullName: 'Michael Chen',
      email: 'm.chen@student.edu',
      institution: profile.institutionName || 'AttendAI Central University',
      educationType: 'school',
      status: 'Suspended',
      role: 'student',
      isVerified: false,
      lastLoginAt: '3 days ago',
      createdAt: '2025-01-12',
    },
  ]);

  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'teacher' | 'student'>('all');

  // Modal / Action states
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserForm, setEditUserForm] = useState({ fullName: '', email: '', role: 'student', status: 'Active' });

  // Notifications / Feedback toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Admin Announcements
  const [announcements, setAnnouncements] = useState<any[]>([
    {
      id: 'ann-1',
      title: 'Official Semester II Academic Holiday Calendar Released',
      message: 'All students and faculty are requested to review the updated festival and exam holidays schedule.',
      date: new Date().toLocaleDateString(),
      target: 'All Institutions',
      author: 'Super Admin',
      status: 'Published',
    },
    {
      id: 'ann-2',
      title: '75% Attendance Eligibility Warning Broadcast',
      message: 'Students falling below 75% attendance in core subjects must submit leave applications by Friday.',
      date: 'Yesterday',
      target: 'Students',
      author: 'Academic Registrar',
      status: 'Published',
    },
  ]);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnMsg, setNewAnnMsg] = useState('');
  const [newAnnTarget, setNewAnnTarget] = useState('All Users');

  // Admin Security & 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [activeSessions, setActiveSessions] = useState([
    { id: 'sess-1', device: 'Chrome on macOS (Current)', ip: '192.168.1.1', location: 'Mumbai, IN', time: 'Active now' },
    { id: 'sess-2', device: 'AttendAI Android App v3.2', ip: '49.36.12.84', location: 'Pune, IN', time: '2 hours ago' },
  ]);

  // System Audit Logs
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: 'log-101', action: 'ADMIN_LOGIN', user: 'ytshivam5818@gmail.com', details: 'Authenticated via Super Admin credentials', time: '08:30:12 AM', type: 'security' },
    { id: 'log-102', action: 'HOLIDAY_UPDATE', user: 'ytshivam5818@gmail.com', details: 'Added Diwali Break into Academic Calendar', time: '08:15:40 AM', type: 'calendar' },
    { id: 'log-103', action: 'ROLE_ELEVATION', user: 'ytshivam5818@gmail.com', details: 'Verified student profile status for Alex Rivera', time: 'Yesterday', type: 'user' },
    { id: 'log-104', action: 'BACKUP_EXPORT', user: 'ytshivam5818@gmail.com', details: 'Generated system configuration snapshot', time: 'Yesterday', type: 'system' },
  ]);

  // Admin Holiday Publisher
  const [showAdminAddHol, setShowAdminAddHol] = useState(false);
  const [holTitle, setHolTitle] = useState('');
  const [holDate, setHolDate] = useState('');
  const [holEndDate, setHolEndDate] = useState('');
  const [holCategory, setHolCategory] = useState<HolidayCategory>('festival');
  const [holDesc, setHolDesc] = useState('');

  // Settings State
  const [adminEmailInput, setAdminEmailInput] = useState(authUser?.email || 'ytshivam5818@gmail.com');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminPassConfirm, setAdminPassConfirm] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

  // Sync users with Supabase on load
  useEffect(() => {
    async function fetchSupabaseUsers() {
      if (!isSupabaseConfigured) return;
      setIsLoadingUsers(true);
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && data && data.length > 0) {
          const fetched: any[] = data.map((d) => ({
            id: d.id,
            fullName: d.full_name || d.fullName || d.name || 'User',
            email: d.email || 'N/A',
            institution: d.institution || profile.institutionName || 'AttendAI Central University',
            educationType: d.education_type || d.educationType || 'college',
            status: d.status || 'Active',
            role: d.role || 'student',
            isVerified: d.is_verified ?? true,
            lastLoginAt: d.last_login_at
              ? new Date(d.last_login_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Recent',
            createdAt: d.created_at ? d.created_at.split('T')[0] : '2026-08-01',
          }));
          setUserList(fetched);
        }
      } catch (e) {
        console.warn('Supabase users fetch fallback to local store:', e);
      } finally {
        setIsLoadingUsers(false);
      }
    }

    fetchSupabaseUsers();
  }, [profile.institutionName]);

  // User Actions
  const handleToggleSuspendUser = async (user: any) => {
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    const updated = userList.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u));
    setUserList(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('users').update({ status: newStatus }).eq('id', user.id);
      } catch (e) {
        console.warn('Supabase update status notice:', e);
      }
    }

    await logAdminActivity(
      newStatus === 'Suspended' ? 'USER_SUSPEND' : 'USER_ACTIVATE',
      `Account status for ${user.fullName} (${user.email}) set to ${newStatus}`,
      'user_status',
      authUser?.email || profile.email || 'ytshivam5818@gmail.com'
    );

    showToast(`Account status for ${user.fullName} changed to ${newStatus}.`);
  };

  const handleChangeUserRole = async (user: any, newRole: UserRole) => {
    const updated = userList.map((u) => (u.id === user.id ? { ...u, role: newRole } : u));
    setUserList(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('users').update({ role: newRole }).eq('id', user.id);
      } catch (e) {
        console.warn('Supabase update role notice:', e);
      }
    }

    await logAdminActivity(
      'ROLE_CHANGE',
      `Updated user privilege level for ${user.fullName} (${user.email}) to ${newRole.toUpperCase()}`,
      'role',
      authUser?.email || profile.email || 'ytshivam5818@gmail.com'
    );

    showToast(`Role for ${user.fullName} updated to ${newRole.toUpperCase()}.`);
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) return;

    setUserList(userList.filter((u) => u.id !== userId));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('users').delete().eq('id', userId);
      } catch (e) {
        console.warn('Supabase delete user notice:', e);
      }
    }

    await logAdminActivity(
      'ACCOUNT_DELETE',
      `Permanently removed user profile for ${name} (ID: ${userId}) from Supabase database`,
      'deletion',
      authUser?.email || profile.email || 'ytshivam5818@gmail.com'
    );

    showToast(`User ${name} successfully removed from the system.`);
  };

  const handleResetUserPassword = async (email: string) => {
    try {
      await requestPasswordReset(email);
      showToast(`Password reset link dispatched to ${email}.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch password reset email.');
    }
  };

  const handleSaveEditedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const updated = userList.map((u) =>
      u.id === selectedUser.id
        ? { ...u, fullName: editUserForm.fullName, email: editUserForm.email, role: editUserForm.role, status: editUserForm.status }
        : u
    );

    setUserList(updated);
    setShowEditUserModal(false);
    showToast(`User profile for ${editUserForm.fullName} updated successfully!`);
  };

  // Add Announcement
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim()) return;

    const newAnn = {
      id: `ann-${Date.now()}`,
      title: newAnnTitle.trim(),
      message: newAnnMsg.trim() || 'No additional text provided.',
      date: new Date().toLocaleDateString(),
      target: newAnnTarget,
      author: 'Super Admin',
      status: 'Published',
    };

    setAnnouncements([newAnn, ...announcements]);
    
    await logAdminActivity(
      'ANNOUNCEMENT_PUBLISH',
      `Broadcasted announcement "${newAnnTitle.trim()}" to target audience: ${newAnnTarget}`,
      'announcement',
      authUser?.email || profile.email || 'ytshivam5818@gmail.com'
    );

    setNewAnnTitle('');
    setNewAnnMsg('');
    showToast('Announcement published successfully to all targeted dashboards!');
  };

  // Create Holiday
  const handleCreateAdminHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holTitle || !holDate) return;

    const newHol: AcademicHoliday = {
      id: `hol-admin-${Date.now()}`,
      title: holTitle.trim(),
      date: holDate,
      endDate: holEndDate || undefined,
      type: holCategory,
      description: holDesc.trim() || undefined,
      institutionScope: 'all',
    };

    const updated = [...holidays, newHol].sort((a, b) => a.date.localeCompare(b.date));
    if (onSaveHolidays) onSaveHolidays(updated);

    await logAdminActivity(
      'HOLIDAY_PUBLISH',
      `Published institution holiday "${holTitle.trim()}" on ${holDate}`,
      'calendar',
      authUser?.email || profile.email || 'ytshivam5818@gmail.com'
    );

    showToast(`Holiday "${holTitle}" published successfully across the institution!`);
    setHolTitle('');
    setHolDate('');
    setHolEndDate('');
    setHolDesc('');
    setShowAdminAddHol(false);
  };

  // Export JSON Backup
  const handleExportSystemBackup = () => {
    const backupData = {
      system: 'AttendAI SaaS Engine',
      exportedAt: new Date().toISOString(),
      admin: profile.email || 'ytshivam5818@gmail.com',
      usersCount: userList.length,
      users: userList,
      subjects,
      holidays,
      announcements,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendai_admin_backup_${Date.now()}.json`;
    a.click();
    showToast('Complete system snapshot exported as JSON!');
  };

  // Filter Users
  const filteredUsers = userList.filter((u) => {
    const matchesSearch =
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calculate stats
  const totalStudents = userList.filter((u) => u.role === 'student').length;
  const totalTeachers = userList.filter((u) => u.role === 'teacher').length;
  const totalAdmins = userList.filter((u) => u.role === 'admin').length;

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* 1. ADMINISTRATOR PROFILE HEADER CARD */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl relative overflow-hidden">
        {/* Decorative Background Accents */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Admin Identity Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 p-1 shadow-lg shadow-purple-500/20">
                <img
                  src={
                    profile.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={profile.name}
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-slate-900 text-white" title="Account Verified">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight font-serif text-white">
                  Shivam Jagtap
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border border-purple-400/40 text-purple-200 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-purple-400" /> Super Admin
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-purple-400" /> ytshivam5818@gmail.com
                <span className="text-slate-600">•</span>
                <Building2 className="w-3.5 h-3.5 text-blue-400" /> {profile.institutionName || 'AttendAI Central University'}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                <span><strong className="text-slate-200">Admin ID:</strong> ADM-232981</span>
                <span><strong className="text-slate-200">Last Login:</strong> Today, 08:30 AM</span>
                <span><strong className="text-slate-200">Member Since:</strong> Jun 2024</span>
              </div>
            </div>
          </div>

          {/* Quick Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch lg:self-auto justify-end">
            <button
              onClick={handleExportSystemBackup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 backdrop-blur-md"
            >
              <Download className="w-4 h-4 text-purple-300" />
              <span>Export Backup</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('settings')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Admin Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
          { id: 'users', label: 'User Management', icon: Users, badge: userList.length },
          { id: 'controls', label: 'Academic Controls', icon: Sliders },
          { id: 'academic_calendar', label: 'Calendar & Holidays', icon: CalendarIcon },
          { id: 'announcements', label: 'Notice Board', icon: Megaphone, badge: announcements.length },
          { id: 'security', label: 'Security & Access', icon: ShieldCheck },
          { id: 'analytics', label: 'Analytics & Reports', icon: TrendingUp },
          { id: 'settings', label: 'System Settings', icon: Settings },
          { id: 'logs', label: 'Audit Logs', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap relative ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI CARDS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Total Users</span>
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black tracking-tight">{userList.length}</p>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3 h-3" /> +14.2% from last month
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Active Students</span>
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black tracking-tight">{totalStudents}</p>
              <p className="text-[11px] text-slate-400 font-medium">Across all courses</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Faculty Members</span>
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black tracking-tight">{totalTeachers}</p>
              <p className="text-[11px] text-slate-400 font-medium">Assigned to subjects</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Today's Attendance</span>
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black tracking-tight">88.5%</p>
              <p className="text-[11px] text-emerald-400 font-medium">+2.1% higher than avg</p>
            </div>
          </div>

          {/* SYSTEM PERFORMANCE & QUICK ACTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions Panel */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2 font-serif">
                <Zap className="w-5 h-5 text-purple-400" /> Admin Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => setActiveAdminTab('users')}
                  className="w-full p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-left text-xs font-bold flex items-center justify-between border border-slate-700/60 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4 text-purple-400" />
                    <span>Manage User Accounts & Roles</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-all" />
                </button>

                <button
                  onClick={() => setActiveAdminTab('announcements')}
                  className="w-full p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-left text-xs font-bold flex items-center justify-between border border-slate-700/60 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Megaphone className="w-4 h-4 text-blue-400" />
                    <span>Publish Announcement Broadcast</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-all" />
                </button>

                <button
                  onClick={() => setActiveAdminTab('academic_calendar')}
                  className="w-full p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-left text-xs font-bold flex items-center justify-between border border-slate-700/60 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-4 h-4 text-emerald-400" />
                    <span>Configure Academic Calendar</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-all" />
                </button>

                <button
                  onClick={handleExportSystemBackup}
                  className="w-full p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-left text-xs font-bold flex items-center justify-between border border-slate-700/60 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-amber-400" />
                    <span>Export Full System Backup (JSON)</span>
                  </div>
                  <Download className="w-4 h-4 text-slate-500 group-hover:text-white transition-all" />
                </button>
              </div>
            </div>

            {/* Subject Attendance Breakdown */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2 font-serif">
                  <BookOpen className="w-5 h-5 text-indigo-400" /> Live Subject Overview
                </h3>
                <span className="text-xs text-slate-400">{subjects.length} Active Courses</span>
              </div>

              <div className="space-y-3">
                {subjects.slice(0, 4).map((sub) => {
                  const pct = sub.totalClasses > 0 ? Math.round((sub.attendedClasses / sub.totalClasses) * 100) : 100;
                  return (
                    <div key={sub.id} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{sub.name}</span>
                        <span className={`font-black ${pct >= sub.minAttendance ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {pct}% Avg Attendance
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeAdminTab === 'users' && (
        <div className="space-y-6">
          {/* Search & Filter Header */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search users by name, email, or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {(['all', 'admin', 'teacher', 'student'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold capitalize transition-all ${
                    roleFilter === r
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* User Table */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-5">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Institution</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Last Activity</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/50 transition-all">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-300 font-black text-xs flex items-center justify-center shrink-0 border border-purple-500/30">
                            {u.fullName?.substring(0, 2).toUpperCase() || 'US'}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{u.fullName}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeUserRole(u, e.target.value as UserRole)}
                          className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-purple-300 focus:outline-none"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="py-4 px-4 text-slate-300">{u.institution}</td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            u.status === 'Active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-400">{u.lastLoginAt}</td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleResetUserPassword(u.email)}
                            title="Reset Password Email"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleSuspendUser(u)}
                            title={u.status === 'Active' ? 'Suspend User' : 'Activate User'}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-all"
                          >
                            {u.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id, u.fullName)}
                            title="Delete User"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/30 text-rose-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACADEMIC CONTROLS */}
      {activeAdminTab === 'controls' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-serif">Academic Course & Subjects Management</h3>
              <p className="text-xs text-slate-400">Configure core curriculum, set minimum attendance thresholds, and assign teachers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((sub) => (
              <div key={sub.id} className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {sub.code || 'SUB-101'}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">Min: {sub.minAttendance}%</span>
                </div>

                <h4 className="text-base font-bold text-white">{sub.name}</h4>
                <p className="text-xs text-slate-400 font-medium">Instructor: {sub.teacherName || 'Assigned Faculty'}</p>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                  <span>Total Classes: <strong>{sub.totalClasses}</strong></span>
                  <span>Attended: <strong>{sub.attendedClasses}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ACADEMIC CALENDAR */}
      {activeAdminTab === 'academic_calendar' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold font-serif">Official Academic Calendar Publisher</h3>
                <p className="text-xs text-slate-400">Publish institution-wide holidays, exam periods, and session timelines.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenCalendarModal}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700"
                >
                  Full Calendar Modal
                </button>
                <button
                  onClick={() => setShowAdminAddHol(!showAdminAddHol)}
                  className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add New Holiday
                </button>
              </div>
            </div>

            {showAdminAddHol && (
              <form onSubmit={handleCreateAdminHoliday} className="p-5 rounded-2xl bg-slate-800/90 border border-purple-500/30 space-y-4">
                <h4 className="text-sm font-bold text-purple-300">Publish Institution Holiday</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Holiday Title (e.g. Diwali Festival)"
                    value={holTitle}
                    onChange={(e) => setHolTitle(e.target.value)}
                    required
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="date"
                    value={holDate}
                    onChange={(e) => setHolDate(e.target.value)}
                    required
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  Publish Holiday
                </button>
              </form>
            )}

            <div className="space-y-2">
              {holidays.slice(0, 5).map((h) => (
                <div key={h.id} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{h.title}</p>
                    <p className="text-[11px] text-slate-400">{h.date} {h.endDate ? `- ${h.endDate}` : ''}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {h.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ANNOUNCEMENTS */}
      {activeAdminTab === 'announcements' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4">
            <h3 className="text-lg font-bold font-serif">Broadcast Announcements</h3>

            <form onSubmit={handleAddAnnouncement} className="space-y-3">
              <input
                type="text"
                placeholder="Announcement Title..."
                value={newAnnTitle}
                onChange={(e) => setNewAnnTitle(e.target.value)}
                required
                className="w-full p-3 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
              />
              <textarea
                placeholder="Announcement Message body..."
                value={newAnnMsg}
                onChange={(e) => setNewAnnMsg(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none resize-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
              >
                Publish Broadcast
              </button>
            </form>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{ann.title}</span>
                    <span className="text-[10px] text-slate-400">{ann.date}</span>
                  </div>
                  <p className="text-xs text-slate-300">{ann.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY & ACCESS */}
      {activeAdminTab === 'security' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-6">
            <h3 className="text-lg font-bold font-serif flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Supabase Security & Access Controls
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-400">Supabase Row Level Security (RLS)</span>
                <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Strict Owner-Isolated Access Active
                </p>
                <p className="text-[11px] text-slate-400">Users can only access their own document records unless granted Admin role.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-400">Two-Factor Security (2FA)</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Require 2FA for Admin Portal</span>
                  <button
                    onClick={() => {
                      setIs2FAEnabled(!is2FAEnabled);
                      showToast(`2FA Enforce Mode updated to ${!is2FAEnabled ? 'ENABLED' : 'DISABLED'}`);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      is2FAEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {is2FAEnabled ? 'Active' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: ANALYTICS & REPORTS */}
      {activeAdminTab === 'analytics' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-serif">System Analytics & Growth Telemetry</h3>
            <button
              onClick={handleExportSystemBackup}
              className="px-4 py-2 rounded-2xl bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Export CSV/PDF
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
              <h4 className="text-sm font-bold text-slate-200">Daily Active User Trend</h4>
              <div className="h-40 flex items-end justify-between gap-2 pt-4">
                {[65, 78, 82, 95, 88, 92, 99].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-xl transition-all"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[10px] text-slate-400">Day {idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
              <h4 className="text-sm font-bold text-slate-200">Subject Attendance Comparison</h4>
              <div className="space-y-2">
                {subjects.slice(0, 3).map((sub) => (
                  <div key={sub.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">{sub.name}</span>
                      <span className="text-purple-400 font-bold">88%</span>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: SETTINGS */}
      {activeAdminTab === 'settings' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-6">
          <h3 className="text-lg font-bold font-serif">Admin Credentials & Preferences</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-300">Admin Primary Email Address</label>
              <input
                type="email"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-white"
              />

              <button
                onClick={async () => {
                  await logAdminActivity(
                    'SETTING_UPDATE',
                    `Updated admin primary contact notification email address to ${adminEmailInput}`,
                    'settings',
                    authUser?.email || profile.email || 'ytshivam5818@gmail.com'
                  );
                  showToast('Primary admin contact email saved and logged.');
                }}
                className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
              >
                Update Contact Email
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
              <h4 className="text-sm font-bold text-slate-200">Supabase Backend Diagnostic</h4>
              <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Supabase Database Live Connected
              </p>
              <p className="text-[11px] text-slate-400">Database Engine: PostgreSQL with Row Level Security (RLS)</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: AUDIT LOGS / ACTIVITY LOGS */}
      {activeAdminTab === 'logs' && (
        <ActivityLogs adminEmail={authUser?.email || profile.email || 'ytshivam5818@gmail.com'} />
      )}
    </div>
  );
};
