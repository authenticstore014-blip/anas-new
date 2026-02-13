
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, ShieldCheck, Shield, Lock, Users, Trash2, Ban, Pause, Play, 
  Terminal, Activity, Search, Eye, X, Filter, FileText, Banknote, 
  Car, Bike, Truck, RefreshCw, AlertCircle, TrendingUp, MoreVertical,
  ChevronRight, ReceiptText, Printer, Download, CreditCard, ExternalLink,
  Snowflake, History, Landmark, Gavel, UserX, Inbox, MessageSquare, CheckCircle, Mail,
  AlertTriangle, Hammer, ClipboardList, Flag, CheckCircle2, RotateCcw,
  Settings, Phone, EyeOff, UserPlus, Fingerprint, RefreshCcw, ShieldX, Database,
  ArrowUpRight, AlertOctagon, FileDown, Plus, Info, Zap, Clock, Loader2,
  Code, FileJson, Copy, HeartPulse, HardDrive, Beaker, FileSearch, Edit3, Briefcase
} from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { PaymentRecord, AuditLog, User, UserStatus, PolicyStatus, Policy, ContactMessage, Claim, ClaimStatus, RiskLevel, KYCStatus, ComplianceStatus, PolicyDuration } from '../types';

type AdminTab = 'dashboard' | 'users' | 'policies' | 'payments' | 'claims' | 'audit' | 'diagnostics';
type CustomerTab = 'protection' | 'documents' | 'payments' | 'claims';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const CustomerCenterPage: React.FC = () => {
  const { 
    user, isLoading, logout, 
    users, policies, payments, auditLogs, claims,
    updateUserStatus, updateUserRisk, setComplianceStatus, deleteUserPermanent, setKYCStatus, blockPayments,
    updatePolicyStatus, updatePolicyDetails, updatePaymentStatus, markPaymentDispute, updateClaimStatus,
    downloadPDF, generatePolicyPDF, submitClaim, checkAskMID, deletePolicy, runDiagnostics, seedMockEnvironment,
    bindPolicyManual
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [customerTab, setCustomerTab] = useState<CustomerTab>('protection');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Diagnostics State
  const [isScanning, setIsScanning] = useState(false);
  const [diagReport, setDiagReport] = useState<any>(null);

  // MODAL STATES
  const [actingUser, setActingUser] = useState<User | null>(null);
  const [actingPolicy, setActingPolicy] = useState<Policy | null>(null);
  
  // Binding State
  const [isBindingNew, setIsBindingNew] = useState(false);
  const [bindData, setBindData] = useState({
    userId: '',
    vrm: '',
    make: '',
    model: '',
    duration: '12 Months' as PolicyDuration,
    type: 'Comprehensive Cover',
    premium: '3500.00',
    reason: 'Manual Overwrite'
  });

  // Edit Buffer for Policies
  const [editBuffer, setEditBuffer] = useState<{vrm?: string, make?: string, model?: string, type?: string, duration?: PolicyDuration}>({});
  const [showManifest, setShowManifest] = useState(false);

  const [generatingPolicyId, setGeneratingPolicyId] = useState<string | null>(null);
  const [isFilingClaim, setIsFilingClaim] = useState(false);
  
  const [isCheckingMID, setIsCheckingMID] = useState(false);
  const [midCheckResult, setMidCheckResult] = useState<{ found: boolean; status?: string; message: string; vrm?: string } | null>(null);

  const filteredUsers = useMemo(() => {
    const clientsOnly = users.filter(u => u.role === 'customer');
    if (!debouncedSearchQuery) return clientsOnly;
    const lower = debouncedSearchQuery.toLowerCase();
    return clientsOnly.filter(u => u.name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower));
  }, [users, debouncedSearchQuery]);

  const filteredPolicies = useMemo(() => {
    if (!debouncedSearchQuery) return policies;
    const lower = debouncedSearchQuery.toLowerCase();
    return policies.filter(p => p.id.toLowerCase().includes(lower) || p.details?.vrm?.toLowerCase().includes(lower));
  }, [policies, debouncedSearchQuery]);

  if (isLoading) return null;
  if (!user) return <Navigate to="/auth" />;

  const isAdmin = user.role === 'admin';

  const myPolicies = policies.filter(p => p.userId === user.id);

  const handleRunScan = async () => {
    setIsScanning(true);
    const report = await runDiagnostics();
    setDiagReport(report);
    setIsScanning(false);
  };

  const handleDownloadEnhancedPDF = async (policy: Policy) => {
    if (!user) return;
    if (!policy.pdfUrl) {
      setGeneratingPolicyId(policy.id);
      try {
        await generatePolicyPDF(policy.id);
      } finally {
        setGeneratingPolicyId(null);
      }
    }
    downloadPDF(policy.id);
  };

  const handleCheckMID = async (vrm: string) => {
    setIsCheckingMID(true);
    setMidCheckResult(null);
    const result = await checkAskMID(vrm);
    setMidCheckResult({ ...result, vrm });
    setIsCheckingMID(false);
  };

  const handleManualBind = async () => {
    if (!bindData.userId || !bindData.vrm) return;
    const success = await bindPolicyManual(bindData.userId, {
      type: bindData.type,
      duration: bindData.duration,
      premium: bindData.premium,
      reason: bindData.reason,
      details: {
        vrm: bindData.vrm.toUpperCase(),
        make: bindData.make,
        model: bindData.model,
        firstName: users.find(u => u.id === bindData.userId)?.name.split(' ')[0] || 'Admin',
        policyStartDate: new Date().toLocaleDateString()
      }
    });
    if (success) setIsBindingNew(false);
  };

  const savePolicyEdits = () => {
    if (!actingPolicy) return;
    const updates = {
      type: editBuffer.type || actingPolicy.type,
      duration: editBuffer.duration || actingPolicy.duration,
      details: {
        ...actingPolicy.details,
        vrm: editBuffer.vrm || actingPolicy.details?.vrm,
        make: editBuffer.make || actingPolicy.details?.make,
        model: editBuffer.model || actingPolicy.details?.model,
      }
    };
    updatePolicyDetails(actingPolicy.id, updates, 'Admin Manual Detail Adjustment');
    setActingPolicy(null);
    setEditBuffer({});
    setShowManifest(false);
  };

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
              <h1 className="text-4xl font-bold text-white font-outfit tracking-tighter">{isAdmin ? 'SwiftPolicy Command' : 'Dashboard'}</h1>
              <p className="text-white/50 text-sm">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                 <Activity size={12} className="text-green-500 animate-pulse" />
                 <span className="text-[9px] font-black uppercase text-white/50 tracking-widest">Gateway: Operational</span>
              </div>
            )}
            <button onClick={logout} className="px-8 py-3 bg-white text-[#2d1f2d] rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Sign Out</button>
          </div>
        </div>

        {isAdmin ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-1 space-y-3">
              {[
                { id: 'dashboard', label: 'System Health', icon: <TrendingUp size={18} /> },
                { id: 'users', label: 'Clients', icon: <Users size={18} /> },
                { id: 'policies', label: 'Policies', icon: <Shield size={18} /> },
                { id: 'payments', label: 'Payments', icon: <Landmark size={18} /> },
                { id: 'claims', label: 'Claims Engine', icon: <Hammer size={18} /> },
                { id: 'audit', label: 'Audit Log', icon: <History size={18} /> },
                { id: 'diagnostics', label: 'Integrity Check', icon: <HeartPulse size={18} /> }
              ].map((item: any) => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveTab(item.id)} 
                  className={`w-full flex items-center gap-4 px-8 py-5 rounded-2xl font-black text-xs transition-all text-left uppercase tracking-widest ${
                    activeTab === item.id 
                    ? 'bg-[#e91e8c] text-white shadow-lg' 
                    : 'bg-white/5 hover:bg-white/10 text-white/40'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-2xl min-h-[750px]">
                
                {activeTab === 'diagnostics' && (
                  <div className="animate-in fade-in duration-300">
                    <div className="flex justify-between items-center mb-10">
                       <h2 className="text-3xl font-bold font-outfit">Integrity Check</h2>
                       <div className="flex gap-4">
                          <button 
                            onClick={seedMockEnvironment}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                          >
                            <Beaker size={14} />
                            Bootstrap Environment
                          </button>
                          <button 
                            onClick={handleRunScan} 
                            disabled={isScanning}
                            className="px-6 py-3 bg-[#2d1f2d] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 disabled:opacity-50"
                          >
                            {isScanning ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
                            Execute Deep Scan
                          </button>
                       </div>
                    </div>

                    {!diagReport && !isScanning && (
                      <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
                        <HardDrive size={48} className="mx-auto text-gray-200 mb-6" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Awaiting Command Initiation</p>
                        <p className="text-gray-300 text-[10px] mt-2 max-w-xs mx-auto">Use Bootstrap Environment to quickly populate mock records for testing functional paths.</p>
                      </div>
                    )}

                    {isScanning && (
                      <div className="py-20 text-center">
                         <div className="w-20 h-20 border-4 border-gray-100 border-t-[#e91e8c] rounded-full animate-spin mx-auto mb-10" />
                         <p className="text-gray-400 font-black uppercase tracking-widest text-xs animate-pulse">Scanning Data Registers...</p>
                      </div>
                    )}

                    {diagReport && !isScanning && (
                      <div className="space-y-8 animate-in zoom-in-95">
                         <div className={`p-8 rounded-[32px] border flex items-center justify-between ${
                           diagReport.status === 'Healthy' ? 'bg-green-50 border-green-100 text-green-700' :
                           diagReport.status === 'Warning' ? 'bg-orange-50 border-orange-100 text-orange-700' :
                           'bg-red-50 border-red-100 text-red-700'
                         }`}>
                            <div className="flex items-center gap-6">
                               <div className="p-4 bg-white rounded-2xl shadow-sm">
                                  {diagReport.status === 'Healthy' ? <CheckCircle2 size={32}/> : <AlertTriangle size={32}/>}
                               </div>
                               <div>
                                  <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter">System Health: {diagReport.status}</h3>
                                  <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Global Integrity Assessment Complete</p>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-3">
                            {diagReport.checks.map((check: any, i: number) => (
                              <div key={i} className="p-6 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${
                                      check.result === 'Pass' ? 'bg-green-500' :
                                      check.result === 'Warning' ? 'bg-orange-500' : 'bg-red-500'
                                    }`} />
                                    <div>
                                       <p className="text-sm font-bold text-[#2d1f2d]">{check.name}</p>
                                       <p className="text-[10px] text-gray-400 font-medium">{check.message}</p>
                                    </div>
                                 </div>
                                 <span className="text-[9px] font-mono text-gray-300">{new Date(check.timestamp).toLocaleTimeString()}</span>
                              </div>
                            ))}
                         </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'dashboard' && (
                  <div className="animate-in fade-in duration-300">
                    <div className="flex justify-between items-center mb-10">
                      <h2 className="text-3xl font-bold font-outfit">System Health</h2>
                      <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        <Activity size={14} /> Underwriting Engine: Online
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                       {[
                         { label: 'Total Accounts', val: users.length, icon: <Users /> },
                         { label: 'Live Risk', val: policies.filter(p => p.status === 'Active').length, icon: <Activity /> },
                         { label: 'Fraud Suspicion', val: users.filter(u => u.isSuspicious || u.risk_flag).length, icon: <ShieldAlert className="text-red-500" /> },
                         { label: 'Active Policies', val: policies.length, icon: <Shield /> }
                       ].map((s, i) => (
                         <div key={i} className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                           <div className="mb-4 text-[#e91e8c]">{s.icon}</div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                           <p className="text-2xl font-black font-outfit text-[#2d1f2d]">{s.val}</p>
                         </div>
                       ))}
                    </div>

                    <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100">
                       <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                         <Landmark size={14} /> Rating Factor Audit (Actuarial Brackets)
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                             <p className="text-[9px] font-black uppercase text-pink-500 mb-2">Comp. (Annual)</p>
                             <p className="text-lg font-black font-outfit text-[#2d1f2d]">£3,000 – £3,999</p>
                          </div>
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                             <p className="text-[9px] font-black uppercase text-blue-500 mb-2">T.P.F.T (Annual)</p>
                             <p className="text-lg font-black font-outfit text-[#2d1f2d]">£1,400 – £2,999</p>
                          </div>
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                             <p className="text-[9px] font-black uppercase text-indigo-500 mb-2">Monthly (All)</p>
                             <p className="text-lg font-black font-outfit text-[#2d1f2d]">£400 – £800</p>
                          </div>
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                             <p className="text-[9px] font-black uppercase text-gray-500 mb-2">Motorcycle</p>
                             <p className="text-lg font-black font-outfit text-[#2d1f2d]">£500 – £1,500</p>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="animate-in fade-in duration-300">
                    <div className="flex justify-between items-center mb-10">
                       <h2 className="text-3xl font-bold font-outfit">Clients</h2>
                       <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                          <input className="bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-6 py-4 text-xs font-bold w-64 focus:border-[#e91e8c] outline-none" placeholder="Search clients..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                       </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                          <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <th className="px-6 py-2">Client ID</th>
                            <th className="px-6 py-2">Full Name</th>
                            <th className="px-6 py-2">Email</th>
                            <th className="px-6 py-2">Status</th>
                            <th className="px-6 py-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map(u => (
                            <tr key={u.id} className="bg-gray-50 group hover:bg-white hover:shadow-xl transition-all rounded-[32px]">
                              <td className="px-6 py-5 rounded-l-[24px] text-[10px] font-mono font-bold text-gray-400">{u.id}</td>
                              <td className="px-6 py-5 font-bold text-sm">
                                <button onClick={() => setActingUser(u)} className="hover:text-[#e91e8c] text-left underline decoration-dotted underline-offset-4">{u.name}</button>
                              </td>
                              <td className="px-6 py-5 text-sm text-gray-500">{u.email}</td>
                              <td className="px-6 py-5">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                  u.status === 'Active' ? 'bg-green-100 text-green-600' : 
                                  u.status === 'Frozen' ? 'bg-blue-100 text-blue-600' : 
                                  'bg-orange-100 text-orange-600'
                                }`}>
                                  {u.status}
                                </span>
                              </td>
                              <td className="px-6 py-5 rounded-r-[24px] text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setActingUser(u)} className="p-2 bg-white text-gray-400 hover:text-indigo-500 rounded-lg transition-all" title="View Detail"><Eye size={14}/></button>
                                  <button onClick={() => { updateUserStatus(u.id, 'Frozen', 'Admin Action'); }} className="px-3 py-1.5 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 transition-all">Freeze</button>
                                  <button onClick={() => { if(window.confirm('Delete user ' + u.name + '?')) deleteUserPermanent(u.id, 'Admin Permanent Deletion'); }} className="px-3 py-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all">Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'policies' && (
                  <div className="animate-in fade-in duration-300">
                    <div className="flex justify-between items-center mb-10">
                       <h2 className="text-3xl font-bold font-outfit">Policies</h2>
                       <div className="flex gap-4">
                          <button 
                            onClick={() => setIsBindingNew(true)}
                            className="px-6 py-3 bg-[#e91e8c] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-[#c4167a] transition-all shadow-lg shadow-pink-100"
                          >
                            <Plus size={14} /> Bind New Risk
                          </button>
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                            <input className="bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-6 py-3.5 text-xs font-bold w-64 focus:border-[#e91e8c] outline-none" placeholder="Search policies..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                          </div>
                       </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                          <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <th className="px-6 py-2">Policy ID</th>
                            <th className="px-6 py-2">Risk / Duration</th>
                            <th className="px-6 py-2">Cover Type</th>
                            <th className="px-6 py-2">Status / Pricing</th>
                            <th className="px-6 py-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPolicies.map(p => {
                            const owner = users.find(u => u.id === p.userId);
                            const prem = parseFloat(p.premium.replace('£', '').replace(',', ''));
                            let isPriceVerified = true;
                            
                            if (p.duration === '12 Months') {
                              if (p.type === 'Comprehensive Cover' && (prem < 3000 || prem > 4000)) isPriceVerified = false;
                              if (p.type === 'Third Party Insurance' && (prem < 1400 || prem > 3000)) isPriceVerified = false;
                              if (p.type === 'Motorcycle Insurance' && (prem < 500 || prem > 1500)) isPriceVerified = false;
                            } else {
                              if (prem < 400 || prem > 800) isPriceVerified = false;
                            }

                            return (
                              <tr key={p.id} className="bg-gray-50 group hover:bg-white hover:shadow-xl transition-all rounded-[32px]">
                                <td className="px-6 py-5 rounded-l-[24px]">
                                  <button onClick={() => { setActingPolicy(p); setEditBuffer({ vrm: p.details?.vrm, make: p.details?.make, model: p.details?.model, type: p.type, duration: p.duration }); }} className="flex flex-col text-left group-hover:translate-x-1 transition-transform">
                                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">{p.id}</span>
                                    <span className="text-xs font-black text-[#e91e8c] uppercase">{p.details?.vrm}</span>
                                  </button>
                                </td>
                                <td className="px-6 py-5">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-sm">{owner?.name || 'Unknown'}</span>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-max mt-1 ${p.duration === '1 Month' ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-600'}`}>
                                      {p.duration}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-5 text-sm font-medium">{p.type}</td>
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                      p.status === 'Active' ? 'bg-green-100 text-green-600' : 
                                      p.status === 'Frozen' ? 'bg-blue-100 text-blue-600' : 
                                      'bg-red-100 text-red-600'
                                    }`}>
                                      {p.status}
                                    </span>
                                    {isPriceVerified ? (
                                      <CheckCircle2 size={14} className="text-green-500" title="Pricing Engine Verified" />
                                    ) : (
                                      <AlertTriangle size={14} className="text-orange-500" title="Actuarial Bracket Mismatch" />
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-5 rounded-r-[24px] text-right">
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => { setActingPolicy(p); setEditBuffer({ vrm: p.details?.vrm, make: p.details?.make, model: p.details?.model, type: p.type, duration: p.duration }); }}
                                      className="p-2 bg-white text-gray-400 hover:text-indigo-500 rounded-lg transition-all"
                                      title="Inspect Risk"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    <button onClick={() => { updatePolicyStatus(p.id, 'Frozen', 'Admin Action'); }} className="px-3 py-1.5 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 transition-all">Freeze</button>
                                    <button onClick={() => { if(window.confirm('IRREVERSIBLE: Execute permanent deletion?')) deletePolicy(p.id, 'Admin Permanent Deletion'); }} className="px-3 py-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all">Delete</button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'audit' && (
                  <div className="animate-in fade-in duration-300">
                    <h2 className="text-3xl font-bold mb-10 font-outfit">Audit Log</h2>
                    <div className="space-y-3">
                      {auditLogs.map(log => (
                        <div key={log.id} className="p-5 bg-gray-50 border border-gray-100 rounded-2xl flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all">
                          <div>
                             <div className="flex items-center gap-3 mb-1">
                                <span className={`px-2 py-0.5 text-white rounded-md text-[7px] font-black uppercase tracking-widest ${log.action.includes('BIND') ? 'bg-indigo-600' : 'bg-black'}`}>{log.action}</span>
                                <span className="text-[10px] font-bold text-[#2d1f2d]">{log.userEmail}</span>
                             </div>
                             <p className="text-xs text-gray-500">{log.details}</p>
                          </div>
                          <span className="text-[9px] font-mono text-gray-300">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
             <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 max-w-fit mx-auto backdrop-blur-sm">
                {(['protection', 'documents', 'payments', 'claims'] as CustomerTab[]).map(t => (
                  <button key={t} onClick={() => setCustomerTab(t)} className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${customerTab === t ? 'bg-[#e91e8c] text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>
                    {t}
                  </button>
                ))}
             </div>

             {customerTab === 'protection' && (
               <div className="space-y-8 animate-in slide-in-from-bottom-4">
                  <div className="bg-white p-14 rounded-[64px] shadow-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-12">
                       <h2 className="text-3xl font-bold text-[#2d1f2d] font-outfit">Active Protection</h2>
                       <button onClick={() => setIsFilingClaim(true)} className="px-6 py-3 bg-[#2d1f2d] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-black transition-all">
                          <Plus size={14} /> Report Incident
                       </button>
                    </div>
                    {myPolicies.length === 0 ? (
                      <div className="py-20 text-center text-gray-300">
                        <ShieldX size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-bold uppercase tracking-widest text-xs">No active protection found</p>
                        <Link to="/quote" className="text-[#e91e8c] font-black uppercase text-[10px] mt-4 block">Get Instant Cover</Link>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {myPolicies.map(p => (
                          <div key={p.id} className={`p-10 rounded-[48px] border flex items-center justify-between group transition-all ${p.status === 'Active' ? 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-xl' : 'bg-red-50/30 border-red-100 opacity-60 grayscale'}`}>
                              <div className="flex items-center gap-8">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${p.status === 'Active' ? 'bg-white text-[#e91e8c]' : 'bg-gray-200 text-gray-400'}`}>
                                  {p.type.includes('CAR') ? <Car size={32}/> : <Bike size={32}/>}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-[#2d1f2d] font-outfit uppercase">{p.details?.vrm}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                      <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Policy: {p.id}</p>
                                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                      <p className={`font-black uppercase text-[10px] tracking-widest px-2 py-0.5 rounded-full ${p.duration === '1 Month' ? 'bg-indigo-100 text-indigo-500' : 'bg-pink-100 text-[#e91e8c]'}`}>{p.duration}</p>
                                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                      <p className={`font-black uppercase text-[10px] tracking-widest ${p.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>
                                          {p.status === 'Active' ? 'ENFORCED' : 'SUSPENDED'}
                                      </p>
                                    </div>
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-3">
                                <p className="text-3xl font-black text-[#e91e8c] font-outfit">{p.premium}</p>
                                <div className="flex gap-2">
                                    <button 
                                      disabled={isCheckingMID || p.status !== 'Active'}
                                      onClick={() => handleCheckMID(p.details?.vrm)}
                                      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2d1f2d] hover:text-white transition-all disabled:opacity-30"
                                    >
                                      {isCheckingMID ? <RefreshCw className="animate-spin" size={14}/> : <Database size={14}/>} 
                                      Verify askMID
                                    </button>
                                    {p.status === 'Active' && (
                                      <button 
                                        disabled={generatingPolicyId === p.id}
                                        onClick={() => handleDownloadEnhancedPDF(p)}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#e91e8c] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#c4167a] transition-all shadow-lg"
                                      >
                                        {generatingPolicyId === p.id ? <><RefreshCw size={14} className="animate-spin"/> Initializing...</> : <><FileDown size={14}/> PDF Policy</>}
                                      </button>
                                    )}
                                </div>
                              </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
               </div>
             )}
          </div>
        )}
      </div>

      {/* ADMIN POLICY EDITOR MODAL */}
      {actingPolicy && (
        <div className="fixed inset-0 z-[100] bg-[#2d1f2d]/95 backdrop-blur-xl flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-2xl rounded-[48px] p-12 relative shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
              <button onClick={() => { setActingPolicy(null); setEditBuffer({}); setShowManifest(false); }} className="absolute top-10 right-10 p-4 bg-gray-50 rounded-xl hover:bg-red-50 text-gray-400 transition-all"><X size={20}/></button>
              
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-[#e91e8c]/10 text-[#e91e8c] rounded-2xl flex items-center justify-center"><Edit3 size={32}/></div>
                  <div>
                    <h2 className="text-3xl font-bold text-[#2d1f2d] font-outfit">Policy Inspector</h2>
                    <p className="text-gray-400 text-sm font-medium tracking-tight">System Ref: {actingPolicy.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowManifest(!showManifest)}
                  className={`p-4 rounded-xl transition-all ${showManifest ? 'bg-[#e91e8c] text-white' : 'bg-gray-100 text-gray-400 hover:text-[#e91e8c]'}`}
                  title="Inspect Raw Manifest"
                >
                  <Code size={20} />
                </button>
              </div>

              {showManifest ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                   <div className="bg-[#2d1f2d] p-8 rounded-3xl overflow-x-auto">
                      <pre className="text-pink-400 text-xs font-mono leading-relaxed">
                        {JSON.stringify(actingPolicy.details, null, 2)}
                      </pre>
                   </div>
                   <button onClick={() => setShowManifest(false)} className="w-full py-4 bg-gray-100 text-gray-400 rounded-xl font-black uppercase tracking-widest text-[10px]">Return to Controls</button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-8 bg-gray-50 border border-gray-100 rounded-3xl mb-4">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Premium Term ({actingPolicy.duration})</h3>
                     <div className="flex items-center justify-between">
                        <span className="text-2xl font-black font-outfit text-[#2d1f2d]">{actingPolicy.premium}</span>
                        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 size={10} /> Validated Binding
                        </span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Asset VRM</label>
                        <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-mono font-bold text-[#2d1f2d] outline-none focus:border-[#e91e8c]" value={editBuffer.vrm} onChange={e => setEditBuffer({...editBuffer, vrm: e.target.value.toUpperCase()})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cover Level</label>
                        <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-[#2d1f2d] outline-none focus:border-[#e91e8c]" value={editBuffer.type} onChange={e => setEditBuffer({...editBuffer, type: e.target.value})}>
                            <option value="Comprehensive Cover">Comprehensive Cover</option>
                            <option value="Third Party Insurance">Third Party Insurance</option>
                            <option value="Motorcycle Insurance">Motorcycle Insurance</option>
                        </select>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Duration</label>
                        <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-[#2d1f2d] outline-none focus:border-[#e91e8c]" value={editBuffer.duration} onChange={e => setEditBuffer({...editBuffer, duration: e.target.value as PolicyDuration})}>
                            <option value="12 Months">12 Months (Annual)</option>
                            <option value="1 Month">1 Month (Short-Term)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vehicle Make</label>
                        <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-[#2d1f2d] outline-none focus:border-[#e91e8c]" value={editBuffer.make} onChange={e => setEditBuffer({...editBuffer, make: e.target.value})} />
                      </div>
                  </div>

                  <div className="pt-8 flex gap-4">
                      <button onClick={savePolicyEdits} className="flex-1 py-5 bg-[#2d1f2d] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl">Apply Changes</button>
                      <button onClick={() => { setActingPolicy(null); setEditBuffer({}); setShowManifest(false); }} className="px-8 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">Cancel</button>
                  </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* ADMIN MANUAL BINDING MODAL */}
      {isBindingNew && (
        <div className="fixed inset-0 z-[100] bg-[#2d1f2d]/95 backdrop-blur-xl flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-2xl rounded-[48px] p-12 relative shadow-2xl animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto">
              <button onClick={() => setIsBindingNew(false)} className="absolute top-10 right-10 p-4 bg-gray-50 rounded-xl hover:bg-red-50 text-gray-400 transition-all"><X size={20}/></button>
              
              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Briefcase size={32}/></div>
                <div>
                  <h2 className="text-3xl font-bold text-[#2d1f2d] font-outfit">Manual Risk Binding</h2>
                  <p className="text-gray-400 text-sm font-medium tracking-tight">Direct issuance bypass flow</p>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Client Account</label>
                    <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-[#2d1f2d] outline-none focus:border-[#e91e8c]" value={bindData.userId} onChange={e => setBindData({...bindData, userId: e.target.value})}>
                        <option value="">Choose User...</option>
                        {users.filter(u => u.role === 'customer').map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Term Duration</label>
                       <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-[#2d1f2d] outline-none focus:border-[#e91e8c]" value={bindData.duration} onChange={e => setBindData({...bindData, duration: e.target.value as PolicyDuration})}>
                           <option value="12 Months">12 Months (Annual)</option>
                           <option value="1 Month">1 Month (Short-Term)</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vehicle Reg (VRM)</label>
                       <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-mono font-bold text-[#2d1f2d] outline-none focus:border-[#e91e8c]" placeholder="BT19 KYX" value={bindData.vrm} onChange={e => setBindData({...bindData, vrm: e.target.value.toUpperCase()})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Manual Premium (£)</label>
                       <input type="number" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-[#2d1f2d] outline-none focus:border-[#e91e8c]" value={bindData.premium} onChange={e => setBindData({...bindData, premium: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Underwriter Reason</label>
                       <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-[#2d1f2d] outline-none focus:border-[#e91e8c]" placeholder="e.g. Underwriter Auth #101" value={bindData.reason} onChange={e => setBindData({...bindData, reason: e.target.value})} />
                    </div>
                 </div>

                 <div className="pt-8 flex gap-4">
                    <button onClick={handleManualBind} className="flex-1 py-5 bg-[#2d1f2d] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl">Bind Policy & Issue Certificate</button>
                    <button onClick={() => setIsBindingNew(false)} className="px-8 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs">Cancel</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ADMIN CLIENT 360 MODAL */}
      {actingUser && (
        <div className="fixed inset-0 z-[100] bg-[#2d1f2d]/95 backdrop-blur-xl flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-3xl rounded-[48px] p-12 relative shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setActingUser(null)} className="absolute top-10 right-10 p-4 bg-gray-50 rounded-xl hover:bg-red-50 text-gray-400 transition-all"><X size={20}/></button>
              
              <div className="flex items-center gap-6 mb-10">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-white text-2xl ${actingUser.status === 'Active' ? 'bg-[#2d1f2d]' : 'bg-red-500'}`}>{actingUser.name.charAt(0)}</div>
                <div>
                   <h2 className="text-3xl font-bold text-[#2d1f2d] font-outfit">Client Profile: {actingUser.name}</h2>
                   <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${actingUser.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{actingUser.status}</span>
                      <span className="text-[10px] font-medium text-gray-400">{actingUser.email}</span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Identity Enforcement</h3>
                    <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => { updateUserStatus(actingUser.id, 'Active', 'Admin Manual Override'); setActingUser(null); }} className="p-4 border border-green-200 rounded-xl text-green-600 font-black uppercase text-[8px] tracking-widest hover:bg-green-600 hover:text-white transition-all">Enable</button>
                       <button onClick={() => { updateUserStatus(actingUser.id, 'Frozen', 'Admin Manual Freeze'); setActingUser(null); }} className="p-4 border border-blue-200 rounded-xl text-blue-600 font-black uppercase text-[8px] tracking-widest hover:bg-blue-600 hover:text-white transition-all">Freeze</button>
                       <button onClick={() => { updateUserStatus(actingUser.id, 'Removed', 'Admin Manual Removal'); setActingUser(null); }} className="p-4 border border-orange-200 rounded-xl text-orange-600 font-black uppercase text-[8px] tracking-widest hover:bg-orange-600 hover:text-white transition-all">Remove</button>
                       <button onClick={() => { if(window.confirm('IRREVERSIBLE: Execute permanent deletion?')) { deleteUserPermanent(actingUser.id, 'Admin Hard Purge'); setActingUser(null); } }} className="p-4 border border-red-200 rounded-xl text-red-600 font-black uppercase text-[8px] tracking-widest hover:bg-red-600 hover:text-white transition-all">Purge</button>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-3xl space-y-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Risk Assessment</p>
                       <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#2d1f2d]">Category: {actingUser.riskLevel || 'Low'}</span>
                          {actingUser.risk_flag && <Flag className="text-red-500 animate-bounce" size={14} />}
                       </div>
                       <p className="text-xs text-gray-400 italic">"{(actingUser.internalNotes || 'No internal notes on file.')}"</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Asset Summary</h3>
                    <div className="space-y-3">
                       {policies.filter(p => p.userId === actingUser.id).map(p => (
                         <div key={p.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                            <div>
                               <p className="text-[10px] font-black text-[#e91e8c] uppercase">{p.details?.vrm}</p>
                               <p className="text-xs font-bold text-[#2d1f2d]">{p.type} ({p.duration})</p>
                            </div>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${p.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{p.status}</span>
                         </div>
                       ))}
                       {policies.filter(p => p.userId === actingUser.id).length === 0 && <p className="text-xs text-gray-300 italic">No assets registered.</p>}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCenterPage;
