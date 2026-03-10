import React from 'react';
import { PolicyProjection } from './types';
import { Shield, MapPin, CheckCircle2 } from 'lucide-react';

export const OfficialCertificateTemplate: React.FC<{ projection: PolicyProjection }> = ({ projection }) => {
  return (
    <div id="official-certificate-view" className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white p-12 pb-24 text-[#2d1f2d] font-sans relative border border-gray-200">
      <style dangerouslySetInnerHTML={{ __html: `
        #official-certificate-view * {
          --tw-text-opacity: 1 !important;
          --tw-bg-opacity: 1 !important;
          --tw-border-opacity: 1 !important;
        }
        .text-gray-400 { color: #9ca3af !important; }
        .text-gray-500 { color: #6b7280 !important; }
        .text-gray-600 { color: #4b5563 !important; }
        .text-gray-700 { color: #374151 !important; }
        .bg-gray-50 { background-color: #f9fafb !important; }
        .border-gray-100 { border-color: #f3f4f6 !important; }
        .border-gray-200 { border-color: #e5e7eb !important; }
        .border-gray-800 { border-color: #1f2937 !important; }
      `}} />
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#e91e8c] p-1.5 rounded-lg">
            <Shield className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black font-outfit tracking-tighter">SwiftPolicy</span>
        </div>
        <div className="text-right">
          <div className="flex flex-col items-end mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-[#e91e8c] p-1 rounded-md">
                <Shield className="text-white" size={16} />
              </div>
              <span className="text-lg font-black font-outfit tracking-tighter">SwiftPolicy</span>
            </div>
            <p className="text-[10px] font-black text-[#e91e8c] uppercase tracking-widest">swiftpolicy.co.uk</p>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date of issue: {projection.issue_date}</p>
        </div>
      </div>

      <h1 className="text-3xl font-black text-center mb-8 uppercase tracking-tight border-b-2 border-gray-100 pb-4">Certificate of Motor Insurance</h1>

      <div className="grid grid-cols-[1fr_2fr] border-2 border-gray-800">
        {/* Certificate Number */}
        <div className="border-b border-r border-gray-800 p-3 font-bold text-xs uppercase bg-gray-50">Certificate number:</div>
        <div className="border-b border-gray-800 p-3 font-black text-sm flex justify-between items-center">
          <span>{projection.certificate_number}</span>
          <span className="text-gray-400 font-mono">CW113</span>
        </div>

        {/* 1. Registration mark of vehicle */}
        <div className="border-b border-r border-gray-800 p-3 font-bold text-xs uppercase bg-gray-50">1. Registration mark of vehicle:</div>
        <div className="border-b border-gray-800 p-3 text-xs space-y-2">
          {projection.insured_objects.map((obj, i) => (
            <p key={i} className="font-black text-sm">{String.fromCharCode(97 + i)}) {obj.registration} — {obj.make} {obj.model}</p>
          ))}
          <p className="text-[10px] leading-tight text-gray-600 italic">
            b) Any motor car supplied to the policyholder under the courtesy car option (Section J) of this policy or any motor car supplied to the policyholder under an agreement between the insurers and a recommended repairer while the car described above is being repaired by that repairer as a direct result of damage covered by this policy.
          </p>
        </div>

        {/* 2. Name of policyholder */}
        <div className="border-b border-r border-gray-800 p-3 font-bold text-xs uppercase bg-gray-50">2. Name of policyholder:</div>
        <div className="border-b border-gray-800 p-3 font-black text-sm uppercase">{projection.policyholder.name}</div>

        {/* 3. Effective date */}
        <div className="border-b border-r border-gray-800 p-3 font-bold text-xs uppercase bg-gray-50">
          3. Effective date of the commencement of insurance for the purposes of the relevant law:
        </div>
        <div className="border-b border-gray-800 p-3 font-black text-sm">{projection.effective_date}</div>

        {/* 4. Date of expiry */}
        <div className="border-b border-r border-gray-800 p-3 font-bold text-xs uppercase bg-gray-50">4. Date of expiry of insurance:</div>
        <div className="border-b border-gray-800 p-3 font-black text-sm">{projection.expiry_date}</div>

        {/* 5. Persons entitled to drive */}
        <div className="border-b border-r border-gray-800 p-3 font-bold text-xs uppercase bg-gray-50">5. Persons or classes of persons entitled to drive:</div>
        <div className="border-b border-gray-800 p-3 text-xs space-y-3">
          <p className="font-black text-sm uppercase">{projection.persons_entitled_to_drive.join(', ')}</p>
          <div className="space-y-1 text-[10px] leading-tight text-gray-700">
            {projection.driver_eligibility_rules.map((rule, i) => (
              <p key={i}>{rule}</p>
            ))}
          </div>
        </div>

        {/* 6. Limitations as to use */}
        <div className="border-r border-gray-800 p-3 font-bold text-xs uppercase bg-gray-50">6. Limitations as to use:</div>
        <div className="p-3 text-[10px] leading-tight text-gray-700 space-y-2">
          {projection.use_limitations.map((rule, i) => (
            <p key={i}>{String.fromCharCode(97 + i)}) {rule}</p>
          ))}
          <div className="pt-2 space-y-1">
            {projection.exclusions.map((rule, i) => (
              <p key={i}>{String.fromCharCode(99 + i)}) {rule}</p>
            ))}
          </div>
        </div>
      </div>

      {/* CERTIFICATION */}
      <div className="mt-8 text-[10px] leading-relaxed text-gray-700">
        <p>{projection.certification_language}</p>
      </div>

      {/* SIGNATURE */}
      <div className="mt-12 flex justify-end">
        <div className="text-right">
          <div className="mb-2 italic font-serif text-3xl text-[#2d1f2d] opacity-80" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Ben Kedby</div>
          <p className="text-xs font-black uppercase tracking-tight">{projection.insurer_identity.ceo_name}</p>
          <p className="text-[10px] text-gray-500 font-bold">{projection.insurer_identity.ceo_title}</p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-16 pt-8 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-2">Important Notes</h4>
            <ul className="text-[8px] text-gray-500 space-y-1 list-disc pl-4">
              <li>This certificate gives evidence of insurance cover to comply with the law. For full details of the cover, reference should also be made to the policy wording and schedule.</li>
              <li>Unless stated otherwise in paragraph 5 above this policy does not cover the policyholder to drive any car other than those listed in paragraphs 1a and 1b.</li>
              <li>This certificate of motor insurance takes the place of an International Motor Insurance Card (green card).</li>
              <li>Advice to third parties: Nothing in this certificate affects your right as a third party to make a claim.</li>
            </ul>
          </div>
          <div className="text-[8px] text-gray-400 leading-tight">
            <p className="mb-2">SwiftPolicy Insurance Services is child company of AUTOLINE DIRECT INSURANCE CONSULTANTS LIMITED, authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority. Firm Reference Number: 481413.</p>
            <p className="mb-2">Registered in England No NI020828. Registered Office: Crown House, 27 Old Gloucester Street, London WC1N 3AX, UK. Telephone: 0203 137 1752.</p>
            <p>Registered address: {projection.insurer_identity.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
