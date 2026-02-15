
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, ShieldCheck, Shield, Lock, Users, Trash2, Ban, Pause, Play, 
  Terminal, Activity, Search, Eye, X, Filter, FileText, Banknote, 
  Car, Bike, Truck, RefreshCw, AlertCircle, TrendingUp, MoreVertical,
  ChevronRight, ReceiptText, Printer, Download, CreditCard, ExternalLink,
  Snowflake, History, Landmark, Gavel, UserX, Inbox, MessageSquare, CheckCircle, Mail,
  AlertTriangle, Hammer, ClipboardList, Flag, CheckCircle2, RotateCcw,
  Settings, Phone, EyeOff, UserPlus, Fingerprint, ShieldX, Database,
  ArrowUpRight, ArrowRight, AlertOctagon, FileDown, Plus, Info, Zap, Clock, Loader2,
  Code, FileJson, Copy, HeartPulse, HardDrive, Beaker, FileSearch, Edit3, Briefcase,
  CalendarDays, Settings2, ShieldQuestion, UserCog, ChevronDown, ChevronLeft, 
  User as UserIcon, KeyRound, UserMinus, ShieldBan, MapPin, Hash, BriefcaseBusiness
} from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { User, Policy, MIDSubmission, PolicyStatus, VehicleLookupLog, UserStatus } from '../types';

// PROFESSIONAL POLICY DETAIL LEDGER MODAL
const PolicyDetailsModal = ({ policy, onClose }: { policy: Policy; onClose: () => void }) => {
  const d = policy.details;
  const isConfirmed = ['Active', 'Validated'].includes(policy.status);
  
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#2d1f2d]/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white h-[90vh] rounded-[48px] shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-8 md:p-12 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-[#e91e8c] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-pink-900/10">
                 <Shield size={32} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e91e8c] mb-1">Official Policy Document</p>
                 <h2 className="text-3xl font-bold font-outfit tracking-tighter text-[#2d1f2d]">Policy Ledger</h2>
              </div>
           </div>
           <button onClick={onClose} className="p-4 bg-white rounded-2xl hover:bg-gray-100 transition-all border border-gray-100 shadow-sm">
              <X size={24} className="text-gray-400" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
           
           {/* 1. Policy Summary */}
           <section className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                 <Activity size={14} /> 1.0 Policy Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { label: 'Policy Number', value: policy.id, icon: <Hash size={14}/> },
                   { label: 'Status', value: policy.status, icon: <CheckCircle2 size={14} className={isConfirmed ? "text-green-500" : "text-orange-500"} /> },
                   { label: 'Issue Date', value: new Date(d.issueDate || '').toLocaleDateString(), icon: <Clock size={14}/> },
                   { label: 'Reference', value: d.paymentRef || 'N/A', icon: <Fingerprint size={14}/> }
                 ].map((item, i) => (
                   <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        {item.icon} {item.label}
                      </p>
                      <p className="text-sm font-black text-[#2d1f2d] uppercase">{item.value}</p>
                   </div>
                 ))}
              </div>
           </section>

           {/* 2. Holder & 3. Vehicle */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <section className="space-y-6">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                    <UserIcon size={14} /> 2.0 Policyholder Information
                 </h3>
                 <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                       <span className="text-xs font-bold text-gray-400 uppercase">Full Legal Name</span>
                       <span className="text-sm font-black">{d.firstName} {d.lastName}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                       <span className="text-xs font-bold text-gray-400 uppercase">Date of Birth</span>
                       <span className="text-sm font-black">{new Date(d.dob || '').toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                       <span className="text-xs font-bold text-gray-400 uppercase">Contact Email</span>
                       <span className="text-sm font-black">{d.email}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                       <span className="text-xs font-bold text-gray-400 uppercase">Driving Licence</span>
                       <span className="text-sm font-mono font-black">{d.licenceNumber}</span>
                    </div>
                    <div className="pt-2">
                       <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Risk Address</span>
                       <p className="text-xs font-bold text-[#2d1f2d]">{d.address}</p>
                    </div>
                 </div>
              </section>

              <section className="space-y-6">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                    <Car size={14} /> 3.0 Vehicle Specification
                 </h3>
                 <div className="bg-[#2d1f2d] rounded-[32px] p-8 shadow-2xl text-white space-y-4 relative overflow-hidden">
                    <Car size={120} className="absolute -right-10 -bottom-10 opacity-5" />
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                       <span className="text-xs font-bold text-white/30 uppercase">Registration</span>
                       <span className="text-xl font-black font-outfit uppercase tracking-tighter text-[#e91e8c]">{d.vrm}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                       <span className="text-xs font-bold text-white/30 uppercase">Make/Model</span>
                       <span className="text-sm font-black">{d.make} {d.model}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                       <span className="text-xs font-bold text-white/30 uppercase">Year / Type</span>
                       <span className="text-sm font-black">{d.year} {d.vehicleType?.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                       <span className="text-xs font-bold text-white/30 uppercase">Technical Detail</span>
                       <span className="text-sm font-black">{d.fuelType} • {d.engineSize}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-white/30 uppercase">Chassis (VIN)</span>
                       <span className="text-[10px] font-mono opacity-60 uppercase">{d.vin}</span>
                    </div>
                 </div>
              </section>
           </div>

           {/* 4. Coverage Details */}
           <section className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                 <ShieldCheck size={14} /> 4.0 Coverage & Terms
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-8 bg-pink-50 border border-pink-100 rounded-[32px] space-y-6">
                    <div>
                       <p className="text-[9px] font-black text-[#e91e8c] uppercase tracking-widest mb-2">Coverage Tier</p>
                       <p className="text-2xl font-black text-[#2d1f2d] font-outfit">{d.coverLevel}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-pink-100">
                       <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Voluntary Excess</p>
                          <p className="text-sm font-black text-[#2d1f2d]">{d.excess}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Compulsory Excess</p>
                          <p className="text-sm font-black text-[#2d1f2d]">£250.00</p>
                       </div>
                    </div>
                 </div>
                 <div className="p-8 bg-white border border-gray-100 rounded-[32px] space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Policy Timeline</p>
                    <div className="flex items-center gap-6">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-400 uppercase">Effective From</span>
                          <span className="text-sm font-black text-[#2d1f2d]">{new Date(d.startDate || '').toLocaleDateString()}</span>
                       </div>
                       <ArrowRight className="text-[#e91e8c]" size={16} />
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-400 uppercase">Expires End Of</span>
                          <span className="text-sm font-black text-[#2d1f2d]">{new Date(d.expiryDate || '').toLocaleDateString()}</span>
                       </div>
                    </div>
                    <div className="pt-6 border-t border-gray-50 flex items-center gap-3">
                       <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center text-green-500">
                          <CheckCircle size={14} />
                       </div>
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">MID Registered & Live</span>
                    </div>
                 </div>
              </div>
           </section>

           {/* 5. Financial Summary - ENHANCED FOR ANNUAL POLICIES */}
           <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                   <CreditCard size={14} /> 5.0 Financial Ledger
                </h3>
                {policy.duration === '12 Months' && (
                  <span className="px-3 py-1 bg-[#2d1f2d] text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Annual Coverage Plan</span>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Premium Breakdown */}
                 <div className="bg-gray-50 border border-gray-100 rounded-[40px] p-10 relative overflow-hidden">
                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Underwriting Itemization</p>
                       {[
                         { label: 'Base Underwriting Premium', value: d.breakdown?.base || 0 },
                         { label: 'Risk Adjustment Loading', value: d.breakdown?.riskAdjustment || 0 },
                         { label: 'No Claims Discount Applied', value: d.breakdown?.ncbDiscount || 0, color: 'text-green-600' },
                         { label: 'Tax (12% Insurance Premium Tax)', value: d.breakdown?.ipt || 0 },
                         { label: 'Standard Administration Fee', value: d.breakdown?.adminFee || 0 }
                       ].map((item, i) => (
                         <div key={i} className="flex justify-between items-center text-sm font-medium border-b border-gray-200/50 pb-3 last:border-0">
                            <span className="text-gray-400">{item.label}</span>
                            <span className={`font-black ${item.color || 'text-[#2d1f2d]'}`}>£{Math.abs(item.value).toFixed(2)}</span>
                         </div>
                       ))}
                       <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between items-center">
                          <span className="text-sm font-black text-[#2d1f2d] uppercase">Total Contract Value</span>
                          <span className="text-2xl font-black font-outfit text-[#2d1f2d]">£{policy.premium}</span>
                       </div>
                    </div>
                 </div>

                 {/* Payment Schedule & Validation Overlay */}
                 <div className="bg-[#2d1f2d] rounded-[40px] p-10 text-white relative flex flex-col justify-center overflow-hidden">
                    {/* CONFIRMATION OVERLAY */}
                    {!isConfirmed && (
                      <div className="absolute inset-0 bg-[#2d1f2d]/95 backdrop-blur-md z-10 flex flex-col items-center justify-center p-8 text-center border-4 border-orange-500/20 rounded-[40px]">
                         <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 mb-6 border border-orange-500/20">
                            <Clock size={32} className="animate-pulse" />
                         </div>
                         <h4 className="text-xl font-bold font-outfit mb-2">Pending Admin Approval</h4>
                         <p className="text-white/40 text-sm leading-relaxed max-w-[280px]">Amounts will be officially validated and confirmed once an administrator verifies the risk profile.</p>
                      </div>
                    )}

                    <div className="relative z-0 space-y-8">
                       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#e91e8c]">Annual Policy Financial Details</p>
                       
                       <div className="space-y-6">
                          <div className="flex justify-between items-end">
                             <div>
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">First Month Charge</p>
                                <div className="flex items-end gap-1">
                                   <span className="text-xl font-bold text-white/20 mb-1 font-outfit">£</span>
                                   <span className="text-5xl font-black font-outfit tracking-tighter tabular-nums">{d.breakdown?.firstMonthCharge?.toFixed(2) || (parseFloat(policy.premium) / 12).toFixed(2)}</span>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Full Policy Cost</p>
                                <p className="text-xl font-black font-outfit tracking-tighter">£{d.breakdown?.fullAnnualPremium?.toFixed(2) || policy.premium}</p>
                             </div>
                          </div>

                          <div className="h-px bg-white/10" />

                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Remaining Balance</p>
                                <p className="text-sm font-bold">£{d.breakdown?.remainingBalance?.toFixed(2) || 0.00}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Payment Plan</p>
                                <p className="text-sm font-bold uppercase tracking-widest text-[#e91e8c]">{d.paymentFrequency || 'Annually'}</p>
                             </div>
                          </div>
                       </div>

                       <div className="mt-6 px-4 py-2 bg-green-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-900/10 inline-block">
                          Validation Level: {isConfirmed ? 'Officially Confirmed' : 'Pre-Approval Estimate'}
                       </div>
                    </div>
                 </div>
              </div>
           </section>
        </div>

        <div className="p-8 md:px-12 md:py-10 bg-white border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4 text-gray-400">
              <Info size={18} />
              <p className="text-[10px] font-bold uppercase tracking-widest">Regulatory documents stored in encrypted Vault</p>
           </div>
           <div className="flex gap-4 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-8 py-4 border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                 <Printer size={16} /> Print Schedule
              </button>
              <button className="flex-1 md:flex-none px-10 py-4 bg-[#2d1f2d] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2">
                 <FileDown size={16} /> Download PDF
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

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

const UserProfilePanel = ({ targetUser, onClose, policies, onAction }: { 
  targetUser: User; 
  onClose: () => void;
  policies: Policy[];
  onAction: (action: string, id: string, extra?: any) => void;
}) => {
  const userPolicies = policies.filter(p => p.userId === targetUser.id);
  
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-[#2d1f2d]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${targetUser.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}>
                <UserIcon size={28} />
             </div>
             <div>
                <h2 className="text-2xl font-bold font-outfit tracking-tighter">{targetUser.name}</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">UID: {targetUser.id} • Status: {targetUser.status}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-10">
          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                <p className="font-bold text-[#2d1f2d] truncate">{targetUser.email}</p>
             </div>
             <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Registration Date</p>
                <p className="font-bold text-[#2d1f2d]">{new Date(targetUser.createdAt).toLocaleDateString()}</p>
             </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
               <ShieldCheck size={14} /> Registered Assets ({userPolicies.length})
            </h3>
            <div className="space-y-3">
              {userPolicies.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-200 rounded-3xl text-center text-gray-400 text-xs font-bold">No active policies found for this user.</div>
              ) : (
                userPolicies.map(p => (
                  <div key={p.id} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black uppercase tracking-widest">{p.details?.vrm}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{p.details?.make} {p.details?.model}</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-50 rounded-full text-[9px] font-black uppercase text-[#e91e8c]">{p.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4 pt-10 border-t border-gray-100">
             <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
               <Settings2 size={14} /> Administrative Controls
            </h3>
            <div className="grid grid-cols-2 gap-4">
               {targetUser.status === 'Active' ? (
                 <button onClick={() => onAction('SUSPEND', targetUser.id)} className="py-4 bg-orange-50 text-orange-600 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-orange-100 transition-all">
                   <Pause size={14} /> Suspend Access
                 </button>
               ) : (
                 <button onClick={() => onAction('ACTIVATE', targetUser.id)} className="py-4 bg-green-50 text-green-600 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-green-100 transition-all">
                   <Play size={14} /> Restore Access
                 </button>
               )}
               <button onClick={() => onAction('RESET_PWD', targetUser.id)} className="py-4 bg-blue-50 text-blue-600 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-blue-100 transition-all">
                 <KeyRound size={14} /> Reset Password
               </button>
               <button onClick={() => onAction('BLOCK', targetUser.id)} className="py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-red-100 transition-all col-span-2">
                 <ShieldBan size={14} /> Permanently Block Entry
               </button>
            </div>
          </div>
          
          <button onClick={() => onAction('DELETE', targetUser.id)} className="w-full py-4 text-gray-300 hover:text-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all">
             <UserMinus size={14} /> Remove Account Registry
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomerCenterPage: React.FC = () => {
  const { 
    user, isLoading, logout, users, policies, vehicleLogs, auditLogs,
    updateUserStatus, deleteUserPermanent, resetUserPassword, updatePolicyStatus, refreshData
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('All');
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [policySearch, setPolicySearch] = useState('');
  const [viewingPolicy, setViewingPolicy] = useState<Policy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const isAdmin = user?.role === 'admin';

  const filteredUsers = useMemo(() => {
    let list = [...users].filter(u => u.status !== 'Removed' && u.role !== 'admin');
    if (userSearch) {
      const s = userSearch.toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
    }
    if (userStatusFilter !== 'All') {
      list = list.filter(u => u.status === userStatusFilter);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [users, userSearch, userStatusFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  const filteredPolicies = useMemo(() => {
    let list = [...policies].filter(p => p.status !== 'Removed');
    if (policySearch) {
      const s = policySearch.toLowerCase();
      list = list.filter(p => 
        p.details?.vrm?.toLowerCase().includes(s) || 
        p.details?.make?.toLowerCase().includes(s) || 
        p.details?.model?.toLowerCase().includes(s) ||
        p.id.toLowerCase().includes(s)
      );
    }
    return list.sort((a, b) => new Date(b.validatedAt || 0).getTime() - new Date(a.validatedAt || 0).getTime());
  }, [policies, policySearch]);

  const paginatedPolicies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPolicies.slice(start, start + pageSize);
  }, [filteredPolicies, currentPage]);

  const getCustomerName = useCallback((userId: string) => {
    const u = users.find(u => u.id === userId);
    return u ? u.name : 'Unknown Account';
  }, [users]);

  const handleAdminAction = async (action: string, id: string) => {
    if (action === 'ACTIVATE') updateUserStatus(id, 'Active', 'Admin restoration');
    if (action === 'SUSPEND') updateUserStatus(id, 'Suspended', 'Admin manual suspension');
    if (action === 'BLOCK') updateUserStatus(id, 'Blocked', 'Admin security block');
    if (action === 'DELETE') {
       if (window.confirm('De-register this user account? Historical data will be preserved but access revoked.')) {
         deleteUserPermanent(id, 'Admin manual de-registration');
       }
    }
    if (action === 'RESET_PWD') {
      const res = await resetUserPassword(id);
      if (res.success) {
        alert(`Temporary access key generated: ${res.tempKey}\n\nPlease share this securely with the client.`);
      }
    }
    setViewingUser(null);
  };

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
                { id: 'clients', label: 'Client Registry', icon: <Users size={18} /> },
                { id: 'policies', label: 'Admin Policies', icon: <ShieldCheck size={18} /> },
                { id: 'vehicle-registry', label: 'Vehicle Intel', icon: <Database size={18} /> },
                { id: 'audit-logs', label: 'Security Logs', icon: <History size={18} /> }
              ] : [
                { id: 'my-policies', label: 'My Policies', icon: <ShieldCheck size={18} /> }
              ])
            ].map((item: any) => (
              <button 
                key={item.id} 
                onClick={() => { setActiveTab(item.id); setCurrentPage(1); }} 
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
                        <button onClick={() => setActiveTab('clients')} className="p-10 bg-[#2d1f2d] rounded-[40px] text-white text-left hover:scale-[1.02] transition-transform shadow-xl">
                          <Users className="text-[#e91e8c] mb-6" size={32} />
                          <p className="text-6xl font-black font-outfit">{users.filter(u => u.status !== 'Removed' && u.role !== 'admin').length}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-2">Enrolled Clients</p>
                        </button>
                        <div className="p-10 bg-gray-50 border border-gray-100 rounded-[40px] text-left">
                          <Activity className="text-[#e91e8c] mb-6" size={32} />
                          <p className="text-6xl font-black font-outfit">{auditLogs.length}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Audit Transactions</p>
                        </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                       {policies.filter(p => p.userId === user.id).length === 0 ? (
                         <div className="py-20 text-center">
                            <Shield className="mx-auto text-gray-100 mb-6" size={64} />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No active policies found in your vault.</p>
                         </div>
                       ) : (
                         policies.filter(p => p.userId === user.id).map(p => (
                            <button 
                              key={p.id} 
                              onClick={() => setViewingPolicy(p)}
                              className="w-full p-8 bg-gray-50 border border-gray-100 rounded-[40px] shadow-sm flex items-center justify-between hover:bg-white hover:border-[#e91e8c] transition-all group"
                            >
                              <div className="flex items-center gap-6">
                                 <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-[#e91e8c] group-hover:bg-[#e91e8c] group-hover:text-white transition-all shadow-sm">
                                    <Car size={24} />
                                 </div>
                                 <div className="text-left">
                                    <h3 className="text-3xl font-black font-outfit uppercase tracking-tighter">{p.details?.vrm}</h3>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{p.details?.make} {p.details?.model} • £{p.premium}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="px-4 py-1.5 bg-[#e91e8c] text-white rounded-full text-[10px] font-black uppercase">{p.status}</span>
                                <ChevronRight className="text-gray-300 group-hover:text-[#e91e8c] group-hover:translate-x-1 transition-all" size={20} />
                              </div>
                            </button>
                         ))
                       )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'clients' && isAdmin && (
                <div className="animate-in fade-in duration-300">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                      <div>
                        <h2 className="text-3xl font-bold font-outfit">Client Registry</h2>
                        <p className="text-gray-400 text-sm mt-1">Platform enrollment and risk profile management.</p>
                      </div>
                      <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                          <input 
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-6 py-3 text-xs font-bold outline-none focus:border-[#e91e8c]"
                            placeholder="Search name/email..."
                            value={userSearch}
                            onChange={e => setUserSearch(e.target.value)}
                          />
                        </div>
                        <select className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none" value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)}>
                           <option>All</option>
                           <option>Active</option>
                           <option>Suspended</option>
                           <option>Blocked</option>
                        </select>
                      </div>
                   </div>

                   <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Identity</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Enrollment</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                           {paginatedUsers.map(u => (
                             <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                               <td className="px-6 py-5">
                                  <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${u.status === 'Active' ? 'bg-green-500' : 'bg-red-400'}`}>
                                       {u.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold text-[#2d1f2d]">{u.name}</span>
                                      <span className="text-[10px] text-gray-400 font-medium">{u.email}</span>
                                    </div>
                                  </div>
                               </td>
                               <td className="px-6 py-5 text-xs text-gray-500 font-medium">
                                 {new Date(u.createdAt).toLocaleDateString()}
                               </td>
                               <td className="px-6 py-5">
                                 <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                   u.status === 'Active' ? 'bg-green-50 text-green-600' : 
                                   u.status === 'Suspended' ? 'bg-orange-50 text-orange-600' : 
                                   'bg-red-50 text-red-600'
                                 }`}>
                                   {u.status}
                                 </span>
                               </td>
                               <td className="px-6 py-5">
                                  <div className="flex justify-center gap-2">
                                     <ActionButton onClick={() => setViewingUser(u)} icon={<Eye size={14}/>} tooltip="Examine Account" colorClass="bg-white border border-gray-100"/>
                                     {u.status === 'Active' ? (
                                       <ActionButton onClick={() => handleAdminAction('SUSPEND', u.id)} icon={<Pause size={14}/>} tooltip="Suspend Access" colorClass="bg-orange-50 text-orange-600 border border-orange-100"/>
                                     ) : (
                                       <ActionButton onClick={() => handleAdminAction('ACTIVATE', u.id)} icon={<Play size={14}/>} tooltip="Restore Access" colorClass="bg-green-50 text-green-600 border border-green-100"/>
                                     )}
                                     <ActionButton onClick={() => handleAdminAction('RESET_PWD', u.id)} icon={<KeyRound size={14}/>} tooltip="Override Credentials" colorClass="bg-blue-50 text-blue-600 border border-blue-100"/>
                                  </div>
                               </td>
                             </tr>
                           ))}
                        </tbody>
                      </table>
                   </div>
                </div>
              )}

              {activeTab === 'audit-logs' && isAdmin && (
                <div className="animate-in fade-in duration-300">
                   <h2 className="text-3xl font-bold font-outfit mb-10">Security Audit Logs</h2>
                   <div className="space-y-4">
                      {auditLogs.map(log => (
                        <div key={log.id} className="p-6 bg-gray-50 border border-gray-100 rounded-3xl flex items-start gap-6">
                           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#e91e8c] shadow-sm shrink-0">
                              <History size={20} />
                           </div>
                           <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                 <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{log.action}</p>
                                 <p className="text-[10px] text-gray-300 font-mono">{log.timestamp}</p>
                              </div>
                              <p className="text-sm font-bold text-[#2d1f2d] mb-1">{log.details}</p>
                              <p className="text-[10px] text-gray-400 font-medium">Performed by: {log.userEmail} • Target ID: {log.targetId || 'N/A'}</p>
                           </div>
                        </div>
                      ))}
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

              {activeTab === 'my-policies' && !isAdmin && (
                <div className="animate-in fade-in duration-300">
                   <h2 className="text-3xl font-bold font-outfit mb-8">My Document Vault</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {policies.filter(p => p.userId === user.id).map(p => (
                          <div key={p.id} className="p-8 bg-gray-50 border border-gray-100 rounded-[40px] flex flex-col gap-6">
                             <div className="flex justify-between items-start">
                                <div>
                                   <p className="text-[9px] font-black text-[#e91e8c] uppercase tracking-widest mb-1">Active Policy</p>
                                   <h3 className="text-3xl font-black font-outfit uppercase tracking-tighter">{p.details?.vrm}</h3>
                                </div>
                                <ShieldCheck size={32} className="text-green-500" />
                             </div>
                             <p className="text-sm font-bold text-gray-400">{p.details?.make} {p.details?.model} • {p.type}</p>
                             <button 
                               onClick={() => setViewingPolicy(p)}
                               className="mt-4 py-4 bg-[#2d1f2d] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2"
                             >
                                <Eye size={14} /> Examine Policy Documents
                             </button>
                          </div>
                       ))}
                   </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      
      {viewingUser && isAdmin && (
        <UserProfilePanel 
          targetUser={viewingUser} 
          onClose={() => setViewingUser(null)} 
          policies={policies}
          onAction={handleAdminAction}
        />
      )}

      {viewingPolicy && (
        <PolicyDetailsModal 
          policy={viewingPolicy} 
          onClose={() => setViewingPolicy(null)} 
        />
      )}
    </div>
  );
};

export default CustomerCenterPage;
