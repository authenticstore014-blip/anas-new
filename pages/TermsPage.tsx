
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Shield, ArrowRight, Award, CheckCircle } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf8fa]">
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-[#e91e8c] font-bold mb-10 group transition-all">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1" />
          Back to home
        </Link>

        <div className="bg-white rounded-[48px] p-10 md:p-20 border border-gray-100 shadow-2xl shadow-pink-900/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 text-[#e91e8c] mb-4">
                <Award className="h-8 w-8" />
                <span className="font-black uppercase tracking-[0.3em] text-xs">Regulated Firm</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-[#2d1f2d] font-outfit">Terms & Conditions</h1>
              <div className="flex items-center gap-2 text-gray-400 mt-4 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Version 4.2 • Last updated: Jan 2025
              </div>
            </div>
            <div className="bg-[#2d1f2d] p-6 rounded-[24px] text-white flex items-center gap-4 border border-white/10">
               <div className="w-12 h-12 bg-[#e91e8c]/20 rounded-xl flex items-center justify-center text-[#e91e8c]">
                  <Shield size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">FCA Reference</p>
                  <p className="text-lg font-bold font-mono">FRN: 481413</p>
               </div>
            </div>
          </div>

          <div className="space-y-16 text-gray-500 leading-relaxed text-lg">
            <section>
              <h2 className="text-3xl font-bold text-[#2d1f2d] mb-6 font-outfit">1. Regulatory Status</h2>
              <p className="mb-4">SwiftPolicy Insurance Services is a child company of AUTOLINE DIRECT INSURANCE CONSULTANTS LIMITED. We are authorised by the Prudential Regulation Authority (PRA) and regulated by the Financial Conduct Authority (FCA) and the Prudential Regulation Authority.</p>
              <p>Our registration details can be verified on the Financial Services Register by visiting <a href="https://register.fca.org.uk/" className="text-[#e91e8c] font-bold underline">register.fca.org.uk</a> or by contacting the FCA on 0800 111 6768.</p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-[#2d1f2d] mb-6 font-outfit">2. Your Duty of Disclosure</h2>
              <p>You must answer all questions honestly and to the best of your knowledge. Failure to provide accurate information may result in your policy being cancelled, your premium being adjusted, or a claim being refused.</p>
            </section>

            <section className="bg-pink-50/50 p-10 rounded-[40px] border border-pink-100">
               <h3 className="text-2xl font-bold text-[#2d1f2d] mb-8 font-outfit flex items-center gap-3">
                 <CheckCircle className="text-green-500" />
                 Your Financial Protection
               </h3>
               <div className="space-y-6">
                 <p>We are covered by the Financial Services Compensation Scheme (FSCS). You may be entitled to compensation from the scheme if we cannot meet our obligations.</p>
                 <ul className="space-y-4 text-base font-medium">
                   <li className="flex gap-4"><div className="w-6 h-6 rounded-full bg-white text-[#e91e8c] flex items-center justify-center shrink-0 shadow-sm font-black text-xs">1</div> 100% Protection for compulsory insurance (e.g., Third Party Motor)</li>
                   <li className="flex gap-4"><div className="w-6 h-6 rounded-full bg-white text-[#e91e8c] flex items-center justify-center shrink-0 shadow-sm font-black text-xs">2</div> 90% Protection for other types of insurance claims</li>
                 </ul>
               </div>
            </section>

            <section className="pt-12 border-t border-gray-100">
              <h2 className="text-3xl font-bold text-[#2d1f2d] mb-8 font-outfit">Contact & Registration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-10 bg-[#2d1f2d] text-white rounded-[40px] shadow-xl">
                  <h3 className="text-[#e91e8c] font-black mb-6 uppercase tracking-widest text-xs">Primary Contact</h3>
                  <div className="space-y-4">
                    <p className="text-2xl font-bold">0203 137 1752</p>
                    <p className="font-medium opacity-60">info@swiftpolicy.co.uk</p>
                  </div>
                </div>
                <div className="p-10 bg-gray-50 border border-gray-100 rounded-[40px]">
                  <h3 className="text-gray-400 font-black mb-6 uppercase tracking-widest text-xs">UK Headquarters</h3>
                  <p className="text-xl leading-relaxed text-[#2d1f2d] font-bold">
                    Crown House,<br />
                    27 Old Gloucester Street,<br />
                    London WC1N 3AX, UK
                  </p>
                  <p className="text-xs text-gray-400 mt-4 font-bold">Registered in England No NI020828</p>
                  <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-2">A subsidiary of Autoline Direct Insurance Consultants Ltd</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
