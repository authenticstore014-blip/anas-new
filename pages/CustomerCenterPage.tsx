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
import { User, Policy, MIDSubmission, PolicyStatus, VehicleLookupLog } from '../types';

// TOOLTIP COMPONENT
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

// POLICY INTELLIGENCE PANEL
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

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
               <Car size={14} /> Risk Asset Verification
            </h3>
            <div className="p-8 bg-white border border-gray-100 rounded-[32px] shadow-sm grid grid-cols-2 gap-8">
               <div className="col-span-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Registration</p>
                  <p className="text-2xl font-black font-outfit uppercase tracking-tighter text-[#2d1f2d]">{policy.details?.vrm || 'N/A'}</p>
               </div>
               <div className="col-span-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Specification</p>
                  <p className="text-lg font-bold text-[#2d1f2d]">{policy.details?.make} {policy.details?.model}</p>
               </div>
               <div className="col-span-2 grid grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">VIN / Chassis</p>
                    <p className="text-xs font-mono font-bold text-gray-600">{policy.details?.vin || 'NOT_CAPTURED'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Technical Spec</p>
                    <p className="text-xs font-bold">{policy.details?.engineSize} {policy.details?.fuelType}</p>
                  </div>
               </div>
            </div>
          </div>

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

          <div className="pt-10 border-t border-gray-100 flex flex-wrap gap-4">
            <button onClick={() => onStatusUpdate(policy.id, 'Active', 'Admin Audit Resume')} className="flex-1 py-4 bg-[#e91e8c] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-[#c4167a] transition-all"><Play size={14} /> Resume Coverage</button>
            <button onClick={() => onStatusUpdate(policy.id, 'Blocked', 'Admin Audit Hold')} className="flex-1 py-4 border-2 border-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-red-50 transition-all"><ShieldAlert size={14} /> Flag Risk</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomerCenterPage: React.FC = () => {
  const { 
    user, isLoading, logout, users, policies, vehicleLogs,
    runDiagnostics, testRegistrationFlow, updatePolicyStatus, deletePolicy, refreshData
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dashboardView, setDashboardView] = useState<'summary' | 'active-feed'>('summary');
  const [isScanning, setIsScanning] = useState(false);
  const [diagReport, setDiagReport] = useState<any>(null);
  const [policySearch, setPolicySearch] = useState('');
  const [viewingPolicy, setViewingPolicy] = useState<Policy | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const isAdmin = user?.role === 'admin';

  const getCustomerName = useCallback((userId: string) => {
    const u = users.find(u => u.id === userId);
    return u ? u.name : 'Unknown Account';
  }, [users]);

  const filteredPolicies = useMemo(() => {
    let list = [...policies];
    if (!isAdmin && user) list = list.filter(p => p.userId === user.id && p.status !== 'Removed');
    if (policySearch) {
      const s = policySearch.toLowerCase();
      list = list.filter(p => getCustomerName(p.userId).toLowerCase().includes(s) || p.details?.vrm?.toLowerCase().includes(s));
    }
    if (statusFilter !== 'All') list = list.filter(p => p.status === (statusFilter === 'Pending' ? 'Pending Validation' : statusFilter));
    return list;
  }, [policies, policySearch, statusFilter, isAdmin, user, getCustomerName]);

  const paginatedPolicies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPolicies.slice(start, start + pageSize);
  }, [filteredPolicies, currentPage]);

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
                { id: 'vehicle-registry', label: 'Vehicle Intel', icon: <Database size={18} /> },
                { id: 'diagnostics', label: 'Integrity', icon: <HeartPulse size={18} /> }
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
                  <h2 className="text-3xl font-bold font-outfit mb-8">{isAdmin ? 'Operations Monitor' : 'Policy Register'}</h2>
                  {isAdmin ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <button onClick={() => setDashboardView('active-feed')} className="p-10 bg-[#2d1f2d] rounded-[40px] text-white text-left hover:scale-[1.02] transition-transform shadow-xl">
                          <ShieldCheck className="text-[#e91e8c] mb-6" size={32} />
                          <p className="text-6xl font-black font-outfit">{policies.filter(p => p.status === 'Active').length}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-2">Active Registrations</p>
                        </button>
                        <button onClick={() => setActiveTab('vehicle-registry')} className="p-10 bg-gray-50 border border-gray-100 rounded-[40px] text-left hover:scale-[1.02] transition-transform shadow-sm">
                          <Database className="text-[#e91e8c] mb-6" size={32} />
                          <p className="text-6xl font-black font-outfit">{vehicleLogs.length}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Vehicle Lookups</p>
                        </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                       {filteredPolicies.map(p => (
                          <div key={p.id} className="p-8 bg-gray-50 border border-gray-100 rounded-[40px] shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                               <h3 className="text-3xl font-black font-outfit uppercase tracking-tighter">{p.details?.vrm}</h3>
                               <span className="px-3 py-1 bg-[#e91e8c] text-white rounded-full text-[10px] font-black uppercase">{p.status}</span>
                            </div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{p.details?.make} {p.details?.model} • £{p.premium}</p>
                          </div>
                       ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'vehicle-registry' && isAdmin && (
                <div className="animate-in fade-in duration-300">
                   <div className="flex justify-between items-center mb-10">
                      <div>
                        <h2 className="text-3xl font-bold font-outfit">Vehicle Intel Registry</h2>
                        <p className="text-gray-400 text-sm mt-1">Audit trail of all DVLA/MIB lookups and cached spec data.</p>
                      </div>
                      <button onClick={refreshData} className="p-3 bg-gray-50 rounded-xl hover:bg-[#e91e8c]/10 text-gray-400 hover:text-[#e91e8c] transition-all"><RefreshCw size={20}/></button>
                   </div>
                   
                   <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Reg</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Vehicle</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Source</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                           {vehicleLogs.map(log => (
                             <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                               <td className="px-6 py-5 font-black text-[#2d1f2d] uppercase tracking-widest text-sm">{log.registration}</td>
                               <td className="px-6 py-5 text-sm font-bold text-gray-600">{log.make} {log.model}</td>
                               <td className="px-6 py-5">
                                 <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                   log.source === 'API' ? 'bg-blue-50 text-blue-600' : 
                                   log.source === 'Intelligence' ? 'bg-purple-50 text-purple-600' : 
                                   'bg-gray-50 text-gray-400'
                                 }`}>
                                   {log.source}
                                 </span>
                               </td>
                               <td className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">
                                 {log.success ? <span className="text-green-500 flex items-center gap-1"><CheckCircle size={12}/> PASS</span> : <span className="text-red-400 flex items-center gap-1"><AlertCircle size={12}/> FAIL</span>}
                               </td>
                               <td className="px-6 py-5 text-xs text-gray-400 font-medium">{new Date(log.timestamp).toLocaleString()}</td>
                             </tr>
                           ))}
                        </tbody>
                      </table>
                   </div>
                </div>
              )}

              {activeTab === 'policies' && isAdmin && (
                <div className="animate-in fade-in duration-300">
                   <h2 className="text-3xl font-bold font-outfit mb-10">Administrative Registry</h2>
                   <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400">Asset</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400">Holder</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400">Status</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Audit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                           {paginatedPolicies.map(p => (
                             <tr key={p.id} onClick={() => setViewingPolicy(p)} className="hover:bg-gray-50/50 cursor-pointer transition-colors">
                               <td className="px-6 py-5">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-black uppercase tracking-widest">{p.details?.vrm}</span>
                                    <span className="text-[10px] text-gray-400 font-bold">{p.details?.make} {p.details?.model}</span>
                                  </div>
                               </td>
                               <td className="px-6 py-5 text-sm font-bold text-gray-600">{getCustomerName(p.userId)}</td>
                               <td className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-[#e91e8c]">{p.status}</td>
                               <td className="px-6 py-5 text-center" onClick={e => e.stopPropagation()}>
                                  <ActionButton onClick={() => setViewingPolicy(p)} icon={<Eye size={16}/>} tooltip="Deep Audit" colorClass="bg-white border border-gray-100"/>
                               </td>
                             </tr>
                           ))}
                        </tbody>
                      </table>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {viewingPolicy && isAdmin && (
        <PolicyIntelligencePanel 
          policy={viewingPolicy} 
          onClose={() => setViewingPolicy(null)} 
          getCustomerName={getCustomerName}
          onStatusUpdate={(id, status, reason) => {
            updatePolicyStatus(id, status, reason);
            setViewingPolicy(policies.find(p => p.id === id) || null);
          }}
        />
      )}
    </div>
  );
};

export default CustomerCenterPage;