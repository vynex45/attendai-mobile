import { StudentProfile, Subject, AttendanceRecord, DailyPunchLog } from '../types';

export const downloadCSVFile = (filename: string, csvContent: string) => {
  // UTF-8 BOM \uFEFF ensures proper character encoding in Microsoft Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportCompleteHistoryCSV = (
  profile: StudentProfile,
  subjects: Subject[],
  records: AttendanceRecord[],
  punchLogs: DailyPunchLog[]
) => {
  const safeName = profile.name.replace(/\s+/g, '_') || 'Student';
  const timestamp = new Date().toISOString().split('T')[0];
  
  let csv = `=== ATTENDAI COMPLETE ATTENDANCE HISTORY EXPORT ===\n`;
  csv += `Student Name,"${(profile.name || '').replace(/"/g, '""')}"\n`;
  csv += `Roll / PRN Number,"${(profile.rollNumber || 'N/A').replace(/"/g, '""')}"\n`;
  csv += `Institution,"${(profile.institutionName || 'N/A').replace(/"/g, '""')}"\n`;
  csv += `Target Goal,${profile.targetPercentage}%\n`;
  csv += `Export Date,${timestamp}\n\n`;

  // SECTION 1: SUBJECT ATTENDANCE SUMMARY
  csv += `=== SUBJECT SUMMARY ===\n`;
  csv += `Subject Code,Subject Name,Attended Classes,Total Classes,Attendance Percentage,Target Status\n`;
  if (subjects.length === 0) {
    csv += `No subjects added yet.\n`;
  } else {
    subjects.forEach((sub) => {
      const pct = sub.totalClasses > 0 ? ((sub.attendedClasses / sub.totalClasses) * 100).toFixed(1) : '100.0';
      const status = Number(pct) >= profile.targetPercentage ? 'MEETING TARGET' : 'BELOW TARGET';
      csv += `"${sub.code || ''}","${sub.name.replace(/"/g, '""')}",${sub.attendedClasses},${sub.totalClasses},${pct}%,${status}\n`;
    });
  }
  csv += `\n`;

  // SECTION 2: SUBJECT CLASS ATTENDANCE LOGS
  csv += `=== CLASS ATTENDANCE LOGS ===\n`;
  csv += `Date,Subject Code,Subject Name,Status,Time Slot,Mode,Notes\n`;
  if (records.length === 0) {
    csv += `No subject class records logged yet.\n`;
  } else {
    records.forEach((rec) => {
      const sub = subjects.find((s) => s.id === rec.subjectId);
      csv += `"${rec.date}","${sub?.code || ''}","${(sub ? sub.name : 'Subject').replace(/"/g, '""')}","${rec.status}","${rec.timeSlot || ''}","${rec.mode || 'offline'}","${(rec.notes || '').replace(/"/g, '""')}"\n`;
    });
  }
  csv += `\n`;

  // SECTION 3: DAILY PUNCH CHECK-IN LOGS
  csv += `=== DAILY PUNCH CHECK-IN LOGS ===\n`;
  csv += `Date,Status,Punch In Time,Punch Out Time,Logged Hours,Location,Notes\n`;
  if (punchLogs.length === 0) {
    csv += `No daily punch logs recorded yet.\n`;
  } else {
    punchLogs.forEach((log) => {
      csv += `"${log.date}","${log.status}","${log.punchInTime || ''}","${log.punchOutTime || ''}","${log.totalHours || ''}","${log.location || 'Campus'}","${(log.notes || '').replace(/"/g, '""')}"\n`;
    });
  }

  downloadCSVFile(`AttendAI_Full_Attendance_History_${safeName}_${timestamp}.csv`, csv);
};

export const exportDailyPunchLogsCSV = (
  profile: StudentProfile,
  punchLogs: DailyPunchLog[]
) => {
  const safeName = profile.name.replace(/\s+/g, '_') || 'Student';
  const timestamp = new Date().toISOString().split('T')[0];
  let csv = 'Date,Status,Punch In,Punch Out,Total Hours,Location,Notes\n';
  punchLogs.forEach((log) => {
    csv += `"${log.date}","${log.status}","${log.punchInTime || ''}","${log.punchOutTime || ''}","${log.totalHours || ''}","${log.location || 'Campus'}","${(log.notes || '').replace(/"/g, '""')}"\n`;
  });
  downloadCSVFile(`AttendAI_Daily_Punch_Logs_${safeName}_${timestamp}.csv`, csv);
};

export const exportSubjectRecordsCSV = (
  profile: StudentProfile,
  subjects: Subject[],
  records: AttendanceRecord[]
) => {
  const safeName = profile.name.replace(/\s+/g, '_') || 'Student';
  const timestamp = new Date().toISOString().split('T')[0];
  let csv = 'Date,Subject Code,Subject Name,Status,Time Slot,Mode,Notes\n';
  records.forEach((rec) => {
    const sub = subjects.find((s) => s.id === rec.subjectId);
    csv += `"${rec.date}","${sub?.code || ''}","${(sub ? sub.name : 'Subject').replace(/"/g, '""')}","${rec.status}","${rec.timeSlot || ''}","${rec.mode || 'offline'}","${(rec.notes || '').replace(/"/g, '""')}"\n`;
  });
  downloadCSVFile(`AttendAI_Subject_Attendance_${safeName}_${timestamp}.csv`, csv);
};

export const exportSubjectSummaryCSV = (
  profile: StudentProfile,
  subjects: Subject[]
) => {
  const safeName = profile.name.replace(/\s+/g, '_') || 'Student';
  const timestamp = new Date().toISOString().split('T')[0];
  let csv = 'Subject Code,Subject Name,Attended Classes,Total Classes,Attendance %,Target Goal,Status,Shortage / Safe Margin\n';
  subjects.forEach((sub) => {
    const pct = sub.totalClasses > 0 ? Number(((sub.attendedClasses / sub.totalClasses) * 100).toFixed(1)) : 100;
    const goal = sub.minAttendance || profile.targetPercentage;
    const isSafe = pct >= goal;
    const statusStr = isSafe ? 'MEETING TARGET' : 'BELOW THRESHOLD';
    
    // margin calculation
    let marginNote = '';
    if (isSafe) {
      // Bunkable margin
      const safeBunks = Math.max(0, Math.floor((sub.attendedClasses - (goal / 100) * sub.totalClasses) / (goal / 100)));
      marginNote = `${safeBunks} bunks available`;
    } else {
      // Required consecutive attendances
      const reqClasses = Math.ceil(((goal / 100) * sub.totalClasses - sub.attendedClasses) / (1 - goal / 100));
      marginNote = `Need ${Math.max(1, reqClasses)} classes`;
    }

    csv += `"${sub.code || ''}","${sub.name.replace(/"/g, '""')}",${sub.attendedClasses},${sub.totalClasses},${pct}%,${goal}%,"${statusStr}","${marginNote}"\n`;
  });
  downloadCSVFile(`AttendAI_Subject_Summary_${safeName}_${timestamp}.csv`, csv);
};
