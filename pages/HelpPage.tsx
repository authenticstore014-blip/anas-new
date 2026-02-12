
import React, { useState } from 'react';
import { 
  Search, HelpCircle, MessageCircle, FileText, 
  ChevronDown, ChevronUp, LifeBuoy, AlertCircle, Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    { q: "How do I make a claim?", a: "You can make a claim 24/7 through your customer center or by calling our claims line at 0203 137 1752. We recommend having your policy number ready." },
    { q: "Can I pay monthly?", a: "Yes, we offer monthly installment plans. Note that choosing to pay monthly may include a small credit charge." },
    { q: "How do I change my vehicle details?", a: "Log in to your customer center, select your active policy, and click 'Make a Change'. You can update your vehicle, address, or drivers instantly." },
    { q: "What is your cooling-off period?", a: "We offer a 14-day cooling-off period from the date your policy starts or the date you receive your documents, whichever is later." }
  ];

  return (
    <div className="min-h-screen bg-[#faf8fa]">
      <section className="bg-[#2d1f2d] py-24 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 font-outfit">Help Center</h1>
          <div className="max-w-2xl mx-auto relative">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
             <input 
               className="w-full bg-white border-0 rounded-2xl px-16 py-5 text-gray-900 text-lg shadow-2xl focus:ring-2 focus:ring-[#e91e8c] outline-none" 
               placeholder="How can we help you today?" 
             />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e91e8c]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Manage Policy", icon: <FileText />, desc: "Update details, add drivers or renew.", link: "/customers" },
            { title: "Make a Claim", icon: <AlertCircle />, desc: "Step-by-step guide to reporting a loss.", link: "/contact" },
            { title: "Contact Support", icon: <MessageCircle />, desc: "Talk to our friendly UK-based agents.", link: "/contact" }
          ].map((item, i) => (
            <Link key={i} to={item.link} className="p-10 bg-white border border-gray-100 rounded-[32px] shadow-sm hover:shadow-xl transition-all group">
               <div className="w-14 h-14 rounded-2xl bg-[#e91e8c]/5 flex items-center justify-center text-[#e91e8c] mb-6 group-hover:bg-[#e91e8c] group-hover:text-white transition-colors">
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 28 })}
               </div>
               <h3 className="text-xl font-bold text-[#2d1f2d] mb-2 font-outfit">{item.title}</h3>
               <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#2d1f2d] mb-12 font-outfit text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-[#2d1f2d]">{faq.q}</span>
                  {activeFaq === i ? <ChevronUp size={20} className="text-[#e91e8c]" /> : <ChevronDown size={20} className="text-gray-300" />}
                </button>
                {activeFaq === i && (
                  <div className="p-6 pt-0 text-gray-500 text-sm leading-relaxed animate-in slide-in-from-top-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
           <div className="bg-[#2d1f2d] rounded-[40px] p-10 md:p-16 text-white text-center shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-6 font-outfit">Still need assistance?</h2>
                <p className="text-white/40 mb-10 max-w-xl mx-auto">If you couldn't find what you were looking for, our team is available by phone or email at info@swiftpolicy.co.uk.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <a href="tel:02031371752" className="px-10 py-5 bg-[#e91e8c] rounded-2xl font-bold hover:bg-[#c4167a] transition-all flex items-center justify-center gap-3">
                    <Phone size={20} /> 0203 137 1752
                  </a>
                  <a href="mailto:info@swiftpolicy.co.uk" className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    Email Support
                  </a>
                </div>
              </div>
              <LifeBuoy className="absolute -bottom-20 -right-20 w-80 h-80 text-white/5" />
           </div>
        </div>
      </section>
    </div>
  );
};

export default HelpPage;
