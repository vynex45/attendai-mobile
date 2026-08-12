import { AcademicHoliday, AcademicSession, HolidayCategory, EducationType } from '../types';

export const DEFAULT_ACADEMIC_SESSION: AcademicSession = {
  id: 'session-2026-2027',
  name: 'Academic Session 2026–2027',
  startDate: '2026-08-01',
  endDate: '2027-05-02',
  autoHolidayDetection: true,
  weeklyOffDays: [0], // 0 = Sunday
  secondSaturdayOff: true,
  institutionName: 'National Academic Board',
};

// Major Indian Public & Festival Holidays for Session July 25, 2026 - May 2, 2027
export const DEFAULT_PUBLIC_HOLIDAYS: AcademicHoliday[] = [
  {
    id: 'hol-1',
    title: 'Independence Day',
    date: '2026-08-15',
    type: 'national',
    description: 'National holiday commemorating 80th Independence Day of India.',
    institutionScope: 'all',
  },
  {
    id: 'hol-2',
    title: 'Janmashtami',
    date: '2026-09-04',
    type: 'festival',
    description: 'Lord Krishna Jayanti celebration.',
    institutionScope: 'all',
  },
  {
    id: 'hol-3',
    title: 'Mahatma Gandhi Jayanti',
    date: '2026-10-02',
    type: 'national',
    description: 'National holiday honoring Mahatma Gandhi.',
    institutionScope: 'all',
  },
  {
    id: 'hol-4',
    title: 'Dussehra (Vijayadashami)',
    date: '2026-10-20',
    type: 'festival',
    description: 'Vijayadashami festival celebration.',
    institutionScope: 'all',
  },
  {
    id: 'hol-5',
    title: 'Diwali Festival',
    date: '2026-11-08',
    endDate: '2026-11-09',
    type: 'festival',
    description: 'Deepavali festival of lights.',
    institutionScope: 'all',
  },
  {
    id: 'hol-6',
    title: 'Bhai Dooj',
    date: '2026-11-10',
    type: 'festival',
    description: 'Bhai Dooj festival.',
    institutionScope: 'all',
  },
  {
    id: 'hol-7',
    title: 'Guru Nanak Jayanti',
    date: '2026-11-24',
    type: 'festival',
    description: 'Guru Nanak Dev Ji Gurpurab.',
    institutionScope: 'all',
  },
  {
    id: 'hol-8',
    title: 'Christmas Day',
    date: '2026-12-25',
    type: 'national',
    description: 'Christmas celebration holiday.',
    institutionScope: 'all',
  },
  {
    id: 'hol-9',
    title: 'New Year Day',
    date: '2027-01-01',
    type: 'school',
    description: 'New Year academic holiday.',
    institutionScope: 'all',
  },
  {
    id: 'hol-10',
    title: 'Makar Sankranti / Pongal',
    date: '2027-01-14',
    type: 'festival',
    description: 'Harvest festival holiday.',
    institutionScope: 'all',
  },
  {
    id: 'hol-11',
    title: 'Republic Day',
    date: '2027-01-26',
    type: 'national',
    description: 'National holiday celebrating Republic Day of India.',
    institutionScope: 'all',
  },
  {
    id: 'hol-12',
    title: 'Maha Shivratri',
    date: '2027-03-06',
    type: 'festival',
    description: 'Maha Shivratri festival.',
    institutionScope: 'all',
  },
  {
    id: 'hol-13',
    title: 'Eid-ul-Fitr',
    date: '2027-03-10',
    type: 'festival',
    description: 'Ramzan Eid celebration.',
    institutionScope: 'all',
  },
  {
    id: 'hol-14',
    title: 'Holi Festival',
    date: '2027-03-24',
    type: 'festival',
    description: 'Holi festival of colors.',
    institutionScope: 'all',
  },
  {
    id: 'hol-15',
    title: 'Good Friday',
    date: '2027-03-26',
    type: 'national',
    description: 'Good Friday holiday.',
    institutionScope: 'all',
  },
  {
    id: 'hol-16',
    title: 'Ram Navami',
    date: '2027-04-16',
    type: 'festival',
    description: 'Ram Navami festival.',
    institutionScope: 'all',
  },
  {
    id: 'hol-17',
    title: 'Mahavir Jayanti',
    date: '2027-04-19',
    type: 'festival',
    description: 'Mahavir Jayanti holiday.',
    institutionScope: 'all',
  },
  {
    id: 'hol-18',
    title: 'State Foundation Day',
    date: '2027-05-01',
    type: 'custom',
    description: 'State Foundation Day / Labor Day.',
    institutionScope: 'all',
  },
];

// Category Metadata for UI icons & colors
export const HOLIDAY_CATEGORY_META: Record<
  HolidayCategory,
  { label: string; badgeBg: string; textCol: string; borderCol: string; icon: string }
> = {
  weekly: {
    label: 'Weekly Off',
    badgeBg: 'bg-indigo-500/15',
    textCol: 'text-indigo-300',
    borderCol: 'border-indigo-500/30',
    icon: 'Calendar',
  },
  national: {
    label: 'National Holiday',
    badgeBg: 'bg-emerald-500/15',
    textCol: 'text-emerald-300',
    borderCol: 'border-emerald-500/30',
    icon: 'Flag',
  },
  festival: {
    label: 'Festival Holiday',
    badgeBg: 'bg-pink-500/15',
    textCol: 'text-pink-300',
    borderCol: 'border-pink-500/30',
    icon: 'Sparkles',
  },
  school: {
    label: 'School Holiday',
    badgeBg: 'bg-blue-500/15',
    textCol: 'text-blue-300',
    borderCol: 'border-blue-500/30',
    icon: 'School',
  },
  college: {
    label: 'College Holiday',
    badgeBg: 'bg-purple-500/15',
    textCol: 'text-purple-300',
    borderCol: 'border-purple-500/30',
    icon: 'GraduationCap',
  },
  university: {
    label: 'University Break',
    badgeBg: 'bg-cyan-500/15',
    textCol: 'text-cyan-300',
    borderCol: 'border-cyan-500/30',
    icon: 'Building2',
  },
  custom: {
    label: 'Institution Holiday',
    badgeBg: 'bg-amber-500/15',
    textCol: 'text-amber-300',
    borderCol: 'border-amber-500/30',
    icon: 'Award',
  },
  emergency: {
    label: 'Emergency Closure',
    badgeBg: 'bg-red-500/15',
    textCol: 'text-red-300',
    borderCol: 'border-red-500/30',
    icon: 'AlertTriangle',
  },
};

/**
 * Check if a date string YYYY-MM-DD falls into a second Saturday of its month
 */
export function isSecondSaturday(dateObj: Date): boolean {
  if (dateObj.getDay() !== 6) return false; // Not a Saturday
  const dayOfMonth = dateObj.getDate();
  return dayOfMonth >= 8 && dayOfMonth <= 14;
}

/**
 * Check if a date string YYYY-MM-DD falls into a Sunday (0)
 */
export function isSunday(dateObj: Date): boolean {
  return dateObj.getDay() === 0;
}

/**
 * Check if a date string falls within academic session bounds
 */
export function isDateInSession(dateStr: string, session: AcademicSession): boolean {
  return dateStr >= session.startDate && dateStr <= session.endDate;
}

export interface HolidayStatus {
  isHoliday: boolean;
  title?: string;
  category?: HolidayCategory;
  isLocked: boolean;
  isOverride: boolean;
  details?: AcademicHoliday;
  reason?: string;
}

/**
 * Master Holiday Lookup for any date YYYY-MM-DD
 */
export function getHolidayStatusForDate(
  dateStr: string,
  session: AcademicSession,
  holidaysList: AcademicHoliday[]
): HolidayStatus {
  if (!isDateInSession(dateStr, session)) {
    return {
      isHoliday: true,
      title: 'Outside Academic Session',
      category: 'custom',
      isLocked: true,
      isOverride: false,
      reason: 'This date is outside the active academic session bounds (25 July 2026 – 02 May 2027).',
    };
  }

  // 1. Check custom / public holidays list first
  const dateParts = dateStr.split('-');
  const y = parseInt(dateParts[0], 10);
  const m = parseInt(dateParts[1], 10) - 1;
  const d = parseInt(dateParts[2], 10);
  const dateObj = new Date(y, m, d);

  const matchedHoliday = holidaysList.find((h) => {
    if (h.endDate) {
      return dateStr >= h.date && dateStr <= h.endDate;
    }
    return h.date === dateStr;
  });

  if (matchedHoliday) {
    if (matchedHoliday.isWorkingOverride) {
      return {
        isHoliday: false,
        title: `${matchedHoliday.title} (Class Conducted)`,
        category: matchedHoliday.type,
        isLocked: false,
        isOverride: true,
        details: matchedHoliday,
        reason: 'Institution conducting classes on this holiday as an working override.',
      };
    }
    return {
      isHoliday: true,
      title: matchedHoliday.title,
      category: matchedHoliday.type,
      isLocked: true,
      isOverride: false,
      details: matchedHoliday,
      reason: matchedHoliday.description || `${matchedHoliday.title} (${matchedHoliday.type})`,
    };
  }

  // 2. Check automatic weekly holidays
  if (session.autoHolidayDetection) {
    if (isSunday(dateObj) && session.weeklyOffDays.includes(0)) {
      return {
        isHoliday: true,
        title: 'Sunday Weekly Off',
        category: 'weekly',
        isLocked: true,
        isOverride: false,
        reason: 'Automatic non-working weekly holiday (Sunday).',
      };
    }

    if (session.secondSaturdayOff && isSecondSaturday(dateObj)) {
      return {
        isHoliday: true,
        title: 'Second Saturday Off',
        category: 'weekly',
        isLocked: true,
        isOverride: false,
        reason: 'Automatic non-working second Saturday holiday.',
      };
    }
  }

  return {
    isHoliday: false,
    isLocked: false,
    isOverride: false,
  };
}

export interface SessionStats {
  totalSessionDays: number;
  totalSundays: number;
  totalSecondSaturdays: number;
  totalPublicHolidays: number;
  totalCustomHolidays: number;
  totalNonWorkingDays: number;
  totalWorkingTeachingDays: number;
  passedWorkingDays: number;
  remainingWorkingDays: number;
  upcomingHolidays: {
    title: string;
    date: string;
    category: HolidayCategory;
    daysLeft: number;
  }[];
}

/**
 * Calculate full session academic metrics
 */
export function calculateAcademicSessionStats(
  session: AcademicSession,
  holidaysList: AcademicHoliday[],
  currentDateStr: string = '2026-07-25'
): SessionStats {
  const startObj = new Date(session.startDate);
  const endObj = new Date(session.endDate);
  const todayObj = new Date(currentDateStr);

  let totalSessionDays = 0;
  let totalSundays = 0;
  let totalSecondSaturdays = 0;
  let totalPublicHolidays = 0;
  let totalCustomHolidays = 0;
  let totalNonWorkingDays = 0;
  let totalWorkingTeachingDays = 0;
  let passedWorkingDays = 0;
  let remainingWorkingDays = 0;

  const upcomingHolidays: {
    title: string;
    date: string;
    category: HolidayCategory;
    daysLeft: number;
  }[] = [];

  const cur = new Date(startObj);
  while (cur <= endObj) {
    totalSessionDays++;
    const year = cur.getFullYear();
    const month = String(cur.getMonth() + 1).padStart(2, '0');
    const day = String(cur.getDate()).padStart(2, '0');
    const curStr = `${year}-${month}-${day}`;

    const status = getHolidayStatusForDate(curStr, session, holidaysList);

    if (status.isHoliday) {
      totalNonWorkingDays++;
      if (status.category === 'weekly') {
        if (isSunday(cur)) totalSundays++;
        else if (isSecondSaturday(cur)) totalSecondSaturdays++;
      } else if (status.category === 'national' || status.category === 'festival') {
        totalPublicHolidays++;
      } else {
        totalCustomHolidays++;
      }

      // Collect upcoming holidays
      if (curStr >= currentDateStr && upcomingHolidays.length < 8) {
        const diffMs = cur.getTime() - todayObj.getTime();
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (daysLeft >= 0) {
          upcomingHolidays.push({
            title: status.title || 'Holiday',
            date: curStr,
            category: status.category || 'custom',
            daysLeft,
          });
        }
      }
    } else {
      totalWorkingTeachingDays++;
      if (curStr <= currentDateStr) {
        passedWorkingDays++;
      } else {
        remainingWorkingDays++;
      }
    }

    cur.setDate(cur.getDate() + 1);
  }

  return {
    totalSessionDays,
    totalSundays,
    totalSecondSaturdays,
    totalPublicHolidays,
    totalCustomHolidays,
    totalNonWorkingDays,
    totalWorkingTeachingDays,
    passedWorkingDays,
    remainingWorkingDays,
    upcomingHolidays,
  };
}

/**
 * Export Academic Calendar configuration as JSON
 */
export function exportAcademicCalendarJSON(session: AcademicSession, holidays: AcademicHoliday[]): string {
  return JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      academicSession: session,
      holidays: holidays,
    },
    null,
    2
  );
}

/**
 * Import Academic Calendar JSON
 */
export function parseAcademicCalendarJSON(jsonStr: string): {
  session?: AcademicSession;
  holidays?: AcademicHoliday[];
  error?: string;
} {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.academicSession || !Array.isArray(data.holidays)) {
      return { error: 'Invalid academic calendar JSON structure. Must contain academicSession and holidays.' };
    }
    return {
      session: data.academicSession,
      holidays: data.holidays,
    };
  } catch {
    return { error: 'Failed to parse JSON file. Please check syntax.' };
  }
}
