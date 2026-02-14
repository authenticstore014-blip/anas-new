
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, ShieldCheck, Shield, Lock, Users, Trash2, Ban, Pause, Play, 
  Terminal, Activity, Search, Eye, X, Filter, FileText, Banknote, 
  Car, Bike, Truck, RefreshCw, AlertCircle, TrendingUp, MoreVertical,
  ChevronRight, ReceiptText, Printer, Download, CreditCard, ExternalLink,
  Snowflake, History, Landmark, Gavel, UserX, Inbox, MessageSquare, CheckCircle, Mail,
  AlertTriangle, Hammer, ClipboardList, Flag, CheckCircle2, RotateCcw,
  Settings, Phone, EyeOff, UserPlus, Fingerprint, RefreshCcw, ShieldX, Database,
  ArrowUpRight, ArrowRight, AlertOctagon, FileDown, Plus, Info, Zap, Clock, Loader2,
  Code, FileJson, Copy, HeartPulse, HardDrive, Beaker, FileSearch, Edit3, Briefcase,
  CalendarDays, Settings2, ShieldQuestion, UserCog, ChevronDown, ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { User, Policy, MIDSubmission, PolicyStatus } from '../types';

// TOOLTIP COMPONENT (Lightweight Wrapper)
const ActionButton = ({ onClick, icon, tooltip, colorClass, disabled }: any) => (
  <div className="relative group">
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`p-2.5 rounded-xl transition-all shadow-sm disabled:opacity-30 ${colorClass}`}
    >
      {icon}
    </button>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#2d1f2d] text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-200 z-[100] translate-y-1 group-hover:translate-y-0 shadow-2xl border border-white/10">
      {tooltip}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#2d1f2d]" />
    </div>
  </div>
);

// POLICY INTELLIGENCE PANEL (Slide-over Detail View)
const PolicyIntelligencePanel = ({ policy, onClose, getCustomerName, onStatusUpdate }: { 
  policy: Policy; 
  onClose: () => void; 
  getCustomerName: (id: string) => string;
  onStatusUpdate: (id: string, status: PolicyStatus, reason: string) => void;
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-[#2d1f2d]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="bg-[#e91e8c]/10 p-3 rounded-2xl text-[#e91e8c]">
                <ShieldCheck size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-bold font-outfit tracking-tighter">Policy Intelligence</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Registry Ref: {policy.id}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-10">
          {/* Summary Header */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <p className="font-bold text-[#2d1f2d] flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full ${policy.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                   {policy.status}
                </p>
             </div>
             <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Holder Identity</p>
                <p className="font-bold text-[#2d1f2d] truncate">{getCustomerName(policy.userId)}</p>
             </div>
          </div>

          {/* Asset Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
               <Car size={14} /> Risk Asset Verification
            </h3>
            <div className="p-8 bg-white border border-gray-100 rounded-[32px] shadow-sm grid grid-cols-2 gap-8">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Registration</p>
                  <p className="text-2xl font-black font-outfit uppercase tracking-tighter text-[#2d1f2d]">{policy.details?.vrm || 'N/A'}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Specification</p>
                  <p className="text-lg font-bold text-[#2d1f2d]">{policy.details?.make} {policy.details?.model}</p>
               </div>
               <div className="col-span-2 grid grid-cols-3 gap-4 pt-6 border-t border-gray-50">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Year</p>
                    <p className="text-sm font-bold">{policy.details?.year || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">NCB Applied</p>
                    <p className="text-sm font-bold">{policy.details?.ncb || '0'} Years</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Excess</p>
                    <p className="text-sm font-bold">{policy.details?.excess || '£250'}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Underwriting Meta */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
               <Fingerprint size={14} /> Underwriting Metadata
            </h3>
            <div className="p-8 bg-[#2d1f2d] rounded-[32px] text-white/80 space-y-6">
               <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Licence Number</span>
                  <span className="text-sm font-mono font-bold text-[#e91e8c]">{policy.details?.licenceNumber || 'NOT_FOUND'}</span>
               </div>
               <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Cover Level</span>
                  <span className="text-sm font-bold">{policy.details?.coverLevel || 'Comprehensive'}</span>
               </div>
               <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Policy Term</span>
                  <span className="text-sm font-bold">{policy.duration}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Binding Date</span>
                  <span className="text-sm font-bold">{policy.validatedAt ? new Date(policy.validatedAt).toLocaleString() : 'N/A'}</span>
               </div>
            </div>
          </div>

          {/* Raw Data Inspector */}
          <div className="space-y-4">
             <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
               <Code size={14} /> Technical Audit Payload
            </h3>
            <div className="bg-gray-900 p-6 rounded-3xl overflow-x-auto">
               <pre className="text-[10px] font-mono text-green-400 leading-relaxed">
                 {JSON.stringify(policy, null, 2)}
               </pre>
            </div>
          </div>

          {/* Admin Operations Footer */}
          <div className="pt-10 border-t border-gray-100 flex flex-wrap gap-4">
            <button 
              onClick={() => onStatusUpdate(policy.id, 'Active', 'Admin Deep Audit Resume')}
              className="flex-1 py-4 bg-[#e91e8c] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-[#c4167a] transition-all"
            >
              <Play size={14} /> Resume Coverage
            </button>
            <button 
              onClick={() => onStatusUpdate(policy.id, 'Blocked', 'Admin Deep Audit Hold')}
              className="flex-1 py-4 border-2 border-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
            >
              <ShieldAlert size={14} /> Flag Risk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomerCenterPage: React.FC = () => {
  const { 
    user, isLoading, logout, users, policies,
    runDiagnostics, testRegistrationFlow, updatePolicyStatus, deletePolicy, refreshData
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dashboardView, setDashboardView] = useState<'summary' | 'active-feed'>('summary');
  const [isScanning, setIsScanning] = useState(false);
  const [isTestingReg, setIsTestingReg] = useState(false);
  const [diagReport, setDiagReport] = useState<any>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [policySearch, setPolicySearch] = useState('');
  
  // New State for Detailed Policy View
  const [viewingPolicy, setViewingPolicy] = useState<Policy | null>(null);
  
  // Advanced Filter State (Admin Only)
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const isAdmin = user?.role === 'admin';

  // IDENTITY LOOKUP HELPER
  const getCustomerName = useCallback((userId: string) => {
    const u = users.find(u => u.id === userId);
    return u ? u.name : 'Unknown Account';
  }, [users]);

  // DRILL DOWN DATA (ADMIN ONLY)
  const activePolicies = useMemo(() => {
    return policies.filter(p => p.status === 'Active');
  }, [policies]);

  // ADVANCED QUERY ENGINE
  const filteredPolicies = useMemo(() => {
    let list = [...policies];
    
    // 1. Identity Isolation (Security Check)
    if (!isAdmin && user) {
      list = list.filter(p => p.userId === user.id && p.status !== 'Removed');
    }

    // 2. Search Vector (Policy ID, VRM, or User Name)
    if (policySearch) {
      const s = policySearch.toLowerCase();
      list = list.filter(p => {
        const userName = getCustomerName(p.userId).toLowerCase();
        return p.id.toLowerCase().includes(s) || 
               p.details?.vrm?.toLowerCase().includes(s) ||
               userName.includes(s);
      });
    }

    // 3. Status Vector (Normalized for Data Consistency)
    if (statusFilter !== 'All') {
      const mapped = statusFilter === 'Pending' ? 'Pending Validation' : statusFilter;
      list = list.filter(p => p.status === mapped);
    }

    // 4. Type Vector
    if (typeFilter !== 'All') {
      list = list.filter(p => p.type.toLowerCase().includes(typeFilter.toLowerCase()));
    }

    return list;
  }, [policies, policySearch, statusFilter, typeFilter, isAdmin, user, getCustomerName]);

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredPolicies.length / pageSize);
  const paginatedPolicies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPolicies.slice(start, start + pageSize);
  }, [filteredPolicies, currentPage]);

  const handleDownloadPDF = useCallback((policy: Policy) => {
    if (policy.status === 'Removed') {
      alert("Unauthorized Access: Cannot retrieve documentation for removed records.");
      return;
    }
    
    if (!policy.pdfUrl) {
      alert("System Integrity Alert: PDF stream not found for this reference.");
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = policy.pdfUrl;
      link.setAttribute('download', `SwiftPolicy_${policy.id}_${policy.details?.vrm || 'Document'}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log(`SECURE_AUDIT: PDF_DOWNLOAD_SUCCESS: ${policy.id} by ${user?.email}`);
    } catch (err) {
      console.error("PDF RECOVERY ERROR:", err);
      alert("Network Error: Could not establish secure download stream.");
    }
  }, [user]);

  const handleRunScan = async () => {
    setIsScanning(true);
    const report = await runDiagnostics();
    setDiagReport(report);
    setIsScanning(false);
  };

  const handleTestRegistration = async () => {
    setIsTestingReg(true);
    setTestResult(null);
    const result = await testRegistrationFlow();
    setTestResult(result);
    setIsTestingReg(false);
  };

  const getStatusBadge = (status: PolicyStatus) => {
    switch (status) {
      case 'Active': return <span className="px-3 py-1 bg-green-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>;
      case 'Frozen': return <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Frozen</span>;
      case 'Blocked': return <span className="px-3 py-1 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Blocked</span>;
      case 'Validated': return <span className="px-3 py-1 bg-indigo-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Validated</span>;
      case 'Removed': return <span className="px-3 py-1 bg-gray-400 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Removed</span>;
      case 'Pending Validation': return <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Pending</span>;
      default: return <span className="px-3 py-1 bg-gray-200 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">{status}</span>;
    }
  };

  const getStatusMessage = (status: PolicyStatus) => {
    switch (status) {
      case 'Frozen': return "Your policy is currently frozen. Claims and renewals are suspended. Contact support for reinstatement.";
      case 'Blocked': return "This policy has been blocked by our administration team. Coverage is VOID until further notice.";
      case 'Validated': return "Underwriting Complete. Your policy is validated and awaiting activation.";
      case 'Pending Validation': return "Documents Received. Our team is manually verifying your details (ETA 2h).";
      case 'Active': return "Comprehensive protection is active. MID has been updated.";
      default: return null;
    }
  };

  // Early returns must happen after all hooks have been initialized
  if (isLoading) return null;
  if (!user) return <Navigate to="/auth" />;

  return (
    <div className="min-h-screen bg-[#faf8fa] pb-20 font-inter text-[#2d1f2d]">
      <div className="absolute top-0 left-0 w-full h-[350px] bg-[#2d1f2d] z-0" />
      <div className="relative z-10 pt-16 max-w-7xl mx-auto px-4">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
               {isAdmin ? <Terminal className="text-[#e91e8c]" size={28} /> : <div className="text-2xl font-black text-[#e91e8c] font-outfit">{user.name.charAt(0)}</div>}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white font-outfit tracking-tighter">{isAdmin ? 'SwiftPanel Control' : 'My Dashboard'}</h1>
              <p className="text-white/50 text-sm">{user.email} • <span className="uppercase tracking-widest font-black text-[#e91e8c] text-[10px]">{user.role}</span></p>
            </div>
          </div>
          <button onClick={logout} className="px-8 py-3 bg-white text-[#2d1f2d] rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-gray-100 transition-all">Sign Out</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1 space-y-3">
            {[
              { id: 'dashboard', label: 'Overview', icon: <TrendingUp size={18} /> },
              ...(isAdmin ? [
                { id: 'policies', label: 'Admin Policies', icon: <ShieldCheck size={18} /> },
                { id: 'identities', label: 'Identity Vault', icon: <UserCog size={18} /> },
                { id: 'diagnostics', label: 'System Integrity', icon: <HeartPulse size={18} /> }
              ] : [
                { id: 'my-policies', label: 'My Policies', icon: <ShieldCheck size={18} /> }
              ])
            ].map((item: any) => (
              <button 
                key={item.id} 
                onClick={() => { setActiveTab(item.id); setDashboardView('summary'); setCurrentPage(1); }} 
                className={`w-full flex items-center gap-4 px-8 py-5 rounded-2xl font-black text-xs transition-all text-left uppercase tracking-widest ${
                  activeTab === item.id ? 'bg-[#e91e8c] text-white shadow-lg' : 'bg-white/5 hover:bg-white/10 text-white/40'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white p-8 md:p-12 rounded-[56px] border border-gray-100 shadow-2xl min-h-[700px]">
              
              {activeTab === 'dashboard' && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold font-outfit">{isAdmin ? 'Live Operations Feed' : 'Policy Register'}</h2>
                    {isAdmin && dashboardView === 'active-feed' && (
                      <button 
                        onClick={() => setDashboardView('summary')}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#e91e8c] hover:underline"
                      >
                        <RotateCcw size={12} /> Back to Summary
                      </button>
                    )}
                  </div>

                  {isAdmin ? (
                    dashboardView === 'summary' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
                        {/* Active Policies Card */}
                        <button 
                          onClick={() => setDashboardView('active-feed')}
                          className="p-10 bg-[#2d1f2d] rounded-[40px] text-white text-left hover:scale-[1.02] transition-transform active:scale-95 group shadow-xl"
                        >
                          <ShieldCheck className="text-[#e91e8c] mb-6 group-hover:scale-110 transition-transform" size={32} />
                          <p className="text-6xl font-black font-outfit">{activePolicies.length}</p>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mt-2">Active Registrations</p>
                          <div className="mt-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#e91e8c] opacity-0 group-hover:opacity-100 transition-opacity">
                            View Detailed Feed <ArrowRight size={12} />
                          </div>
                        </button>

                        {/* Total Underwritten Contracts Card */}
                        <button 
                          onClick={() => setActiveTab('policies')}
                          className="p-10 bg-gray-50 border border-gray-100 rounded-[40px] text-left hover:scale-[1.02] transition-transform active:scale-95 group shadow-sm hover:bg-white hover:shadow-xl"
                        >
                          <Users className="text-green-500 mb-6 group-hover:scale-110 transition-transform" size={32} />
                          <p className="text-6xl font-black font-outfit">{policies.filter(p => p.status !== 'Removed').length}</p>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Total Underwritten</p>
                          <div className="mt-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            Audit Full Registry <ArrowRight size={12} />
                          </div>
                        </button>
                      </div>
                    ) : (
                      /* DETAILED ACTIVE FEED VIEW (DRILL DOWN) */
                      <div className="animate-in slide-in-from-right-8 duration-500">
                        <div className="mb-6 p-6 bg-green-50 rounded-3xl border border-green-100 flex items-center gap-4">
                          <Activity className="text-green-500" size={24} />
                          <div>
                            <p className="text-xs font-black text-green-700 uppercase tracking-widest">Active Operations Monitor</p>
                            <p className="text-sm text-green-600/80">Displaying all currently active insurance contracts across the digital network.</p>
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-sm">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                              <tr>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Ref</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Policyholder</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Asset</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Dates</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {activePolicies.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="px-6 py-20 text-center text-gray-300 font-bold uppercase tracking-widest text-[10px]">
                                    No active policies currently found in the registry.
                                  </td>
                                </tr>
                              ) : (
                                activePolicies.map(p => (
                                  <tr key={p.id} onClick={() => setViewingPolicy(p)} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                                    <td className="px-6 py-5">
                                      <span className="text-xs font-black text-[#2d1f2d] font-mono">{p.id}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                      <div className="flex flex-col">
                                        <span className="text-sm font-bold text-[#2d1f2d]">{getCustomerName(p.userId)}</span>
                                        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">ID: {p.userId.slice(0, 8)}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-5">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                          {p.type.includes('Car') ? <Car size={16}/> : p.type.includes('Van') ? <Truck size={16}/> : <Bike size={16}/>}
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-xs font-black uppercase text-[#2d1f2d] tracking-widest">{p.details?.vrm || 'PENDING'}</span>
                                          <span className="text-[10px] text-gray-400 font-medium">{p.details?.make} {p.details?.model}</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-5">
                                      <div className="flex flex-col text-[10px] font-bold text-gray-500">
                                        <span className="flex items-center gap-1"><Clock size={10} /> Start: {p.validatedAt ? new Date(p.validatedAt).toLocaleDateString() : 'N/A'}</span>
                                        <span className="text-gray-300">Exp: {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-5">
                                      {getStatusBadge(p.status)}
                                    </td>
                                    <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-center gap-2">
                                        <ActionButton 
                                          onClick={() => handleDownloadPDF(p)}
                                          icon={<FileDown size={16} />}
                                          tooltip="Download Certificate"
                                          colorClass="bg-white border border-gray-100 text-gray-400 hover:text-[#e91e8c]"
                                        />
                                        <ActionButton 
                                          onClick={() => setViewingPolicy(p)}
                                          icon={<Search size={16} />}
                                          tooltip="View Registry Details"
                                          colorClass="bg-white border border-gray-100 text-gray-400 hover:text-[#e91e8c]"
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="space-y-8">
                      {filteredPolicies.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
                          <ShieldQuestion className="mx-auto text-gray-200 mb-6" size={48} />
                          <p className="text-gray-400 font-bold">No insurance records found in your portal.</p>
                          <Link to="/quote" className="inline-block mt-4 text-[#e91e8c] font-black uppercase tracking-widest text-xs">Start New Application</Link>
                        </div>
                      ) : (
                        filteredPolicies.map(p => (
                          <div key={p.id} className="p-8 bg-gray-50 border border-gray-100 rounded-[40px] shadow-sm animate-in slide-in-from-bottom-2">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-3xl font-bold font-outfit uppercase tracking-tighter">{p.details?.vrm || 'PENDING'}</h3>
                                  {getStatusBadge(p.status)}
                                </div>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{p.type} • {p.id}</p>
                              </div>
                              <div className="md:text-right flex flex-col items-start md:items-end">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Authorized Premium</p>
                                <p className="text-3xl font-black text-[#2d1f2d]">£{p.premium}</p>
                              </div>
                            </div>
                            
                            {getStatusMessage(p.status) && (
                              <div className={`mb-8 p-6 rounded-3xl flex items-center gap-4 text-xs font-bold ${
                                p.status === 'Frozen' || p.status === 'Blocked' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#e91e8c]/5 text-[#e91e8c] border border-[#e91e8c]/10'
                              }`}>
                                <Info size={24} className="shrink-0" />
                                <span className="leading-relaxed">{getStatusMessage(p.status)}</span>
                              </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-gray-200">
                               <div className="space-y-1">
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Insured Asset</p>
                                  <p className="text-xs font-bold uppercase">{p.details?.make} {p.details?.model}</p>
                               </div>
                               <div className="space-y-1">
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">NCB Discount</p>
                                  <p className="text-xs font-bold uppercase">{p.details?.ncb || '0'} Years</p>
                               </div>
                               <div className="space-y-1">
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Voluntary Excess</p>
                                  <p className="text-xs font-bold uppercase">{p.details?.excess || '£250'}</p>
                               </div>
                               <div className="flex justify-end items-center gap-3">
                                  <button onClick={() => handleDownloadPDF(p)} disabled={p.status === 'Blocked' || p.status === 'Frozen'} className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-[#e91e8c] rounded-xl transition-all shadow-sm disabled:opacity-30"><Download size={18}/></button>
                                  <button disabled={p.status === 'Blocked' || p.status === 'Frozen'} className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-[#e91e8c] rounded-xl transition-all shadow-sm disabled:opacity-30"><Printer size={18}/></button>
                               </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'policies' && isAdmin && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
                    <div>
                      <h2 className="text-3xl font-bold font-outfit">Policy Administration</h2>
                      <p className="text-gray-400 text-sm mt-1">Full control over underwritten risk contracts.</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                      <div className="relative">
                         <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                         <select 
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-8 py-3 text-[10px] font-black uppercase tracking-widest focus:border-[#e91e8c] outline-none shadow-sm appearance-none cursor-pointer"
                         >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Validated">Validated</option>
                            <option value="Active">Active</option>
                            <option value="Frozen">Frozen</option>
                            <option value="Blocked">Blocked</option>
                            <option value="Removed">Removed</option>
                         </select>
                         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={12} />
                      </div>

                      <div className="relative">
                         <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                         <select 
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                            className="bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-8 py-3 text-[10px] font-black uppercase tracking-widest focus:border-[#e91e8c] outline-none shadow-sm appearance-none cursor-pointer"
                         >
                            <option value="All">All Types</option>
                            <option value="Car">Car</option>
                            <option value="Van">Van</option>
                            <option value="Motorcycle">Motorcycle</option>
                         </select>
                         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={12} />
                      </div>

                      <div className="relative flex-1 min-w-[200px]">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                         <input 
                           className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-xs font-bold focus:border-[#e91e8c] outline-none shadow-sm" 
                           placeholder="Search ID, VRM or Holder..." 
                           value={policySearch}
                           onChange={e => { setPolicySearch(e.target.value); setCurrentPage(1); }}
                         />
                      </div>
                    </div>
                  </div>

                  {/* ADMIN POLICY DATA TABLE */}
                  <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-sm mb-8">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Policy Ref</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Holder</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Asset</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Dates</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {paginatedPolicies.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-20 text-center text-gray-300 font-bold uppercase tracking-widest text-[10px]">
                              No policy records found in registry for this query.
                            </td>
                          </tr>
                        ) : (
                          paginatedPolicies.map(p => (
                            <tr key={p.id} onClick={() => setViewingPolicy(p)} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                              <td className="px-6 py-5">
                                <span className="text-xs font-black text-[#2d1f2d] font-mono">{p.id}</span>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-[#2d1f2d]">{getCustomerName(p.userId)}</span>
                                  <span className="text-[9px] font-mono text-gray-400 uppercase">{p.userId}</span>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                    {p.type.includes('Car') ? <Car size={16}/> : p.type.includes('Van') ? <Truck size={16}/> : <Bike size={16}/>}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black uppercase text-[#2d1f2d] tracking-widest">{p.details?.vrm || 'PENDING'}</span>
                                    <span className="text-[10px] text-gray-400 font-medium">{p.details?.make} {p.details?.model}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                {getStatusBadge(p.status)}
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex flex-col text-[10px] font-bold text-gray-500">
                                  <span className="flex items-center gap-1"><Clock size={10} /> {p.validatedAt ? new Date(p.validatedAt).toLocaleDateString() : 'Unvalidated'}</span>
                                  <span className="text-gray-300">Exp: {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                                </div>
                              </td>
                              <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-2">
                                  {/* Download Action */}
                                  <ActionButton 
                                    onClick={() => handleDownloadPDF(p)}
                                    disabled={p.status === 'Removed'}
                                    icon={<FileDown size={16} />}
                                    tooltip="Download Policy Certificate"
                                    colorClass="bg-white border border-gray-100 text-gray-400 hover:text-[#e91e8c] hover:border-[#e91e8c]/20"
                                  />

                                  {/* Validate Action */}
                                  {p.status === 'Pending Validation' && (
                                    <ActionButton 
                                      onClick={() => updatePolicyStatus(p.id, 'Validated', 'System Override')}
                                      icon={<CheckCircle size={16} />}
                                      tooltip="Mark as Validated"
                                      colorClass="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                                    />
                                  )}

                                  {/* Activate Action */}
                                  {(p.status === 'Validated' || p.status === 'Frozen' || p.status === 'Blocked') && (
                                    <ActionButton 
                                      onClick={() => updatePolicyStatus(p.id, 'Active', 'Manual Resume')}
                                      icon={<Play size={16} />}
                                      tooltip="Activate Coverage"
                                      colorClass="bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
                                    />
                                  )}

                                  {/* Freeze Action */}
                                  {p.status === 'Active' && (
                                    <ActionButton 
                                      onClick={() => updatePolicyStatus(p.id, 'Frozen', 'Security Hold')}
                                      icon={<Pause size={16} />}
                                      tooltip="Freeze Policy"
                                      colorClass="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                                    />
                                  )}

                                  {/* Block Action */}
                                  {p.status !== 'Blocked' && p.status !== 'Removed' && (
                                    <ActionButton 
                                      onClick={() => updatePolicyStatus(p.id, 'Blocked', 'Suspected Violation')}
                                      icon={<ShieldAlert size={16} />}
                                      tooltip="Block Policy"
                                      colorClass="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                                    />
                                  )}

                                  {/* Delete Action */}
                                  {p.status !== 'Removed' && (
                                    <ActionButton 
                                      onClick={() => deletePolicy(p.id, 'Admin Cleanup')}
                                      icon={<Trash2 size={16} />}
                                      tooltip="Soft Delete"
                                      colorClass="bg-gray-50 text-gray-300 hover:bg-red-600 hover:text-white"
                                    />
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION CONTROLS */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredPolicies.length)} of {filteredPolicies.length} Records
                      </p>
                      <div className="flex items-center gap-2">
                        <button 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => prev - 1)}
                          className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:bg-white hover:text-[#e91e8c] disabled:opacity-30 transition-all"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                          <button 
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-10 h-10 rounded-xl font-black text-[10px] transition-all ${
                              currentPage === i + 1 ? 'bg-[#e91e8c] text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-white'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button 
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:bg-white hover:text-[#e91e8c] disabled:opacity-30 transition-all"
                        >
                          <ChevronRightIcon size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'identities' && isAdmin && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-3xl font-bold font-outfit mb-8">Identity Vault</h2>
                  <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
                    <UserCog className="mx-auto text-gray-200 mb-6" size={48} />
                    <p className="text-gray-400 font-bold">Standard Identity Registers Operational.</p>
                  </div>
                </div>
              )}

              {activeTab === 'diagnostics' && isAdmin && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                    <div>
                      <h2 className="text-4xl font-black font-outfit text-[#2d1f2d] tracking-tighter">System Health Ops</h2>
                      <p className="text-gray-400 text-sm mt-1 leading-relaxed">Identity vault and registry integrity verification engine.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                      <button 
                        onClick={handleTestRegistration}
                        disabled={isTestingReg}
                        className="px-8 py-4 bg-[#2d1f2d] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95"
                      >
                        {isTestingReg ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />} 
                        Test Auth Flow
                      </button>
                      <button 
                        onClick={handleRunScan}
                        disabled={isScanning}
                        className="px-8 py-4 bg-[#e91e8c] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-[#c4167a] transition-all shadow-xl shadow-pink-900/20 active:scale-95"
                      >
                        {isScanning ? <Loader2 className="animate-spin" size={16} /> : <Activity size={16} />} 
                        Run Integrity Scan
                      </button>
                    </div>
                  </div>

                  {testResult && (
                    <div className={`mb-12 p-8 rounded-[32px] border-2 flex items-center gap-6 animate-in zoom-in-95 duration-500 ${testResult.success ? 'bg-green-50 border-green-100 text-green-700 shadow-green-900/5' : 'bg-red-50 border-red-100 text-red-700 shadow-red-900/5'}`}>
                      <div className={`p-4 rounded-2xl ${testResult.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {testResult.success ? <CheckCircle size={28} /> : <AlertOctagon size={28} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-black uppercase text-xs tracking-[0.3em] mb-1">{testResult.success ? 'Identity Pipeline Verified' : 'Critical System Halt'}</p>
                        <p className="text-lg font-bold">{testResult.message}</p>
                      </div>
                      <button onClick={() => setTestResult(null)} className="p-3 opacity-30 hover:opacity-100 transition-opacity"><X size={24} /></button>
                    </div>
                  )}

                  {diagReport ? (
                    <div className="space-y-8">
                       <div className={`p-10 rounded-[48px] border-2 flex flex-col md:flex-row items-center justify-between gap-8 ${
                          diagReport.status === 'Healthy' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                       }`}>
                          <div className="flex items-center gap-8">
                             <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center shadow-2xl ${
                                diagReport.status === 'Healthy' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                             }`}>
                                <Activity size={40} className={diagReport.status === 'Healthy' ? 'animate-pulse' : ''} />
                             </div>
                             <div>
                                <h3 className="text-3xl font-black font-outfit text-[#2d1f2d]">Status: {diagReport.status}</h3>
                                <p className="text-sm text-gray-500 font-medium">All sub-systems are currently within operational variance.</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3 px-6 py-3 bg-white/50 rounded-2xl border border-white/80">
                             <Clock size={16} className="text-gray-400" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{new Date(diagReport.checks[0].timestamp).toLocaleTimeString()}</span>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {diagReport.checks.map((check: any, idx: number) => (
                             <div key={idx} className="p-8 bg-gray-50 border border-gray-100 rounded-[40px] flex items-center justify-between shadow-sm group hover:bg-white hover:shadow-xl transition-all duration-500">
                                <div className="flex items-center gap-5">
                                   <div className={`p-3 rounded-xl ${check.result === 'Pass' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                                      {check.result === 'Pass' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-[#2d1f2d] uppercase tracking-widest mb-1">{check.name}</p>
                                      <p className="text-xs text-gray-400 font-medium">{check.message}</p>
                                   </div>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${check.result === 'Pass' ? 'text-green-500' : 'text-red-500'}`}>{check.result}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                  ) : (
                    <div className="py-32 text-center bg-gray-50 rounded-[48px] border-4 border-dashed border-gray-100">
                       <Activity size={64} className="mx-auto text-gray-200 mb-8" />
                       <h3 className="text-2xl font-bold text-gray-300 font-outfit mb-2">No Active Diagnostic Data</h3>
                       <p className="text-gray-400 font-medium uppercase tracking-[0.2em] text-[10px]">Initialize scan to verify cloud vault and identity registers</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Policy Details Intelligence Panel Backdrop/Component */}
      {viewingPolicy && isAdmin && (
        <PolicyIntelligencePanel 
          policy={viewingPolicy} 
          onClose={() => setViewingPolicy(null)} 
          getCustomerName={getCustomerName}
          onStatusUpdate={(id, status, reason) => {
            updatePolicyStatus(id, status, reason);
            // Auto-refresh viewing object with new status
            setViewingPolicy(policies.find(p => p.id === id) || null);
          }}
        />
      )}
    </div>
  );
};

export default CustomerCenterPage;
