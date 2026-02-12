
import React, { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Zap, ShieldCheck, Heart, Clock, Star, Truck, Check, Car, 
  Monitor, Headphones, Award, Database, Search, 
  ShieldAlert, Fingerprint, Activity, MousePointer2, Sparkles, Shield,
  Bike, Settings, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FindOutMore from '../components/FindOutMore';
import PremiumCalculator from '../components/PremiumCalculator';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=2000", // Motorcycle
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000", // Porsche
  "https://images.unsplash.com/photo-1542362567-b05500282774?auto=format&fit=crop&q=80&w=2000", // Audi
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=2000", // Ferrari
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=2000"  // Mustang
];

const HeroSlide = memo(({ src, active }: { src: string, active: boolean }) => (
  <div className="relative h-full w-full flex-shrink-0">
    <img 
      src={src} 
      alt="Hero" 
      loading={active ? "eager" : "lazy"}
      className="w-full h-full object-cover will-change-transform" 
    />
  </div>
));

const HomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = prev + slideDirection;
        if (next >= HERO_IMAGES.length) {
          setSlideDirection(-1);
          return prev - 1;
        }
        if (next < 0) {
          setSlideDirection(1);
          return prev + 1;
        }
        return next;
      });
    }, 8000); // Increased interval for better performance feel
    return () => clearInterval(slideInterval);
  }, [slideDirection]);

  return (
    <div className="relative min-h-screen bg-[#faf8fa]">
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden text-white min-h-[95vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <div 
            className="flex h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform"
            style={{ 
              width: `${HERO_IMAGES.length * 100}%`,
              transform: `translateX(-${(currentSlide * 100) / HERO_IMAGES.length}%)` 
            }}
          >
            {HERO_IMAGES.map((src, index) => (
              <HeroSlide key={src} src={src} active={currentSlide === index} />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#2d1f2d]/95 via-[#2d1f2d]/80 to-[#faf8fa] z-10" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-30 py-20">
          <div className="text-center max-w-4xl mx-auto mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-6 py-2.5 text-xs font-black uppercase tracking-[0.2em]">
              <Sparkles className="h-4 w-4 text-[#e91e8c]" />
              Secure, Transparent Insurance at Your Fingertips
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 font-outfit leading-[1.1]">
              Instant Cover. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e91e8c] to-[#ff6eb5]">Zero Drama.</span>
            </h1>
            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Get protected in 60 seconds with our award-winning, FCA-regulated platform. No paperwork, just protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            {[
              { id: 'car', label: 'Car Insurance', icon: <Car size={32} />, color: 'bg-pink-500' },
              { id: 'van', label: 'Van Insurance', icon: <Truck size={32} />, color: 'bg-blue-500' },
              { id: 'motorcycle', label: 'Motorcycle Insurance', icon: <Bike size={32} />, color: 'bg-indigo-500' }
            ].map((item) => (
              <Link
                key={item.id}
                to="/quote"
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 transition-all duration-500 hover:bg-white/10 hover:border-[#e91e8c]/50 hover:-translate-y-4 hover:shadow-[0_40px_80px_-15px_rgba(233,30,140,0.3)] overflow-hidden"
              >
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className={`w-20 h-20 rounded-[28px] ${item.color}/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500`}>
                    {item.icon}
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold font-outfit mb-1">{item.label}</h3>
                    <p className="text-white/40 text-xs font-black uppercase tracking-widest">Start Instant Quote</p>
                  </div>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
                    <div className="bg-[#e91e8c] text-white px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      Go <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
                <div className={`absolute -bottom-12 -right-12 w-32 h-32 ${item.color} opacity-0 group-hover:opacity-20 rounded-full blur-3xl transition-opacity duration-500`} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Ticker */}
      <div className="bg-white border-b border-gray-100 py-6 overflow-hidden">
        <div className="flex whitespace-nowrap animate-ticker will-change-transform">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-12 px-6">
              <div className="flex items-center gap-3 text-[#2d1f2d]/40 font-black text-xs uppercase tracking-[0.2em]">
                <Shield className="h-4 w-4 text-green-500" />
                Live MID Status: Operational
              </div>
              <div className="w-1 h-1 bg-gray-200 rounded-full" />
              <div className="flex items-center gap-3 text-[#2d1f2d]/40 font-black text-xs uppercase tracking-[0.2em]">
                <Activity className="h-4 w-4 text-[#e91e8c]" />
                Last Quote: 4s ago
              </div>
              <div className="w-1 h-1 bg-gray-200 rounded-full" />
              <div className="flex items-center gap-3 text-[#2d1f2d]/40 font-black text-xs uppercase tracking-[0.2em]">
                <Award className="h-4 w-4 text-yellow-500" />
                5-Star Trustpilot Rated
              </div>
              <div className="w-1 h-1 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Steps Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-bold text-[#2d1f2d] mb-6 font-outfit">Cover in 3 Easy Steps</h2>
            <p className="text-gray-400 text-xl font-medium">Why wait days for a callback? We've automated the boring stuff.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-pink-50 via-pink-100 to-pink-50 -translate-y-1/2 hidden md:block z-0" />
            {[
              { step: "01", title: "Tell us about you", desc: "Enter your reg or address. Our engine handles the rest using real-time data.", icon: <Fingerprint size={32} /> },
              { step: "02", title: "Choose your cover", desc: "Pick the level of protection that fits your lifestyle and budget.", icon: <MousePointer2 size={32} /> },
              { step: "03", title: "Drive away covered", desc: "Instant MID update and digital certificate sent straight to your inbox.", icon: <Zap size={32} /> }
            ].map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-white border-4 border-white rounded-[32px] shadow-2xl flex items-center justify-center text-[#e91e8c] mb-10 group-hover:scale-110 transition-transform duration-500 relative">
                   <div className="absolute -top-4 -right-4 bg-[#2d1f2d] text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs font-outfit">{s.step}</div>
                   {s.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#2d1f2d] mb-4 font-outfit">{s.title}</h3>
                <p className="text-gray-500 leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PremiumCalculator />

      <section id="policies" className="py-32 bg-[#faf8fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-[#2d1f2d] mb-6 font-outfit">Specific Protection</h2>
          <p className="text-gray-400 text-xl font-medium">Every policy is backed by our UK-wide repair network.</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { title: "Car Insurance", icon: <Car />, desc: "Award-winning car insurance with a lifetime repair guarantee and roadside assist." },
            { title: "Motorcycle Insurance", icon: <Bike />, desc: "Specialist cover for riders. Includes protective gear cover and agreed value options for classic bikes." },
            { title: "Van Insurance", icon: <Truck />, desc: "Keep your business moving with dedicated van cover including tools protection." }
          ].map((p, i) => (
            <div key={i} className="p-12 rounded-[48px] border border-gray-100 bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 group hover:-translate-y-3">
              <div className="w-20 h-20 rounded-[28px] bg-[#e91e8c]/10 flex items-center justify-center text-[#e91e8c] mb-10 group-hover:bg-[#e91e8c] group-hover:text-white transition-all duration-300 shadow-xl shadow-pink-900/5">
                {React.cloneElement(p.icon as React.ReactElement<any>, { size: 36 })}
              </div>
              <h3 className="text-3xl font-bold text-[#2d1f2d] mb-4 font-outfit">{p.title}</h3>
              <p className="text-gray-500 mb-12 text-lg leading-relaxed">{p.desc}</p>
              <Link to="/quote" className="inline-flex items-center gap-3 font-black text-sm uppercase tracking-widest text-[#e91e8c] hover:text-[#c4167a]">
                Get a quote <ArrowRight size={20} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <FindOutMore />

      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-[#e91e8c] to-[#ff4da6] rounded-[64px] p-12 md:p-24 text-white text-center relative overflow-hidden shadow-2xl shadow-pink-900/30">
            <div className="relative z-10">
              <h2 className="text-5xl md:text-7xl font-bold mb-8 font-outfit">Ready to save?</h2>
              <p className="text-white/80 text-2xl mb-12 max-w-2xl mx-auto font-medium">Average savings of £214 per year when switching to SwiftPolicy.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link to="/quote" className="px-12 py-6 bg-[#2d1f2d] text-white rounded-[32px] font-black uppercase tracking-widest text-lg hover:bg-black transition-all shadow-xl shadow-black/20">Secure Your Quote</Link>
                <Link to="/auth" className="px-12 py-6 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-[32px] font-black uppercase tracking-widest text-lg hover:bg-white/20 transition-all">Sign Up First</Link>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/10 rounded-full animate-ping opacity-20 pointer-events-none" />
          </div>
        </div>
      </section>

      <div className="py-16 flex justify-center border-t border-gray-100 bg-[#faf8fa]">
        <Link 
          to={user?.role === 'admin' ? "/customers" : "/auth"} 
          className="group flex items-center gap-2 px-6 py-2.5 bg-gray-100/50 border border-gray-200/50 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white hover:bg-[#e91e8c] hover:border-[#e91e8c] hover:shadow-xl hover:shadow-pink-900/10 transition-all duration-300 active:scale-95"
          aria-label="System Administration"
        >
           <Lock size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
           {user?.role === 'admin' ? "Open Admin Console" : "Administrator Portal"}
        </Link>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-ticker { 
          animation: ticker 50s linear infinite; 
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
