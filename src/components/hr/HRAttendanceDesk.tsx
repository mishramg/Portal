import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { AttendanceRecord, UserAccount, UserRole, Festival, SiteVisitRecord } from '../../types';
import { 
  getWeeklyLateStaffSummaries, 
  LATE_THRESHOLD_LABEL, 
  isPunchInLate 
} from '../../lib/attendanceUtils';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Search, 
  Plus, 
  Download, 
  Camera, 
  UserCheck, 
  ShieldCheck,
  Building2,
  FileText,
  Cake,
  Gift,
  Sparkles,
  PartyPopper,
  Edit3,
  Trash2,
  UserPlus,
  Phone,
  Mail,
  Key,
  CalendarDays,
  FileSpreadsheet,
  ArrowLeft,
  BellRing
} from 'lucide-react';

import { parseDateOfBirth, MONTH_NAMES } from '../common/BirthdayReminderModal';

interface HRAttendanceDeskProps {
  attendanceRecords: AttendanceRecord[];
  users: UserAccount[];
  festivals?: Festival[];
  siteVisits?: SiteVisitRecord[];
  activeUser: UserAccount;
  onAddAttendance: (record: AttendanceRecord) => void;
  onUpdateAttendanceStatus: (id: string, status: AttendanceRecord['status'], notes?: string) => void;
  onAddFestival?: (fest: Festival) => void;
  onUpdateFestival?: (fest: Festival) => void;
  onDeleteFestival?: (festId: string) => void;
  onAddUser?: (user: UserAccount) => void;
  onUpdateUser?: (user: UserAccount) => void;
  onDeleteUser?: (userId: string) => void;
  onBackToHome?: () => void;
}

export const HRAttendanceDesk: React.FC<HRAttendanceDeskProps> = ({
  attendanceRecords,
  users,
  festivals = [],
  siteVisits = [],
  activeUser,
  onAddAttendance,
  onUpdateAttendanceStatus,
  onAddFestival,
  onUpdateUser,
  onAddUser,
  onDeleteUser,
  onBackToHome
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ATTENDANCE' | 'SITE_VISITS' | 'EMPLOYEES' | 'BIRTHDAYS' | 'FESTIVALS'>('ATTENDANCE');

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visitSearchQuery, setVisitSearchQuery] = useState<string>('');
  const [visitDateFilter, setVisitDateFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  // Modal for Manual Attendance Entry by HR
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newEmpId, setNewEmpId] = useState<string>(users[0]?.id || '');
  const [newStatus, setNewStatus] = useState<AttendanceRecord['status']>('PRESENT');
  const [newPunchIn, setNewPunchIn] = useState<string>('09:00 AM');
  const [newPunchOut, setNewPunchOut] = useState<string>('06:00 PM');
  const [newLocation, setNewLocation] = useState<string>('Kamlawati HQ, Office Floor');
  const [newNotes, setNewNotes] = useState<string>('Manual HR Attendance Entry');

  // Modal for Adding/Editing Employee Details
  const [showEmpModal, setShowEmpModal] = useState<boolean>(false);
  const [editingEmp, setEditingEmp] = useState<UserAccount | null>(null);
  const [selectedBankDetailsEmp, setSelectedBankDetailsEmp] = useState<UserAccount | null>(null);

  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empRole, setEmpRole] = useState<UserRole>('CRM_EMPLOYEE');
  const [empDept, setEmpDept] = useState('Client Relations & Sales');
  const [empDesignation, setEmpDesignation] = useState('Executive');
  const [empPhone, setEmpPhone] = useState('');
  const [empCode, setEmpCode] = useState('');
  const [empDob, setEmpDob] = useState('1995-01-01');
  const [empJoining, setEmpJoining] = useState(new Date().toISOString().split('T')[0]);
  const [empPin, setEmpPin] = useState('123456');

  // Salary & Bank states for add/edit employee
  const [empBasic, setEmpBasic] = useState('50000');
  const [empAnnualSalary, setEmpAnnualSalary] = useState('600000');
  const [empBankName, setEmpBankName] = useState('HDFC Bank');
  const [empAccNo, setEmpAccNo] = useState('');
  const [empIfsc, setEmpIfsc] = useState('');
  const [empPan, setEmpPan] = useState('');
  const [empUan, setEmpUan] = useState('');
  const [empPf, setEmpPf] = useState('');

  // Modal for Adding Festival
  const [showFestModal, setShowFestModal] = useState<boolean>(false);
  const [festName, setFestName] = useState('');
  const [festDate, setFestDate] = useState(new Date().toISOString().split('T')[0]);
  const [festDesc, setFestDesc] = useState('');
  const [festType, setFestType] = useState<'OFFICIAL' | 'OPTIONAL' | 'CORPORATE_EVENT'>('OFFICIAL');

  // Copied Wish State
  const [copiedWishId, setCopiedWishId] = useState<string | null>(null);

  // Filter attendance records
  const filteredRecords = attendanceRecords.filter((rec) => {
    const matchesDate = !selectedDate || rec.date === selectedDate;
    const matchesSearch = 
      rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.locationAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || rec.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;

    return matchesDate && matchesSearch && matchesDept && matchesStatus;
  });

  // Calculate Metrics
  const dateRecords = attendanceRecords.filter((r) => r.date === selectedDate);
  const presentCount = dateRecords.filter((r) => r.status === 'PRESENT' || r.status === 'ON_FIELD').length;
  const onFieldCount = dateRecords.filter((r) => r.status === 'ON_FIELD').length;
  const lateCount = dateRecords.filter((r) => r.status === 'LATE' || isPunchInLate(r.punchInTime)).length;
  const halfDayCount = dateRecords.filter((r) => r.status === 'HALF_DAY').length;
  
  // Weekly Late Staff Summaries (3+ threshold detection)
  const weeklyLateSummaries = getWeeklyLateStaffSummaries(attendanceRecords, selectedDate);
  const flaggedStaffList = weeklyLateSummaries.filter(s => s.isFlagged3x);

  // Compulsory policy: Admin is exempt, all non-admin users are compulsory
  const nonAdminUsers = users.filter(u => u.role !== 'ADMIN' && u.active);
  const nonAdminPunched = nonAdminUsers.filter(u => dateRecords.some(r => r.employeeId === u.id));
  const pendingCompulsoryStaff = nonAdminUsers.filter(u => !dateRecords.some(r => r.employeeId === u.id));
  const totalStaff = users.length;

  const handleCreateManualAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = users.find((u) => u.id === newEmpId);
    if (!targetUser) return;

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      date: selectedDate,
      employeeId: targetUser.id,
      employeeName: targetUser.name,
      employeeRole: targetUser.role,
      department: targetUser.department || 'Operations',
      status: newStatus,
      punchInTime: newPunchIn,
      punchOutTime: newPunchOut,
      locationAddress: newLocation,
      notes: newNotes
    };

    onAddAttendance(newRecord);
    setShowAddModal(false);
    setNewNotes('');
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const salaryDetails = {
      basicSalary: parseFloat(empBasic) || 0,
      annualSalary: parseFloat(empAnnualSalary) || 0,
      payFrequency: 'Monthly' as const
    };
    const bankDetails = {
      bankName: empBankName,
      accountNumber: empAccNo,
      ifscCode: empIfsc,
      panNumber: empPan,
      uanNumber: empUan,
      pfNumber: empPf
    };

    if (editingEmp && onUpdateUser) {
      onUpdateUser({
        ...editingEmp,
        name: empName,
        email: empEmail,
        role: empRole,
        department: empDept,
        designation: empDesignation,
        phone: empPhone,
        employeeCode: empCode,
        dateOfBirth: empDob,
        joiningDate: empJoining,
        accessPin: empPin,
        salaryDetails,
        bankDetails
      });
    } else if (onAddUser) {
      const newU: UserAccount = {
        id: `user_${Date.now()}`,
        name: empName,
        email: empEmail,
        role: empRole,
        department: empDept,
        designation: empDesignation,
        phone: empPhone,
        employeeCode: empCode || `EMP-2026-${Math.floor(100+Math.random()*900)}`,
        dateOfBirth: empDob,
        joiningDate: empJoining,
        accessPin: empPin,
        salaryDetails,
        bankDetails,
        active: true
      };
      onAddUser(newU);
    }
    setShowEmpModal(false);
    setEditingEmp(null);
  };

  const handleSaveFestival = (e: React.FormEvent) => {
    e.preventDefault();
    if (!festName) return;
    const newF: Festival = {
      id: `fest_${Date.now()}`,
      name: festName,
      date: festDate,
      description: festDesc,
      holidayType: festType
    };
    if (onAddFestival) {
      onAddFestival(newF);
    }
    setShowFestModal(false);
    setFestName('');
    setFestDesc('');
  };

  // Birthday helper calculation based on live system date
  const getBirthdayInfo = (dobStr?: string) => {
    if (!dobStr) return { daysLeft: 999, isToday: false, isSoon: false, formatted: 'Not Provided' };
    const today = new Date();
    const currentYear = today.getFullYear();
    const parsed = parseDateOfBirth(dobStr);
    if (!parsed) return { daysLeft: 999, isToday: false, isSoon: false, formatted: dobStr };
    
    const { day: d, month: mIndex } = parsed;
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    let bdayThisYear = new Date(currentYear, mIndex, d);
    let diffTime = bdayThisYear.getTime() - todayZero.getTime();
    let diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const bdayNextYear = new Date(currentYear + 1, mIndex, d);
      diffDays = Math.round((bdayNextYear.getTime() - todayZero.getTime()) / (1000 * 60 * 60 * 24));
    }

    const isToday = diffDays === 0;
    const isSoon = diffDays > 0 && diffDays <= 3; // 3 days before reminder

    const formatted = `${d} ${MONTH_NAMES[mIndex]}`;

    return { daysLeft: diffDays, isToday, isSoon, formatted };
  };

  // Automated birthday message template
  const getBirthdayWishMessage = (empName: string) => {
    return `Dear ${empName}, Wishing you a very Happy Birthday from all of us at Kamlawati Group! May your day be filled with joy, and may this coming year bring you tremendous success, robust health, and endless happiness. Best regards, Management & HR Team 🎂🎉`;
  };

  const copyWishToClipboard = (empId: string, empName: string) => {
    const msg = getBirthdayWishMessage(empName);
    navigator.clipboard.writeText(msg);
    setCopiedWishId(empId);
    setTimeout(() => setCopiedWishId(null), 3000);
  };

  // Check upcoming festivals in next 7 days or today
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingFestivals = festivals.filter(f => {
    // simple comparison or same month/day check
    return f.date >= todayStr;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const exportToExcel = () => {
    // Columns required: Date | Name | Punch In | Punch Out | Status | Department | Employee ID | Locations
    const data = filteredRecords.map((r) => {
      const targetUser = users.find((u) => u.id === r.employeeId);
      const empId = targetUser?.employeeCode || r.employeeId || 'N/A';
      const punchInLoc = String(r.locationAddress || 'N/A');
      const punchOutLoc = String(r.punchOutLocation || r.locationAddress || 'N/A');
      const combinedLocations = `Punch In: ${punchInLoc} | Punch Out: ${punchOutLoc}`;

      return {
        'Date': String(r.date ?? ''),
        'Name': String(r.employeeName ?? ''),
        'Punch In': String(r.punchInTime ?? ''),
        'Punch Out': String(r.punchOutTime ?? 'Active'),
        'Status': String(r.status ?? ''),
        'Department': String(r.department ?? ''),
        'Employee ID': empId,
        'Locations': combinedLocations
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, `KDPL_Attendance_Report_${selectedDate || 'All'}.xlsx`);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Back to Home Bar */}
      {onBackToHome && (
        <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <button
            onClick={onBackToHome}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#165EAA]" />
            <span>Back to Home</span>
          </button>
          <span className="text-xs font-bold text-slate-500">KDPL Staff Attendance Desk</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#165EAA] text-white rounded-2xl p-5 sm:p-7 shadow-xl flex flex-wrap items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            Human Resources & Staff Accounts Desk
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight flex flex-wrap items-center gap-3">
            <span>Staff Attendance & HR Portal</span>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-200 border border-rose-500/30 font-mono">
              GPS AUDIT REGISTER • XLSX EXPORT
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => {
              setEditingEmp(null);
              setEmpName('');
              setEmpEmail('');
              setEmpPhone('');
              setEmpCode(`EMP-2026-${Math.floor(200 + Math.random() * 800)}`);
              setEmpDob('1995-05-15');
              setEmpPin(Math.floor(100000 + Math.random() * 900000).toString());
              setShowEmpModal(true);
            }}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add New Employee
          </button>
        </div>
      </div>

      {/* Sub Tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('ATTENDANCE')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'ATTENDANCE'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          Staff Attendance
        </button>
        <button
          onClick={() => setActiveSubTab('SITE_VISITS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'SITE_VISITS'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <MapPin className="w-4 h-4 text-rose-400" />
          Site Visits ({siteVisits.length})
        </button>
        <button
          onClick={() => setActiveSubTab('EMPLOYEES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'EMPLOYEES'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          All Employees Details ({users.length})
        </button>
        <button
          onClick={() => setActiveSubTab('BIRTHDAYS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'BIRTHDAYS'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Cake className="w-4 h-4 text-amber-300" />
          Birthday Reminders & Wishes
          {users.some(u => getBirthdayInfo(u.dateOfBirth).isToday || getBirthdayInfo(u.dateOfBirth).isSoon) && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('FESTIVALS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'FESTIVALS'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <PartyPopper className="w-4 h-4 text-purple-300" />
          Corporate Festivals & Calendar
        </button>
      </div>

      {/* TAB 2: STAFF SITE VISITS */}
      {activeSubTab === 'SITE_VISITS' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                Staff Field & Site Visit Audit Log
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin view on who went for which site visit, purpose, live entry/exit photos, GPS location, and timings.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff, purpose, location..."
                  value={visitSearchQuery}
                  onChange={(e) => setVisitSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 w-64"
                />
              </div>
              <input
                type="date"
                value={visitDateFilter}
                onChange={(e) => setVisitDateFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              {visitDateFilter && (
                <button
                  onClick={() => setVisitDateFilter('')}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {siteVisits
              .filter((v) => {
                const matchSearch =
                  !visitSearchQuery ||
                  v.employeeName.toLowerCase().includes(visitSearchQuery.toLowerCase()) ||
                  v.visitPurpose.toLowerCase().includes(visitSearchQuery.toLowerCase()) ||
                  v.siteLocation.toLowerCase().includes(visitSearchQuery.toLowerCase());
                const matchDate = !visitDateFilter || v.date === visitDateFilter;
                return matchSearch && matchDate;
              })
              .length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No Site Visit Logs Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No staff member has recorded a site visit matching your current filter criteria.
                </p>
              </div>
            ) : (
              siteVisits
                .filter((v) => {
                  const matchSearch =
                    !visitSearchQuery ||
                    v.employeeName.toLowerCase().includes(visitSearchQuery.toLowerCase()) ||
                    v.visitPurpose.toLowerCase().includes(visitSearchQuery.toLowerCase()) ||
                    v.siteLocation.toLowerCase().includes(visitSearchQuery.toLowerCase());
                  const matchDate = !visitDateFilter || v.date === visitDateFilter;
                  return matchSearch && matchDate;
                })
                .map((visit) => {
                  const isActive = !visit.endTime;
                  return (
                    <div
                      key={visit.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                            {visit.employeeName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-extrabold text-slate-900">{visit.employeeName}</h4>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                                {visit.employeeRole.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{visit.department || 'Field Operations'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                            📅 {visit.date}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                              isActive
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                            {isActive ? 'Active On-Field Visit' : 'Completed Visit'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                          <span className="text-slate-400 font-bold uppercase text-[10px]">Visit Purpose & Details</span>
                          <p className="text-slate-900 font-extrabold text-sm">{visit.visitPurpose}</p>
                          {visit.notes && <p className="text-slate-600 italic pt-1">"{visit.notes}"</p>}
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                          <span className="text-slate-400 font-bold uppercase text-[10px]">Site Location</span>
                          <p className="text-slate-800 font-bold flex items-start gap-1 pt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span>{visit.siteLocation}</span>
                          </p>
                          {visit.latitude && visit.longitude && (
                            <p className="text-[10px] text-slate-500 font-mono pt-1">
                              GPS: {visit.latitude.toFixed(4)}, {visit.longitude.toFixed(4)}
                            </p>
                          )}
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                          <span className="text-slate-400 font-bold uppercase text-[10px]">Timestamps</span>
                          <div className="flex items-center justify-between text-slate-700">
                            <span>Start Time:</span>
                            <strong className="text-emerald-700 font-bold">{visit.startTime}</strong>
                          </div>
                          <div className="flex items-center justify-between text-slate-700">
                            <span>End Time:</span>
                            <strong className="text-slate-900 font-bold">{visit.endTime || 'Still Active'}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Photos Row */}
                      {(visit.entryPhotoUrl || visit.exitPhotoUrl) && (
                        <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                          <span className="text-xs font-bold text-slate-500">Visit Photos:</span>
                          {visit.entryPhotoUrl && (
                            <button
                              onClick={() => setSelectedPhotoModal(visit.entryPhotoUrl || null)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5" /> Entry Selfie
                            </button>
                          )}
                          {visit.exitPhotoUrl && (
                            <button
                              onClick={() => setSelectedPhotoModal(visit.exitPhotoUrl || null)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold border border-purple-200 transition-colors cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5" /> Exit Selfie
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* TAB 1: ATTENDANCE REGISTER */}
      {activeSubTab === 'ATTENDANCE' && (
        <div className="space-y-6">
          {/* Daily Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Present Today</p>
                <p className="text-2xl font-black text-slate-900 pt-1">{presentCount} / {totalStaff}</p>
                <p className="text-[11px] text-emerald-600 font-semibold pt-1">
                  {totalStaff ? Math.round((presentCount / totalStaff) * 100) : 0}% Total Attendance
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Staff Compliance</p>
                <p className="text-2xl font-black text-rose-900 pt-1">{nonAdminPunched.length} / {nonAdminUsers.length}</p>
                <p className="text-[11px] text-rose-600 font-semibold pt-1">
                  {pendingCompulsoryStaff.length > 0 ? `${pendingCompulsoryStaff.length} Compulsory Pending` : 'All Staff Punched'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">On-Field Duty</p>
                <p className="text-2xl font-black text-blue-900 pt-1">{onFieldCount}</p>
                <p className="text-[11px] text-blue-600 font-semibold pt-1">Active Site Visits</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <MapPin className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Late Punch-Ins</p>
                <p className="text-2xl font-black text-amber-900 pt-1">{lateCount}</p>
                <p className="text-[11px] text-amber-600 font-semibold pt-1">After {LATE_THRESHOLD_LABEL}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* 3+ Late Punches Weekly Flagged Staff Watchlist */}
          {flaggedStaffList.length > 0 && (
            <div className="bg-amber-50/90 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <BellRing className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-amber-950">
                        Punctuality Policy Watch: {flaggedStaffList.length} Staff with 3+ Late Punches This Week
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-black uppercase">
                        After {LATE_THRESHOLD_LABEL}
                      </span>
                    </div>
                    <p className="text-xs text-amber-900/80 mt-0.5">
                      These employees have punched in after {LATE_THRESHOLD_LABEL} 3 or more times this week and received automated punctuality reminder & request messages.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {flaggedStaffList.map((st) => (
                  <div key={st.employeeId} className="bg-white p-3.5 rounded-xl border border-amber-300 shadow-2xs space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-slate-900">{st.employeeName}</div>
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-200">
                        {st.lateCount}x Late
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{st.department || 'Operations'}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {st.lateRecords.map((lp) => (
                        <span key={lp.id} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          {lp.date.slice(5)}: {lp.punchInTime}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Policy Notice Bar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span><strong>Attendance Policy:</strong> Marking Punch In & Out is <strong>compulsory for all staff members</strong>. Administrator accounts are <strong>optional / exempt</strong>.</span>
            </span>
            <span className="text-[11px] font-mono font-bold bg-white px-2.5 py-0.5 rounded border border-slate-200 text-slate-700">
              {pendingCompulsoryStaff.length === 0 ? '✓ 100% Staff Punched In' : `⚠️ ${pendingCompulsoryStaff.length} Non-Admin Staff Pending`}
            </span>
          </div>

          {/* Filter Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                <Calendar className="w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                />
              </div>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                <option value="Site Execution">Site Execution</option>
                <option value="Field Operations">Field Operations</option>
                <option value="Client Relations & Sales">Client Relations & Sales</option>
                <option value="Creative Studio">Creative Studio</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Accounts & Finance">Accounts & Finance</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="ON_FIELD">On Field</option>
                <option value="LATE">Late Punch-In</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="ABSENT">Absent</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search employee name or site..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="Export Excel Worksheet"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export XLSX
              </button>
              <button
                onClick={() => {
                  const headers = ['Date,Employee Name,Role,Department,Status,Punch In,Punch Out,Location,Notes'];
                  const rows = filteredRecords.map(r => 
                    `"${r.date}","${r.employeeName}","${r.employeeRole}","${r.department}","${r.status}","${r.punchInTime}","${r.punchOutTime || ''}","${r.locationAddress.replace(/"/g, '""')}","${(r.notes || '').replace(/"/g, '""')}"`
                  );
                  const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `KDPL_Attendance_Report_${selectedDate}.csv`;
                  a.click();
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-slate-300 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-600" />
                CSV
              </button>
            </div>
          </div>

          {/* Attendance Cards List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-rose-600" />
                Attendance Register ({filteredRecords.length} records)
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-rose-500 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Log Manual Entry
              </button>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No attendance logs found for selected filters.</p>
                <p className="text-xs text-slate-500">Try changing the date or click "Log Manual Entry" to record attendance.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => (
                  <div key={rec.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Dual Camera Photo Thumbnails (In & Out) */}
                      <div className="flex items-center gap-2 shrink-0">
                        {rec.photoUrl ? (
                          <button 
                            onClick={() => {
                              if (window.showGlobalImageViewer) {
                                window.showGlobalImageViewer(rec.photoUrl!, `Punch-In Selfie: ${rec.employeeName} (${rec.date})`);
                              } else {
                                setSelectedPhotoModal(rec.photoUrl!);
                              }
                            }}
                            className="relative group shrink-0"
                            title="Click to view Punch In photo"
                          >
                            <img
                              src={rec.photoUrl}
                              alt={`In: ${rec.employeeName}`}
                              className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-300 group-hover:border-emerald-500 transition-all shadow-sm"
                            />
                            <div className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[8px] font-black px-1 rounded uppercase">
                              In
                            </div>
                          </button>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                            {rec.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        )}

                        {rec.punchOutPhotoUrl && (
                          <button 
                            onClick={() => {
                              if (window.showGlobalImageViewer) {
                                window.showGlobalImageViewer(rec.punchOutPhotoUrl!, `Punch-Out Selfie: ${rec.employeeName} (${rec.date})`);
                              } else {
                                setSelectedPhotoModal(rec.punchOutPhotoUrl!);
                              }
                            }}
                            className="relative group shrink-0"
                            title="Click to view Punch Out photo"
                          >
                            <img
                              src={rec.punchOutPhotoUrl}
                              alt={`Out: ${rec.employeeName}`}
                              className="w-12 h-12 rounded-xl object-cover border-2 border-rose-300 group-hover:border-rose-500 transition-all shadow-sm"
                            />
                            <div className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-black px-1 rounded uppercase">
                              Out
                            </div>
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900">{rec.employeeName}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {rec.department}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {rec.locationAddress}
                        </p>
                        {rec.notes && (
                          <p className="text-xs text-slate-600 italic bg-slate-50 px-2 py-1 rounded border border-slate-200/60">
                            "{rec.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-slate-700">
                          In: <span className="font-mono text-emerald-600 font-bold">{rec.punchInTime}</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-700">
                          Out: <span className="font-mono text-slate-600 font-bold">{rec.punchOutTime || 'Active'}</span>
                        </div>
                      </div>

                      <div className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                        rec.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        rec.status === 'ON_FIELD' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        rec.status === 'LATE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        rec.status === 'HALF_DAY' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {rec.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ALL EMPLOYEES DETAILS */}
      {activeSubTab === 'EMPLOYEES' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Complete Employee Directory & Details</h2>
              <p className="text-xs text-slate-500">Manage all staff members, personnel codes, designation, phone, email, and access credentials.</p>
            </div>
            <button
              onClick={() => {
                setEditingEmp(null);
                setEmpName('');
                setEmpEmail('');
                setEmpPhone('');
                setEmpCode(`EMP-2026-${Math.floor(200 + Math.random() * 800)}`);
                setEmpDob('1995-05-15');
                setEmpPin(Math.floor(100000 + Math.random() * 900000).toString());
                setShowEmpModal(true);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Add Employee
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((u) => {
              const binfo = getBirthdayInfo(u.dateOfBirth);
              return (
                <div key={u.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white font-black flex items-center justify-center text-base shadow-md">
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">{u.name}</h3>
                        <p className="text-xs font-bold text-rose-600">{u.designation || u.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-bold">
                      {u.employeeCode || 'EMP-2026'}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-400" /> Dept:</span>
                      <strong className="text-slate-800">{u.department || 'Operations'}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> Email:</span>
                      <strong className="text-slate-800 font-mono text-[11px]">{u.email}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> Phone:</span>
                      <strong className="text-slate-800">{u.phone || 'N/A'}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> DOB:</span>
                      <strong className="text-slate-800">{binfo.formatted}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Joining:</span>
                      <strong className="text-slate-800">{u.joiningDate || '2024-01-01'}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-slate-400" /> Annual Salary:</span>
                      <strong className="text-emerald-700 font-bold">₹{u.salaryDetails?.annualSalary ? u.salaryDetails.annualSalary.toLocaleString() : '6,00,000'}/yr</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-slate-400" /> Access PIN:</span>
                      <strong className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">{u.accessPin || '849201'}</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedBankDetailsEmp(u)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-rose-200 cursor-pointer transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                      View Bank Details
                    </button>
                    <button
                      onClick={() => {
                        setEditingEmp(u);
                        setEmpName(u.name);
                        setEmpEmail(u.email);
                        setEmpRole(u.role);
                        setEmpDept(u.department || '');
                        setEmpDesignation(u.designation || '');
                        setEmpPhone(u.phone || '');
                        setEmpCode(u.employeeCode || '');
                        setEmpDob(u.dateOfBirth || '1995-01-01');
                        setEmpJoining(u.joiningDate || new Date().toISOString().split('T')[0]);
                        setEmpPin(u.accessPin || '123456');
                        setEmpBasic(String(u.salaryDetails?.basicSalary || 50000));
                        setEmpAnnualSalary(String(u.salaryDetails?.annualSalary || 600000));
                        setEmpBankName(u.bankDetails?.bankName || 'HDFC Bank');
                        setEmpAccNo(u.bankDetails?.accountNumber || '');
                        setEmpIfsc(u.bankDetails?.ifscCode || '');
                        setEmpPan(u.bankDetails?.panNumber || '');
                        setEmpUan(u.bankDetails?.uanNumber || '');
                        setEmpPf(u.bankDetails?.pfNumber || '');
                        setShowEmpModal(true);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: BIRTHDAY REMINDERS & WISHES */}
      {activeSubTab === 'BIRTHDAYS' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500 to-rose-600 text-white p-6 md:p-8 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 text-white text-xs font-bold uppercase tracking-wider">
                <Cake className="w-4 h-4 text-amber-200" />
                Automated HR Birthday Assistant
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                3-Day Advance & Same-Day Birthday Reminders
              </h2>
              <p className="text-sm text-amber-100">
                System automatically detects staff birthdays occurring today or within the next 3 days. Send personalized birthday wishes instantly with name placeholders automatically inserted!
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center">
              <p className="text-xs uppercase font-bold text-amber-100">Total Staff Birthdays</p>
              <p className="text-3xl font-black">{users.filter(u => u.dateOfBirth).length}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Active Birthday Alerts & Automated Wish Messages
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {users.map((u) => {
                const binfo = getBirthdayInfo(u.dateOfBirth);
                if (binfo.daysLeft > 30) return null; // show upcoming within 30 days or today/3 days

                const isToday = binfo.isToday;
                const isSoon = binfo.isSoon;

                return (
                  <div 
                    key={u.id} 
                    className={`p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
                      isToday 
                        ? 'bg-gradient-to-r from-amber-50 to-rose-50 border-amber-300 ring-2 ring-amber-400/40' 
                        : isSoon 
                        ? 'bg-amber-50/60 border-amber-200' 
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-md shrink-0 ${
                        isToday ? 'bg-amber-500 text-white animate-bounce' : isSoon ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isToday ? '🎂' : isSoon ? '⏰' : '🎁'}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-extrabold text-slate-900">{u.name}</h4>
                          {isToday && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white uppercase tracking-wider animate-pulse">
                              Today's Birthday! 🎉
                            </span>
                          )}
                          {isSoon && !isToday && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wider">
                              Upcoming in {binfo.daysLeft} {binfo.daysLeft === 1 ? 'Day' : 'Days'} ⏰
                            </span>
                          )}
                          {!isToday && !isSoon && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              Birthday: {binfo.formatted}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {u.designation || u.role} • <strong className="text-slate-700">{u.department || 'Operations'}</strong> • Phone: {u.phone || 'N/A'}
                        </p>

                        <div className="mt-3 bg-white/80 p-3 rounded-xl border border-slate-200/80 text-xs font-medium text-slate-700 italic">
                          "{getBirthdayWishMessage(u.name)}"
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                      <button
                        onClick={() => copyWishToClipboard(u.id, u.name)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                          copiedWishId === u.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                        }`}
                      >
                        <Gift className="w-4 h-4 text-amber-400" />
                        {copiedWishId === u.id ? 'Copied Wish Message! ✓' : 'Copy Automated Wish'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CORPORATE FESTIVALS & CALENDAR */}
      {activeSubTab === 'FESTIVALS' && (
        <div className="space-y-6">
          {/* Upcoming Festival Reminder Banner */}
          {upcomingFestivals.length > 0 && (
            <div className="bg-slate-900 text-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-800 flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800 text-blue-300 border border-slate-700 text-xs font-bold uppercase tracking-wider">
                  <CalendarDays className="w-4 h-4 text-blue-400" />
                  Upcoming Corporate Holiday & Calendar Notice
                </div>
                <h3 className="text-xl font-bold text-white">
                  Next Holiday / Event: {upcomingFestivals[0].name} ({upcomingFestivals[0].date})
                </h3>
                <p className="text-sm text-slate-300">
                  {upcomingFestivals[0].description}
                </p>
              </div>
              <button
                onClick={() => setShowFestModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Corporate Festival
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-purple-600" />
                All Corporate Festivals & Holidays Calendar ({festivals.length})
              </h3>
              <button
                onClick={() => setShowFestModal(true)}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-purple-500 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Festival
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {festivals.map((f) => (
                <div key={f.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-base shrink-0 border border-purple-100">
                      🎉
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-extrabold text-slate-900">{f.name}</h4>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                          f.holidayType === 'OFFICIAL' ? 'bg-rose-100 text-rose-800' :
                          f.holidayType === 'OPTIONAL' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {f.holidayType.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{f.description}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-purple-900 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
                      {f.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ATTENDANCE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider">Log Manual Attendance (HR)</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateManualAttendance} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Employee</label>
                <select
                  value={newEmpId}
                  onChange={(e) => setNewEmpId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Attendance Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ON_FIELD">On Field</option>
                    <option value="LATE">Late</option>
                    <option value="HALF_DAY">Half Day</option>
                    <option value="ABSENT">Absent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Punch In Time</label>
                  <input
                    type="text"
                    value={newPunchIn}
                    onChange={(e) => setNewPunchIn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Punch Out Time</label>
                  <input
                    type="text"
                    value={newPunchOut}
                    onChange={(e) => setNewPunchOut(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location / Site Address</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">HR Notes / Reason</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                  placeholder="Enter remarks..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT EMPLOYEE MODAL */}
      {showEmpModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="text-sm font-extrabold uppercase tracking-wider">
                {editingEmp ? 'Edit Employee Details' : 'Add New Employee'}
              </h3>
              <button onClick={() => setShowEmpModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveEmployee} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
                  placeholder="e.g. Anand Sharma"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                    placeholder="email@company.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                    placeholder="+91 98765..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">System Role</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUB_ADMIN">SUB_ADMIN</option>
                    <option value="CRM_EMPLOYEE">CRM_EMPLOYEE</option>
                    <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
                    <option value="DESIGNER">DESIGNER</option>
                    <option value="PROJECT_COORDINATOR">PROJECT_COORDINATOR</option>
                    <option value="SITE_SUPERVISOR">SITE_SUPERVISOR</option>
                    <option value="HR">HR</option>
                    <option value="ACCOUNTS">ACCOUNTS</option>
                    <option value="PURCHASE">PURCHASE</option>
                    <option value="FACILITY_MANAGER">FACILITY_MANAGER</option>
                    <option value="VENDOR_MANAGER">VENDOR_MANAGER</option>
                    <option value="IT_PERSON">IT_PERSON</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={empDesignation}
                    onChange={(e) => setEmpDesignation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employee Code</label>
                  <input
                    type="text"
                    value={empCode}
                    onChange={(e) => setEmpCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth (DOB)</label>
                  <input
                    type="date"
                    value={empDob}
                    onChange={(e) => setEmpDob(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={empJoining}
                    onChange={(e) => setEmpJoining(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Basic Salary (Mo.)</label>
                  <input
                    type="number"
                    value={empBasic}
                    onChange={(e) => setEmpBasic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Annual Salary (₹)</label>
                  <input
                    type="number"
                    value={empAnnualSalary}
                    onChange={(e) => setEmpAnnualSalary(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-3">
                <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Bank & Statutory Accounts</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name & Branch</label>
                    <input
                      type="text"
                      value={empBankName}
                      onChange={(e) => setEmpBankName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                      placeholder="e.g. HDFC Bank, Gurgaon"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={empAccNo}
                      onChange={(e) => setEmpAccNo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={empIfsc}
                      onChange={(e) => setEmpIfsc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">PAN Number</label>
                    <input
                      type="text"
                      value={empPan}
                      onChange={(e) => setEmpPan(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">UAN / PF Number</label>
                    <input
                      type="text"
                      value={empUan}
                      onChange={(e) => setEmpUan(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Access PIN (6 Digit)</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={empPin}
                    onChange={(e) => setEmpPin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEmpModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {editingEmp ? 'Save Changes' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD FESTIVAL MODAL */}
      {showFestModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-purple-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider">Add Corporate Festival / Holiday</h3>
              <button onClick={() => setShowFestModal(false)} className="text-purple-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveFestival} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Festival Name</label>
                <input
                  type="text"
                  required
                  value={festName}
                  onChange={(e) => setFestName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
                  placeholder="e.g. Diwali / Independence Day"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Festival Date</label>
                  <input
                    type="date"
                    required
                    value={festDate}
                    onChange={(e) => setFestDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Holiday Type</label>
                  <select
                    value={festType}
                    onChange={(e) => setFestType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="OFFICIAL">Official Holiday</option>
                    <option value="OPTIONAL">Optional Holiday</option>
                    <option value="CORPORATE_EVENT">Corporate Event</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Celebration Details</label>
                <textarea
                  value={festDesc}
                  onChange={(e) => setFestDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                  placeholder="Enter celebration notes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFestModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Festival
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BANK & SALARY DETAILS DOSSIER MODAL */}
      {selectedBankDetailsEmp && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider">
                  Secure Bank & Salary Dossier: {selectedBankDetailsEmp.name}
                </h3>
              </div>
              <button onClick={() => setSelectedBankDetailsEmp(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-slate-900">{selectedBankDetailsEmp.name}</h4>
                  <p className="text-xs text-slate-500">{selectedBankDetailsEmp.designation || selectedBankDetailsEmp.role} • {selectedBankDetailsEmp.department || 'Operations'}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold bg-slate-200 px-2.5 py-1 rounded-lg text-slate-700">
                    {selectedBankDetailsEmp.employeeCode || 'EMP-2026'}
                  </span>
                  <p className="text-[11px] text-slate-500 pt-1">Joined: {selectedBankDetailsEmp.joiningDate || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-600" />
                  Salary & Compensation Structure
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <p className="text-[11px] font-semibold text-slate-500">Basic Salary</p>
                    <p className="text-base font-black text-slate-900 pt-0.5">
                      ₹{selectedBankDetailsEmp.salaryDetails?.basicSalary ? selectedBankDetailsEmp.salaryDetails.basicSalary.toLocaleString() : '50,000'} <span className="text-[10px] font-normal text-slate-500">/mo</span>
                    </p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <p className="text-[11px] font-semibold text-emerald-700">Annual Salary</p>
                    <p className="text-base font-black text-emerald-900 pt-0.5">
                      ₹{selectedBankDetailsEmp.salaryDetails?.annualSalary ? selectedBankDetailsEmp.salaryDetails.annualSalary.toLocaleString() : '6,00,000'} <span className="text-[10px] font-normal text-emerald-700">/yr</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Verified Banking & Statutory Accounts
                </h5>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Bank Name & Branch:</span>
                    <strong className="text-slate-800 font-bold">{selectedBankDetailsEmp.bankDetails?.bankName || 'HDFC Bank, Cyber City Branch'}</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Account Number:</span>
                    <strong className="text-slate-900 font-mono font-bold tracking-wider">{selectedBankDetailsEmp.bankDetails?.accountNumber || '50200019283746'}</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">IFSC Code:</span>
                    <strong className="text-slate-900 font-mono font-bold">{selectedBankDetailsEmp.bankDetails?.ifscCode || 'HDFC0000240'}</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">PAN Number:</span>
                    <strong className="text-slate-900 font-mono font-bold">{selectedBankDetailsEmp.bankDetails?.panNumber || 'ABCDE1234F'}</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">UAN Number (Provident Fund):</span>
                    <strong className="text-slate-900 font-mono font-bold">{selectedBankDetailsEmp.bankDetails?.uanNumber || '100928374619'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">PF Establishment ID:</span>
                    <strong className="text-slate-900 font-mono font-bold">{selectedBankDetailsEmp.bankDetails?.pfNumber || 'DL/CPM/0019283'}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedBankDetailsEmp(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GPS PHOTO MODAL */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-4 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">GPS Punch-In Verification Photo</h3>
              <button onClick={() => setSelectedPhotoModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
              <img src={selectedPhotoModal} alt="Punch-In Verification" className="max-h-[70vh] rounded-lg object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
