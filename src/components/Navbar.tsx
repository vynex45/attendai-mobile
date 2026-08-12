import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Calculator,
  Bot,
  Calendar,
  Clock,
  BarChart3,
  CheckSquare,
  Settings,
  Bell,
  Sun,
  Moon,
  User,
  GraduationCap,
  FileText,
  ShieldAlert,
  Shield,
  LogOut,
  LogIn,
  ChevronDown,
  Menu,
  X,
  Layers,
  Zap,
  Search,
  ArrowRight,
} from 'lucide-react';
import { StudentProfile, AuthUser, Subject, DailyPunchLog, AttendanceRecord } from '../types';
import { calculateRequiredForSubject, calculateDailyPunchStats } from '../services/storage';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: StudentProfile;
  authUser?: AuthUser | null;
  subjects?: Subject[];
  records?: AttendanceRecord[];
  punchLogs?: DailyPunchLog[];
  onLogout?: () => void;
  onOpenAuth?: () => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (val: boolean) => void;
  onOpenOnboarding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  authUser,
  subjects = [],
  records = [],
  punchLogs = [],
  onLogout,
  onOpenAuth,
  darkMode,
  setDarkMode,
  isDarkMode,
  setIsDarkMode,
  onOpenOnboarding,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  // Global Search State & Refs
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const effectiveDarkMode = isDarkMode ?? darkMode ?? true;
  const toggleDarkMode = () => {
    if (setIsDarkMode) setIsDarkMode(!effectiveDarkMode);
    else if (setDarkMode) setDarkMode(!effectiveDarkMode);
  };

  // Keyboard shortcut Cmd+K / Ctrl+K to trigger search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus & search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // All App Pages for quick search navigation
  const allAppPages = [
    { id: 'dashboard', title: 'Dashboard Overview', desc: 'Daily punch logs, streak & quick attendance overview', icon: LayoutDashboard },
    { id: 'subjects', title: 'Course Subjects', desc: 'Manage subjects, mark attendance & thresholds', icon: BookOpen },
    { id: 'calculator', title: 'Attendance Calculator', desc: 'Predict required classes & safe bunks', icon: Calculator },
    { id: 'calendar', title: 'Calendar & Heatmap', desc: 'Attendance calendar heatmap & academic holidays', icon: Calendar },
    { id: 'timetable', title: 'Schedule & Timetable', desc: 'Weekly class schedule & time slots', icon: Clock },
    { id: 'ai-assistant', title: 'AI Attendance Predictor', desc: 'AI assistant & attendance forecast', icon: Bot },
    { id: 'reports', title: 'Reports & Statement Export', desc: 'Export PDF statements & CSV records', icon: FileText },
    { id: 'analytics', title: 'Analytics & Risk Breakdown', desc: 'Visual charts & risk analysis', icon: BarChart3 },
    { id: 'assignments', title: 'Tasks & Assignments', desc: 'Exams, homework & upcoming tasks', icon: CheckSquare },
    { id: 'profile', title: 'Student Profile', desc: 'Academic details, target goal & institution', icon: User },
    { id: 'settings', title: 'Settings', desc: 'Preferences & theme customization', icon: Settings },
  ];

  const cleanQuery = searchQuery.trim().toLowerCase();

  // Matched App Pages
  const matchedPages = cleanQuery
    ? allAppPages.filter(
        (p) =>
          p.title.toLowerCase().includes(cleanQuery) ||
          p.desc.toLowerCase().includes(cleanQuery) ||
          p.id.toLowerCase().includes(cleanQuery)
      )
    : [];

  // Matched Subjects
  const matchedSubjects = cleanQuery
    ? subjects.filter(
        (sub) =>
          sub.name.toLowerCase().includes(cleanQuery) ||
          (sub.code && sub.code.toLowerCase().includes(cleanQuery)) ||
          (sub.description && sub.description.toLowerCase().includes(cleanQuery))
      )
    : [];

  // Matched Daily Punch Logs
  const matchedPunchLogs = cleanQuery
    ? punchLogs.filter(
        (log) =>
          log.date.toLowerCase().includes(cleanQuery) ||
          log.status.toLowerCase().includes(cleanQuery) ||
          (log.location && log.location.toLowerCase().includes(cleanQuery)) ||
          (log.notes && log.notes.toLowerCase().includes(cleanQuery))
      )
    : [];

  // Matched Subject Attendance Records
  const matchedSubjectRecords = cleanQuery
    ? records.filter((rec) => {
        const sub = subjects.find((s) => s.id === rec.subjectId);
        return (
          rec.date.toLowerCase().includes(cleanQuery) ||
          rec.status.toLowerCase().includes(cleanQuery) ||
          (rec.notes && rec.notes.toLowerCase().includes(cleanQuery)) ||
          (sub && sub.name.toLowerCase().includes(cleanQuery))
        );
      })
    : [];

  const hasSearchQuery = cleanQuery.length > 0;
  const totalResultsCount =
    matchedPages.length +
    matchedSubjects.length +
    matchedPunchLogs.length +
    matchedSubjectRecords.length;

  // Primary navigation items (CENTER section)
  const primaryNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'timetable', label: 'Schedule', icon: Clock },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, badge: 'AI' },
    { id: 'admin', label: 'Admin', icon: ShieldAlert, badge: 'ADMIN' },
  ];

  // Secondary/Productivity navigation items (Under "More" dropdown)
  const secondaryNavItems = [
    { id: 'calculator', label: 'Calculator', desc: 'Predict required attendance', icon: Calculator },
    { id: 'reports', label: 'Reports', desc: 'Export & print logs', icon: FileText },
    { id: 'analytics', label: 'Analytics', desc: 'Trends & risk analysis', icon: BarChart3 },
    { id: 'assignments', label: 'Tasks', desc: 'Exams & assignments', icon: CheckSquare },
    { id: 'profile', label: 'Profile', desc: 'Academic details', icon: User },
  ];

  const isSecondaryActive = secondaryNavItems.some((item) => item.id === activeTab);

  // Dynamic Attendance Shortage & Status Notifications
  const target = profile.targetPercentage;
  const punchStats = calculateDailyPunchStats(punchLogs, target);

  const dynamicNotifications: Array<{
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    actionTab?: string;
  }> = [];

  if (punchStats.overallPercentage < target) {
    dynamicNotifications.push({
      id: 'notif-punch-low',
      type: 'critical',
      title: '🚨 Punch Attendance Shortage',
      message: `Daily punch attendance is ${punchStats.overallPercentage}% (Target: ${target}%). Must punch in for ${punchStats.requiredDaysToTarget} consecutive days.`,
      actionTab: 'dashboard',
    });
  }

  subjects.forEach((sub) => {
    const { required, pct } = calculateRequiredForSubject(sub.attendedClasses, sub.totalClasses, target);
    if (pct < target) {
      dynamicNotifications.push({
        id: `notif-sub-${sub.id}`,
        type: 'critical',
        title: `⚠️ ${sub.name} Below Target (${pct}%)`,
        message: `Need +${required} consecutive classes to reach ${target}%.`,
        actionTab: 'calculator',
      });
    } else if (pct < target + 3) {
      dynamicNotifications.push({
        id: `notif-sub-warn-${sub.id}`,
        type: 'warning',
        title: `⚡ ${sub.name} Near Risk Zone`,
        message: `Currently at ${pct}%. Stay safe and attend upcoming classes.`,
        actionTab: 'subjects',
      });
    }
  });

  const unreadCount = dynamicNotifications.length;

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col items-center pointer-events-auto">
      {/* Floating Glassmorphic Navbar Container - Height 76px */}
      <div 
        className="w-full max-w-[1500px] h-[56px] px-3 sm:px-4 flex items-center justify-between border shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl rounded-2xl transition-all box-border relative overflow-visible"
        style={{
          width: 'calc(100% - 24px)',
          maxWidth: '1500px',
          height: '56px',
          margin: '10px auto',
          borderRadius: '16px',
          padding: '0 14px',
          boxSizing: 'border-box',
          background: effectiveDarkMode ? 'rgba(10, 15, 30, 0.85)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: effectiveDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
        }}
      >
        
        {/* LEFT SECTION: Logo & Navbar Quick Search */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div 
            className="flex items-center gap-1.5 cursor-pointer group shrink-0" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-tr from-purple-600 via-pink-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm sm:text-base shadow-md shadow-purple-500/25 border border-white/20 group-hover:scale-105 transition-transform shrink-0">
              A
            </div>
            <div className="hidden xl:flex items-center gap-1 shrink-0">
              <span className="text-base font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent font-serif italic">
                AttendAI
              </span>
              <span className="text-[8px] font-extrabold tracking-wider uppercase px-1.5 py-0.2 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 text-purple-300 border border-purple-500/30 shadow-sm shrink-0">
                PRO
              </span>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="relative shrink-0" ref={searchRef}>
            <div className="flex items-center gap-1.5 px-2 sm:px-2.5 h-[32px] rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 focus-within:border-purple-500 focus-within:bg-white/10 transition-all text-xs text-slate-200 w-24 sm:w-32 md:w-40 lg:w-44 xl:w-52">
              <Search className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="bg-transparent border-none outline-none text-[11px] sm:text-xs text-white placeholder-slate-400 w-full"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <kbd className="hidden lg:inline-block px-1 py-0.2 text-[8px] font-mono font-bold text-slate-400 bg-white/10 rounded border border-white/10 shrink-0">
                  ⌘K
                </kbd>
              )}
            </div>

            {/* Live Search Results Dropdown Overlay */}
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute left-0 top-[44px] w-[300px] sm:w-[380px] max-h-[460px] overflow-y-auto p-3 bg-slate-900/98 dark:bg-slate-950/98 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 space-y-3"
                >
                  {!hasSearchQuery ? (
                    <div className="p-3 text-center space-y-2">
                      <p className="text-xs font-bold text-slate-200">Quick App Search</p>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Search across subjects (e.g. <span className="text-purple-400 font-mono">Math</span>), dates, class logs, or jump to any page.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">Subjects</span>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">Punch Logs</span>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">Calculator</span>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">Reports</span>
                      </div>
                    </div>
                  ) : totalResultsCount === 0 ? (
                    <div className="p-4 text-center space-y-1 text-xs">
                      <p className="font-bold text-slate-300">No matching results</p>
                      <p className="text-[10px] text-slate-400">
                        No subjects, records, or pages found for "<span className="text-purple-400">{searchQuery}</span>".
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Section 1: Pages & Features */}
                      {matchedPages.length > 0 && (
                        <div className="space-y-1">
                          <p className="px-2 text-[9px] font-black uppercase tracking-wider text-purple-400">
                            Pages & Features ({matchedPages.length})
                          </p>
                          {matchedPages.map((page) => {
                            const PageIcon = page.icon;
                            return (
                              <button
                                key={page.id}
                                onClick={() => {
                                  setActiveTab(page.id);
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                }}
                                className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/10 text-slate-200 transition-all cursor-pointer group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                                    <PageIcon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-white leading-snug truncate">{page.title}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{page.desc}</p>
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Section 2: Course Subjects */}
                      {matchedSubjects.length > 0 && (
                        <div className="space-y-1 border-t border-white/10 pt-2">
                          <p className="px-2 text-[9px] font-black uppercase tracking-wider text-orange-400">
                            Course Subjects ({matchedSubjects.length})
                          </p>
                          {matchedSubjects.map((sub) => {
                            const pct = sub.totalClasses > 0 ? Number(((sub.attendedClasses / sub.totalClasses) * 100).toFixed(1)) : 100;
                            const goal = sub.minAttendance || profile.targetPercentage;
                            const isSafe = pct >= goal;

                            return (
                              <button
                                key={sub.id}
                                onClick={() => {
                                  setActiveTab('subjects');
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                }}
                                className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/10 text-slate-200 transition-all cursor-pointer group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                                    style={{ backgroundColor: sub.color || '#f97316' }}
                                  />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs font-extrabold text-white truncate">{sub.name}</p>
                                      {sub.code && (
                                        <span className="px-1.5 py-0.2 rounded bg-white/10 font-mono text-[9px] font-bold text-purple-300 shrink-0">
                                          {sub.code}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 truncate">
                                      {sub.attendedClasses}/{sub.totalClasses} classes attended
                                    </p>
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 shadow-sm ${
                                  isSafe ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                }`}>
                                  {pct}%
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Section 3: Attendance Logs & Records */}
                      {(matchedPunchLogs.length > 0 || matchedSubjectRecords.length > 0) && (
                        <div className="space-y-1 border-t border-white/10 pt-2">
                          <p className="px-2 text-[9px] font-black uppercase tracking-wider text-cyan-400">
                            Attendance Records ({matchedPunchLogs.length + matchedSubjectRecords.length})
                          </p>

                          {/* Daily Punch Logs */}
                          {matchedPunchLogs.map((log) => (
                            <button
                              key={`p-${log.id}`}
                              onClick={() => {
                                setActiveTab('dashboard');
                                setIsSearchOpen(false);
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/10 text-slate-200 transition-all cursor-pointer"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs font-bold text-white shrink-0">{log.date}</span>
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                                    {log.status}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 truncate max-w-[210px]">
                                  {log.location || 'Punch Log'} {log.notes ? `• ${log.notes}` : ''}
                                </p>
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold shrink-0">Punch Log</span>
                            </button>
                          ))}

                          {/* Subject Class Attendance Records */}
                          {matchedSubjectRecords.map((rec) => {
                            const sub = subjects.find((s) => s.id === rec.subjectId);
                            return (
                              <button
                                key={`r-${rec.id}`}
                                onClick={() => {
                                  setActiveTab('reports');
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                }}
                                className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/10 text-slate-200 transition-all cursor-pointer"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-xs font-bold text-white shrink-0">{rec.date}</span>
                                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                      rec.status === 'present' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                                    }`}>
                                      {rec.status}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[210px]">
                                    {sub?.name || 'Class'} {rec.notes ? `• ${rec.notes}` : ''}
                                  </p>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold shrink-0">Class Record</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CENTER SECTION: Navigation Items */}
        <nav className="hidden min-[1000px]:flex items-center gap-0.5 xl:gap-1 shrink-0 whitespace-nowrap">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isAdmin = item.id === 'admin';

            const handleNavClick = () => {
              if (isAdmin && authUser?.role !== 'admin') {
                if (onOpenAuth) onOpenAuth();
                else setActiveTab('admin');
              } else {
                setActiveTab(item.id);
              }
            };

            return (
              <button
                key={item.id}
                onClick={handleNavClick}
                className={`h-[34px] flex items-center gap-1 xl:gap-1.5 px-2 xl:px-2.5 rounded-lg text-[11px] xl:text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                  isAdmin
                    ? isActive
                      ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-purple-500/25 border border-purple-400/40'
                      : 'bg-purple-600/20 text-purple-200 border border-purple-500/30 hover:bg-purple-600/30 hover:text-white'
                    : isActive
                      ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-purple-500/25 border border-purple-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.08] bg-white/[0.03] border border-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isAdmin ? 'text-amber-300 animate-pulse' : isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1 py-0.2 text-[7px] xl:text-[8px] font-black rounded-full shadow-sm ${
                    isAdmin
                      ? 'bg-gradient-to-r from-amber-500 to-purple-500 text-white'
                      : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* MORE / PRODUCTIVITY DROPDOWN MENU */}
          <div className="relative shrink-0" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`h-[34px] flex items-center gap-1 xl:gap-1.5 px-2 xl:px-2.5 rounded-lg text-[11px] xl:text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                isSecondaryActive || showMoreMenu
                  ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08] bg-white/[0.03] border border-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>More</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showMoreMenu ? 'rotate-180 text-purple-300' : 'text-slate-400'}`} />
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-[44px] w-60 p-2 bg-slate-900/95 dark:bg-slate-950/95 border border-white/15 rounded-xl shadow-2xl backdrop-blur-2xl z-50 space-y-1"
                >
                  <div className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400 border-b border-white/10 mb-1">
                    Productivity & Tools
                  </div>
                  {secondaryNavItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = activeTab === subItem.id;
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          setActiveTab(subItem.id);
                          setShowMoreMenu(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${
                          isSubActive
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold shadow-md'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className={`p-1 rounded-md ${isSubActive ? 'bg-white/20' : 'bg-white/5 text-purple-400'}`}>
                          <SubIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-none">{subItem.label}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 leading-none">{subItem.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* RIGHT SECTION: Controls, Streak, Theme, Notifications & User Profile */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 whitespace-nowrap">
          
          {/* Countdown / Streak Badge */}
          <div
            onClick={() => setActiveTab('gamification')}
            className="h-[34px] px-2 sm:px-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:scale-105 hover:bg-orange-500/20 transition-all shadow-sm shrink-0 whitespace-nowrap"
            title="Current Attendance Streak"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-pulse shrink-0" />
            <span className="hidden xl:inline">{profile.streak} Days</span>
            <span className="xl:hidden">{profile.streak}d</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="h-[34px] w-[34px] rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 shrink-0 cursor-pointer"
            title="Toggle Theme Mode"
          >
            {effectiveDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-purple-400" />}
          </button>

          {/* Notifications Button */}
          <div className="relative shrink-0" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="h-[34px] w-[34px] rounded-lg bg-white/5 border border-white/10 flex items-center justify-center relative text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 shrink-0 cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                </>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  className="absolute right-0 top-[42px] w-72 bg-slate-900/95 border border-white/15 rounded-xl shadow-2xl p-3 z-50 backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-between mb-2.5 border-b border-white/10 pb-1.5">
                    <h4 className="font-extrabold text-xs text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-purple-400" /> Attendance Alerts
                    </h4>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${
                      unreadCount > 0
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {unreadCount > 0 ? `${unreadCount} Action Needed` : 'All Clear'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs max-h-64 overflow-y-auto">
                    {dynamicNotifications.length > 0 ? (
                      dynamicNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (notif.actionTab) setActiveTab(notif.actionTab);
                            setShowNotifications(false);
                          }}
                          className={`p-2 rounded-lg border text-slate-200 cursor-pointer transition-all hover:scale-[1.01] ${
                            notif.type === 'critical'
                              ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                              : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                        >
                          <p className={`font-bold text-xs ${notif.type === 'critical' ? 'text-red-300' : 'text-amber-300'}`}>
                            {notif.title}
                          </p>
                          <p className="text-slate-300 text-[10px] mt-0.5 leading-snug">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-center space-y-1">
                        <p className="font-bold text-xs">🎉 All Targets Met!</p>
                        <p className="text-[10px] text-emerald-300/80">
                          Your attendance across all subjects and daily punches is above {target}%.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Chip */}
          <div className="relative shrink-0" ref={userMenuRef}>
            <button
              onClick={() => {
                if (authUser) {
                  setShowUserMenu(!showUserMenu);
                } else if (onOpenAuth) {
                  onOpenAuth();
                }
              }}
              className="h-[34px] px-1.5 sm:px-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5 hover:bg-white/10 cursor-pointer transition-all shrink-0 whitespace-nowrap"
              title={authUser ? "Account Profile & Settings" : "Sign In / Register"}
            >
              <div className="w-5.5 h-5.5 rounded-md bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-black shadow-sm relative border border-white/20 overflow-hidden shrink-0">
                {authUser?.photoURL ? (
                  <img src={authUser.photoURL} alt={authUser.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <GraduationCap className="w-3 h-3" />
                )}
                {authUser?.isVerified && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full border border-slate-900" />
                )}
              </div>
              <div className="hidden 2xl:block text-left">
                <p className="text-[11px] font-extrabold text-white truncate max-w-[80px]">
                  {authUser ? (authUser.fullName || 'User') : 'Guest'}
                </p>
              </div>
            </button>

            {/* User Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && authUser && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  className="absolute right-0 top-[42px] w-72 bg-slate-900/98 border border-white/15 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-2xl space-y-3"
                >
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm border border-white/20 overflow-hidden shrink-0 shadow-md">
                      {authUser.photoURL ? (
                        <img src={authUser.photoURL} alt={authUser.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span>{authUser.fullName ? authUser.fullName.charAt(0) : 'U'}</span>
                      )}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-black text-white truncate">{authUser.fullName || 'User'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{authUser.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider ${
                          authUser.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {authUser.role === 'admin' ? 'Super Admin' : 'Student'}
                        </span>
                        {authUser.isVerified ? (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Verified
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    {onOpenOnboarding && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenOnboarding();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 text-left font-semibold transition-all cursor-pointer"
                      >
                        <GraduationCap className="w-4 h-4 text-purple-400" />
                        <span>Edit Education Profile</span>
                      </button>
                    )}

                    {authUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveTab('admin');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 text-left font-semibold transition-all cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span>Admin Panel</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setActiveTab('settings');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 text-left font-semibold transition-all cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-blue-400" />
                      <span>Account Settings</span>
                    </button>
                  </div>

                  {onLogout && (
                    <div className="pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-bold text-xs transition-all cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`h-[34px] w-[34px] rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all shrink-0 cursor-pointer ${
              activeTab === 'settings' ? 'bg-purple-600/30 text-purple-300 border-purple-500/40' : ''
            }`}
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Auth Button for Guest Users */}
          {!authUser && (
            <button
              onClick={onOpenAuth}
              className="h-[34px] px-2.5 sm:px-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-extrabold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all border border-purple-400/30 shrink-0 whitespace-nowrap cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" /> <span className="hidden lg:inline">Sign In</span>
            </button>
          )}

          {/* Hamburger Toggle (below 1000px) */}
          <button
            onClick={() => setShowMobileDrawer(!showMobileDrawer)}
            className="min-[1000px]:hidden h-[34px] w-[34px] rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all shrink-0 cursor-pointer"
            title="Toggle Menu"
          >
            {showMobileDrawer ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* MOBILE / TABLET SLIDE-OUT DRAWER (below 1000px) */}
      <AnimatePresence>
        {showMobileDrawer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="min-[1000px]:hidden overflow-hidden rounded-[20px] bg-slate-950/95 border border-white/15 p-4 backdrop-blur-2xl shadow-2xl space-y-4"
            style={{
              width: 'calc(100% - 24px)',
              maxWidth: '1500px',
              margin: '6px auto',
            }}
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-2">Primary Navigation</p>
              <div className="grid grid-cols-2 gap-2">
                {primaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isAdmin = item.id === 'admin';
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (isAdmin && authUser?.role !== 'admin') {
                          if (onOpenAuth) onOpenAuth();
                          else setActiveTab('admin');
                        } else {
                          setActiveTab(item.id);
                        }
                        setShowMobileDrawer(false);
                      }}
                      className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-2">Tools & Analytics</p>
              <div className="grid grid-cols-2 gap-2">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setShowMobileDrawer(false);
                      }}
                      className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Logout Action Row inside Mobile Drawer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-black shrink-0 border border-white/20 overflow-hidden">
                  {authUser?.photoURL ? (
                    <img src={authUser.photoURL} alt={authUser.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{authUser?.fullName ? authUser.fullName.charAt(0) : 'U'}</span>
                  )}
                </div>
                <div className="text-left truncate">
                  <p className="text-xs font-extrabold text-white truncate">{authUser ? (authUser.fullName || 'User') : 'Guest User'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{authUser ? (authUser.email || 'Student Account') : 'Not signed in'}</p>
                </div>
              </div>

              {authUser ? (
                <button
                  onClick={() => {
                    setShowMobileDrawer(false);
                    if (onLogout) onLogout();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowMobileDrawer(false);
                    if (onOpenAuth) onOpenAuth();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div 
        className="min-[1000px]:hidden flex items-center justify-around bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl px-2 py-2 shadow-2xl overflow-x-auto scrollbar-none"
        style={{
          width: 'calc(100% - 24px)',
          maxWidth: '1500px',
          margin: '6px auto 0 auto',
        }}
      >
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAdmin = item.id === 'admin';
          return (
            <button
              key={item.id}
              onClick={() => {
                if (isAdmin && authUser?.role !== 'admin') {
                  if (onOpenAuth) onOpenAuth();
                  else setActiveTab('admin');
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
                isActive ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
