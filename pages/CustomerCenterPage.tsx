
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
  Code, FileJson, Copy, HeartPulse, HardDrive, Beaker, FileSearch, Edit3, Briefcase,
  CalendarDays
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
    updatePolicyStatus, updatePolicyDetails, validatePolicy, updatePaymentStatus, markPaymentDispute, updateClaimStatus,
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
  const [isValidating, setIsValidating] = useState(false);
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
    let data = policies;
    if (debouncedSearchQuery) {
      const lower = debouncedSearchQuery.toLowerCase();
      data = data.filter(p => p.id.toLowerCase().includes(lower) || p.details?.vrm?.toLowerCase().includes(lower));
    }
    return data;
  }, [policies, debouncedSearchQuery]);

  if (isLoading) return null;
  if (!user) return <Navigate to="/auth" />;

  const isAdmin = user.role === 'admin';

  const myPolicies = policies.filter(p => p.userId === user.id);

  // Helper: Calculate Policy Dates and Real-Time Status
  const getPolicyLifeCycle = (policy: Policy) => {
    const startStr = policy.validatedAt || policy.details?.policyStartDate || policy.details?.policyStartDate;
    if (!startStr) return { start: 'TBC', end: 'TBC', status: policy.status };

    const startDate = new Date(startStr);
    const endDate = new Date(startDate);
    
    if (policy.duration === '1 Month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const now = new Date();
    let computedStatus = policy.status;

    if (policy.status === 'Active' && now > endDate) {
      computedStatus = 'Expired';
    }

    return {
      start: startDate.toLocaleDateString('en-GB'),
      end: endDate.toLocaleDateString('en-GB'),
      status: computedStatus
    };
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    const report = await runDiagnostics();
    setDiagReport(report);
    setIsScanning(false);
  };

  const handleDownloadEnhancedPDF = async (policy: Policy) => {
    if (!user) return;
    const lifecycle = getPolicyLifeCycle(policy);
    if (lifecycle.status !== 'Active') return;
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
        policyStartDate: new Date().toISOString().split('T')[0]
      }
    });
    if (success) setIsBindingNew(false);
  };

  const handleValidate = async (id: string) => {
    setIsValidating(true);
    await validatePolicy(id);
    setIsValidating(false);
    setActingPolicy(null);
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
                            
                            const lifecycle = getPolicyLifeCycle(p);

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
                                      lifecycle.status === 'Active' ? 'bg-green-100 text-green-600' : 
                                      lifecycle.status === 'Frozen' ? 'bg-blue-100 text-blue-600' : 
                                      lifecycle.status === 'Pending Validation' ? 'bg-orange-100 text-orange-600' :
                                      lifecycle.status === 'Expired' ? 'bg-gray-200 text-gray-500' :
                                      'bg-red-100 text-red-600'
                                    }`}>
                                      {lifecycle.status}
                                    </span>
                                    {!isPriceVerified && <AlertTriangle size={14} className="text-orange-500" title="Actuarial Bracket Mismatch" />}
                                  </div>
                                </td>
                                <td className="px-6 py-5 rounded-r-[24px] text-right">
                                  <div className="flex justify-end gap-2">
                                    {lifecycle.status === 'Pending Validation' && (
                                      <button 
                                        onClick={() => handleValidate(p.id)}
                                        className="px-3 py-1.5 bg-green-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-green-700 transition-all flex items-center gap-1"
                                      >
                                        <CheckCircle2 size={12} /> Validate
                                      </button>
                                    )}
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
                        {myPolicies.map(p => {
                          const lifecycle = getPolicyLifeCycle(p);
                          return (
                            <div key={p.id} className={`p-10 rounded-[48px] border flex flex-col md:flex-row items-center justify-between group transition-all relative overflow-hidden ${
                              lifecycle.status === 'Active' ? 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-xl' : 
                              lifecycle.status === 'Pending Validation' ? 'bg-orange-50/30 border-orange-100' :
                              'bg-gray-100 border-gray-200 grayscale opacity-60'
                            }`}>
                                <div className="flex items-center gap-8 w-full md:w-auto">
                                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${lifecycle.status === 'Active' ? 'bg-white text-[#e91e8c]' : 'bg-gray-200 text-gray-400'}`}>
                                    {p.type.includes('CAR') ? <Car size={32}/> : <Bike size={32}/>}
                                  </div>
                                  <div>
                                      <h3 className="text-2xl font-bold text-[#2d1f2d] font-outfit uppercase">{p.details?.vrm}</h3>
                                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                        <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Policy ID: {p.id}</p>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block" />
                                        <p className={`font-black uppercase text-[10px] tracking-widest px-2 py-0.5 rounded-full ${p.duration === '1 Month' ? 'bg-indigo-100 text-indigo-500' : 'bg-pink-100 text-[#e91e8c]'}`}>{p.duration} Type</p>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block" />
                                        <p className={`font-black uppercase text-[10px] tracking-widest ${
                                          lifecycle.status === 'Active' ? 'text-green-500' : 
                                          lifecycle.status === 'Pending Validation' ? 'text-orange-500 animate-pulse' : 
                                          lifecycle.status === 'Expired' ? 'text-gray-400' :
                                          'text-red-500'
                                        }`}>
                                            {lifecycle.status === 'Active' ? 'VALID & ENFORCED' : 
                                             lifecycle.status === 'Pending Validation' ? 'AWAITING ADMIN VALIDATION' : 
                                             lifecycle.status.toUpperCase()}
                                        </p>
                                      </div>
                                      
                                      <div className="mt-4 flex items-center gap-6 p-4 bg-white/50 rounded-2xl border border-gray-100 w-fit">
                                         <div className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Effective From</span>
                                            <div className="flex items-center gap-2 text-xs font-bold text-[#2d1f2d]">
                                               <CalendarDays size={12} className="text-[#e91e8c]" /> {lifecycle.start}
                                            </div>
                                         </div>
                                         <div className="h-6 w-px bg-gray-200" />
                                         <div className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Expiry Date</span>
                                            <div className="flex items-center gap-2 text-xs font-bold text-[#2d1f2d]">
                                               <CalendarDays size={12} className="text-[#e91e8c]" /> {lifecycle.end}
                                            </div>
                                         </div>
                                      </div>
                                  </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-4 mt-6 md:mt-0 w-full md:w-auto">
                                  <p className="text-3xl font-black text-[#e91e8c] font-outfit">{p.premium}</p>
                                  <div className="flex gap-2">
                                      {lifecycle.status === 'Active' ? (
                                        <>
                                          <button 
                                            disabled={isCheckingMID}
                                            onClick={() => handleCheckMID(p.details?.vrm)}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2d1f2d] hover:text-white transition-all disabled:opacity-30"
                                          >
                                            {isCheckingMID ? <RefreshCw className="animate-spin" size={14}/> : <Database size={14}/>} 
                                            Check MID
                                          </button>
                                          <button 
                                            disabled={generatingPolicyId === p.id}
                                            onClick={() => handleDownloadEnhancedPDF(p)}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#e91e8c] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#c4167a] transition-all shadow-lg"
                                          >
                                            {generatingPolicyId === p.id ? <><RefreshCw size={14} className="animate-spin"/> ...</> : <><FileDown size={14}/> Download PDF</>}
                                          </button>
                                        </>
                                      ) : lifecycle.status === 'Pending Validation' ? (
                                        <div className="flex items-center gap-2 px-6 py-3 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-100">
                                           <Clock size={14} /> Activation Pending
                                        </div>
                                      ) : (
                                        <Link to="/quote" className="flex items-center gap-2 px-6 py-3 bg-[#2d1f2d] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                                           <RefreshCcw size={14} /> Re-Calculate Quote
                                        </Link>
                                      )}
                                  </div>
                                </div>
                            </div>
                          );
                        })}
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
                    <h2 className="text-3xl font-bold text-[#2d1f2d] font-outfit">Policy Control</h2>
                    <p className="text-gray-400 text-sm font-medium tracking-tight">System Ref: {actingPolicy.id}</p>
                  </div>
                </div>
                {actingPolicy.status === 'Pending Validation' && (
                  <button 
                    onClick={() => handleValidate(actingPolicy.id)}
                    disabled={isValidating}
                    className="px-6 py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg"
                  >
                    {isValidating ? <RefreshCw className="animate-spin" size={14}/> : <CheckCircle2 size={14} />} Validate & Activate
                  </button>
                )}
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
                     <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Premium Term ({actingPolicy.duration})</h3>
                          <span className="text-2xl font-black font-outfit text-[#2d1f2d]">{actingPolicy.premium}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${
                          actingPolicy.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600 animate-pulse'
                        }`}>
                          {actingPolicy.status === 'Active' ? <><CheckCircle2 size={10} /> Binding Accepted</> : 'Pending Admin Validation'}
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
    </div>
  );
};

export default CustomerCenterPage;
