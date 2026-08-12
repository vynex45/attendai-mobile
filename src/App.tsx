import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { SubjectManager } from './components/SubjectManager';
import { AttendanceCalculator } from './components/AttendanceCalculator';
import { AIChatbot } from './components/AIChatbot';
import { CalendarView } from './components/CalendarView';
import { TimetableGrid } from './components/TimetableGrid';
import { AnalyticsView } from './components/AnalyticsView';
import { AssignmentsExams } from './components/AssignmentsExams';
import { GamificationView } from './components/GamificationView';
import { ProfileView } from './components/ProfileView';
import { ReportsView } from './components/ReportsView';
import { AdminPanelView } from './components/AdminPanelView';
import { AcademicCalendarModal } from './components/AcademicCalendarModal';

import {
  getStoredProfile,
  saveProfile,
  getStoredSubjects,
  saveSubjects,
  getStoredRecords,
  saveRecords,
  getStoredPunchLogs,
  savePunchLogs,
  getStoredTimetable,
  saveTimetable,
  getStoredAssignments,
  saveAssignments,
  getStoredExams,
  saveExams,
  getStoredInsights,
  saveInsights,
  getStoredAcademicSession,
  saveAcademicSession,
  getStoredAcademicHolidays,
  saveAcademicHolidays,
  addAttendanceRecord,
  markAllPresentToday,
  resetAllData,
  purgePreAug1Data,
} from './services/storage';

import {
  getCurrentSession,
  logoutUser,
  refreshUserSession,
  fetchOrCreatePhoneUserDoc,
  createSession,
} from './services/auth';
import { supabase, isSupabaseConfigured } from './services/supabase';

import {
  StudentProfile,
  Subject,
  AttendanceRecord,
  DailyPunchLog,
  TimetableSlot,
  Assignment,
  Exam,
  AIInsight,
  AuthUser,
  AuthSession,
  AcademicSession,
  AcademicHoliday,
} from './types';

export function App() {
  const [profile, setProfileState] = useState<StudentProfile>(getStoredProfile());
  const [subjects, setSubjectsState] = useState<Subject[]>(getStoredSubjects());
  const [records, setRecordsState] = useState<AttendanceRecord[]>(getStoredRecords());
  const [punchLogs, setPunchLogsState] = useState<DailyPunchLog[]>(getStoredPunchLogs());
  const [timetable, setTimetableState] = useState<TimetableSlot[]>(getStoredTimetable());
  const [assignments, setAssignmentsState] = useState<Assignment[]>(getStoredAssignments());
  const [exams, setExamsState] = useState<Exam[]>(getStoredExams());
  const [insights, setInsightsState] = useState<AIInsight[]>(getStoredInsights());
  const [session, setSessionState] = useState<AcademicSession>(getStoredAcademicSession());
  const [academicHolidays, setAcademicHolidaysState] = useState<AcademicHoliday[]>(getStoredAcademicHolidays());
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  const updateAcademicSession = (updated: AcademicSession) => {
    setSessionState(updated);
    saveAcademicSession(updated);
  };

  const updateAcademicHolidays = (updated: AcademicHoliday[]) => {
    setAcademicHolidaysState(updated);
    saveAcademicHolidays(updated);
  };

  // Authentication State
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Initialize and verify session on load + purge pre-Aug 1 data
  useEffect(() => {
    // Purge records prior to August 1, 2026 for Academic Year 2026-2027
    const { cleanedRecords, cleanedPunches, cleanedSession, cleanedSubjects } = purgePreAug1Data();
    setRecordsState(cleanedRecords);
    setPunchLogsState(cleanedPunches);
    setSessionState(cleanedSession);
    if (cleanedSubjects && cleanedSubjects.length > 0) {
      setSubjectsState(cleanedSubjects);
    }

    const session = getCurrentSession();
    if (session) {
      setAuthUser(session.user);
      refreshUserSession();
      if (!profile.isOnboarded) {
        setShowOnboarding(true);
      }
    } else {
      // Prompt user login
      setShowAuthModal(true);
    }

    // Subscribe to Supabase auth state changes
    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, sbSession) => {
        if (event === 'SIGNED_IN' && sbSession?.user) {
          const phone = sbSession.user.phone || '';
          const uid = sbSession.user.id;
          if (phone) {
            const user = await fetchOrCreatePhoneUserDoc(uid, phone, 'student');
            createSession(user, true);
            setAuthUser(user);
            setShowAuthModal(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setAuthUser(null);
        }
      });

      return () => {
        authListener?.subscription.unsubscribe();
      };
    }
  }, []);

  const handleAuthSuccess = (user: AuthUser, session: AuthSession) => {
    setAuthUser(user);
    setShowAuthModal(false);

    // Sync profile name & email
    const updatedProf: StudentProfile = {
      ...profile,
      id: user.id,
      name: user.fullName,
      email: user.email,
    };
    setProfileState(updatedProf);
    saveProfile(updatedProf);

    if (!updatedProf.isOnboarded) {
      setShowOnboarding(true);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setAuthUser(null);
    const updatedProf: StudentProfile = {
      ...profile,
      name: 'Guest',
      email: '',
    };
    setProfileState(updatedProf);
    saveProfile(updatedProf);
    setShowAuthModal(true);
  };

  const updatePunchLogs = (updated: DailyPunchLog[]) => {
    setPunchLogsState(updated);
    savePunchLogs(updated);
  };

  const handlePunchIn = (location: DailyPunchLog['location'] = 'Campus', notes?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const existingIdx = punchLogs.findIndex((p) => p.date === todayStr);
    let updatedLogs = [...punchLogs];

    if (existingIdx >= 0) {
      updatedLogs[existingIdx] = {
        ...updatedLogs[existingIdx],
        punchInTime: timeStr,
        isPunchedIn: true,
        status: 'present',
        location: location || updatedLogs[existingIdx].location,
        notes: notes || updatedLogs[existingIdx].notes,
      };
    } else {
      updatedLogs.unshift({
        id: `punch-${todayStr}-${Date.now()}`,
        date: todayStr,
        punchInTime: timeStr,
        isPunchedIn: true,
        status: 'present',
        location: location || 'Campus',
        notes: notes || 'Punched in for today',
      });
    }

    updatePunchLogs(updatedLogs);

    // Reward XP & Streak
    updateProfile({
      ...profile,
      xp: profile.xp + 15,
      streak: profile.streak + 1,
    });
  };

  const handlePunchOut = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const existingIdx = punchLogs.findIndex((p) => p.date === todayStr);
    let updatedLogs = [...punchLogs];

    if (existingIdx >= 0) {
      const existing = updatedLogs[existingIdx];
      let totalHrs = 8.0;
      if (existing.punchInTime) {
        // approximate hours
        totalHrs = 7.5;
      }

      updatedLogs[existingIdx] = {
        ...existing,
        punchOutTime: timeStr,
        totalHours: totalHrs,
        isPunchedIn: false,
      };
      updatePunchLogs(updatedLogs);
    }
  };

  const handleMarkDailyStatus = (date: string, status: DailyPunchLog['status'], notes?: string) => {
    const existingIdx = punchLogs.findIndex((p) => p.date === date);
    let updatedLogs = [...punchLogs];

    if (existingIdx >= 0) {
      updatedLogs[existingIdx] = {
        ...updatedLogs[existingIdx],
        status,
        notes: notes || updatedLogs[existingIdx].notes,
      };
    } else {
      updatedLogs.unshift({
        id: `punch-${date}-${Date.now()}`,
        date,
        status,
        isPunchedIn: false,
        notes: notes || 'Daily status marked',
      });
    }

    updatePunchLogs(updatedLogs);
  };

  // Sync state changes to storage
  const updateProfile = (updated: StudentProfile) => {
    setProfileState(updated);
    saveProfile(updated);
  };

  const handleUpdateTarget = (newTarget: number) => {
    const updated = { ...profile, targetPercentage: newTarget };
    updateProfile(updated);
  };

  const updateSubjects = (updated: Subject[]) => {
    setSubjectsState(updated);
    saveSubjects(updated);
  };

  const handleMarkAttendance = (subjectId: string, status: AttendanceRecord['status'], date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const { updatedSubjects, updatedRecords } = addAttendanceRecord(
      subjects,
      records,
      subjectId,
      targetDate,
      status
    );

    updateSubjects(updatedSubjects);
    setRecordsState(updatedRecords);
    saveRecords(updatedRecords);

    // Give XP for attendance
    if (status === 'present') {
      const newXp = profile.xp + 10;
      updateProfile({ ...profile, xp: newXp });
    }
  };

  const handleMarkAllPresent = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const { updatedSubjects, updatedRecords } = markAllPresentToday(
      subjects,
      records,
      todayStr
    );

    updateSubjects(updatedSubjects);
    setRecordsState(updatedRecords);
    saveRecords(updatedRecords);

    // Boost XP and Streak
    updateProfile({
      ...profile,
      xp: profile.xp + subjects.length * 10,
      streak: profile.streak + 1,
    });
  };

  const handleSaveSubject = (sub: Subject) => {
    const exists = subjects.some((s) => s.id === sub.id);
    let updated: Subject[];
    if (exists) {
      updated = subjects.map((s) => (s.id === sub.id ? sub : s));
    } else {
      updated = [...subjects, sub];
    }
    updateSubjects(updated);
  };

  const handleDeleteSubject = (subjectId: string) => {
    const updated = subjects.filter((s) => s.id !== subjectId);
    updateSubjects(updated);
  };

  const handleImportSubjects = (newSubs: Subject[]) => {
    updateSubjects(newSubs);
  };

  const handleAddTimetableSlot = (slot: TimetableSlot) => {
    const updated = [...timetable, slot];
    setTimetableState(updated);
    saveTimetable(updated);
  };

  const handleAddAssignment = (as: Assignment) => {
    const updated = [...assignments, as];
    setAssignmentsState(updated);
    saveAssignments(updated);
  };

  const handleAddExam = (ex: Exam) => {
    const updated = [...exams, ex];
    setExamsState(updated);
    saveExams(updated);
  };

  const handleResetApp = () => {
    if (window.confirm('Are you sure you want to reset all attendance data?')) {
      resetAllData();
      window.location.reload();
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#030712] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200' : 'bg-slate-50 text-slate-900'} transition-colors duration-300 font-sans relative overflow-x-hidden`}>
      
      {/* Background Ambient Aurora Orbs */}
      {isDarkMode && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[120px] animate-aurora" />
          <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[140px] animate-aurora-reverse" />
          <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[150px] animate-aurora" />
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        </div>
      )}
      
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={authUser ? () => setShowAuthModal(false) : undefined}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Onboarding Modal */}
      {showOnboarding && authUser?.isVerified && (
        <OnboardingModal
          profile={profile}
          onSaveProfile={(updated) => {
            updateProfile(updated);
            setShowOnboarding(false);
          }}
        />
      )}

      {/* Main Sticky Navbar */}
      <Navbar
        profile={profile}
        authUser={authUser}
        subjects={subjects}
        records={records}
        punchLogs={punchLogs}
        onLogout={handleLogout}
        onOpenAuth={() => {
          setShowAuthModal(true);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Hero Section on Landing/Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        {activeTab === 'dashboard' && (
          <HeroSection
            profile={profile}
            setActiveTab={setActiveTab}
          />
        )}
      </div>

      {/* Dynamic Academic Calendar & Holiday Manager Modal */}
      {showCalendarModal && (
        <AcademicCalendarModal
          isOpen={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
          session={session}
          onSaveSession={updateAcademicSession}
          holidays={academicHolidays}
          onSaveHolidays={updateAcademicHolidays}
          isAdmin={authUser?.role === 'admin'}
        />
      )}

      {/* Main Dynamic View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            profile={profile}
            subjects={subjects}
            punchLogs={punchLogs}
            timetable={timetable}
            insights={insights}
            session={session}
            holidays={academicHolidays}
            onPunchIn={handlePunchIn}
            onPunchOut={handlePunchOut}
            onMarkDailyStatus={handleMarkDailyStatus}
            setActiveTab={setActiveTab}
            onOpenCalendarModal={() => setShowCalendarModal(true)}
            onUpdateTarget={handleUpdateTarget}
            onMarkSubjectAttendance={handleMarkAttendance}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectManager
            subjects={subjects}
            records={records}
            onSaveSubject={(sub) => {
              const idx = subjects.findIndex((s) => s.id === sub.id);
              let updated = [...subjects];
              if (idx >= 0) updated[idx] = sub;
              else updated.push(sub);
              updateSubjects(updated);
            }}
            onDeleteSubject={(subId) => {
              updateSubjects(subjects.filter((s) => s.id !== subId));
            }}
            onClearAllSubjects={() => {
              updateSubjects([]);
            }}
            targetPercentage={profile.targetPercentage}
          />
        )}

        {activeTab === 'calculator' && (
          <AttendanceCalculator
            subjects={subjects}
            targetPercentage={profile.targetPercentage}
          />
        )}

        {activeTab === 'ai-assistant' && (
          <AIChatbot
            profile={profile}
            subjects={subjects}
            onImportSubjects={handleImportSubjects}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            records={records}
            subjects={subjects}
            session={session}
            holidays={academicHolidays}
            onOpenCalendarModal={() => setShowCalendarModal(true)}
            onSaveHolidays={updateAcademicHolidays}
          />
        )}

        {activeTab === 'timetable' && (
          <TimetableGrid
            timetable={timetable}
            subjects={subjects}
            onAddSlot={handleAddTimetableSlot}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            profile={profile}
            subjects={subjects}
            records={records}
            punchLogs={punchLogs}
          />
        )}

        {(activeTab === 'profile' || activeTab === 'settings') && (
          <ProfileView
            profile={profile}
            onSaveProfile={updateProfile}
            darkMode={isDarkMode}
            setDarkMode={setIsDarkMode}
            subjects={subjects}
            records={records}
            punchLogs={punchLogs}
            authUser={authUser}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanelView
            profile={profile}
            subjects={subjects}
            session={session}
            onSaveSession={updateAcademicSession}
            holidays={academicHolidays}
            onSaveHolidays={updateAcademicHolidays}
            authUser={authUser}
            onOpenCalendarModal={() => setShowCalendarModal(true)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            subjects={subjects}
            profile={profile}
          />
        )}

        {activeTab === 'assignments' && (
          <AssignmentsExams
            assignments={assignments}
            exams={exams}
            subjects={subjects}
            onAddAssignment={handleAddAssignment}
            onAddExam={handleAddExam}
          />
        )}

        {activeTab === 'gamification' && (
          <GamificationView
            profile={profile}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        profile={profile}
        onResetData={handleResetApp}
        setActiveTab={setActiveTab}
        onOpenOnboarding={() => setShowOnboarding(true)}
      />

    </div>
  );
}

export default App;
