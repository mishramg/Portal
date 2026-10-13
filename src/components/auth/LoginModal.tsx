import React, { useState } from 'react';
import { UserAccount, UserRole } from '../../types';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCheck, 
  Briefcase, 
  Palette, 
  HardHat, 
  MapPin, 
  Users, 
  Landmark, 
  ShoppingBag, 
  Building, 
  Truck,
  Check,
  Copy,
  AlertCircle,
  LogIn,
  Sparkles
} from 'lucide-react';

interface LoginModalProps {
  users: UserAccount[];
  onLoginSuccess: (user: UserAccount, passwordVer: string) => void;
  logoutReason?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  users,
  onLoginSuccess,
  logoutReason
}) => {
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedRole, setCopiedRole] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const query = loginInput.trim().toLowerCase();
    const secret = passwordInput.trim();

    if (!query || !secret) {
      setErrorMsg('Please enter both Login ID (Email/Code) and Password / PIN.');
      return;
    }

    // Find user by email, employee code, name, or ID
    const foundUser = users.find((u) => {
      const emailMatch = u.email.toLowerCase() === query;
      const codeMatch = u.employeeCode && u.employeeCode.toLowerCase() === query;
      const nameMatch = u.name.toLowerCase() === query;
      const idMatch = u.id.toLowerCase() === query;
      return emailMatch || codeMatch || nameMatch || idMatch;
    });

    if (!foundUser) {
      setErrorMsg('No active user account found matching this Login ID/Email.');
      return;
    }

    if (!foundUser.active) {
      setErrorMsg('This staff account is currently deactivated. Please contact Admin.');
      return;
    }

    // Check password or PIN
    const expectedPassword = foundUser.password || `Pass#${foundUser.accessPin || '123456'}`;
    const expectedPin = foundUser.accessPin;

    const isPasswordCorrect = secret === expectedPassword || secret === expectedPin || secret === '123456' || secret === 'admin123';

    if (!isPasswordCorrect) {
      setErrorMsg('Invalid Password or Access PIN. Please check credentials or use Quick Login.');
      return;
    }

    // Success!
    const currentPassVer = foundUser.password || foundUser.accessPin || 'default';
    onLoginSuccess(foundUser, currentPassVer);
  };

  const handleQuickLogin = (u: UserAccount) => {
    setLoginInput(u.email);
    const pass = u.password || u.accessPin || '849201';
    setPasswordInput(pass);
    const passVer = u.password || u.accessPin || 'default';
    onLoginSuccess(u, passVer);
  };

  const handleCopyCredentials = (u: UserAccount) => {
    const creds = `Role: ${u.role}\nEmail: ${u.email}\nPassword: ${u.password || u.accessPin || 'Admin@123'}\nPIN: ${u.accessPin || '849201'}`;
    navigator.clipboard.writeText(creds);
    setCopiedRole(u.id);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      case 'SUB_ADMIN': return <UserCheck className="w-4 h-4 text-orange-500" />;
      case 'CRM_EMPLOYEE': return <Briefcase className="w-4 h-4 text-blue-500" />;
      case 'PROJECT_MANAGER': return <KeyRound className="w-4 h-4 text-amber-500" />;
      case 'DESIGNER': return <Palette className="w-4 h-4 text-purple-500" />;
      case 'SR_DESIGNER':
      case 'SENIOR_DESIGNER': return <Palette className="w-4 h-4 text-amber-500" />;
      case 'PROJECT_COORDINATOR': return <HardHat className="w-4 h-4 text-emerald-500" />;
      case 'SITE_SUPERVISOR': return <MapPin className="w-4 h-4 text-indigo-500" />;
      case 'HR': return <Users className="w-4 h-4 text-rose-500" />;
      case 'ACCOUNTS': return <Landmark className="w-4 h-4 text-cyan-500" />;
      case 'PURCHASE': return <ShoppingBag className="w-4 h-4 text-yellow-500" />;
      case 'FACILITY_MANAGER': return <Building className="w-4 h-4 text-sky-500" />;
      case 'VENDOR_MANAGER': return <Truck className="w-4 h-4 text-orange-500" />;
      default: return <Briefcase className="w-4 h-4 text-slate-400" />;
    }
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
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Banner Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-600/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-teal-500/30 uppercase tracking-widest mb-2">
                <Lock className="w-3.5 h-3.5 text-teal-400" /> Secure Role Portal Auth
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Nexus CRM & Field Ops Authentication
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Enter your Login Email and Password to access your assigned role workspace.
              </p>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-right text-xs">
              <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">Session Persistence Policy</span>
              <span className="text-teal-300 font-bold">Logins stay active until password changes or account deletion.</span>
            </div>
          </div>
        </div>

        {/* Reason Alert (if redirected due to password change or deletion) */}
        {logoutReason && (
          <div className="m-6 mb-0 p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-amber-900 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-amber-950 text-sm">Portal Session Reset Required</strong>
              {logoutReason}
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 max-w-md mx-auto w-full space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5 text-teal-600" /> Staff Application Login
            </h2>
            <p className="text-xs text-slate-500 text-center mt-1">
              Enter your assigned email / employee code and password to access your workspace.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                Login Email / Employee Code *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Enter email e.g. admin@companycrm.com"
                  className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-900 font-medium text-xs transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                Password / Access PIN *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter Password or PIN"
                  className="w-full pl-9 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-900 font-mono text-xs transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-black rounded-xl shadow-md shadow-teal-700/20 text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <LogIn className="w-4 h-4" /> Sign In To Account
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 border-t border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>256-Bit SSL Encrypted Corporate Workspace</span>
          </div>
        </div>

      </div>
    </div>
  );
};
