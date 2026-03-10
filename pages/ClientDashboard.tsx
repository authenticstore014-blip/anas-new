import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, Clock, Phone, User as UserIcon, RotateCcw, 
  ArrowRight, Eye, Car, X, FileText, Download, Loader2,
  Mail, Globe, MapPin, CheckCircle2, BadgeCheck, Lock,
  ShieldAlert, Sparkles, AlertCircle, UserCheck, CalendarDays, FileCheck
} from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { Policy, User } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { OfficialCertificateModal } from '../services/PolicyDocumentEngine/OfficialCertificateModal';

const PolicyDocumentModal = ({ policy, user, onClose }: { policy: Policy, user: User, onClose: () => void }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;
    setIsDownloading(true);
    try {
      // Ensure the element is visible and has a white background during capture
      const canvas = await html2canvas(documentRef.current, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('policy-document-container');
          if (el) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            el.style.backgroundColor = '#ffffff';
            
            // Recursively remove oklch colors from all elements in the cloned document
            const allElements = el.querySelectorAll('*');
            allElements.forEach((node: any) => {
              if (node.style) {
                const style = window.getComputedStyle(node);
                if (style.backgroundColor.includes('oklch')) {
                  node.style.backgroundColor = '#ffffff';
                }
                if (style.color.includes('oklch')) {
                  node.style.color = '#000000';
                }
                if (style.borderColor.includes('oklch')) {
                  node.style.borderColor = '#e5e7eb';
                }
              }
            });
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

      // Add the first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Add subsequent pages if content is longer than one A4 page
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      pdf.save(`SwiftPolicy_Certificate_${policy.displayId || policy.id}.pdf`);
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-[#2d1f2d]/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-full sm:max-w-[95vw] bg-white h-full sm:h-auto sm:max-h-[95vh] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-4 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-white shrink-0 gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-[#e91e8c]/10 rounded-2xl flex items-center justify-center text-[#e91e8c]"><FileText size={20}/></div>
             <div><h3 className="font-black text-[#2d1f2d] uppercase tracking-tighter text-sm md:text-base">Policy Schedule</h3><p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ref: {policy.displayId || policy.id}</p></div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
             <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex-1 sm:flex-none px-4 md:px-8 py-3 bg-[#2d1f2d] text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Download PDF
             </button>
             <button onClick={onClose} className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:bg-gray-100 transition-all"><X size={20}/></button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4 md:p-12 bg-gray-100 flex justify-center">
           {/* PROFESSIONAL POLICY DOCUMENT LAYOUT */}
           <div ref={documentRef} id="policy-document-container" className="w-full max-w-full sm:max-w-[210mm] bg-white p-4 sm:p-6 md:p-16 shadow-xl text-[#2d1f2d] font-sans relative overflow-x-hidden">
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  .policy-section { page-break-inside: auto; }
                  .policy-section h3 { page-break-after: avoid; }
                  .page-break { page-break-after: always; }
                }
                #policy-document {
                  padding-top: 10mm;
                  padding-bottom: 10mm;
                  background-color: #ffffff;
                }
                @media (min-width: 640px) {
                  #policy-document {
                    padding-top: 20mm;
                    padding-bottom: 20mm;
                  }
                }
                /* Fix for html2canvas oklch error */
                #policy-document *, #policy-document-container * {
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
              <div id="policy-document" className="w-full">
                {/* HEADER SECTION */}
                <div className="flex flex-col sm:flex-row justify-between items-start mb-8 sm:mb-12 border-b-2 border-gray-100 pb-8 sm:pb-10 gap-6 sm:gap-8 policy-section">
                  <div className="w-full sm:w-auto">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="bg-[#e91e8c] p-1.5 rounded-lg"><Shield className="text-white" size={20}/></div>
                      <span className="text-xl sm:text-2xl font-black font-outfit tracking-tighter">SwiftPolicy</span>
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-gray-400 space-y-1">
                       <p>Crown House, 27 Old Gloucester Street</p>
                       <p>London, WC1N 3AX, United Kingdom</p>
                       <p>Contact: 0203 137 1752 | info@swiftpolicy.co.uk</p>
                       <p>Website: www.swiftpolicy.co.uk</p>
                       <p className="text-[#e91e8c] font-black">FCA Firm Reference: 481413</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <div className="flex flex-col items-start sm:items-end mb-4 sm:mb-6">
                       <div className="flex items-center gap-2 mb-1">
                         <div className="bg-[#e91e8c] p-1 rounded-md">
                           <Shield className="text-white" size={14} />
                         </div>
                         <span className="text-base sm:text-lg font-black font-outfit tracking-tighter">SwiftPolicy</span>
                       </div>
                       <p className="text-[9px] sm:text-[10px] font-black text-[#e91e8c] uppercase tracking-widest">swiftpolicy.co.uk</p>
                    </div>
                    <h1 className="text-lg sm:text-xl font-black uppercase text-[#2d1f2d] tracking-widest mb-1">CERTIFICATE OF MOTOR INSURANCE</h1>
                    <div className="space-y-1 mt-4 sm:mt-6">
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black text-gray-300 uppercase">Policy Reference Number</span>
                          <div className="flex items-center gap-2 justify-start sm:justify-end">
                            <span className="text-lg sm:text-xl font-mono font-black text-[#e91e8c]">{policy.displayId || policy.id}</span>
                            <span className="text-gray-300 font-mono text-[10px] sm:text-xs">CW113</span>
                          </div>
                       </div>
                       <div className="flex flex-col mt-2">
                          <span className="text-[8px] font-black text-gray-300 uppercase">Issue Date</span>
                          <span className="text-[10px] sm:text-xs font-bold">{new Date(policy.createdAt).toLocaleDateString('en-GB')}</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* GRID SECTIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 policy-section">
                 {/* Policyholder Details */}
                 <div className="space-y-6">
                    <div className="border-l-4 border-[#e91e8c] pl-4 sm:pl-6 py-1">
                       <h3 className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 sm:mb-4">Policyholder Details</h3>
                       <div className="space-y-2 sm:space-y-3">
                          <p className="text-base sm:text-lg font-black tracking-tight leading-none">
                            {(() => {
                              const prefixes = ['MR ', 'MRS ', 'MS ', 'MISS ', 'DR ', 'PROF '];
                              const upperName = user.name.toUpperCase();
                              if (prefixes.some(p => upperName.startsWith(p))) return user.name;
                              return `MR ${user.name}`;
                            })()}
                          </p>
                          <div className="text-[10px] sm:text-xs font-bold text-gray-500 space-y-1">
                             <div className="flex items-start gap-2">
                               <MapPin size={10} className="mt-0.5 shrink-0"/> 
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
                             <p className="flex items-center gap-2"><Mail size={12}/> {user.email}</p>
                             <p className="flex items-center gap-2"><Phone size={12}/> {user.phone || '07XXX XXXXXX'}</p>
                          </div>
                       </div>
                    </div>

                    {/* Policy Coverage */}
                    <div className="border-l-4 border-[#2d1f2d] pl-4 sm:pl-6 py-1">
                       <h3 className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 sm:mb-4">Policy Coverage</h3>
                       <div className="space-y-2 sm:space-y-3">
                          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                             <span className="text-[10px] sm:text-xs font-bold text-gray-400">Level of Cover</span>
                             <span className="text-[10px] sm:text-xs font-black uppercase">{policy.details.coverLevel}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                             <span className="text-[10px] sm:text-xs font-bold text-gray-400">Effective From</span>
                             <span className="text-[10px] sm:text-xs font-black">{new Date(policy.details.startDate || policy.createdAt).toLocaleDateString('en-GB')}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                             <span className="text-[10px] sm:text-xs font-bold text-gray-400">Expiry Date</span>
                             <span className="text-[10px] sm:text-xs font-black">{new Date(policy.details.expiryDate || policy.renewalDate || '').toLocaleDateString('en-GB')}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                             <span className="text-[10px] sm:text-xs font-bold text-gray-400">Policy Excess</span>
                             <span className="text-[10px] sm:text-xs font-black">{policy.details.excess || '£250.00'}</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Vehicle Details */}
                 <div className="space-y-6">
                    <div className="bg-gray-50 p-4 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[32px] border border-gray-100 relative overflow-hidden">
                       <h3 className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 sm:mb-6 flex items-center gap-2"><Car size={12}/> Vehicle Specification</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 relative z-10">
                          <div className="sm:col-span-2">
                             <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Registration</p>
                             <p className="text-lg sm:text-xl md:text-2xl font-black font-mono tracking-widest border-2 border-gray-100 bg-white inline-block px-3 sm:px-4 py-1 rounded-lg sm:rounded-xl text-[#2d1f2d]">{policy.details.vrm}</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Make</p>
                             <p className="text-[10px] sm:text-xs font-bold">{policy.details.make}</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Model</p>
                             <p className="text-[10px] sm:text-xs font-bold">{policy.details.model}</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Year</p>
                             <p className="text-[10px] sm:text-xs font-bold">{policy.details.year}</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Fuel Type</p>
                             <p className="text-[10px] sm:text-xs font-bold">{(policy.details as any).fuel_type || 'Petrol'}</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Engine Size</p>
                             <p className="text-[10px] sm:text-xs font-bold">{policy.details.engine_size || policy.details.engineCC || 'N/A'}</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Colour</p>
                             <p className="text-[10px] sm:text-xs font-bold">{policy.details.color || policy.details.colour || 'N/A'}</p>
                          </div>
                       </div>
                    </div>

                    <div className="bg-[#e91e8c]/5 p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] border border-[#e91e8c]/10">
                       <h3 className="text-[9px] sm:text-[10px] font-black uppercase text-[#e91e8c] tracking-widest mb-3">Optional Add-ons</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {policy.details.addons?.breakdown && <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600"><CheckCircle2 size={10} className="text-green-500"/> Breakdown Assist</div>}
                          {policy.details.addons?.legal && <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600"><CheckCircle2 size={10} className="text-green-500"/> Motor Legal Exp.</div>}
                          {policy.details.addons?.protectedNcb && <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600"><CheckCircle2 size={10} className="text-green-500"/> NCD Protection</div>}
                          {policy.details.addons?.windscreen && <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600"><CheckCircle2 size={10} className="text-green-500"/> Windscreen Cover</div>}
                       </div>
                    </div>
                 </div>
              </div>

              {/* PAYMENT SUMMARY SECTION */}
              <div className="bg-[#2d1f2d] p-6 sm:p-8 md:p-10 rounded-[24px] sm:rounded-[32px] md:rounded-[48px] text-white relative overflow-hidden mb-8 sm:mb-12 policy-section">
                 <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8">
                    <div className="space-y-4 w-full lg:w-auto">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center text-[#e91e8c] shadow-lg"><BadgeCheck size={20} className="sm:w-6 sm:h-6"/></div>
                          <h3 className="text-base sm:text-lg md:text-xl font-black font-outfit uppercase tracking-widest">Premium Settlement</h3>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 pt-2">
                          <div>
                             <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Payment Source</p>
                             <p className="text-[10px] sm:text-xs font-bold text-white/60">Card ending in {policy.details.cardLastFour || 'XXXX'}</p>
                             {policy.details.cardExpiry && (
                               <p className="text-[9px] sm:text-[10px] font-bold text-white/40 mt-0.5">Expiry Date: {policy.details.cardExpiry}</p>
                             )}
                             {isPaid && (
                               <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mt-1">Payment Settled</p>
                             )}
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Billing Plan</p>
                             <p className="text-[10px] sm:text-xs font-bold text-white/60">
                               {isOneMonth ? '1 Month – Single Payment' : isMonthly ? '12 Monthly Installments' : 'Annual Upfront'}
                             </p>
                          </div>
                          {isMonthly && (
                             <div>
                                <p className="text-[8px] font-black text-[#e91e8c] uppercase tracking-widest">Monthly Installment</p>
                                <p className="text-xs sm:text-sm font-black">£{monthlyAmount?.toFixed(2)}</p>
                             </div>
                          )}
                       </div>
                    </div>
                    <div className="text-left lg:text-right border-t lg:border-t-0 lg:border-l border-white/10 pt-6 sm:pt-8 lg:pt-0 lg:pl-8 w-full lg:w-auto">
                       <p className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">TOTAL POLICY COST ({isOneMonth ? '30 DAYS' : 'ANNUAL'})</p>
                       <p className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit tracking-tighter text-white">£{totalCost.toFixed(2)}</p>
                       <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-2 flex items-center justify-start lg:justify-end gap-1"><Shield size={8}/> Prices inclusive of IPT & Fees</p>
                    </div>
                 </div>
                 <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-[#e91e8c]/10 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />
              </div>

              {/* FOOTER SECTION */}
              <div className="border-t border-gray-100 pt-8 sm:pt-10 flex flex-col items-center text-center gap-4 sm:gap-6 policy-section">
                 <div className="flex flex-col items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
                    <div className="flex flex-col items-center">
                       <div className="italic font-serif text-xl sm:text-2xl text-[#2d1f2d] opacity-80 mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Ben Kedby</div>
                       <div className="w-24 sm:w-32 h-px bg-gray-300 mb-2"></div>
                       <span className="font-black text-[#2d1f2d] text-[9px] sm:text-[10px] uppercase tracking-widest">BEN KEDBY</span>
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-300">Authorised Signatory</p>
                 </div>
                 <div className="text-[9px] text-gray-400 leading-relaxed max-w-2xl space-y-2">
                    <p className="font-bold">SwiftPolicy Insurance Services is child company of AUTOLINE DIRECT INSURANCE CONSULTANTS LIMITED, authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority. Firm Reference Number: 481413.</p>
                    <p>Registered in England No NI020828. Registered Office: Crown House, 27 Old Gloucester Street, London WC1N 3AX, UK. Telephone: 0203 137 1752.</p>
                    <p>This document is evidence of your insurance contract and serves as your Certificate of Motor Insurance. Please keep it in a safe place. You can manage your policy 24/7 at www.swiftpolicy.co.uk.</p>
                 </div>
              </div>
            </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const ClientDashboard: React.FC = () => {
  const { user, policies, logout } = useAuth();
  const [viewingPolicy, setViewingPolicy] = useState<Policy | null>(null);
  const [viewingOfficialCertificate, setViewingOfficialCertificate] = useState<Policy | null>(null);

  // Strictly enforce role separation
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;

  /**
   * LEGACY ACCOUNT HANDLER
   * If a profile is disabled (from an older admin-review flow), show a utility screen.
   * For all new signups, is_profile_enabled will be true.
   */
  if (user.is_profile_enabled === false) {
    return (
      <div className="min-h-screen bg-[#faf8fa] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[48px] p-12 shadow-2xl border border-gray-100 text-center animate-in zoom-in-95 duration-500">
           <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-gray-300">
              <Lock size={40} />
           </div>
           <h2 className="text-3xl font-black font-outfit uppercase tracking-tighter text-[#2d1f2d] mb-4">Profile Not Activated</h2>
           <p className="text-gray-500 font-medium leading-relaxed mb-10">
              Your secure profile section is not yet activated. Contact support or wait for administrative approval to view your policy data and personal dashboard.
           </p>
           <div className="space-y-4">
              <Link to="/contact" className="block w-full py-4 bg-[#e91e8c] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-[#c4167a] transition-all">Contact Support</Link>
              <button onClick={logout} className="block w-full py-4 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-[#e91e8c] transition-all">Sign Out</button>
           </div>
        </div>
      </div>
    );
  }

  // User-scoped data isolation - Essential for regulatory privacy
  const myPolicies = policies.filter(p => p.userId === user.id && p.status !== 'Deleted');

  const getCountdown = (expiryDate: string) => {
    const end = new Date(expiryDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} Days Left` : 'Expiring Today';
  };

  return (
    <div className="min-h-screen bg-[#faf8fa] py-12 sm:py-20 font-inter text-[#2d1f2d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Full Access Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8 mb-10 sm:mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl text-white bg-[#e91e8c]">
               <UserCheck size={24} className="sm:w-8 sm:h-8" />
            </div>
            <div>
               <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-outfit tracking-tighter leading-none mb-1 sm:mb-2">My Policy Hub</h1>
               <p className="text-gray-400 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                  Welcome back, {user.name} • <span className="text-green-500">Secure Portal Access</span>
               </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
             <Link to="/quote" className="flex-1 sm:flex-none text-center bg-[#e91e8c] hover:bg-[#c4167a] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-pink-900/20">New Quote</Link>
             <button onClick={logout} className="p-3 sm:p-4 bg-white border border-gray-100 rounded-xl sm:rounded-2xl text-gray-400 hover:text-[#e91e8c] transition-all"><RotateCcw size={18} className="sm:w-5 sm:h-5"/></button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="bg-white rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 md:p-16 border border-gray-100 shadow-2xl animate-in fade-in duration-700">
               <h2 className="text-xl sm:text-2xl font-black font-outfit uppercase tracking-tighter mb-6 sm:mb-10 flex items-center gap-3"><Shield size={20} className="sm:w-6 sm:h-6 text-[#e91e8c]"/> Active Protection</h2>
               {myPolicies.length === 0 ? (
                 <div className="py-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200"><Shield size={40}/></div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No active policies discovered in your registry.</p>
                    <Link to="/quote" className="inline-flex items-center gap-2 text-[#e91e8c] font-black uppercase tracking-widest text-[10px] hover:underline">Secure your first quote <ArrowRight size={14}/></Link>
                 </div>
               ) : (
                 <div className="space-y-6">
                    {myPolicies.map(p => {
                      const isOneMonth = p.policy_type === 'ONE_MONTH';
                      const isPaid = p.paymentStatus === 'Paid' || p.status === 'Active';
                      return (
                        <div key={p.id} className="p-5 sm:p-8 bg-gray-50 border border-gray-100 rounded-[24px] sm:rounded-[32px] hover:bg-white hover:border-[#e91e8c] transition-all group">
                           <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
                              <div className="flex items-center gap-4 sm:gap-6 w-full">
                                 <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-[#e91e8c] shadow-md transition-transform group-hover:scale-110 shrink-0">
                                   {isOneMonth ? <CalendarDays size={24} className="sm:w-8 sm:h-8" /> : <Car size={24} className="sm:w-8 sm:h-8"/>}
                                 </div>
                                 <div className="min-w-0">
                                   <div className="flex items-center gap-2 mb-1">
                                      <p className="text-xl sm:text-2xl font-black font-outfit uppercase tracking-tighter leading-none truncate">{p.details.vrm}</p>
                                      {isOneMonth && <span className="px-2 py-0.5 bg-[#e91e8c] text-white rounded text-[7px] sm:text-[8px] font-black uppercase tracking-widest">1 Month</span>}
                                   </div>
                                   <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 truncate">
                                     {p.displayId || p.id} • {p.details.make} • {isOneMonth ? '30 Days Term' : 'Annual Plan'}
                                   </p>
                                   {isPaid && p.details.cardLastFour && (
                                     <div className="space-y-0.5">
                                       <p className="text-[8px] sm:text-[9px] font-bold text-[#e91e8c]/60 uppercase tracking-widest truncate">
                                         Card ending in {p.details.cardLastFour} {p.details.cardExpiry && `• Exp: ${p.details.cardExpiry}`} • <span className="text-green-600">Payment Settled</span>
                                       </p>
                                     </div>
                                   )}
                                 </div>
                              </div>
                              <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                                 {isOneMonth && (
                                   <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm">
                                      <Clock size={10} className="sm:w-3 sm:h-3 text-[#e91e8c]" />
                                      <span className="text-[8px] sm:text-[9px] font-black uppercase text-gray-400 tracking-widest">{getCountdown(p.details.expiryDate || '')}</span>
                                   </div>
                                 )}
                                 <div className="flex items-center gap-2">
                                    <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${p.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{p.status}</span>
                                    <button onClick={() => setViewingPolicy(p)} className="p-3 sm:p-4 bg-white border border-gray-100 rounded-lg sm:rounded-xl text-gray-400 hover:text-[#e91e8c] transition-all" title="View Schedule"><Eye size={18} className="sm:w-5 sm:h-5"/></button>
                                    <button onClick={() => setViewingOfficialCertificate(p)} className="p-3 sm:p-4 bg-white border border-gray-100 rounded-lg sm:rounded-xl text-gray-400 hover:text-green-600 transition-all" title="Official Certificate"><FileCheck size={18} className="sm:w-5 sm:h-5"/></button>
                                 </div>
                              </div>
                           </div>
                        </div>
                      );
                    })}
                 </div>
               )}
            </div>

            <div className="bg-[#2d1f2d] rounded-[32px] sm:rounded-[48px] p-8 sm:p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-[#e91e8c] mb-4 sm:mb-6">Direct Claims Support</h3>
                  <p className="text-white/50 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-md">Dedicated claims assistance available 24/7. Immediate notification ensures rapid settlement.</p>
                  <Link to="/contact" className="px-8 sm:px-10 py-4 sm:py-5 bg-white text-[#2d1f2d] rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-gray-100 transition-all inline-flex items-center gap-3">Incident Report <ArrowRight size={16}/></Link>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#e91e8c]/10 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-right-4 duration-700">
             <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[24px] sm:rounded-[32px] md:rounded-[48px] border border-gray-100 shadow-xl space-y-6 sm:space-y-8">
                <h3 className="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-widest border-b border-gray-50 pb-4 flex items-center gap-3"><Clock size={14} className="sm:w-4 sm:h-4 text-[#e91e8c]"/> Profile Overview</h3>
                <div className="space-y-4 sm:space-y-6">
                   <div className="flex justify-between items-center"><span className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Code</span><span className="text-[10px] sm:text-xs font-bold font-mono">{user.client_code}</span></div>
                   <div className="flex justify-between items-center"><span className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity Gate</span><span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[8px] sm:text-[9px] font-black uppercase bg-green-50 text-green-700">Active</span></div>
                   <div className="flex justify-between items-center"><span className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Risk Tier</span><span className="text-[10px] sm:text-xs font-bold capitalize">{user.risk_factor || 'Low'}</span></div>
                </div>
             </div>

             <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[24px] sm:rounded-[32px] md:rounded-[48px] border border-gray-100 shadow-xl space-y-6 sm:space-y-8">
                <h3 className="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-widest border-b border-gray-50 pb-4 flex items-center gap-3"><Phone size={14} className="sm:w-4 sm:h-4 text-[#e91e8c]"/> UK Support Hub</h3>
                <div className="space-y-3 sm:space-y-4">
                   <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 leading-relaxed">Direct line for policy amendments and general inquiries.</p>
                   <p className="text-base sm:text-lg md:text-xl font-bold text-[#2d1f2d]">0203 137 1752</p>
                </div>
             </div>
          </div>
        </div>
      </div>
      {viewingPolicy && <PolicyDocumentModal policy={viewingPolicy} user={user} onClose={() => setViewingPolicy(null)} />}
      {viewingOfficialCertificate && <OfficialCertificateModal policy={viewingOfficialCertificate} user={user} onClose={() => setViewingOfficialCertificate(null)} />}
    </div>
  );
};

export default ClientDashboard;