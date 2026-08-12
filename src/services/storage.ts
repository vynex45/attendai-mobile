import { supabase, isSupabaseConfigured } from './supabase';
import { getCurrentSession } from './auth';
import {
  StudentProfile,
  Subject,
  AttendanceRecord,
  DailyPunchLog,
  TimetableSlot,
  Assignment,
  Exam,
  Holiday,
  Badge,
  LeaderboardUser,
  Note,
  AIInsight,
  AcademicSession,
  AcademicHoliday,
  AttendanceStatus,
} from '../types';
import {
  initialProfile,
  initialSubjects,
  generateInitialRecords,
  initialPunchLogs,
  initialTimetable,
  initialAssignments,
  initialExams,
  initialHolidays,
  initialBadges,
  initialLeaderboard,
  initialNotes,
  initialInsights,
} from '../data/mockData';
import {
  DEFAULT_ACADEMIC_SESSION,
  DEFAULT_PUBLIC_HOLIDAYS,
} from './academicCalendar';

const KEYS = {
  PROFILE: 'attendai_profile_v1',
  SUBJECTS: 'attendai_subjects_v1',
  RECORDS: 'attendai_records_v1',
  PUNCH_LOGS: 'attendai_punch_logs_v1',
  TIMETABLE: 'attendai_timetable_v1',
  ASSIGNMENTS: 'attendai_assignments_v1',
  EXAMS: 'attendai_exams_v1',
  HOLIDAYS: 'attendai_holidays_v1',
  ACADEMIC_SESSION: 'attendai_academic_session_v1',
  ACADEMIC_HOLIDAYS: 'attendai_academic_holidays_v1',
  BADGES: 'attendai_badges_v1',
  LEADERBOARD: 'attendai_leaderboard_v1',
  NOTES: 'attendai_notes_v1',
  INSIGHTS: 'attendai_insights_v1',
  THEME: 'attendai_theme_v1',
};

// Safe JSON Parse helper
function getItem<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('LocalStorage error:', e);
  }
}

export const StorageService = {
  getProfile: (): StudentProfile => getItem(KEYS.PROFILE, initialProfile),
  saveProfile: (p: StudentProfile) => {
    setItem(KEYS.PROFILE, p);
    // Push to Supabase if configured & user authenticated
    const session = getCurrentSession();
    if (isSupabaseConfigured && session?.user?.id) {
      Promise.resolve(
        supabase.from('students').upsert({
          user_id: session.user.id,
          name: p.name,
          email: p.email,
          avatar: p.avatar,
          education_type: p.educationType,
          institution_name: p.institutionName,
          target_percentage: p.targetPercentage,
          xp: p.xp,
          level: p.level,
          streak: p.streak,
          theme: p.theme,
          coins: p.coins,
          is_premium: p.isPremium,
          is_onboarded: p.isOnboarded,
          notifications: p.notifications,
          updated_at: new Date().toISOString(),
        })
      ).catch((err) => console.warn('Supabase student sync notice:', err));
    }
  },

  getSubjects: (): Subject[] => getItem(KEYS.SUBJECTS, initialSubjects),
  saveSubjects: (s: Subject[]) => {
    setItem(KEYS.SUBJECTS, s);
    const session = getCurrentSession();
    if (isSupabaseConfigured && session?.user?.id) {
      const rows = s.map((sub) => ({
        id: sub.id,
        user_id: session.user.id,
        name: sub.name,
        code: sub.code || '',
        teacher_name: sub.teacherName || '',
        room_number: sub.roomNumber || '',
        credits: sub.credits || 3,
        color: sub.color,
        min_attendance: sub.minAttendance,
        total_classes: sub.totalClasses,
        attended_classes: sub.attendedClasses,
        missed_classes: sub.missedClasses,
        leave_classes: sub.leaveClasses || 0,
        medical_leave_classes: sub.medicalLeaveClasses || 0,
        late_classes: sub.lateClasses || 0,
        is_archived: sub.isArchived || false,
        weekly_schedule: sub.weeklySchedule || '',
        updated_at: new Date().toISOString(),
      }));
      Promise.resolve(supabase.from('subjects').upsert(rows)).catch(() => {});
    }
  },

  getRecords: (): AttendanceRecord[] => {
    const raw = getItem<AttendanceRecord[]>(KEYS.RECORDS, generateInitialRecords());
    return raw.filter((r) => r && r.date >= '2026-08-01');
  },
  saveRecords: (r: AttendanceRecord[]) => {
    const valid = r.filter((rec) => rec && rec.date >= '2026-08-01');
    setItem(KEYS.RECORDS, valid);
    const session = getCurrentSession();
    if (isSupabaseConfigured && session?.user?.id) {
      const rows = valid.slice(0, 100).map((rec) => ({
        id: rec.id,
        user_id: session.user.id,
        subject_id: rec.subjectId,
        date: rec.date,
        status: rec.status,
        notes: rec.notes || '',
        time_slot: rec.timeSlot || '',
        mode: rec.mode || 'offline',
        updated_at: new Date().toISOString(),
      }));
      Promise.resolve(supabase.from('attendance').upsert(rows)).catch(() => {});
    }
  },

  getPunchLogs: (): DailyPunchLog[] => {
    const raw = getItem<DailyPunchLog[]>(KEYS.PUNCH_LOGS, initialPunchLogs);
    return raw.filter((p) => p && p.date >= '2026-08-01');
  },
  savePunchLogs: (p: DailyPunchLog[]) => {
    const valid = p.filter((log) => log && log.date >= '2026-08-01');
    setItem(KEYS.PUNCH_LOGS, valid);
  },

  getTimetable: (): TimetableSlot[] => getItem(KEYS.TIMETABLE, initialTimetable),
  saveTimetable: (t: TimetableSlot[]) => {
    setItem(KEYS.TIMETABLE, t);
    const session = getCurrentSession();
    if (isSupabaseConfigured && session?.user?.id) {
      const rows = t.map((slot) => ({
        id: slot.id,
        user_id: session.user.id,
        day: slot.day,
        time: slot.time,
        subject_id: slot.subjectId,
        subject_name: slot.subjectName,
        room: slot.room || '',
        teacher: slot.teacher || '',
        type: slot.type || 'Lecture',
        updated_at: new Date().toISOString(),
      }));
      Promise.resolve(supabase.from('timetable').upsert(rows)).catch(() => {});
    }
  },

  getAssignments: (): Assignment[] => getItem(KEYS.ASSIGNMENTS, initialAssignments),
  saveAssignments: (a: Assignment[]) => {
    setItem(KEYS.ASSIGNMENTS, a);
    const session = getCurrentSession();
    if (isSupabaseConfigured && session?.user?.id) {
      const rows = a.map((item) => ({
        id: item.id,
        user_id: session.user.id,
        subject_id: item.subjectId,
        title: item.title,
        description: item.description || '',
        deadline: item.deadline,
        priority: item.priority || 'medium',
        status: item.status,
        updated_at: new Date().toISOString(),
      }));
      Promise.resolve(supabase.from('assignments').upsert(rows)).catch(() => {});
    }
  },

  getExams: (): Exam[] => getItem(KEYS.EXAMS, initialExams),
  saveExams: (e: Exam[]) => {
    setItem(KEYS.EXAMS, e);
    const session = getCurrentSession();
    if (isSupabaseConfigured && session?.user?.id) {
      const rows = e.map((item) => ({
        id: item.id,
        user_id: session.user.id,
        subject_id: item.subjectId,
        title: item.title,
        date: item.date,
        time: item.time || '',
        room: item.room || '',
        preparation_percent: item.preparationPercent || 0,
        updated_at: new Date().toISOString(),
      }));
      Promise.resolve(supabase.from('exams').upsert(rows)).catch(() => {});
    }
  },

  getHolidays: (): Holiday[] => getItem(KEYS.HOLIDAYS, initialHolidays),
  saveHolidays: (h: Holiday[]) => setItem(KEYS.HOLIDAYS, h),

  getAcademicSession: (): AcademicSession => {
    const sess = getItem<AcademicSession>(KEYS.ACADEMIC_SESSION, DEFAULT_ACADEMIC_SESSION);
    if (!sess || sess.startDate < '2026-08-01') {
      return {
        ...DEFAULT_ACADEMIC_SESSION,
        ...sess,
        startDate: '2026-08-01',
        name: 'Academic Session 2026–2027',
      };
    }
    return sess;
  },
  saveAcademicSession: (s: AcademicSession) => setItem(KEYS.ACADEMIC_SESSION, s),

  getAcademicHolidays: (): AcademicHoliday[] => getItem(KEYS.ACADEMIC_HOLIDAYS, DEFAULT_PUBLIC_HOLIDAYS),
  saveAcademicHolidays: (h: AcademicHoliday[]) => setItem(KEYS.ACADEMIC_HOLIDAYS, h),

  getBadges: (): Badge[] => getItem(KEYS.BADGES, initialBadges),
  saveBadges: (b: Badge[]) => setItem(KEYS.BADGES, b),

  getLeaderboard: (): LeaderboardUser[] => getItem(KEYS.LEADERBOARD, initialLeaderboard),
  saveLeaderboard: (l: LeaderboardUser[]) => setItem(KEYS.LEADERBOARD, l),

  getNotes: (): Note[] => getItem(KEYS.NOTES, initialNotes),
  saveNotes: (n: Note[]) => setItem(KEYS.NOTES, n),

  getInsights: (): AIInsight[] => getItem(KEYS.INSIGHTS, initialInsights),
  saveInsights: (i: AIInsight[]) => setItem(KEYS.INSIGHTS, i),

  resetAllData: () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};

export async function uploadFileToSupabase(file: File, folder: string = 'uploads'): Promise<string> {
  if (!isSupabaseConfigured) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { error } = await supabase.storage.from('attendai-files').upload(filePath, file);
    if (error) throw error;

    const { data: publicData } = supabase.storage.from('attendai-files').getPublicUrl(filePath);
    return publicData.publicUrl;
  } catch (err) {
    console.warn('Supabase storage fallback to data url:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const getProfile = StorageService.getProfile;
export const saveProfile = StorageService.saveProfile;

export const getSubjects = StorageService.getSubjects;
export const saveSubjects = StorageService.saveSubjects;

export const getRecords = StorageService.getRecords;
export const saveRecords = StorageService.saveRecords;

export const getPunchLogs = StorageService.getPunchLogs;
export const savePunchLogs = StorageService.savePunchLogs;

export const getTimetable = StorageService.getTimetable;
export const saveTimetable = StorageService.saveTimetable;

export const getAssignments = StorageService.getAssignments;
export const saveAssignments = StorageService.saveAssignments;

export const getExams = StorageService.getExams;
export const saveExams = StorageService.saveExams;

export const getHolidays = StorageService.getHolidays;
export const saveHolidays = StorageService.saveHolidays;

export const getAcademicSession = StorageService.getAcademicSession;
export const saveAcademicSession = StorageService.saveAcademicSession;

export const getAcademicHolidays = StorageService.getAcademicHolidays;
export const saveAcademicHolidays = StorageService.saveAcademicHolidays;

export const getBadges = StorageService.getBadges;
export const saveBadges = StorageService.saveBadges;

export const getLeaderboard = StorageService.getLeaderboard;
export const saveLeaderboard = StorageService.saveLeaderboard;

export const getNotes = StorageService.getNotes;
export const saveNotes = StorageService.saveNotes;

export const getInsights = StorageService.getInsights;
export const saveInsights = StorageService.saveInsights;
export const resetAllData = StorageService.resetAllData;

// Export aliases for backwards compatibility across components
export const getStoredProfile = StorageService.getProfile;
export const getStoredSubjects = StorageService.getSubjects;
export const getStoredRecords = StorageService.getRecords;
export const getStoredPunchLogs = StorageService.getPunchLogs;
export const getStoredTimetable = StorageService.getTimetable;
export const getStoredAssignments = StorageService.getAssignments;
export const getStoredExams = StorageService.getExams;
export const getStoredInsights = StorageService.getInsights;
export const getStoredAcademicSession = StorageService.getAcademicSession;
export const getStoredAcademicHolidays = StorageService.getAcademicHolidays;

export function purgePreAug1Data() {
  const SESSION_2026_START = '2026-08-01';

  // Filter records >= 2026-08-01
  const rawRecords = getItem<AttendanceRecord[]>(KEYS.RECORDS, []);
  const validRecords = rawRecords.filter((r) => r && r.date >= SESSION_2026_START);
  setItem(KEYS.RECORDS, validRecords);

  // Filter punch logs >= 2026-08-01
  const rawPunches = getItem<DailyPunchLog[]>(KEYS.PUNCH_LOGS, []);
  const validPunches = rawPunches.filter((p) => p && p.date >= SESSION_2026_START);
  setItem(KEYS.PUNCH_LOGS, validPunches);

  // Academic Session
  const sess = getItem<AcademicSession>(KEYS.ACADEMIC_SESSION, DEFAULT_ACADEMIC_SESSION);
  const cleanedSession: AcademicSession = {
    ...sess,
    startDate: SESSION_2026_START,
    name: 'Academic Session 2026–2027',
  };
  setItem(KEYS.ACADEMIC_SESSION, cleanedSession);

  // Synchronize subjects to reflect only valid records >= 2026-08-01
  const subjects = getItem<Subject[]>(KEYS.SUBJECTS, []);
  let updatedSubjects = subjects;
  if (subjects.length > 0) {
    updatedSubjects = subjects.map((sub) => {
      const subRecs = validRecords.filter((r) => r.subjectId === sub.id);
      const attended = subRecs.filter((r) => r.status === 'present').length;
      const missed = subRecs.filter((r) => r.status === 'absent').length;
      const leave = subRecs.filter((r) => r.status === 'leave').length;
      return {
        ...sub,
        totalClasses: subRecs.length,
        attendedClasses: attended,
        missedClasses: missed,
        leaveClasses: leave,
      };
    });
    setItem(KEYS.SUBJECTS, updatedSubjects);
  }

  return {
    cleanedRecords: validRecords,
    cleanedPunches: validPunches,
    cleanedSession,
    cleanedSubjects: updatedSubjects,
  };
}

export function addAttendanceRecord(
  subjects: Subject[],
  records: AttendanceRecord[],
  subjectId: string,
  date: string,
  status: AttendanceStatus
): { updatedSubjects: Subject[]; updatedRecords: AttendanceRecord[] } {
  const existingIdx = records.findIndex((r) => r.subjectId === subjectId && r.date === date);
  let newRecords = [...records];
  const recordId = existingIdx >= 0 ? records[existingIdx].id : `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  const newRecord: AttendanceRecord = {
    id: recordId,
    subjectId,
    date,
    status,
    notes: '',
  };

  if (existingIdx >= 0) {
    newRecords[existingIdx] = newRecord;
  } else {
    newRecords.push(newRecord);
  }

  const updatedSubjects = subjects.map((sub) => {
    if (sub.id !== subjectId) return sub;

    const subRecords = newRecords.filter((r) => r.subjectId === subjectId);
    const attended = subRecords.filter((r) => r.status === 'present').length;
    const missed = subRecords.filter((r) => r.status === 'absent').length;
    const leave = subRecords.filter((r) => r.status === 'leave').length;
    const medical = subRecords.filter((r) => r.status === 'medical_leave').length;
    const late = subRecords.filter((r) => r.status === 'late').length;
    const total = subRecords.filter((r) => r.status !== 'cancelled').length;

    return {
      ...sub,
      totalClasses: total,
      attendedClasses: attended,
      missedClasses: missed,
      leaveClasses: leave,
      medicalLeaveClasses: medical,
      lateClasses: late,
    };
  });

  StorageService.saveRecords(newRecords);
  StorageService.saveSubjects(updatedSubjects);

  return { updatedSubjects, updatedRecords: newRecords };
}

export function markAllPresentToday(
  subjects: Subject[],
  records: AttendanceRecord[],
  date: string
): { updatedSubjects: Subject[]; updatedRecords: AttendanceRecord[] } {
  let currentRecords = [...records];

  subjects.forEach((sub) => {
    if (sub.isArchived) return;
    const existingIdx = currentRecords.findIndex((r) => r.subjectId === sub.id && r.date === date);
    const recId = existingIdx >= 0 ? currentRecords[existingIdx].id : `rec_${Date.now()}_${sub.id}`;
    const newRec: AttendanceRecord = {
      id: recId,
      subjectId: sub.id,
      date,
      status: 'present',
    };
    if (existingIdx >= 0) {
      currentRecords[existingIdx] = newRec;
    } else {
      currentRecords.push(newRec);
    }
  });

  const updatedSubjects = subjects.map((sub) => {
    const subRecords = currentRecords.filter((r) => r.subjectId === sub.id);
    const attended = subRecords.filter((r) => r.status === 'present').length;
    const missed = subRecords.filter((r) => r.status === 'absent').length;
    const leave = subRecords.filter((r) => r.status === 'leave').length;
    const total = subRecords.filter((r) => r.status !== 'cancelled').length;

    return {
      ...sub,
      totalClasses: total,
      attendedClasses: attended,
      missedClasses: missed,
      leaveClasses: leave,
    };
  });

  StorageService.saveRecords(currentRecords);
  StorageService.saveSubjects(updatedSubjects);

  return { updatedSubjects, updatedRecords: currentRecords };
}

export function calculateAttendanceMetrics(
  subjects: Subject[],
  recordsOrTarget?: AttendanceRecord[] | number,
  targetPercentParam?: number
) {
  let records: AttendanceRecord[] = [];
  let targetPercent = 75;

  if (typeof recordsOrTarget === 'number') {
    targetPercent = recordsOrTarget;
  } else if (Array.isArray(recordsOrTarget)) {
    records = recordsOrTarget;
    if (typeof targetPercentParam === 'number') {
      targetPercent = targetPercentParam;
    }
  }

  const activeSubjects = subjects.filter((s) => !s.isArchived);
  let totalConducted = 0;
  let totalAttended = 0;
  let totalMissed = 0;
  let riskCount = 0;

  activeSubjects.forEach((sub) => {
    totalConducted += sub.totalClasses;
    totalAttended += sub.attendedClasses;
    totalMissed += sub.missedClasses;

    const pct = sub.totalClasses > 0 ? (sub.attendedClasses / sub.totalClasses) * 100 : 100;
    if (pct < targetPercent) {
      riskCount++;
    }
  });

  const overallPercentage =
    totalConducted > 0 ? Number(((totalAttended / totalConducted) * 100).toFixed(1)) : 100;

  let requiredClassesToTarget = 0;
  let safeClassesToMiss = 0;

  const P = targetPercent;
  if (overallPercentage < P) {
    const required = Math.ceil((P * totalConducted - 100 * totalAttended) / (100 - P));
    requiredClassesToTarget = Math.max(0, required);
  } else {
    const safe = Math.floor((100 * totalAttended - P * totalConducted) / P);
    safeClassesToMiss = Math.max(0, safe);
  }

  return {
    totalConducted,
    totalAttended,
    totalMissed,
    overallPercentage,
    requiredClassesToTarget,
    safeClassesToMiss,
    riskCount,
  };
}

export const calculateOverallStats = calculateAttendanceMetrics;

export function calculateSubjectPercentage(
  arg1: any,
  arg2?: number
): number {
  if (typeof arg1 === 'object' && arg1 !== null) {
    const total = arg1.totalClasses ?? 0;
    const attended = arg1.attendedClasses ?? 0;
    if (total === 0) return 100;
    return Number(((attended / total) * 100).toFixed(1));
  }
  const attended = Number(arg1) || 0;
  const total = Number(arg2) || 0;
  if (total === 0) return 100;
  return Number(((attended / total) * 100).toFixed(1));
}

export function calculateRequiredForSubject(
  attended: number,
  total: number,
  targetPercent: number
): { required: number; safe: number; pct: number } {
  if (total === 0) return { required: 0, safe: 0, pct: 100 };
  const pct = Number(((attended / total) * 100).toFixed(1));
  const P = targetPercent;

  if (pct < P) {
    const required = Math.ceil((P * total - 100 * attended) / (100 - P));
    return { required: Math.max(0, required), safe: 0, pct };
  } else {
    const safe = Math.floor((100 * attended - P * total) / P);
    return { required: 0, safe: Math.max(0, safe), pct };
  }
}

export function calculateDailyPunchStats(punchLogs: DailyPunchLog[], targetPercent: number) {
  const activeWorkingLogs = punchLogs.filter((l) => l.status !== 'holiday');
  const totalWorkingDays = activeWorkingLogs.length || 1;

  let presentValue = 0;
  let presentDaysCount = 0;
  let lateCount = 0;
  let halfDayCount = 0;
  let absentCount = 0;
  let leaveCount = 0;

  activeWorkingLogs.forEach((log) => {
    if (log.status === 'present') {
      presentValue += 1;
      presentDaysCount++;
    } else if (log.status === 'late') {
      presentValue += 1;
      lateCount++;
    } else if (log.status === 'half_day') {
      presentValue += 0.5;
      halfDayCount++;
    } else if (log.status === 'absent') {
      absentCount++;
    } else if (log.status === 'leave' || log.status === 'medical_leave') {
      leaveCount++;
    }
  });

  const overallPercentage = Number(((presentValue / totalWorkingDays) * 100).toFixed(1));

  let requiredDaysToTarget = 0;
  let safeDaysToSkip = 0;
  const P = targetPercent;

  if (overallPercentage < P) {
    requiredDaysToTarget = Math.max(
      0,
      Math.ceil((P * totalWorkingDays - 100 * presentValue) / (100 - P))
    );
  } else {
    safeDaysToSkip = Math.max(
      0,
      Math.floor((100 * presentValue - P * totalWorkingDays) / P)
    );
  }

  return {
    totalWorkingDays,
    presentValue,
    presentDaysCount,
    lateCount,
    halfDayCount,
    absentCount,
    leaveCount,
    overallPercentage,
    requiredDaysToTarget,
    safeDaysToSkip,
  };
}
