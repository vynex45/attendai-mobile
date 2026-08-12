export type EducationType =
  | 'school'
  | 'college'
  | 'university'
  | 'diploma'
  | 'coaching'
  | 'competitive';

export type UserRole = 'student' | 'teacher' | 'admin';
export type AuthProvider = 'phone' | 'email' | 'magic_link';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  provider: AuthProvider;
  rememberMe: boolean;
  createdAt: string;
  lastLoginAt: string;
  photoURL?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

export type DailyPunchStatus =
  | 'present'
  | 'late'
  | 'half_day'
  | 'absent'
  | 'leave'
  | 'medical_leave'
  | 'holiday';

export interface DailyPunchLog {
  id: string;
  date: string; // YYYY-MM-DD
  punchInTime?: string; // e.g. "09:15 AM"
  punchOutTime?: string; // e.g. "05:00 PM"
  totalHours?: number; // e.g. 7.75
  status: DailyPunchStatus;
  location?: 'Campus' | 'Online' | 'Library' | 'Lab' | 'Off-campus';
  notes?: string;
  isPunchedIn: boolean;
}

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'leave'
  | 'medical_leave'
  | 'holiday'
  | 'cancelled'
  | 'late'
  | 'practical'
  | 'lab'
  | 'seminar'
  | 'workshop'
  | 'tutorial';

export interface NotificationSettings {
  dailyReminder: boolean;
  lowAttendanceAlert: boolean;
  examReminder: boolean;
  holidayReminder: boolean;
  reminderTime?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  educationType: EducationType;
  board?: string;
  classGrade?: string;
  stream?: string;
  section?: string;
  rollNumber?: string;
  schoolName?: string;
  academicYear?: string;
  degree?: string;
  course?: string;
  year?: string;
  semester?: string;
  department?: string;
  collegeName?: string;
  universityName?: string;
  institutionName: string;
  targetPercentage: number;
  xp: number;
  level: number;
  streak: number;
  theme: string;
  language: string;
  coins: number;
  isPremium: boolean;
  isOnboarded: boolean;
  notifications?: NotificationSettings;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  teacherName?: string;
  roomNumber?: string;
  credits?: number;
  color: string;
  minAttendance: number;
  totalClasses: number;
  attendedClasses: number;
  missedClasses: number;
  leaveClasses: number;
  medicalLeaveClasses: number;
  lateClasses: number;
  isArchived?: boolean;
  weeklySchedule?: string;
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
  timeSlot?: string;
  mode?: 'online' | 'offline';
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  time: string;
  subjectId: string;
  subjectName: string;
  room?: string;
  teacher?: string;
  type?: 'Lecture' | 'Practical' | 'Tutorial' | 'Lab' | 'Seminar';
}

export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string;
  date: string;
  time: string;
  room?: string;
  preparationPercent: number;
}

export type HolidayCategory =
  | 'weekly'
  | 'national'
  | 'festival'
  | 'school'
  | 'college'
  | 'university'
  | 'custom'
  | 'emergency';

export interface AcademicHoliday {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD for multi-day breaks
  type: HolidayCategory;
  isWorkingOverride?: boolean; // Admin override if class is conducted on holiday
  description?: string;
  institutionScope?: EducationType | 'all';
}

export interface AcademicSession {
  id: string;
  name: string;
  startDate: string; // e.g. "2026-07-25"
  endDate: string; // e.g. "2027-05-02"
  autoHolidayDetection: boolean;
  weeklyOffDays: number[]; // 0 = Sunday, 6 = Saturday
  secondSaturdayOff: boolean;
  institutionName?: string;
}

export interface Holiday {
  id: string;
  title: string;
  date: string;
  type: 'government' | 'school' | 'custom';
}

export interface Note {
  id: string;
  subjectId?: string;
  title: string;
  content: string;
  date: string;
  tags?: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  dateUnlocked?: string;
  isUnlocked: boolean;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  overallPercentage: number;
  streak: number;
  level: number;
  xp: number;
  isUser?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actions?: { label: string; actionKey: string }[];
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'success' | 'tip' | 'strategy';
  subjectName?: string;
  title: string;
  message: string;
  actionText?: string;
}
