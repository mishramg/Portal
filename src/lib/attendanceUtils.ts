import { AttendanceRecord } from '../types';

/**
 * Parses time string (e.g. "10:25 AM", "09:45 AM", "11:15 AM", "14:30") into minutes from midnight (0 - 1439).
 */
export const parseTimeStringToMinutes = (timeStr?: string): number | null => {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const timeOnly = clean.replace(/[AP]M/, '').trim();
  const parts = timeOnly.split(':');
  if (parts.length < 2) return null;

  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

// 10:15 AM = (10 * 60) + 15 = 615 minutes from midnight
export const LATE_THRESHOLD_MINUTES = 10 * 60 + 15; // 615
export const LATE_THRESHOLD_LABEL = '10:15 AM';

/**
 * Returns true if a punch in time occurred strictly after 10:15 AM.
 */
export const isPunchInLate = (punchInTime?: string): boolean => {
  const mins = parseTimeStringToMinutes(punchInTime);
  if (mins === null) return false;
  return mins > LATE_THRESHOLD_MINUTES;
};

/**
 * Returns Monday 00:00:00 to Sunday 23:59:59 dates for the week containing referenceDate.
 */
export const getWeekRange = (referenceDate: Date | string = new Date()) => {
  const d = typeof referenceDate === 'string' ? new Date(referenceDate) : new Date(referenceDate);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diffToMonday = d.getDate() - (day === 0 ? 6 : day - 1);
  
  const monday = new Date(d);
  monday.setDate(diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const mondayStr = monday.toISOString().split('T')[0];
  const sundayStr = sunday.toISOString().split('T')[0];

  return { monday, sunday, mondayStr, sundayStr };
};

/**
 * Filters all late punch-in records for a specific employee within the given week.
 */
export const getLatePunchesForWeek = (
  attendanceRecords: AttendanceRecord[],
  employeeId: string,
  referenceDate: Date | string = new Date()
): AttendanceRecord[] => {
  const { mondayStr, sundayStr } = getWeekRange(referenceDate);

  return attendanceRecords.filter((rec) => {
    if (rec.employeeId !== employeeId) return false;
    if (rec.date < mondayStr || rec.date > sundayStr) return false;
    return isPunchInLate(rec.punchInTime);
  });
};

/**
 * Checks if an employee has reached 3 or more late punch-ins (>10:15 AM) in the specified week.
 */
export const hasThreeOrMoreLatePunchesThisWeek = (
  attendanceRecords: AttendanceRecord[],
  employeeId: string,
  referenceDate: Date | string = new Date()
): boolean => {
  return getLatePunchesForWeek(attendanceRecords, employeeId, referenceDate).length >= 3;
};

/**
 * Retrieves summary of all staff members who have late punches in the current week.
 */
export interface StaffLateSummary {
  employeeId: string;
  employeeName: string;
  department: string;
  lateCount: number;
  isFlagged3x: boolean;
  lateRecords: AttendanceRecord[];
}

export const getWeeklyLateStaffSummaries = (
  attendanceRecords: AttendanceRecord[],
  referenceDate: Date | string = new Date()
): StaffLateSummary[] => {
  const { mondayStr, sundayStr } = getWeekRange(referenceDate);
  const employeeMap = new Map<string, StaffLateSummary>();

  attendanceRecords.forEach((rec) => {
    if (rec.date < mondayStr || rec.date > sundayStr) return;
    if (!isPunchInLate(rec.punchInTime)) return;

    const existing = employeeMap.get(rec.employeeId) || {
      employeeId: rec.employeeId,
      employeeName: rec.employeeName,
      department: rec.department,
      lateCount: 0,
      isFlagged3x: false,
      lateRecords: []
    };

    existing.lateCount += 1;
    existing.lateRecords.push(rec);
    if (existing.lateCount >= 3) {
      existing.isFlagged3x = true;
    }

    employeeMap.set(rec.employeeId, existing);
  });

  return Array.from(employeeMap.values()).sort((a, b) => b.lateCount - a.lateCount);
};
