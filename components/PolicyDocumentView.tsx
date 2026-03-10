import React from 'react';
import { Shield, MapPin, Mail, Phone, Car, BadgeCheck, CheckCircle2 } from 'lucide-react';
import { Policy, User } from '../types';

interface Props {
  policy: Policy;
  user: User;
  documentRef?: React.RefObject<HTMLDivElement>;
}

export const PolicyDocumentView: React.FC<Props> = ({ policy, user, documentRef }) => {
  return (
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
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 sm:mb-12 border-b-2 border-gray-100 pb-8 sm:pb-10 gap-6 sm:gap-8 policy-section">
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#e91e8c' }}><Shield style={{ color: '#ffffff' }} size={20}/></div>
              <span className="text-xl sm:text-2xl font-black font-outfit tracking-tighter" style={{ color: '#2d1f2d' }}>SwiftPolicy</span>
            </div>
            <div className="text-[9px] sm:text-[10px] font-bold space-y-1" style={{ color: '#9ca3af' }}>
               <p>Crown House, 27 Old Gloucester Street</p>
               <p>London, WC1N 3AX, United Kingdom</p>
               <p>Contact: 0203 137 1752 | info@swiftpolicy.co.uk</p>
               <p>Website: www.swiftpolicy.co.uk</p>
               <p className="font-black" style={{ color: '#e91e8c' }}>FCA Firm Reference: 481413</p>
            </div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <div className="flex flex-col items-start sm:items-end mb-4 sm:mb-6">
               <div className="flex items-center gap-2 mb-1">
                 <div className="p-1 rounded-md" style={{ backgroundColor: '#e91e8c' }}>
                   <Shield style={{ color: '#ffffff' }} size={14} />
                 </div>
                 <span className="text-base sm:text-lg font-black font-outfit tracking-tighter" style={{ color: '#2d1f2d' }}>SwiftPolicy</span>
               </div>
               <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest" style={{ color: '#e91e8c' }}>swiftpolicy.co.uk</p>
            </div>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-widest mb-1" style={{ color: '#2d1f2d' }}>CERTIFICATE OF MOTOR INSURANCE</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 policy-section">
          <div className="space-y-6">
            <div className="pl-4 sm:pl-6 py-1" style={{ borderLeft: '4px solid #e91e8c' }}>
               <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 sm:mb-4" style={{ color: '#9ca3af' }}>Policyholder Details</h3>
               <div className="space-y-2 sm:space-y-3">
                  <p className="text-base sm:text-lg font-black tracking-tight leading-none" style={{ color: '#2d1f2d' }}>
                    {user.name.toUpperCase()}
                  </p>
                  <div className="text-[10px] sm:text-xs font-bold space-y-1" style={{ color: '#6b7280' }}>
                     <div className="flex items-start gap-2">
                       <MapPin size={10} className="mt-0.5 shrink-0" style={{ color: '#6b7280' }}/> 
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
                     <p className="flex items-center gap-2"><Mail size={10} style={{ color: '#6b7280' }}/> {user.email}</p>
                     <p className="flex items-center gap-2"><Phone size={10} style={{ color: '#6b7280' }}/> {user.phone || '07XXX XXXXXX'}</p>
                  </div>
               </div>
            </div>

            <div className="pl-4 sm:pl-6 py-1" style={{ borderLeft: '4px solid #2d1f2d' }}>
               <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 sm:mb-4" style={{ color: '#9ca3af' }}>Policy Coverage</h3>
               <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid #f9fafb' }}>
                     <span className="text-[10px] sm:text-xs font-bold" style={{ color: '#9ca3af' }}>Level of Cover</span>
                     <span className="text-[10px] sm:text-xs font-black uppercase" style={{ color: '#2d1f2d' }}>{policy.details.coverLevel}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid #f9fafb' }}>
                     <span className="text-[10px] sm:text-xs font-bold" style={{ color: '#9ca3af' }}>Effective From</span>
                     <span className="text-[10px] sm:text-xs font-black" style={{ color: '#2d1f2d' }}>{new Date(policy.details.startDate || policy.createdAt).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid #f9fafb' }}>
                     <span className="text-[10px] sm:text-xs font-bold" style={{ color: '#9ca3af' }}>Expiry Date</span>
                     <span className="text-[10px] sm:text-xs font-black" style={{ color: '#2d1f2d' }}>{new Date(policy.details.expiryDate || policy.renewalDate || '').toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid #f9fafb' }}>
                     <span className="text-[10px] sm:text-xs font-bold" style={{ color: '#9ca3af' }}>Policy Excess</span>
                     <span className="text-[10px] sm:text-xs font-black" style={{ color: '#2d1f2d' }}>{policy.details.excess || '£250.00'}</span>
                  </div>
               </div>
            </div>
          </div>

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
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
