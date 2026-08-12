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
} from '../types';

export const initialPunchLogs: DailyPunchLog[] = [];

export const initialProfile: StudentProfile = {
  id: 'st-user',
  name: '',
  email: '',
  avatar: '',
  educationType: 'college',
  degree: '',
  year: '',
  semester: '',
  department: '',
  collegeName: '',
  institutionName: '',
  targetPercentage: 75,
  xp: 0,
  level: 1,
  streak: 0,
  theme: 'peach-glow',
  language: 'English',
  coins: 0,
  isPremium: false,
  isOnboarded: false,
};

export const initialSubjects: Subject[] = [];

export const generateInitialRecords = (): AttendanceRecord[] => {
  return [];
};

export const initialTimetable: TimetableSlot[] = [];

export const initialAssignments: Assignment[] = [];

export const initialExams: Exam[] = [];

export const initialHolidays: Holiday[] = [];

export const initialBadges: Badge[] = [];

export const initialLeaderboard: LeaderboardUser[] = [];

export const initialNotes: Note[] = [];

export const initialInsights: AIInsight[] = [];
