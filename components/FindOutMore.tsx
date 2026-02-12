
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, ShieldCheck, Headphones, Database, 
  Activity, Fingerprint, Search, ShieldAlert, ArrowRight, CheckCircle2
} from 'lucide-react';

type TabType = 'speed' | 'security' | 'support';

const FindOutMore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('speed');

  const content = {
    speed: {
      title: "Data-Driven Speed",
      subtitle: "The fastest quote-to-cover pipeline in the UK.",
      description: "Our proprietary underwriting engine uses over 50+ real-time data points to calculate your risk in seconds, not hours.",
      features: [
        { icon: <Zap size={20} />, text: "60-second quote process" },
        { icon: <Database size={20} />, text: "Instant MID (Motor Insurance Database) updates" },
        { icon: <Activity size={20} />, text: "Real-time pricing adjustments based on fair data" }
      ],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000",
      cta: "Get Started",
      link: "/quote"
    },
    security: {
      title: "Regulated Strength",
      subtitle: "Protection you can put your faith in.",
      description: "As a fully regulated firm (FRN: 481413), we adhere to the highest standards of the Prudential Regulation Authority and the Financial Conduct Authority.",
      features: [
        { icon: <ShieldCheck size={20} />, text: "FSCS protected policies" },
        { icon: <Fingerprint size={20} />, text: "Bank-grade data encryption" },
        { icon: <ShieldAlert size={20} />, text: "Full compliance auditing" }
      ],
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000",
      cta: "View Our Status",
      link: "/terms"
    },
    support: {
      title: "Seamless Support",
      subtitle: "Human experts when life happens.",
      description: "Our London-based team isn't just a call center; we're a dedicated group of insurance professionals available 24/7.",
      features: [
        { icon: <Headphones size={20} />, text: "24/7 UK-based claims assistance" },
        { icon: <Search size={20} />, text: "Transparent claims tracking" },
        { icon: <CheckCircle2 size={20} />, text: "Direct access to specialists" }
      ],
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1000",
      cta: "Contact Us",
      link: "/contact"
    }
  };

  const current = content[activeTab];

  return (
    <section className="py-32 bg-[#faf8fa] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-[#2d1f2d] mb-6 font-outfit">Dive Deeper</h2>
          <p className="text-gray-400 text-xl font-medium max-w-2xl mx-auto">
            SwiftPolicy is built on three core pillars of modern insurance excellence.
          </p>
        </div>

        {/* Interactive Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {(Object.keys(content) as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'bg-[#e91e8c] text-white shadow-2xl shadow-pink-900/20 scale-105' 
                : 'bg-white text-gray-400 border border-gray-100 hover:border-[#e91e8c] hover:text-[#e91e8c]'
              }`}
            >
              {content[tab].title.split(' ')[1]}
            </button>
          ))}
        </div>

        {/* Content Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center bg-white rounded-[64px] p-8 md:p-20 border border-gray-100 shadow-2xl shadow-pink-900/5 min-h-[600px] animate-in fade-in zoom-in-95 duration-500">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 text-[#e91e8c] font-black uppercase tracking-[0.3em] text-xs">
              <Zap size={14} />
              Core Pillar 0{activeTab === 'speed' ? '1' : activeTab === 'security' ? '2' : '3'}
            </div>
            <h3 className="text-5xl font-bold text-[#2d1f2d] font-outfit leading-tight">
              {current.title}<br />
              <span className="text-gray-300">{current.subtitle}</span>
            </h3>
            <p className="text-gray-500 text-xl leading-relaxed">
              {current.description}
            </p>
            
            <div className="space-y-4 pt-4">
              {current.features.map((f, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-[#e91e8c] shrink-0">{f.icon}</div>
                  <span className="font-bold text-[#2d1f2d]">{f.text}</span>
                </div>
              ))}
            </div>

            <Link 
              to={current.link}
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#2d1f2d] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl shadow-black/10 group"
            >
              {current.cta}
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="relative group">
            <div className="aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl relative">
              <img 
                src={current.image} 
                alt={current.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2d1f2d]/40 to-transparent" />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[32px] shadow-2xl border border-gray-100 hidden md:block animate-bounce-slow">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                    <CheckCircle2 size={24} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Status</p>
                    <p className="text-lg font-bold text-[#2d1f2d]">Operational</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default FindOutMore;
