import React, { useState, useRef } from 'react';
import { UserAccount, UserRole, EmployeeDocument, SalaryDetails, BankDetails } from '../../types';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  UserPlus, 
  Building2, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Edit3, 
  Upload, 
  Folder, 
  File, 
  Trash2, 
  Download, 
  Eye, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  CreditCard,
  Lock,
  X
} from 'lucide-react';
import { ApiService } from '../../lib/api';

interface AboutEmployeesProps {
  users: UserAccount[];
  activeUser: UserAccount;
  employeeDocuments: EmployeeDocument[];
  onAddUser: (user: UserAccount) => void;
  onUpdateUser: (user: UserAccount) => void;
  onAddDocument: (doc: EmployeeDocument) => void;
  onDeleteDocument: (docId: string) => void;
  onBackToHome: () => void;
}

export const AboutEmployees: React.FC<AboutEmployeesProps> = ({
  users,
  activeUser,
  employeeDocuments,
  onAddUser,
  onUpdateUser,
  onAddDocument,
  onDeleteDocument,
  onBackToHome
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  // Edit / Add modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('CRM_EMPLOYEE');
  const [department, setDepartment] = useState('Operations');
  const [designation, setDesignation] = useState('Executive');
  const [phone, setPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [reportingTo, setReportingTo] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [accessPin, setAccessPin] = useState('');
  const [password, setPassword] = useState('');

  // Salary & Bank Details
  const [basicSalary, setBasicSalary] = useState('45000');
  const [annualSalary, setAnnualSalary] = useState('540000');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [uanNumber, setUanNumber] = useState('');
  const [pfNumber, setPfNumber] = useState('');

  // Document upload modal
  const [showDocModal, setShowDocModal] = useState(false);
  const [targetEmpForDoc, setTargetEmpForDoc] = useState<UserAccount | null>(null);
  const [docCategory, setDocCategory] = useState<'LEGAL' | 'BANK'>('LEGAL');
  const [docName, setDocName] = useState('');
  const [docFileData, setDocFileData] = useState('');
  const [docFileName, setDocFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Open Edit
  const openEdit = (u: UserAccount) => {
    setIsNewUser(false);
    setEditingId(u.id);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setDepartment(u.department || 'Operations');
    setDesignation(u.designation || 'Staff');
    setPhone(u.phone || '');
    setEmergencyPhone(u.emergencyPhone || '');
    setEmergencyRelation(u.emergencyRelation || '');
    setReportingTo(u.reportingTo || '');
    setEmployeeCode(u.employeeCode || u.id);
    setJoiningDate(u.joiningDate || '');
    setDateOfBirth(u.dateOfBirth || '');
    setAccessPin(u.accessPin || '123456');
    setPassword(u.password || '');
    setBasicSalary(String(u.salaryDetails?.basicSalary || '45000'));
    setAnnualSalary(String(u.salaryDetails?.annualSalary || '540000'));
    setBankName(u.bankDetails?.bankName || 'HDFC Bank');
    setAccountNumber(u.bankDetails?.accountNumber || '');
    setIfscCode(u.bankDetails?.ifscCode || '');
    setPanNumber(u.bankDetails?.panNumber || '');
    setUanNumber(u.bankDetails?.uanNumber || '');
    setPfNumber(u.bankDetails?.pfNumber || '');
    setShowEditModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSalary: SalaryDetails = {
      basicSalary: Number(basicSalary) || 0,
      annualSalary: Number(annualSalary) || 0,
      payFrequency: 'Monthly'
    };
    const updatedBank: BankDetails = {
      bankName,
      accountNumber,
      ifscCode,
      panNumber,
      uanNumber,
      pfNumber
    };

    if (isNewUser) {
      const newUserObj: UserAccount = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        email,
        role,
        department,
        designation,
        phone,
        emergencyPhone,
        emergencyRelation,
        reportingTo,
        employeeCode: employeeCode || `KDPL-${Math.floor(100 + Math.random() * 900)}`,
        joiningDate,
        dateOfBirth,
        accessPin: accessPin || '123456',
        password: password || `KDPL@${accessPin || '123456'}`,
        passwordLastChangedAt: new Date().toISOString(),
        active: true,
        salaryDetails: updatedSalary,
        bankDetails: updatedBank
      };
      onAddUser(newUserObj);
    } else {
      const existing = users.find((u) => u.id === editingId);
      if (existing) {
        const updated: UserAccount = {
          ...existing,
          name,
          email,
          role,
          department,
          designation,
          phone,
          emergencyPhone,
          emergencyRelation,
          reportingTo,
          employeeCode,
          joiningDate,
          dateOfBirth,
          accessPin,
          password: password || existing.password,
          passwordLastChangedAt: password !== existing.password ? new Date().toISOString() : existing.passwordLastChangedAt,
          salaryDetails: updatedSalary,
          bankDetails: updatedBank
        };
        onUpdateUser(updated);
        if (selectedUser?.id === updated.id) {
          setSelectedUser(updated);
        }
      }
    }
    setShowEditModal(false);
  };

  const handleDocFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocFileName(file.name);
    if (!docName) {
      setDocName(file.name.replace(/\.[^/.]+$/, ''));
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setDocFileData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmpForDoc || !docFileData) {
      alert('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrl = await ApiService.uploadMedia(docFileData, docFileName || 'document.pdf', 'DOCUMENT');
      const folderPath = `Employee Documents Root / ${targetEmpForDoc.name} / ${docCategory === 'LEGAL' ? 'Legal Details' : 'Bank Details'}`;
      
      const newDoc: EmployeeDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        employeeId: targetEmpForDoc.id,
        employeeName: targetEmpForDoc.name,
        category: docCategory,
        documentName: docName || docFileName || 'Document',
        fileUrl: uploadedUrl,
        uploadedAt: new Date().toISOString().split('T')[0],
        folderPath
      };

      onAddDocument(newDoc);
      setShowDocModal(false);
      setDocName('');
      setDocFileData('');
      setDocFileName('');
    } finally {
      setIsUploading(false);
    }
  };

  // Filter employees
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      String(u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(u.employeeCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(u.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(u.designation || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header & Back Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#165EAA]" />
            <span>Back to Home</span>
          </button>
          <div className="h-5 w-[1px] bg-slate-200" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#165EAA]" />
              <span>About Employees & Document Vaults</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200 font-mono">
                PERSONNEL VAULT • KYC
              </span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => {
            setIsNewUser(true);
            setEditingId('');
            setName('');
            setEmail('');
            setRole('CRM_EMPLOYEE');
            setDepartment('Operations');
            setDesignation('Executive');
            setPhone('');
            setEmergencyPhone('');
            setEmployeeCode(`KDPL-${Math.floor(100 + Math.random() * 900)}`);
            setJoiningDate(new Date().toISOString().split('T')[0]);
            setDateOfBirth('1996-01-01');
            setAccessPin('123456');
            setPassword('KDPL@123456');
            setBasicSalary('45000');
            setAnnualSalary('540000');
            setBankName('HDFC Bank');
            setAccountNumber('');
            setIfscCode('');
            setPanNumber('');
            setUanNumber('');
            setPfNumber('');
            setShowEditModal(true);
          }}
          className="w-full sm:w-auto px-4 py-2.5 bg-[#165EAA] hover:bg-[#0f4b88] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, employee code, email, designation..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#165EAA]"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#165EAA] font-bold text-slate-700"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="ADMIN">Admins</option>
            <option value="SUB_ADMIN">Sub Admins</option>
            <option value="HR">HR Dept</option>
            <option value="CRM_EMPLOYEE">CRM & Sales</option>
            <option value="PROJECT_MANAGER">Project Managers</option>
            <option value="PROJECT_COORDINATOR">Project Coordinators</option>
            <option value="SITE_SUPERVISOR">Site Supervisors</option>
            <option value="DESIGNER">Designers</option>
            <option value="ACCOUNTS">Finance & Accounts</option>
            <option value="PURCHASE">Purchase Officers</option>
            <option value="FACTORY_STAFF">Factory Staff</option>
            <option value="FACILITY_MANAGER">Facility Managers</option>
            <option value="VENDOR_MANAGER">Vendor Managers</option>
          </select>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredUsers.map((emp) => {
          const empDocs = employeeDocuments.filter((d) => d.employeeId === emp.id);
          const legalDocs = empDocs.filter((d) => d.category === 'LEGAL');
          const bankDocs = empDocs.filter((d) => d.category === 'BANK');

          return (
            <div
              key={emp.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Employee Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#165EAA] flex items-center justify-center font-bold text-base border border-blue-200/80 shadow-xs">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">{emp.name}</h3>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          emp.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {emp.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {emp.designation || 'Staff'} • <span className="text-[#165EAA] font-semibold">{emp.department || 'Operations'}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openEdit(emp)}
                    className="p-2 text-slate-500 hover:text-[#165EAA] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                    title="Edit Employee"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Info Fields Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3.5 text-xs text-slate-600">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Employee ID</p>
                    <p className="font-bold text-slate-800 font-mono mt-0.5">{emp.employeeCode || emp.id}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Reporting To</p>
                    <p className="font-bold text-slate-800 truncate mt-0.5">{emp.reportingTo || 'Direct / MD'}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">System Role</p>
                    <p className="font-bold text-slate-800 mt-0.5">{emp.role.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Office / Mobile Phone</p>
                    <p className="font-bold text-[#165EAA] font-mono mt-0.5">{emp.phone || 'Not Set'}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Official Email</p>
                    <p className="font-medium text-slate-800 truncate mt-0.5">{emp.email}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Emergency Contact</p>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {emp.emergencyPhone || 'Not Set'} {emp.emergencyRelation ? <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded ml-1 border border-blue-100">{emp.emergencyRelation}</span> : ''}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</p>
                    <p className="font-medium text-slate-800 mt-0.5">{emp.dateOfBirth || 'Not Set'}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Joining Date</p>
                    <p className="font-medium text-slate-800 mt-0.5">{emp.joiningDate || 'Not Set'}</p>
                  </div>
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 sm:col-span-2">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase">Salary Structure</p>
                    <p className="font-bold text-emerald-900 mt-0.5">
                      ₹{emp.salaryDetails?.basicSalary?.toLocaleString('en-IN') || '0'} / mo
                      {emp.salaryDetails?.annualSalary ? <span className="text-slate-500 font-normal text-[11px] ml-2">(CTC: ₹{emp.salaryDetails.annualSalary.toLocaleString('en-IN')}/yr)</span> : ''}
                    </p>
                  </div>
                </div>

                {/* Bank & Legal Overview */}
                <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#165EAA]" /> Bank Details
                    </span>
                    <span className="font-semibold text-slate-600">{emp.bankDetails?.bankName || 'Not Set'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    A/C: {emp.bankDetails?.accountNumber || '••••••••'} • IFSC: {emp.bankDetails?.ifscCode || '••••••'} • PAN: {emp.bankDetails?.panNumber || '••••••••'}
                  </p>
                </div>

                {/* Document Controls Folder View */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Folder className="w-4 h-4 text-amber-500" />
                      Employee Documents Vault ({empDocs.length})
                    </span>
                    <button
                      onClick={() => {
                        setTargetEmpForDoc(emp);
                        setDocCategory('LEGAL');
                        setShowDocModal(true);
                      }}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#165EAA] rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3 h-3" /> Upload Document
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Legal Folder */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <p className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>⚖️ Legal Details ({legalDocs.length})</span>
                      </p>
                      <div className="mt-1.5 space-y-1">
                        {legalDocs.length > 0 ? (
                          legalDocs.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-slate-200 text-[11px]">
                              <span className="truncate max-w-[120px] font-medium text-slate-800">{doc.documentName}</span>
                              <div className="flex items-center gap-1">
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                  title="View"
                                >
                                  <Eye className="w-3 h-3" />
                                </a>
                                <button
                                  onClick={() => onDeleteDocument(doc.id)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">No legal docs uploaded</p>
                        )}
                      </div>
                    </div>

                    {/* Bank Folder */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <p className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>🏦 Bank Details ({bankDocs.length})</span>
                      </p>
                      <div className="mt-1.5 space-y-1">
                        {bankDocs.length > 0 ? (
                          bankDocs.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-slate-200 text-[11px]">
                              <span className="truncate max-w-[120px] font-medium text-slate-800">{doc.documentName}</span>
                              <div className="flex items-center gap-1">
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                  title="View"
                                >
                                  <Eye className="w-3 h-3" />
                                </a>
                                <button
                                  onClick={() => onDeleteDocument(doc.id)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">No bank docs uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Edit or Add Employee */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#165EAA]" />
                {isNewUser ? 'Add New Employee' : `Edit Employee Details • ${name}`}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh@kamlawati.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">System Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white font-bold"
                  >
                    <option value="CRM_EMPLOYEE">CRM & Sales Exec</option>
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="PROJECT_COORDINATOR">Project Coordinator</option>
                    <option value="SITE_SUPERVISOR">Site Supervisor</option>
                    <option value="DESIGNER">Designer</option>
                    <option value="SR_DESIGNER">Senior Designer</option>
                    <option value="HR">HR Executive</option>
                    <option value="ACCOUNTS">Finance / Accounts</option>
                    <option value="PURCHASE">Purchase Officer</option>
                    <option value="FACTORY_STAFF">Factory Staff</option>
                    <option value="FACILITY_MANAGER">Facility Manager</option>
                    <option value="VENDOR_MANAGER">Vendor Manager</option>
                    <option value="IT_PERSON">IT Person (Infrastructure & Support)</option>
                    <option value="SUB_ADMIN">Sub Admin</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Fabrication & Assembly"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Lead Project Coordinator"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee ID / Code</label>
                  <input
                    type="text"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="e.g. KDPL-042"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emergency Contact Number</label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emergency Relation</label>
                  <input
                    type="text"
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    placeholder="e.g. SISTER, BROTHER, FATHER"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reporting To</label>
                  <input
                    type="text"
                    value={reportingTo}
                    onChange={(e) => setReportingTo(e.target.value)}
                    placeholder="e.g. Rithu Nair, Sachin Pol"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
              </div>

              {/* Salary & Bank Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <CreditCard className="w-4 h-4 text-[#165EAA]" />
                  Salary & Bank Account Structure
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Basic Monthly Salary (₹)</label>
                    <input
                      type="number"
                      value={basicSalary}
                      onChange={(e) => setBasicSalary(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Annual CTC (₹)</label>
                    <input
                      type="number"
                      value={annualSalary}
                      onChange={(e) => setAnnualSalary(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank Ltd"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 50100293847561"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      placeholder="e.g. HDFC0000240"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">PAN Card Number</label>
                    <input
                      type="text"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value)}
                      placeholder="e.g. ABCDE1234F"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#165EAA] hover:bg-[#0f4b88] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Employee Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Document */}
      {showDocModal && targetEmpForDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#165EAA]" />
                Upload Employee Document
              </h3>
              <button
                onClick={() => setShowDocModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-3.5 text-xs">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-slate-900">{targetEmpForDoc.name}</p>
                <p className="text-[11px] text-slate-500">ID: {targetEmpForDoc.employeeCode || targetEmpForDoc.id} • {targetEmpForDoc.department}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Vault / Category *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDocCategory('LEGAL')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      docCategory === 'LEGAL'
                        ? 'bg-[#165EAA] text-white border-[#165EAA]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ⚖️ Legal Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocCategory('BANK')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      docCategory === 'BANK'
                        ? 'bg-[#165EAA] text-white border-[#165EAA]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🏦 Bank Details
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title / Label *</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Aadhaar Card / Cancelled Cheque / Appointment Letter"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select File (PDF / Image) *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl text-center cursor-pointer transition-colors"
                >
                  <FileText className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                  <p className="text-xs font-bold text-slate-700">
                    {docFileName || 'Click to browse and upload file'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Supports PDF, PNG, JPEG, DOC</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*,.doc,.docx"
                  className="hidden"
                  onChange={handleDocFileSelect}
                />
              </div>

              <div className="p-2.5 bg-slate-100 rounded-xl text-[11px] text-slate-600 font-mono">
                📁 Saved Path: Employee Documents Root / {targetEmpForDoc.name} / {docCategory === 'LEGAL' ? 'Legal Details' : 'Bank Details'}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-2.5 bg-[#165EAA] hover:bg-[#0f4b88] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isUploading ? 'Uploading...' : 'Save to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
