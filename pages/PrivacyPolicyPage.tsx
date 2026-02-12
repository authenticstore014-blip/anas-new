
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Shield, CheckCircle, Send, FileText } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf8fa]">
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-[#e91e8c] font-bold mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white rounded-[40px] p-8 md:p-14 border border-gray-100 shadow-xl">
              <h1 className="text-4xl font-bold text-[#2d1f2d] mb-4 font-outfit">Privacy Policy</h1>
              <div className="flex items-center gap-2 text-gray-400 mb-10 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Last updated: January 2025
              </div>

              <div className="space-y-8 text-gray-500 leading-relaxed">
                <section>
                  <h2 className="text-xl font-bold text-[#2d1f2d] mb-3 font-outfit">1. Introduction</h2>
                  <p>SwiftPolicy Insurance Services (a subsidiary of AUTOLINE DIRECT INSURANCE CONSULTANTS LIMITED) is committed to protecting your privacy. This policy explains how we collect and use your personal information in compliance with the UK GDPR.</p>
                </section>
                <section>
                  <h2 className="text-xl font-bold text-[#2d1f2d] mb-3 font-outfit">2. Data Sharing</h2>
                  <p>We share information with underwriters, regulatory bodies, and our parent group where necessary to provide our services. We never sell your personal data to third-party marketers.</p>
                </section>
                <section>
                  <h2 className="text-xl font-bold text-[#2d1f2d] mb-3 font-outfit">3. Contact Us</h2>
                  <div className="p-6 bg-gray-50 rounded-2xl space-y-1 italic text-sm">
                    <p className="font-bold not-italic">Data Protection Officer</p>
                    <p>Crown House, 27 Old Gloucester Street, London WC1N 3AX, UK</p>
                    <p>Email: info@swiftpolicy.co.uk</p>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#2d1f2d] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <FileText className="text-[#e91e8c] mb-4" size={32} />
                 <h2 className="text-xl font-bold mb-4 font-outfit">Exercise Your Rights</h2>
                 <p className="text-white/50 text-sm mb-8">Request access, correction or deletion of your personal data held by us via info@swiftpolicy.co.uk.</p>
                 
                 {submitted ? (
                   <div className="bg-green-500/20 border border-green-500/30 p-6 rounded-2xl text-center">
                      <CheckCircle className="mx-auto mb-2 text-green-400" />
                      <p className="font-bold">Request Sent</p>
                      <p className="text-xs opacity-60">Delivered to our domain admin.</p>
                   </div>
                 ) : (
                   <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                     <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#e91e8c] outline-none" placeholder="Full Name" />
                     <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#e91e8c] outline-none" placeholder="Email Address" />
                     <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#e91e8c] outline-none">
                        <option value="access">Access Request</option>
                        <option value="erasure">Erasure Request</option>
                        <option value="correction">Correction Request</option>
                     </select>
                     <button className="w-full bg-[#e91e8c] py-4 rounded-xl font-bold hover:bg-[#c4167a] transition-all flex items-center justify-center gap-2">
                       Submit to Info@ <Send size={16} />
                     </button>
                   </form>
                 )}
               </div>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#e91e8c]/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
