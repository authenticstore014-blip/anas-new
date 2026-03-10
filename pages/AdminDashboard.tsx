import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, Shield, Users, Terminal, Search, Eye, X, Banknote, 
  Car, Activity, RotateCcw, TrendingUp, History, Clock, 
  CheckCircle, BadgeCheck, User as UserIcon, ShieldAlert,
  Loader2, Download, Edit3, FileText, Check, UserMinus, 
  Info, Power, Snowflake, Trash2, LayoutDashboard,
  Settings, AlertTriangle, CreditCard, LifeBuoy, MoreVertical,
  ChevronRight, ArrowUpRight, ArrowDownRight, Filter,
  Layers, Package, Printer, Mail, Bell, Globe, Lock,
  Cpu, Zap, Gauge, Building, HardDrive, BarChart4,
  Calendar, CheckSquare, FileCheck,
  ArrowRight, MapPin, CheckCircle2, Phone, XCircle, StickyNote,
  UserX, UserCheck, ShieldPlus, Layout, CalendarDays
} from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { User, Policy, AuditLog, ClaimRecord, PaymentRecord, UserStatus, KYCStatus, RiskLevel, PolicyStatus, ClaimStatus, SupportTicket, RiskConfig, AdminActivityLog } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { OfficialCertificateModal } from '../services/PolicyDocumentEngine/OfficialCertificateModal';

/**
 * Functional Operational Modules
 */

const PolicyDetailModal = ({ policy, user, onClose }: { policy: Policy, user: User | undefined, onClose: () => void }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(documentRef.current, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('admin-policy-document-container');
          if (el) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            el.style.backgroundColor = '#ffffff';
          }
          // Recursively remove oklch colors from all elements in the cloned document
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const element = allElements[i] as HTMLElement;
            const style = window.getComputedStyle(element);
            
            // If background-color or color uses oklch, override it with a safe hex value
            if (style.backgroundColor.includes('oklch')) {
              element.style.backgroundColor = '#ffffff';
            }
            if (style.color.includes('oklch')) {
              element.style.color = '#000000';
            }
            if (style.borderColor.includes('oklch')) {
              element.style.borderColor = '#e5e7eb';
            }
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      pdf.save(`SwiftPolicy_Admin_Record_${policy.displayId || policy.id}.pdf`);
    } catch (e) {
      console.error('PDF Generation Error:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const bd = policy.details.breakdown;
  const totalCost = bd?.total || parseFloat(policy.premium);
  const isMonthly = (policy.details as any).paymentFrequency === 'monthly';
  const monthlyAmount = isMonthly ? (totalCost / 12) : null;
  const isPaid = policy.paymentStatus === 'Paid' || policy.status === 'Active';
  const isOneMonth = policy.policy_type === 'ONE_MONTH';

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#2d1f2d]/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-[95vw] bg-white h-[90vh] md:rounded-[48px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-4 md:p-8 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-[#e91e8c]/10 rounded-2xl flex items-center justify-center text-[#e91e8c]"><Shield size={24}/></div>
             <div><h3 className="font-black text-[#2d1f2d] uppercase tracking-tighter text-sm md:text-base">Policy Administration View</h3><p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {policy.id}</p></div>
          </div>
          <div className="flex gap-3">
             <button onClick={handleDownloadPDF} disabled={isDownloading} className="px-6 py-3 bg-[#2d1f2d] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">
                {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Export PDF
             </button>
             <button onClick={onClose} className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:bg-gray-100 transition-all"><X size={20}/></button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4 md:p-12 bg-gray-50">
           <div ref={documentRef} id="admin-policy-document-container" className="w-full max-w-full sm:max-w-4xl mx-auto bg-white p-6 md:p-12 rounded-[32px] md:rounded-[40px] shadow-sm border border-gray-100 text-[#2d1f2d] font-sans">
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  .policy-section { page-break-inside: auto; }
                  .policy-section h3 { page-break-after: avoid; }
                }
                #admin-policy-view {
                  padding-top: 10mm;
                  padding-bottom: 10mm;
                  background-color: #ffffff;
                }
                /* Fix for html2canvas oklch error */
                #admin-policy-view *, #admin-policy-document-container * {
                  --tw-text-opacity: 1 !important;
                  --tw-bg-opacity: 1 !important;
                  --tw-border-opacity: 1 !important;
                }
                .text-gray-400 { color: #9ca3af !important; }
                .text-gray-300 { color: #d1d5db !important; }
                .text-gray-500 { color: #6b7280 !important; }
                .text-green-600 { color: #16a34a !important; }
                .text-orange-600 { color: #ea580c !important; }
                .border-gray-100 { border-color: #f3f4f6 !important; }
                .bg-gray-50 { background-color: #f9fafb !important; }
                .bg-gray-100 { background-color: #f3f4f6 !important; }
                .bg-pink-50 { background-color: #fdf2f8 !important; }
                .text-blue-600 { color: #2563eb !important; }
                .bg-blue-50 { background-color: #eff6ff !important; }
                .text-red-600 { color: #dc2626 !important; }
                .bg-red-50 { background-color: #fef2f2 !important; }
              `}} />
              <div id="admin-policy-view">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-12 border-b-2 border-gray-100 pb-10 gap-8 policy-section">
                 <div className="w-full sm:w-auto">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-[#e91e8c] p-1.5 rounded-lg"><Shield className="text-white" size={24}/></div>
                      <span className="text-2xl font-black font-outfit tracking-tighter">SwiftPolicy</span>
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 space-y-1">
                       <p>Crown House, 27 Old Gloucester Street</p>
                       <p>London, WC1N 3AX, United Kingdom</p>
                       <p className="text-[#e91e8c]">FCA Firm Reference: 481413</p>
                    </div>
                 </div>
                 <div className="text-left sm:text-right w-full sm:w-auto">
                    <div className="flex flex-col items-start sm:items-end mb-6">
                       <div className="flex items-center gap-2 mb-1">
                         <div className="bg-[#e91e8c] p-1 rounded-md">
                           <Shield className="text-white" size={16} />
                         </div>
                         <span className="text-lg font-black font-outfit tracking-tighter">SwiftPolicy</span>
                       </div>
                       <p className="text-[10px] font-black text-[#e91e8c] uppercase tracking-widest">swiftpolicy.co.uk</p>
                    </div>
                    <h1 className="text-xl font-black uppercase text-[#2d1f2d] tracking-widest mb-1">CERTIFICATE OF MOTOR INSURANCE</h1>
                    <div className="space-y-1 mt-6">
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black text-gray-300 uppercase">Policy Number</span>
                          <div className="flex items-center gap-2 justify-start sm:justify-end">
                            <span className="text-lg font-mono font-black text-[#e91e8c]">{policy.displayId || policy.id}</span>
                            <span className="text-gray-300 font-mono text-xs">CW113</span>
                          </div>
                       </div>
                       <div className="flex flex-col mt-2">
                          <span className="text-[8px] font-black text-gray-300 uppercase">Status</span>
                          <span className={`text-xs font-black uppercase ${policy.status === 'Active' ? 'text-green-600' : 'text-orange-600'}`}>{policy.status}</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 policy-section">
                 <div className="space-y-6">
                    <div className="border-l-4 border-[#e91e8c] pl-6 py-1">
                       <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Policyholder Details</h3>
                       <div className="space-y-3">
                          <p className="text-lg font-black tracking-tight leading-none">{user?.name || 'Unknown Client'}</p>
                          <div className="text-xs font-bold text-gray-500 space-y-1">
                             <div className="flex items-start gap-2">
                               <MapPin size={12} className="mt-0.5 shrink-0"/> 
                               <div className="flex flex-col">
                                 {[
                                   policy.details.addressLine1 || policy.details.address,
                                   policy.details.addressLine2,
                                   policy.details.city,
                                   (policy.details as any).state || policy.details.county,
                                   policy.details.postcode,
                                   (policy.details as any).country
                                 ].filter(Boolean).map((line, i) => (
                                   <span key={i}>{line}</span>
                                 ))}
                               </div>
                             </div>
                             <p className="flex items-center gap-2"><Mail size={12}/> {user?.email}</p>
                             <p className="flex items-center gap-2"><Phone size={12}/> {user?.phone || 'Not provided'}</p>
                          </div>
                       </div>
                    </div>

                    <div className="border-l-4 border-[#2d1f2d] pl-6 py-1">
                       <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Coverage Parameters</h3>
                       <div className="space-y-3">
                          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                             <span className="text-xs font-bold text-gray-400">Level of Cover</span>
                             <span className="text-xs font-black uppercase">{policy.details.coverLevel}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                             <span className="text-xs font-bold text-gray-400">Effective Date</span>
                             <span className="text-xs font-black">{new Date(policy.details.startDate || policy.createdAt).toLocaleDateString('en-GB')}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                             <span className="text-xs font-bold text-gray-400">Expiry Date</span>
                             <span className="text-xs font-black">{new Date(policy.details.expiryDate || policy.renewalDate || '').toLocaleDateString('en-GB')}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                             <span className="text-xs font-bold text-gray-400">Excess Amount</span>
                             <span className="text-xs font-black">{policy.details.excess || '£250.00'}</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="bg-gray-50 p-6 md:p-8 rounded-[32px] border border-gray-100">
                       <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6 flex items-center gap-2"><Car size={14}/> Vehicle Specification</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                          <div className="sm:col-span-2">
                             <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Registration</p>
                             <p className="text-xl md:text-2xl font-black font-mono tracking-widest border-2 border-gray-100 bg-white inline-block px-4 py-1 rounded-xl text-[#2d1f2d]">{policy.details.vrm}</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Make / Model</p>
                             <p className="text-xs font-bold">{policy.details.make} {policy.details.model}</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Year</p>
                             <p className="text-xs font-bold">{policy.details.year}</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Engine Size</p>
                             <p className="text-xs font-bold">{policy.details.engine_size || policy.details.engineCC || 'N/A'}</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Colour</p>
                             <p className="text-xs font-bold">{policy.details.color || policy.details.colour || 'N/A'}</p>
                          </div>
                       </div>
                    </div>

                    <div className="bg-[#e91e8c]/5 p-6 rounded-[24px] border border-[#e91e8c]/10">
                       <h3 className="text-[10px] font-black uppercase text-[#e91e8c] tracking-widest mb-3">Optional Endorsements</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {policy.details.addons?.breakdown && <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600"><CheckCircle2 size={10} className="text-green-500"/> Breakdown Assist</div>}
                          {policy.details.addons?.legal && <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600"><CheckCircle2 size={10} className="text-green-500"/> Motor Legal</div>}
                          {policy.details.addons?.protectedNcb && <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600"><CheckCircle2 size={10} className="text-green-500"/> NCD Protection</div>}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-[#2d1f2d] p-6 md:p-10 rounded-[32px] md:rounded-[48px] text-white relative overflow-hidden policy-section">
                 <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="space-y-4 w-full lg:w-auto">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[#e91e8c] shadow-lg"><BadgeCheck size={24}/></div>
                          <h3 className="text-lg md:text-xl font-bold font-outfit uppercase tracking-widest">Financial Summary</h3>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                          <div>
                             <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Billing Method</p>
                             <p className="text-xs font-bold text-white/60">
                               {isOneMonth ? '1 Month – Single Payment' : isMonthly ? 'Monthly Installments' : 'Annual Upfront'}
                             </p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Payment Source</p>
                             <p className="text-xs font-bold text-white/60">Card ending in {policy.details.cardLastFour || 'XXXX'}</p>
                             {policy.details.cardExpiry && (
                                <p className="text-[10px] font-bold text-white/40 mt-1">Expiry Date: {policy.details.cardExpiry}</p>
                             )}
                             {isPaid && (
                                <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mt-1.5">Payment Settled</p>
                             )}
                          </div>
                          {isMonthly && (
                            <div>
                               <p className="text-[8px] font-black text-[#e91e8c] uppercase tracking-widest">Installment</p>
                               <p className="text-sm font-black">£{monthlyAmount?.toFixed(2)}</p>
                            </div>
                          )}
                       </div>
                    </div>
                    <div className="text-left lg:text-right border-t lg:border-t-0 lg:border-l border-white/10 pt-8 lg:pt-0 lg:pl-8 w-full lg:w-auto">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">TOTAL POLICY COST ({isOneMonth ? '30 DAYS' : 'ANNUAL'})</p>
                       <p className="text-4xl md:text-5xl font-black font-outfit tracking-tighter text-white">£{totalCost.toFixed(2)}</p>
                    </div>
                 </div>
              </div>

              {policy.notes && (
                <div className="mt-12 p-8 bg-yellow-50 border border-yellow-100 rounded-[32px] policy-section">
                   <h3 className="text-[10px] font-black uppercase text-yellow-600 tracking-widest mb-4 flex items-center gap-2"><StickyNote size={14}/> Internal Admin Notes</h3>
                   <p className="text-sm text-gray-700 italic leading-relaxed">"{policy.notes}"</p>
                </div>
              )}

              <div className="mt-12 pt-10 border-t border-gray-100 flex flex-col items-center text-center gap-6 policy-section">
                 <div className="flex flex-col items-center gap-4 mb-4">
                    <div className="flex flex-col items-center">
                       <div className="italic font-serif text-2xl text-[#2d1f2d] opacity-80 mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Ben Kedby</div>
                       <div className="w-32 h-px bg-gray-300 mb-2"></div>
                       <span className="font-black text-[#2d1f2d] text-[10px] uppercase tracking-widest">BEN KEDBY</span>
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-300">Authorised Signatory</p>
                 </div>
                 <div className="text-[9px] text-gray-400 leading-relaxed max-w-2xl space-y-2">
                    <p className="font-bold">SwiftPolicy Insurance Services is child company of AUTOLINE DIRECT INSURANCE CONSULTANTS LIMITED, authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority. Firm Reference Number: 481413.</p>
                    <p>Registered in England No NI020828. Registered Office: Crown House, 27 Old Gloucester Street, London WC1N 3AX, UK. Telephone: 0203 137 1752.</p>
                    <p>This document is an administrative record and serves as a Certificate of Motor Insurance. Please keep it in a safe place. You can manage your policy 24/7 at www.swiftpolicy.co.uk.</p>
                 </div>
              </div>

            </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const ExecutiveOverview = ({ analytics, policies, adminActivityLogs }: any) => (
  <div className="space-y-12 animate-in fade-in duration-500">
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-5xl font-black font-outfit uppercase tracking-tighter">Business Overview</h2>
        <p className="text-gray-400 font-medium text-lg mt-2">Real-time enterprise performance metrics.</p>
      </div>
      <div className="bg-white border border-gray-100 p-2 rounded-2xl flex gap-1 shadow-sm">
         {['Day', 'Week', 'Month', 'Year'].map(t => <button key={t} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${t === 'Month' ? 'bg-[#2d1f2d] text-white' : 'text-gray-400 hover:bg-gray-50'}`}>{t}</button>)}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { label: 'Annual Revenue', value: `£${analytics.revenue.toLocaleString()}`, icon: <Banknote className="text-green-500"/>, trend: '+14.2%', color: 'green' },
        { label: 'Active Registry', value: analytics.activePols, icon: <ShieldCheck className="text-blue-500"/>, trend: '+8.1%', color: 'blue' },
        { label: 'Pending KYC', value: analytics.pendingKYC, icon: <ShieldAlert className="text-orange-500"/>, trend: '-2.4%', color: 'orange' }
      ].map((s, i) => (
        <div key={i} className="p-10 bg-white border border-gray-100 rounded-[48px] shadow-sm hover:shadow-xl transition-all group border-b-4 border-b-transparent hover:border-b-[#e91e8c]">
           <div className="flex justify-between items-start mb-8">
              <div className="p-4 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform">{React.cloneElement(s.icon as any, { size: 32 })}</div>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${s.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {s.trend}
              </span>
           </div>
           <p className="text-[11px] font-black uppercase text-gray-400 tracking-widest mb-1">{s.label}</p>
           <p className="text-5xl font-black font-outfit tracking-tighter leading-none">{s.value}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 bg-white rounded-[48px] p-12 border border-gray-100 shadow-sm relative overflow-hidden">
         <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter mb-10 flex items-center gap-4"><Activity className="text-[#e91e8c]"/> Registry Acquisition Pulse</h3>
         <div className="h-[300px] flex items-end justify-between gap-4 px-4 pb-4">
            {[45, 67, 89, 120, 150, 130, 180, 210, 245, 290, 310, 350].map((h, i) => (
              <div key={i} className="flex-1 bg-[#e91e8c]/10 rounded-xl transition-all hover:bg-[#e91e8c]" style={{ height: `${h / 1.2}px` }} />
            ))}
         </div>
      </div>
      <div className="bg-[#2d1f2d] rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
         <div className="relative z-10">
           <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter mb-4 text-[#e91e8c]">System Activity</h3>
           <div className="space-y-6 mt-10">
              {adminActivityLogs.slice(0, 3).map((log: any, i: number) => (
                <div key={i} className="border-b border-white/5 pb-4 last:border-0">
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{log.action_performed.replace(/_/g, ' ')}</p>
                   <p className="text-sm font-medium line-clamp-1 opacity-70 italic">Ref: {log.policy_id || log.user_id}</p>
                </div>
              ))}
           </div>
         </div>
         <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#e91e8c]/5 rounded-full blur-[80px]" />
      </div>
    </div>
  </div>
);

const RiskPricingConfig = ({ config, onUpdate }: any) => (
  <div className="space-y-12 animate-in fade-in duration-500">
    <div>
      <h2 className="text-5xl font-black font-outfit uppercase tracking-tighter">Underwriting Parameters</h2>
      <p className="text-gray-400 font-medium mt-2">Adjust core risk multipliers and statutory fees.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="p-12 bg-white border border-gray-100 rounded-[56px] shadow-sm space-y-10">
        <h3 className="text-xl font-black font-outfit uppercase tracking-widest text-[#e91e8c] flex items-center gap-4"><Gauge size={24}/> Statutory Parameters</h3>
        <div className="space-y-8">
           <div className="flex justify-between items-center pb-6 border-b border-gray-50">
              <div><p className="font-bold text-[#2d1f2d]">IPT Rate (%)</p><p className="text-xs text-gray-400">UK Insurance Premium Tax</p></div>
              <input type="number" className="w-24 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-black text-center" value={config.iptRate} onChange={e => onUpdate({ iptRate: parseFloat(e.target.value) })} />
           </div>
           <div className="flex justify-between items-center pb-6 border-b border-gray-50">
              <div><p className="font-bold text-[#2d1f2d]">Admin Fee (£)</p><p className="text-xs text-gray-400">Flat policy issuance cost</p></div>
              <input type="number" className="w-24 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-black text-center" value={config.adminFee} onChange={e => onUpdate({ adminFee: parseFloat(e.target.value) })} />
           </div>
        </div>
      </div>

      <div className="p-12 bg-[#2d1f2d] text-white rounded-[56px] shadow-2xl relative overflow-hidden">
        <h3 className="text-xl font-black font-outfit uppercase tracking-widest text-[#e91e8c] flex items-center gap-4 mb-10"><Zap size={24}/> Real-time Multipliers</h3>
        <div className="space-y-6 relative z-10">
           {Object.entries(config.vehicleCategoryMultipliers).map(([cat, mult]: any) => (
             <div key={cat} className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest opacity-40">{cat} Class</span>
                <span className="font-mono font-bold text-[#e91e8c]">x {mult.toFixed(2)}</span>
             </div>
           ))}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e91e8c]/5 rounded-full blur-[80px]" />
      </div>
    </div>
  </div>
);

const SupportTickets = ({ tickets, onUpdate }: any) => (
  <div className="space-y-12 animate-in fade-in duration-500">
    <h2 className="text-5xl font-black font-outfit uppercase tracking-tighter">Support Queue</h2>
    <div className="grid grid-cols-1 gap-6">
      {tickets.map((t: SupportTicket) => (
        <div key={t.id} className="p-8 bg-white border border-gray-100 rounded-[48px] flex items-center justify-between hover:shadow-xl transition-all">
          <div className="flex items-center gap-8">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${t.status === 'Open' ? 'bg-[#e91e8c]' : 'bg-gray-400'}`}>
               <LifeBuoy size={28}/>
            </div>
            <div>
               <p className="text-2xl font-black font-outfit uppercase tracking-tighter">{t.subject}</p>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.id} • {t.type} • Priority: <span className="text-red-500">{t.priority}</span></p>
            </div>
          </div>
          <div className="flex gap-4">
             <button onClick={() => onUpdate(t.id, 'Resolved')} className="px-6 py-3 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all">Resolve Case</button>
             <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-[#e91e8c] transition-all"><ChevronRight size={20}/></button>
          </div>
        </div>
      ))}
      {tickets.length === 0 && <div className="py-40 bg-white rounded-[64px] border border-dashed border-gray-100 text-center text-gray-300 font-black uppercase tracking-widest">No active cases in queue.</div>}
    </div>
  </div>
);

/**
 * Main Admin Dashboard
 */
export const AdminDashboard: React.FC<{ initialTab?: string }> = ({ initialTab }) => {
  const { 
    user, adminUser, users, adminUsers, policies, payments, claims, tickets, riskConfig, auditLogs, adminActivityLogs, logoutAdmin, 
    updateUserStatus, activateUserProfile, enableUserProfile, updateUserRisk, updateUserNotes, validateUserIdentity, updatePolicyStatus, updatePolicyNotes, removePolicy, removeUser, refreshData, 
    updateClaimStatus, updateTicketStatus, updateRiskConfig 
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState(initialTab || 'executive-hub');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [viewingClient, setViewingClient] = useState<User | null>(null);
  const [viewingPolicy, setViewingPolicy] = useState<Policy | null>(null);
  const [viewingOfficialCertificate, setViewingOfficialCertificate] = useState<Policy | null>(null);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const analytics = useMemo(() => ({
    revenue: payments.filter(p => p.status === 'Paid' || p.status === 'Success').reduce((acc, p) => acc + parseFloat(p.amount), 0),
    activePols: policies.filter(p => p.status === 'Active').length,
    pendingKYC: users.filter(u => u.kyc_status === 'PENDING').length
  }), [payments, policies, users]);

  const filteredPolicies = useMemo(() => {
    return policies.filter(p => {
      const owner = users.find(u => u.id === p.userId)?.name || 'Unknown';
      const matchesSearch = p.id.toLowerCase().includes(search.toLowerCase()) || 
                           (p.displayId && p.displayId.toLowerCase().includes(search.toLowerCase())) ||
                           p.details.vrm.toLowerCase().includes(search.toLowerCase()) ||
                           owner.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' ? p.status !== 'Deleted' : p.status === statusFilter;
      const matchesType = typeFilter === 'All' || (typeFilter === 'Annual' ? (p.policy_type === 'ANNUAL' || !p.policy_type) : p.policy_type === 'ONE_MONTH');
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [policies, users, search, statusFilter, typeFilter]);

  // Route guard strictly checks 'adminUser'
  if (!adminUser) return <Navigate to="/auth?admin=true" replace />;

  const handleAdminAction = async (action: string, id: string, extra?: any) => {
    try {
      if (action === 'POLICY_REMOVE') {
         if (window.confirm("Are you sure you want to delete this policy? This action will deactivate the policy and remove it from active records.")) {
           await removePolicy(id, "Administrative soft-deletion.");
           await refreshData();
           alert("Policy has been successfully removed from active records.");
         }
         return;
      }

      if (action === 'USER_REMOVE') {
         if (window.confirm("Are you sure you want to PERMANENTLY delete this client account and all associated policies? This action cannot be undone.")) {
           await removeUser(id, "Administrative total account removal.");
           await refreshData();
           alert("Client account and associated policies have been permanently removed.");
         }
         return;
      }

      if (action === 'ACTIVATE_USER' || action === 'ENABLE_PROFILE') {
        const confirmMsg = action === 'ACTIVATE_USER' 
          ? "Are you sure you want to activate this policy buyer? This enables their secure profile and full portal access."
          : "Activate user profile? This will make their dashboard and data visible to them.";
          
        if (window.confirm(confirmMsg)) {
          const result = await activateUserProfile(id);
          if (result) {
            alert("User profile activated successfully.");
            await refreshData();
          }
        }
        return;
      }
      
      if (action === 'POLICY_NOTE') {
         const note = window.prompt("Add internal administrative note to policy:", policies.find(p => p.id === id)?.notes || "");
         if (note !== null) await updatePolicyNotes(id, note);
         return;
      }

      const reason = window.prompt(`Reasoning for action [${action}]:`);
      if (reason === null && action !== 'KYC') return;
      
      if (action === 'STATUS') updateUserStatus(id, extra, reason || '');
      if (action === 'KYC') validateUserIdentity(id, extra, reason || 'Compliance Audit');
      if (action === 'POLICY_STATUS') await updatePolicyStatus(id, extra, reason || 'Administrative transition');
      await refreshData();
    } catch (error) {
      console.error("Admin action failed:", error);
      alert("An error occurred while performing the administrative action.");
    }
  };

  const NavItem = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`w-full flex items-center gap-4 px-8 py-6 rounded-[32px] font-black text-[10px] transition-all text-left uppercase tracking-widest border-2 ${
        activeTab === id ? 'bg-[#e91e8c] text-white border-[#e91e8c] translate-x-3 shadow-2xl' : 'bg-white text-[#2d1f2d] border-transparent hover:border-[#e91e8c]/20'
      }`}
    >
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#faf8fa] flex font-inter text-[#2d1f2d]">
      <aside className="w-80 bg-white border-r border-gray-100 flex flex-col p-8 sticky top-0 h-screen shrink-0 z-50">
        <div className="flex items-center gap-3 mb-16 px-4">
           <div className="bg-[#e91e8c] p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={28}/></div>
           <div><h1 className="text-xl font-black font-outfit tracking-tighter leading-none">Admin Panel</h1><p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Enterprise v2.4.0</p></div>
        </div>
        <nav className="space-y-2 flex-1 overflow-y-auto pr-2">
           <NavItem id="executive-hub" label="Dashboard" icon={LayoutDashboard} />
           <NavItem id="client-registry" label="Clients" icon={Users} />
           <NavItem id="policy-ledger" label="Policy Management" icon={Shield} />
           <NavItem id="financial-ledger" label="Payments" icon={Banknote} />
           <NavItem id="risk-pricing" label="Risk Config" icon={Gauge} />
           <NavItem id="support-queue" label="Support" icon={LifeBuoy} />
           <NavItem id="activity-audit" label="Activity Audit" icon={History} />
        </nav>
        <div className="mt-10 pt-8 border-t border-gray-50"><button onClick={logoutAdmin} className="w-full flex items-center gap-4 px-8 py-5 rounded-2xl font-black text-[10px] text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all uppercase tracking-widest"><Power size={18}/> Sign Out</button></div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-24 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-40">
           <div className="flex items-center gap-6 w-full max-w-xl">
              <Search className="text-gray-300" size={20}/>
              <input className="w-full bg-transparent text-sm font-bold text-[#2d1f2d] outline-none placeholder-gray-300" placeholder="Quick Search Identity, Policy ID, VRM..." value={search} onChange={e => setSearch(e.target.value)} />
           </div>
           <div className="flex items-center gap-8 pl-8 border-l border-gray-100">
              <div className="text-right">
                 <p className="text-xs font-black uppercase text-[#2d1f2d] leading-none">{adminUser.name}</p>
                 <p className="text-[9px] font-bold text-[#e91e8c] uppercase tracking-widest mt-1">Super Admin Authority</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-200"><Terminal size={24}/></div>
           </div>
        </header>

        <div className="p-12 pb-32">
           {activeTab === 'executive-hub' && <ExecutiveOverview analytics={analytics} policies={policies} adminActivityLogs={adminActivityLogs} />}
           
           {activeTab === 'client-registry' && (
              <div className="space-y-10 animate-in fade-in duration-500">
                 <h2 className="text-5xl font-black font-outfit uppercase tracking-tighter">Client Management Hub</h2>
                 <div className="bg-white rounded-[48px] border border-gray-100 shadow-xl overflow-x-auto overflow-y-visible">
                    <div className="min-w-[1100px]">
                       <div className="grid grid-cols-[2fr_3fr_1fr_1.2fr_1.2fr_1fr] bg-[#2d1f2d] text-[10px] font-black uppercase text-white/40 tracking-[0.2em] px-10 py-6">
                          <div>Name</div>
                          <div>Email</div>
                          <div className="text-center">Policies</div>
                          <div>Status</div>
                          <div>Profile</div>
                          <div className="text-center">Actions</div>
                       </div>
                       <div className="divide-y divide-gray-50">
                          {users.filter(u => u.role !== 'admin').map(u => {
                            const userPoliciesCount = policies.filter(p => p.userId === u.id).length;
                            return (
                              <div key={u.id} className="grid grid-cols-[2fr_3fr_1fr_1.2fr_1.2fr_1fr] px-10 py-6 hover:bg-gray-50/50 transition-all group items-center">
                                 <div>
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#e91e8c] group-hover:text-white transition-all"><UserIcon size={20}/></div>
                                       <p className="font-black text-sm uppercase tracking-tighter text-[#2d1f2d] leading-none">{u.name}</p>
                                    </div>
                                 </div>
                                 <div>
                                    <p className="text-xs font-bold text-gray-500">{u.email}</p>
                                 </div>
                                 <div className="text-center">
                                    <span className="px-3 py-1 bg-pink-50 text-[#e91e8c] rounded-lg text-xs font-black">{userPoliciesCount}</span>
                                 </div>
                                 <div>
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                      u.status === 'Active' ? 'bg-green-100 text-green-700' : 
                                      u.status === 'Pending' ? 'bg-orange-50 text-orange-600 animate-pulse' :
                                      'bg-red-100 text-red-700'
                                    }`}>{u.status}</span>
                                  </div>
                                  <div className="px-10 py-8">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                      u.is_profile_enabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                      {u.is_profile_enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                 </div>
                                 <div className="text-center">
                                    <div className="flex justify-center gap-3">
                                       <button 
                                          onClick={() => setViewingClient(u)} 
                                          className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                          title="View Policies"
                                       >
                                          <Eye size={18}/>
                                       </button>
                                       
                                       {/* Manual Activation Control */}
                                       {u.status === 'Pending' && (
                                         <button 
                                            onClick={() => handleAdminAction('ACTIVATE_USER', u.id)} 
                                            className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"
                                            title="Activate Account"
                                         >
                                            <ShieldPlus size={18}/>
                                         </button>
                                       )}

                                       {/* Enable Profile Control */}
                                       {!u.is_profile_enabled && (
                                         <button 
                                            onClick={() => handleAdminAction('ENABLE_PROFILE', u.id)} 
                                            className="p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all"
                                            title="Activate Account"
                                         >
                                            <Layout size={18}/>
                                         </button>
                                       )}

                                       <button 
                                          onClick={() => handleAdminAction('USER_REMOVE', u.id)} 
                                          className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                          title="Delete Account"
                                       >
                                          <UserX size={18}/>
                                       </button>
                                    </div>
                                 </div>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'policy-ledger' && (
              <div className="space-y-12 animate-in fade-in duration-500">
                 <div className="flex justify-between items-center">
                    <h2 className="text-5xl font-black font-outfit uppercase tracking-tighter text-[#2d1f2d]">Policy Management Ledger</h2>
                    <div className="flex gap-4">
                       <select 
                         className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                         value={typeFilter}
                         onChange={(e) => setTypeFilter(e.target.value)}
                       >
                          <option value="All">All Types</option>
                          <option value="Annual">Annual Insurance</option>
                          <option value="OneMonth">1 Month Insurance</option>
                       </select>
                       <select 
                         className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                         value={statusFilter}
                         onChange={(e) => setStatusFilter(e.target.value)}
                       >
                          <option>All Status</option>
                          <option>Active</option>
                          <option>Pending Approval</option>
                          <option>Approved</option>
                          <option>Suspended</option>
                          <option>Frozen</option>
                          <option>Cancelled</option>
                          <option>Deleted</option>
                       </select>
                    </div>
                 </div>
                 <div className="bg-white rounded-[48px] border border-gray-100 shadow-xl overflow-x-auto overflow-y-visible">
                    <div className="min-w-[1100px]">
                        <div className="grid grid-cols-[1.5fr_1fr_2fr_1.2fr_1fr_1.2fr_1fr_1fr_1fr] bg-[#2d1f2d] text-[9px] font-black uppercase text-white/40 tracking-[0.2em] px-8 py-7">
                             <div className="px-8 py-7 border-b border-white/5">Policy ID</div>
                             <div className="px-8 py-7 border-b border-white/5">Type</div>
                             <div className="px-8 py-7 border-b border-white/5">Customer Name</div>
                             <div className="px-8 py-7 border-b border-white/5">Vehicle</div>
                             <div className="px-8 py-7 border-b border-white/5">Premium</div>
                             <div className="px-8 py-7 border-b border-white/5">Status</div>
                             <div className="px-8 py-7 border-b border-white/5">Start Date</div>
                             <div className="px-8 py-7 border-b border-white/5">End Date</div>
                             <div className="px-8 py-7 border-b border-white/5 text-center">Actions</div>
                        </div>
                       <div className="divide-y divide-gray-50">
                          {filteredPolicies.map(p => {
                            const client = users.find(u => u.id === p.userId);
                            return (
                              <div key={p.id} className="grid grid-cols-[1.5fr_1fr_2fr_1.2fr_1fr_1.2fr_1fr_1fr_1fr] px-8 py-6 hover:bg-pink-50/30 even:bg-gray-50/40 transition-all group items-center">
                                 <div>
                                    <p className="font-mono text-xs font-black tracking-tighter text-[#e91e8c] group-hover:scale-105 transition-transform origin-left">{p.displayId || p.id}</p>
                                    <p className="text-[8px] text-gray-300 uppercase mt-1">Created: {new Date(p.createdAt).toLocaleDateString('en-GB')}</p>
                                 </div>
                                 <div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm ${p.policy_type === 'ONE_MONTH' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                      {p.policy_type === 'ONE_MONTH' ? '1 Month' : 'Annual'}
                                    </span>
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-[#2d1f2d] tracking-tight">{client?.name || 'Unlinked'}</p>
                                    <p className="text-[10px] text-gray-400">{client?.email}</p>
                                 </div>
                                 <div>
                                    <span className="px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-xl font-mono font-black text-xs text-yellow-700 shadow-sm">{p.details.vrm}</span>
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-[#2d1f2d] bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 inline-block">£{parseFloat(p.premium).toLocaleString()}</p>
                                 </div>
                                 <div>
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border ${
                                      p.status === 'Active' ? 'bg-green-100 text-green-700' :
                                      p.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                                      p.status === 'Pending Approval' ? 'bg-orange-100 text-orange-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>{p.status}</span>
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-gray-500">{new Date(p.details.startDate || p.createdAt).toLocaleDateString('en-GB')}</p>
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-gray-500">{new Date(p.details.expiryDate || p.renewalDate || '').toLocaleDateString('en-GB')}</p>
                                 </div>
                                 <div className="text-center">
                                    <div className="flex justify-center items-center gap-2">
                                       <button onClick={() => setViewingPolicy(p)} className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all" title="View Full Details"><Eye size={16}/></button>
                                       
                                       {/* Note Action */}
                                       <button onClick={() => handleAdminAction('POLICY_NOTE', p.id)} className="w-9 h-9 flex items-center justify-center bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-600 hover:text-white hover:shadow-lg hover:shadow-yellow-200 transition-all" title="Add Internal Note"><StickyNote size={16}/></button>

                                       {/* Status Lifecycle Actions */}
                                       {p.status === 'Pending Approval' && (
                                         <button onClick={() => handleAdminAction('POLICY_STATUS', p.id, 'Approved')} className="w-9 h-9 flex items-center justify-center bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white hover:shadow-lg hover:shadow-green-200 transition-all" title="Approve"><CheckSquare size={16}/></button>
                                       )}
                                       {p.status === 'Active' && (
                                         <>
                                           <button onClick={() => handleAdminAction('POLICY_STATUS', p.id, 'Cancelled')} className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-200 transition-all" title="Cancel Policy"><XCircle size={16}/></button>
                                           <button onClick={() => handleAdminAction('POLICY_STATUS', p.id, 'Suspended')} className="w-9 h-9 flex items-center justify-center bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white hover:shadow-lg hover:shadow-orange-200 transition-all" title="Suspend Policy"><UserMinus size={16}/></button>
                                         </>
                                       )}
                                       {(p.status === 'Cancelled' || p.status === 'Suspended') && (
                                         <button onClick={() => handleAdminAction('POLICY_STATUS', p.id, 'Active')} className="w-9 h-9 flex items-center justify-center bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white hover:shadow-lg hover:shadow-green-200 transition-all" title="Reactivate Policy"><Power size={16}/></button>
                                       )}
                                       {p.status !== 'Deleted' && (
                                         <button onClick={() => handleAdminAction('POLICY_REMOVE', p.id)} className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-400 rounded-xl hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-200 transition-all" title="Delete Policy"><Trash2 size={16}/></button>
                                       )}
                                       {p.status === 'Active' && (
                                         <button onClick={() => setViewingOfficialCertificate(p)} className="w-9 h-9 flex items-center justify-center bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white hover:shadow-lg hover:shadow-green-200 transition-all" title="Official Certificate"><FileCheck size={16}/></button>
                                       )}
                                    </div>
                                 </div>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'activity-audit' && (
              <div className="space-y-12 animate-in fade-in duration-500">
                 <h2 className="text-5xl font-black font-outfit uppercase tracking-tighter">Admin Activity Audit</h2>
                 <div className="bg-white rounded-[48px] border border-gray-100 shadow-xl overflow-x-auto overflow-y-visible">
                    <div className="min-w-[1100px]">
                       <div className="grid grid-cols-[2fr_1.5fr_1.5fr_2fr_1.5fr] bg-[#2d1f2d] text-[9px] font-black uppercase text-white/40 tracking-[0.2em] px-10 py-6">
                          <div>Administrator</div>
                          <div>Action Entity</div>
                          <div>Action</div>
                          <div>Transition</div>
                          <div>Timestamp</div>
                       </div>
                       <div className="divide-y divide-gray-50">
                          {adminActivityLogs.map(log => (
                             <div key={log.id} className="grid grid-cols-[2fr_1.5fr_1.5fr_2fr_1.5fr] hover:bg-gray-50/50 transition-all group">
                               <div className="px-10 py-8">
                                  <p className="text-sm font-bold text-[#2d1f2d]">{adminUsers.find(a => a.id === log.admin_id)?.name || 'Superuser'}</p>
                                  <p className="text-[10px] text-gray-400 font-mono">{log.admin_id}</p>
                               </div>
                               <div className="px-10 py-8">
                                  <span className="font-mono text-xs font-bold text-[#e91e8c]">{log.policy_id || log.user_id}</span>
                                </div>
                               <div className="px-10 py-8">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-[#2d1f2d]">{log.action_performed.replace(/_/g, ' ')}</span>
                               </div>
                               <div className="px-10 py-8">
                                  {log.previous_status ? (
                                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest">
                                       <span className="text-gray-300">{log.previous_status}</span>
                                       <ArrowRight size={10} className="text-[#e91e8c]"/>
                                       <span className="text-[#2d1f2d]">{log.new_status}</span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-300 text-[8px] font-black uppercase tracking-widest">Global State Mutation</span>
                                  )}
                               </div>
                               <div className="px-10 py-8">
                                  <p className="text-[10px] font-bold text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    {adminActivityLogs.length === 0 && <div className="py-20 text-center text-gray-300 uppercase font-black tracking-widest">No audit history found.</div>}
                 </div>
              </div>
           </div>
        )}

           {activeTab === 'risk-pricing' && <RiskPricingConfig config={riskConfig} onUpdate={updateRiskConfig} />}
           {activeTab === 'support-queue' && <SupportTickets tickets={tickets} onUpdate={updateTicketStatus} />}
           
           {['financial-ledger', 'kyc-compliance', 'vehicle-registry', 'reports-analytics', 'document-hub', 'admin-roles', 'system-settings'].includes(activeTab) && (
              <div className="min-h-[600px] flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-700">
                 <div className="w-40 h-40 bg-gray-100 rounded-[48px] flex items-center justify-center text-gray-300 border-4 border-dashed border-gray-200"><Layers size={64} className="animate-pulse" /></div>
                 <div className="text-center"><h2 className="text-3xl font-black font-outfit uppercase tracking-tighter text-[#2d1f2d] mb-3">{activeTab.replace(/-/g, ' ')}</h2><p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Module under maintenance or pending logic migration.</p></div>
                 <button onClick={() => setActiveTab('executive-hub')} className="px-10 py-5 bg-[#2d1f2d] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl">Return to Hub</button>
              </div>
           )}
        </div>
      </main>

      {/* Detail Modals */}
      {viewingClient && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end">
          <div className="absolute inset-0 bg-[#2d1f2d]/70 backdrop-blur-sm" onClick={() => setViewingClient(null)} />
          <div className="relative w-full max-w-4xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto border-l border-gray-100 flex flex-col p-12">
            <div className="flex items-center justify-between mb-12">
               <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-[#e91e8c] rounded-[32px] flex items-center justify-center text-white shadow-xl"><UserIcon size={40}/></div>
                  <div><h2 className="text-3xl font-black font-outfit uppercase tracking-tighter leading-none mb-1">{viewingClient.name}</h2><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{viewingClient.client_code} • {viewingClient.email}</p></div>
               </div>
               <button onClick={() => setViewingClient(null)} className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:bg-gray-100 transition-all"><X size={24}/></button>
            </div>
            <div className="space-y-12">
               <section className="bg-blue-50/50 p-8 rounded-[40px] border border-blue-100">
                  <h3 className="text-sm font-black uppercase tracking-widest text-blue-900 mb-8 flex items-center gap-3"><ShieldCheck size={18}/> Compliance & KYC Management</h3>
                  <div className="grid grid-cols-3 gap-3">
                     <button onClick={() => handleAdminAction('KYC', viewingClient.id, 'VERIFIED')} className="py-5 bg-white border-2 border-blue-100 text-blue-700 rounded-2xl font-black uppercase text-[10px] hover:bg-blue-700 hover:text-white transition-all shadow-sm">Verify Identity</button>
                     <button onClick={() => handleAdminAction('KYC', viewingClient.id, 'REJECTED')} className="py-5 bg-white border-2 border-red-100 text-red-600 rounded-2xl font-black uppercase text-[10px] hover:bg-red-600 hover:text-white transition-all shadow-sm">Reject KYC</button>
                     <div className="space-y-2">
                        <button onClick={() => handleAdminAction('STATUS', viewingClient.id, viewingClient.status === 'Active' ? 'Suspended' : 'Active')} className="w-full py-5 bg-[#2d1f2d] text-white rounded-2xl font-black uppercase text-[10px] transition-all shadow-sm">{viewingClient.status === 'Active' ? 'Suspend Access' : 'Restore Access'}</button>
                        {!viewingClient.is_profile_enabled && (
                          <button onClick={() => handleAdminAction('ACTIVATE_USER', viewingClient.id)} className="w-full py-3 bg-[#e91e8c] text-white rounded-xl font-black uppercase text-[9px] transition-all shadow-lg shadow-pink-900/10">Activate Account</button>
                        )}
                     </div>
                  </div>
               </section>
               <section>
                  <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-6 flex items-center gap-3"><Package size={18}/> Registry Entries</h3>
                  <div className="space-y-4">
                     {policies.filter(p => p.userId === viewingClient.id && p.status !== 'Deleted').map(p => (
                        <div key={p.id} className="p-6 bg-gray-50 border border-gray-100 rounded-[32px] flex items-center justify-between">
                           <div className="flex items-center gap-4"><Shield className="text-[#e91e8c]" size={24}/><p className="font-black text-xl uppercase tracking-tighter leading-none">{p.details.vrm}</p></div>
                           <div className="flex gap-2">
                              <button onClick={() => setViewingPolicy(p)} className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-[#e91e8c] transition-all" title="View Details"><Eye size={18}/></button>
                              <button onClick={() => handleAdminAction('POLICY_REMOVE', p.id)} className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-red-600 transition-all" title="Delete Policy"><Trash2 size={18}/></button>
                           </div>
                        </div>
                     ))}
                     {policies.filter(p => p.userId === viewingClient.id && p.status !== 'Deleted').length === 0 && (
                       <p className="text-center py-10 text-gray-300 font-black uppercase tracking-widest text-[10px]">No active policies found.</p>
                     )}
                  </div>
               </section>
            </div>
          </div>
        </div>
      )}

      {viewingPolicy && (
        <PolicyDetailModal 
          policy={viewingPolicy} 
          user={users.find(u => u.id === viewingPolicy.userId)} 
          onClose={() => setViewingPolicy(null)} 
        />
      )}

      {viewingOfficialCertificate && (
        <OfficialCertificateModal 
          policy={viewingOfficialCertificate} 
          user={users.find(u => u.id === viewingOfficialCertificate.userId)} 
          onClose={() => setViewingOfficialCertificate(null)} 
        />
      )}
    </div>
  );
};