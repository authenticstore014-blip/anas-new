
import React from 'react';
import { HelpCircle, Mail, Phone, MessageSquare, AlertTriangle, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

const ComplaintsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf8fa] py-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2d1f2d] mb-6 font-outfit">Our Complaints Process</h1>
          <p className="text-gray-500 text-lg">We're committed to providing the best service, but if something goes wrong, we want to know.</p>
        </div>

        <div className="space-y-10">
          <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl">
            <h2 className="text-2xl font-bold text-[#2d1f2d] mb-8 font-outfit flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><AlertTriangle size={20} /></div>
               How to make a complaint
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
               <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3 text-[#2d1f2d] font-bold">
                    <Phone size={20} className="text-[#e91e8c]" /> Call us
                  </div>
                  <p className="text-sm text-gray-500">Speak directly to our customer relations team.</p>
                  <p className="text-lg font-bold text-[#2d1f2d]">0203 137 1752</p>
               </div>
               <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3 text-[#2d1f2d] font-bold">
                    <Mail size={20} className="text-[#e91e8c]" /> Email us
                  </div>
                  <p className="text-sm text-gray-500">Send us the details of your concern via email.</p>
                  <p className="text-lg font-bold text-[#2d1f2d]">complaints@swiftpolicy.co.uk</p>
               </div>
            </div>
            <div className="prose prose-sm text-gray-500 max-w-none">
               <p className="mb-4">Once we receive your complaint, we will:</p>
               <ul className="space-y-2 list-disc pl-4">
                 <li>Acknowledge your complaint within 5 working days.</li>
                 <li>Investigate the matter thoroughly.</li>
                 <li>Provide a final response within 8 weeks.</li>
               </ul>
            </div>
          </div>

          <div className="bg-[#2d1f2d] p-10 rounded-[40px] text-white shadow-xl flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-[#e91e8c] shrink-0">
               <Scale size={32} />
            </div>
            <div className="flex-1 text-center md:text-left">
               <h3 className="text-xl font-bold mb-2 font-outfit">Financial Ombudsman Service</h3>
               <p className="text-white/40 text-sm mb-0 leading-relaxed">
                 If you're not satisfied with our final response, you have the right to refer your complaint to the Financial Ombudsman Service within 6 months of our final decision.
               </p>
            </div>
            <a href="https://www.financial-ombudsman.org.uk" target="_blank" rel="noreferrer" className="px-8 py-3 bg-white text-[#2d1f2d] rounded-xl font-bold whitespace-nowrap hover:bg-gray-100 transition-all">Visit Website</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsPage;
