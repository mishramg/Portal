import React, { useState } from 'react';
import { UserAccount, UserRole, WorkAssignment, Lead } from '../../types';
import { 
  UserPlus, 
  Search, 
  Copy, 
  Check, 
  KeyRound, 
  X, 
  Users, 
  Mail, 
  Phone, 
  Building, 
  Briefcase,
  Eye,
  EyeOff,
  RefreshCw,
  FileCheck2,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowRight,
  Palette,
  HardHat,
  MapPin,
  FileText,
  ShieldAlert,
  UserCheck,
  Trash2,
  Pencil,
  ShoppingBag,
  Truck,
  Laptop
} from 'lucide-react';

interface UserManagementProps {
  users: UserAccount[];
  works?: WorkAssignment[];
  leads?: Lead[];
  onAddUser: (newUser: UserAccount) => void;
  onUpdateUser?: (updatedUser: UserAccount) => void;
  onToggleUserActive: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
  onSelectUser?: (user: UserAccount) => void;
  onBackToHome?: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  works = [],
  leads = [],
  onAddUser,
  onUpdateUser,
  onToggleUserActive,
  onDeleteUser,
  onSelectUser,
  onBackToHome
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [inspectingStaff, setInspectingStaff] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'WORKS' | 'LEADS' | 'PROFILE'>('WORKS');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('CRM_EMPLOYEE');
  const [editDepartment, setEditDepartment] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editPin, setEditPin] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const openEditUser = (user: UserAccount) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditRole(user.role);
    setEditDepartment(user.department || '');
    setEditDesignation(user.designation || '');
    setEditPin(user.accessPin || '849201');
    setEditPassword(user.password || `Pass#${user.accessPin || '849201'}`);
  };

  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Form state for New Staff Account Creation
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [role, setRole] = useState<UserRole>('CRM_EMPLOYEE');
  const [department, setDepartment] = useState('Client Relations & Sales');
  const [designation, setDesignation] = useState('CRM Account Manager');
  const [accessPin, setAccessPin] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [password, setPassword] = useState('');

  // Handle department auto-fill based on role
  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    const pin = accessPin || '123456';
    switch (selectedRole) {
      case 'ADMIN':
        setDepartment('Executive Management');
        setDesignation('Managing Director');
        setPassword(`Admin@${pin}`);
        break;
      case 'SUB_ADMIN':
        setDepartment('Operations');
        setDesignation('VP of Field Operations');
        setPassword(`Subadmin@${pin}`);
        break;
      case 'CRM_EMPLOYEE':
        setDepartment('Client Relations & Sales');
        setDesignation('CRM Account Manager');
        setPassword(`Crm@${pin}`);
        break;
      case 'DESIGNER':
        setDepartment('Creative Studio');
        setDesignation('Graphic & 3D Visualizer');
        setPassword(`Design@${pin}`);
        break;
      case 'SR_DESIGNER':
      case 'SENIOR_DESIGNER':
        setDepartment('Creative Studio');
        setDesignation('Senior Designer Lead');
        setPassword(`Design@${pin}`);
        break;
      case 'PROJECT_COORDINATOR':
        setDepartment('Project Coordination');
        setDesignation('Project Coordinator');
        setPassword(`Coord@${pin}`);
        break;
      case 'SITE_SUPERVISOR':
        setDepartment('Site Execution');
        setDesignation('Field Site Punch Supervisor');
        setPassword(`Site@${pin}`);
        break;
      case 'HR':
        setDepartment('Human Resources');
        setDesignation('HR Operations Manager');
        setPassword(`Hr@${pin}`);
        break;
      case 'ACCOUNTS':
        setDepartment('Finance & Accounts');
        setDesignation('Accounts & Audit Officer');
        setPassword(`Accounts@${pin}`);
        break;
      case 'PURCHASE':
        setDepartment('Purchase & Procurement');
        setDesignation('Purchase Officer');
        setPassword(`Purchase@${pin}`);
        break;
      case 'FACILITY_MANAGER':
        setDepartment('Facility Management');
        setDesignation('Facility Manager');
        setPassword(`Facility@${pin}`);
        break;
      case 'VENDOR_MANAGER':
        setDepartment('Vendor Management');
        setDesignation('Vendor Manager');
        setPassword(`Vendor@${pin}`);
        break;
      case 'IT_PERSON':
        setDepartment('IT & Technical Systems');
        setDesignation('IT Infrastructure & Support Engineer');
        setPassword(`It@${pin}`);
        break;
    }
  };

  const generateNewPin = () => {
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    setAccessPin(newPin);
    if (!password || password.startsWith('Pass#')) {
      setPassword(`Pass#${newPin}`);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const empCount = users.length + 101;
    const finalPassword = password || `Pass#${accessPin}`;
    const newUserObj: UserAccount = {
      id: `user_${Date.now()}`,
      name,
      email,
      phone: phone || '+91 98000 00000',
      emergencyPhone: emergencyPhone || '+91 98000 00001',
      role,
      department,
      designation,
      employeeCode: `EMP-2026-${empCount}`,
      accessPin,
      password: finalPassword,
      passwordLastChangedAt: new Date().toISOString(),
      joiningDate: new Date().toISOString().split('T')[0],
      active: true,
      permissions: ['PORTAL_ACCESS', 'VIEW_ASSIGNMENTS']
    };

    onAddUser(newUserObj);
    setShowAddModal(false);

    // Reset Form
    setName('');
    setEmail('');
    setPhone('');
    setEmergencyPhone('');
    setPassword('');
    generateNewPin();
  };

  const handleCopyCredentials = (u: UserAccount) => {
    const pass = u.password || `Pass#${u.accessPin || '849201'}`;
    const credText = `Nexus CRM Staff Access Credentials
=================================
Staff Name: ${u.name}
Employee Code: ${u.employeeCode || 'EMP-2026-REG'}
Designation: ${u.designation || 'Staff'}
Role: ${u.role.replace('_', ' ')}
Department: ${u.department || 'Operations'}
Login Email: ${u.email}
Login Password: ${pass}
System Access PIN: ${u.accessPin || '849201'}
Phone: ${u.phone || 'N/A'}
=================================`;

    navigator.clipboard.writeText(credText);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyAllCredentials = () => {
    const header = `NEXUS CRM - FULL ROLE LOGIN DIRECTORY CREDENTIALS\nGenerated: ${new Date().toLocaleString('en-IN')}\n======================================================\n\n`;
    const rows = users.map(u => {
      const pass = u.password || u.accessPin || 'Admin@123';
      return `[${u.role.replace(/_/g, ' ')}]
Name: ${u.name}
Login ID/Email: ${u.email}
Password: ${pass}
PIN: ${u.accessPin || '849201'}
Employee Code: ${u.employeeCode || 'N/A'}
------------------------------------------------------`;
    }).join('\n\n');

    navigator.clipboard.writeText(header + rows);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'ADMIN': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'SUB_ADMIN': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'CRM_EMPLOYEE': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PROJECT_MANAGER': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'DESIGNER': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'SR_DESIGNER':
      case 'SENIOR_DESIGNER': return 'bg-purple-200 text-purple-900 border-purple-400 font-extrabold';
      case 'PROJECT_COORDINATOR': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'SITE_SUPERVISOR': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'HR': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'ACCOUNTS': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'PURCHASE': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'FACILITY_MANAGER': return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'VENDOR_MANAGER': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'IT_PERSON': return 'bg-slate-800 text-white border-slate-700 font-bold';
    }
  };

  // Helper to find all works associated with a user
  const getUserWorks = (userId: string) => {
    return works.filter((w) => 
      w.assignedCrmId === userId ||
      w.assignedDesignerId === userId ||
      w.assignedSupervisorId === userId ||
      w.assignedSiteSupervisorId === userId
    );
  };

  // Helper to find all leads submitted by a user
  const getUserLeads = (userId: string) => {
    return leads.filter((l) => l.submittedByCrmId === userId);
  };

  // Filtered staff list
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.employeeCode && u.employeeCode.toLowerCase().includes(q)) ||
      (u.designation && u.designation.toLowerCase().includes(q));
    return matchesRole && matchesSearch;
  });

  const getStaffRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case 'SUB_ADMIN': return <UserCheck className="w-4 h-4 text-orange-600" />;
      case 'CRM_EMPLOYEE': return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'PROJECT_MANAGER': return <KeyRound className="w-4 h-4 text-amber-600" />;
      case 'DESIGNER': return <Palette className="w-4 h-4 text-purple-600" />;
      case 'SR_DESIGNER':
      case 'SENIOR_DESIGNER': return <Palette className="w-4 h-4 text-amber-600 font-bold" />;
      case 'PROJECT_COORDINATOR': return <HardHat className="w-4 h-4 text-emerald-600" />;
      case 'SITE_SUPERVISOR': return <MapPin className="w-4 h-4 text-indigo-600" />;
      case 'HR': return <Users className="w-4 h-4 text-rose-600" />;
      case 'ACCOUNTS': return <Briefcase className="w-4 h-4 text-cyan-600" />;
      case 'PURCHASE': return <ShoppingBag className="w-4 h-4 text-yellow-600" />;
      case 'FACILITY_MANAGER': return <Building className="w-4 h-4 text-sky-600" />;
      case 'VENDOR_MANAGER': return <Truck className="w-4 h-4 text-orange-600" />;
      case 'IT_PERSON': return <Laptop className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Back Navigation & Header Banner */}
      {onBackToHome && (
        <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <button
            onClick={onBackToHome}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <span className="text-[#165EAA] text-sm font-extrabold">←</span>
            <span>Back to Home</span>
          </button>
          <span className="text-xs font-bold text-slate-500">KDPL Staff Accounts Management</span>
        </div>
      )}

      <div className="bg-[#165EAA] text-white rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              Admin & Sub-Admin Control
            </span>
            <span className="text-xs text-blue-100 font-mono">Staff Security & Credential Manager</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight uppercase flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-200" />
            <span>Staff Accounts & Credential Vault</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-500/30 text-white border border-blue-400/40 font-mono">
              ROLE SECURITY • ACCESS PINS
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAllCredentials}
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs px-3.5 py-2.5 rounded-lg border border-slate-700 flex items-center gap-2 uppercase tracking-wide cursor-pointer transition-colors"
            title="Copy full directory login IDs and passwords"
          >
            {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-teal-400" />}
            <span>{copiedAll ? 'Credentials Copied!' : 'Export Login Directory'}</span>
          </button>

          <button
            onClick={() => {
              generateNewPin();
              setShowAddModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 uppercase tracking-wide cursor-pointer transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Create Staff Account
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Role Filters */}
        <div className="flex flex-wrap items-center gap-1.5 font-bold">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider mr-1">Filter Role:</span>
          {['ALL', 'ADMIN', 'SUB_ADMIN', 'CRM_EMPLOYEE', 'PROJECT_MANAGER', 'SR_DESIGNER', 'DESIGNER', 'PROJECT_COORDINATOR', 'SITE_SUPERVISOR', 'HR', 'ACCOUNTS', 'PURCHASE', 'FACILITY_MANAGER', 'VENDOR_MANAGER', 'IT_PERSON'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-md transition-colors font-semibold cursor-pointer ${
                roleFilter === r
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'ALL' ? 'All Staff' : r === 'PROJECT_COORDINATOR' ? 'Project Coordinator' : r === 'IT_PERSON' ? 'IT Person' : r.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff name, code, email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Provisioned Staff Accounts ({filteredUsers.length})
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Click "Inspect Account & Works" to review staff assignments</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Employee & Code</th>
                <th className="p-3.5">Role & Designation</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Assigned Work Portfolio</th>
                <th className="p-3.5">Login Credentials (ID / Password / PIN)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.map((u) => {
                const userWorks = getUserWorks(u.id);
                const activeWorksCount = userWorks.filter((w) => !w.crmCompleted).length;
                const userLeadsCount = getUserLeads(u.id).length;
                const pass = u.password || `Pass#${u.accessPin || '849201'}`;
                const isPassVisible = !!visiblePasswords[u.id];

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center text-xs uppercase shadow-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">{u.name}</div>
                          <div className="text-[10px] font-mono text-blue-600 font-bold">
                            {u.employeeCode || `EMP-2026-${u.id.slice(-3)}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${getRoleBadge(u.role)}`}>
                          {u.role.replace('_', ' ')}
                        </span>
                        <div className="text-[11px] text-slate-600 font-medium">{u.designation || 'Staff Member'}</div>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-700 font-medium">
                      {u.department || 'Operations'}
                    </td>

                    {/* Assigned Work Portfolio Badge */}
                    <td className="p-3.5">
                      <button
                        onClick={() => {
                          setInspectingStaff(u);
                          setInspectorTab('WORKS');
                        }}
                        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-blue-50 hover:border-blue-300 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        <span>{userWorks.length} Assigned Projects</span>
                        {activeWorksCount > 0 && (
                          <span className="bg-blue-600 text-white text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                            {activeWorksCount} active
                          </span>
                        )}
                        {u.role === 'CRM_EMPLOYEE' && userLeadsCount > 0 && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold border border-amber-200">
                            {userLeadsCount} leads
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Login Credentials Column */}
                    <td className="p-3.5 font-mono">
                      <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200/90 text-[10px]">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-400 font-sans text-[9px] uppercase font-bold">ID:</span>
                          <span className="font-bold text-slate-900 truncate max-w-[140px]">{u.email}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-1">
                          <span className="text-slate-400 font-sans text-[9px] uppercase font-bold">PASS:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                              {isPassVisible ? pass : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                              title={isPassVisible ? "Hide password" : "Show password"}
                            >
                              {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-200 pt-1 text-[9px]">
                          <span className="text-slate-400 font-sans uppercase font-bold">PIN:</span>
                          <span className="font-extrabold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            {u.accessPin || '849201'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => onToggleUserActive(u.id)}
                        className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
                          u.active
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {u.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleCopyCredentials(u)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Copy Staff Credentials"
                        >
                          {copiedId === u.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setInspectingStaff(u);
                            setInspectorTab('WORKS');
                          }}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          title="Inspect Account & Works"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect Works
                        </button>

                        <button
                          onClick={() => openEditUser(u)}
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                          title="Edit Staff Member"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {onDeleteUser && (
                          <button
                            onClick={() => setDeletingUser(u)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Staff Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create New Staff Account */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                  <UserPlus className="w-5 h-5 text-blue-600" /> Create Staff Account & Credentials
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Provision new employee profile and security PIN</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assign Role *</label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-bold text-slate-900"
                  >
                    <option value="SUB_ADMIN">Sub-Admin (Operations Head)</option>
                    <option value="HR">HR (Human Resources Manager)</option>
                    <option value="ACCOUNTS">Accounts (Finance & Payout Manager)</option>
                    <option value="CRM_EMPLOYEE">CRM Employee (Sales / Account Exec)</option>
                    <option value="PROJECT_MANAGER">Project Manager (OTP & Dispatch Lead)</option>
                    <option value="SR_DESIGNER">Senior Designer (Design Lead / Allocation Head)</option>
                    <option value="DESIGNER">Designer (Graphic & 3D Artist)</option>
                    <option value="PROJECT_COORDINATOR">Project Coordinator (Field & Ops Lead)</option>
                    <option value="SITE_SUPERVISOR">Site Supervisor (Field Staff)</option>
                    <option value="PURCHASE">Purchase Officer (Procurement Head)</option>
                    <option value="FACILITY_MANAGER">Facility Manager</option>
                    <option value="VENDOR_MANAGER">Vendor Manager</option>
                    <option value="IT_PERSON">IT Person (Systems & Infrastructure)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation Title</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior CRM Account Exec"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Client Relations & Sales"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="emp.name@companycrm.com"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-medium font-mono"
                  />
                </div>
              </div>

              {/* Password & Security Passcode Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Login Password *</label>
                  <input
                    type="text"
                    required
                    value={password || `Pass#${accessPin}`}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. Crm@528190"
                    className="w-full p-2.5 border border-teal-300 bg-teal-50/50 rounded-lg font-mono font-bold text-teal-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">System Access PIN (6 Digits)</label>
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-black text-amber-950 font-mono">{accessPin}</span>
                    <button
                      type="button"
                      onClick={generateNewPin}
                      className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> New PIN
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 bg-slate-100 font-bold uppercase tracking-wider text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-500 font-bold uppercase tracking-wider text-[11px] shadow-sm"
                >
                  Save & Provision Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: STAFF WORK INSPECTOR & ACCOUNT DETAILS */}
      {inspectingStaff && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black text-xl flex items-center justify-center uppercase shadow-md">
                  {inspectingStaff.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-900">{inspectingStaff.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getRoleBadge(inspectingStaff.role)}`}>
                      {inspectingStaff.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5 font-medium">
                    <span className="font-mono text-blue-600 font-bold">{inspectingStaff.employeeCode || 'EMP-2026-REG'}</span>
                    <span>• {inspectingStaff.designation || 'Staff Member'}</span>
                    <span>• {inspectingStaff.department || 'Operations'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onSelectUser && (
                  <button
                    onClick={() => {
                      onSelectUser(inspectingStaff);
                      setInspectingStaff(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Switch Portal Session
                  </button>
                )}

                {onDeleteUser && (
                  <button
                    onClick={() => setDeletingUser(inspectingStaff)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 uppercase tracking-wider cursor-pointer transition-colors"
                    title="Delete Staff Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Account
                  </button>
                )}

                <button 
                  onClick={() => setInspectingStaff(null)} 
                  className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-2 shrink-0">
              <button
                onClick={() => setInspectorTab('WORKS')}
                className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  inspectorTab === 'WORKS'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Briefcase className="w-4 h-4" /> Assigned Works ({getUserWorks(inspectingStaff.id).length})
              </button>

              {inspectingStaff.role === 'CRM_EMPLOYEE' && (
                <button
                  onClick={() => setInspectorTab('LEADS')}
                  className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                    inspectorTab === 'LEADS'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4" /> Submitted Leads ({getUserLeads(inspectingStaff.id).length})
                </button>
              )}

              <button
                onClick={() => setInspectorTab('PROFILE')}
                className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  inspectorTab === 'PROFILE'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <KeyRound className="w-4 h-4" /> Profile & Passcode Credentials
              </button>
            </div>

            {/* Tab 1: Assigned Works */}
            {inspectorTab === 'WORKS' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {getUserWorks(inspectingStaff.id).length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                    <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="font-bold text-slate-700 text-sm">No Work Assignments Found</div>
                    <p className="text-slate-500 text-xs max-w-sm mx-auto">
                      This staff member currently has no work orders assigned to them as CRM, Designer, Supervisor, or Site Supervisor.
                    </p>
                  </div>
                ) : (
                  getUserWorks(inspectingStaff.id).map((w) => (
                    <div key={w.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">{w.workTitle}</div>
                          <div className="text-slate-500 font-semibold text-[11px] uppercase mt-0.5">
                            Client: <strong className="text-slate-800">{w.clientCompanyName}</strong> ({w.brandName})
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                              w.crmCompleted ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                            }`}
                          >
                            {w.crmCompleted ? 'Supervisor Phase' : w.currentStep.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Role-Specific Work Summaries */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 text-[11px]">
                        {/* Visit Recce Report */}
                        {w.visitReport && (
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-blue-600" /> Recce Visit Report (CRM)
                            </div>
                            <p className="text-slate-600 leading-relaxed italic">{w.visitReport.visitNotes}</p>
                            <div className="text-[10px] text-slate-400">Date: {w.visitReport.visitDate}</div>
                          </div>
                        )}

                        {/* Designer Deliverable */}
                        {w.designDeliverable && (
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <Palette className="w-3.5 h-3.5 text-purple-600" /> Designer Artwork Deliverables
                            </div>
                            <div className="text-slate-700">Artwork Title: {w.designDeliverable.artworkTitle}</div>
                            {w.designDeliverable.pptFileUrl && (
                              <a
                                href={w.designDeliverable.pptFileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline font-bold flex items-center gap-1 mt-1"
                              >
                                <ExternalLink className="w-3 h-3" /> View Presentation PPT
                              </a>
                            )}
                          </div>
                        )}

                        {/* Supervisor OTP */}
                        {w.supervisorOtpCode && (
                          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 space-y-1">
                            <div className="font-bold text-amber-900 flex items-center gap-1">
                              <HardHat className="w-3.5 h-3.5 text-amber-700" /> Supervisor Field Access OTP
                            </div>
                            <div className="font-mono font-black text-amber-950 text-sm tracking-widest">
                              {w.supervisorOtpCode}
                            </div>
                          </div>
                        )}

                        {/* Site Executions */}
                        {w.siteExecutions && w.siteExecutions.length > 0 && (
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Site Punch-In Execution History
                            </div>
                            <div className="text-slate-600">
                              {w.siteExecutions.length} site punch-in records logged.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Submitted Leads */}
            {inspectorTab === 'LEADS' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {getUserLeads(inspectingStaff.id).length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                    <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="font-bold text-slate-700 text-sm">No Submitted Leads</div>
                    <p className="text-slate-500 text-xs">
                      No customer leads have been logged by this CRM staff member yet.
                    </p>
                  </div>
                ) : (
                  getUserLeads(inspectingStaff.id).map((l) => (
                    <div key={l.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                      <div>
                        <div className="font-extrabold text-slate-900">{l.companyName}</div>
                        <div className="text-slate-500 text-[11px]">
                          Contact: {l.contactPerson} ({l.phone})
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Logged Date: {l.createdAt}</div>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-bold uppercase rounded">
                          {l.status}
                        </span>
                        <div className="font-black text-slate-900 text-xs font-mono">
                          ₹{l.estimatedValue ? l.estimatedValue.toLocaleString('en-IN') : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Account Profile & Passcode Credentials */}
            {inspectorTab === 'PROFILE' && (
              <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Staff Profile Summary</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Login Email / User ID</span>
                      <strong className="text-slate-900 font-medium">{inspectingStaff.email}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Mobile Contact</span>
                      <strong className="text-slate-900 font-mono">{inspectingStaff.phone}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Department</span>
                      <strong className="text-slate-900 font-medium">{inspectingStaff.department || 'Operations'}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Designation</span>
                      <strong className="text-slate-900 font-medium">{inspectingStaff.designation || 'Staff Member'}</strong>
                    </div>
                  </div>
                </div>

                {/* Role Login Credentials Card */}
                <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">Role Portal Credentials</span>
                      <div className="text-sm font-extrabold text-teal-950">
                        {inspectingStaff.name} ({inspectingStaff.role.replace(/_/g, ' ')})
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyCredentials(inspectingStaff)}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy Credentials
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-teal-200 font-mono text-xs">
                    <div>
                      <span className="text-slate-400 text-[9px] uppercase block font-sans font-bold">Login Email / ID</span>
                      <strong className="text-slate-900 text-[11px] truncate block">{inspectingStaff.email}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] uppercase block font-sans font-bold">Password</span>
                      <strong className="text-teal-900 text-[11px] block">{inspectingStaff.password || `Pass#${inspectingStaff.accessPin || '849201'}`}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] uppercase block font-sans font-bold">Access PIN</span>
                      <strong className="text-amber-800 text-[11px] block">{inspectingStaff.accessPin || '849201'}</strong>
                    </div>
                  </div>

                  <p className="text-[10px] text-teal-800/90 font-medium">
                    Session stays logged in continuously until password changes or account deletion.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Staff Account */}
      {deletingUser && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 pb-2 border-b border-slate-100">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Staff Account</h3>
                <p className="text-xs text-slate-500">Confirm permanent account removal</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-medium">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Staff Name:</span>{' '}
                <strong className="text-slate-900">{deletingUser.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Employee Code:</span>{' '}
                <strong className="font-mono text-blue-600">{deletingUser.employeeCode || 'EMP-2026-REG'}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Role:</span>{' '}
                <strong className="text-slate-800">{deletingUser.role.replace('_', ' ')}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Email:</span>{' '}
                <strong className="text-slate-800">{deletingUser.email}</strong>
              </div>
            </div>

            <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              Warning: This action will permanently remove {deletingUser.name} from the Team & Role Directory and revoke access PIN credentials.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold uppercase tracking-wider text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteUser && deletingUser) {
                    onDeleteUser(deletingUser.id);
                    if (inspectingStaff?.id === deletingUser.id) {
                      setInspectingStaff(null);
                    }
                    setDeletingUser(null);
                  }
                }}
                className="px-5 py-2 rounded-xl text-white bg-rose-600 hover:bg-rose-700 font-bold uppercase tracking-wider text-xs shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Staff Account */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Edit Staff Member</h3>
                  <p className="text-xs text-slate-500">Update employee profile & role credentials</p>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingUser) {
                  const passChanged = editPassword !== editingUser.password || editPin !== editingUser.accessPin;
                  const updated: UserAccount = {
                    ...editingUser,
                    name: editName,
                    email: editEmail,
                    phone: editPhone,
                    role: editRole,
                    department: editDepartment,
                    designation: editDesignation,
                    accessPin: editPin,
                    password: editPassword,
                    ...(passChanged ? { passwordLastChangedAt: new Date().toISOString() } : {})
                  };
                  if (onUpdateUser) {
                    onUpdateUser(updated);
                  }
                  if (inspectingStaff?.id === editingUser.id) {
                    setInspectingStaff(updated);
                  }
                  setEditingUser(null);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role *</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="ADMIN">ADMIN (Managing Director)</option>
                    <option value="SUB_ADMIN">SUB_ADMIN (VP Ops)</option>
                    <option value="CRM_EMPLOYEE">CRM_EMPLOYEE (Sales / Client Exec)</option>
                    <option value="PROJECT_MANAGER">PROJECT_MANAGER (OTP & Dispatch Lead)</option>
                    <option value="SR_DESIGNER">SR_DESIGNER (Senior Designer Lead)</option>
                    <option value="DESIGNER">DESIGNER (Graphic & 3D Artist)</option>
                    <option value="PROJECT_COORDINATOR">PROJECT_COORDINATOR (Field & Ops)</option>
                    <option value="SITE_SUPERVISOR">SITE_SUPERVISOR (On-Site Exec)</option>
                    <option value="PURCHASE">PURCHASE (Purchase Officer)</option>
                    <option value="FACILITY_MANAGER">FACILITY_MANAGER (Facility Manager)</option>
                    <option value="VENDOR_MANAGER">VENDOR_MANAGER (Vendor Manager)</option>
                    <option value="IT_PERSON">IT_PERSON (IT Systems & Infrastructure)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Login Password *</label>
                  <input
                    type="text"
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full p-2.5 border border-teal-300 bg-teal-50/60 rounded-xl font-mono font-bold text-teal-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Security PIN (6 Digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value)}
                    className="w-full p-2.5 border border-amber-300 bg-amber-50 rounded-xl font-mono font-bold text-amber-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold uppercase tracking-wider text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-amber-600 hover:bg-amber-700 font-bold uppercase tracking-wider text-xs shadow-md shadow-amber-600/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
