
import React, { useState, useMemo } from 'react';
import { 
  Car, Truck, Bike, Info, ArrowRight, Sparkles, 
  User as UserIcon, Calendar, Shield, Zap 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PremiumCalculator: React.FC = () => {
  const [vehicleType, setVehicleType] = useState<'car' | 'van' | 'motorcycle'>('car');
  const [age, setAge] = useState(30);
  const [ncb, setNcb] = useState(5);
  const [mileage, setMileage] = useState(8000);
  const [coverLevel, setCoverLevel] = useState<'comp' | 'tpft'>('comp');

  const estimate = useMemo(() => {
    let finalValue = 0;
    if (vehicleType === 'motorcycle') {
      // Motorcycle £600–£1,200
      finalValue = 600 + (Math.random() * 600);
    } else {
      // Car & van: £1,400 to £3,999
      if (coverLevel === 'comp') {
        // Comprehensive typically higher (£3,000–£3,999)
        finalValue = 3000 + (Math.random() * 999);
      } else {
        // Third party cover typically £1,400–£2,900
        finalValue = 1400 + (Math.random() * 1500);
      }
    }
    
    // Simple age modifier for the estimator
    if (age < 25) finalValue *= 1.5;
    if (age > 65) finalValue *= 1.2;
    
    // NCB modifier
    const ncbDisc = 1 - (Math.min(ncb, 9) * 0.05);
    finalValue *= ncbDisc;

    return Math.round(finalValue);
  }, [vehicleType, age, ncb, mileage, coverLevel]);

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#faf8fa] -skew-x-12 translate-x-1/2 z-0 hidden lg:block" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <div className="space-y-10">
            <div>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-50 text-[#e91e8c] rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                <Sparkles size={14} />
                Real-Time Risk Assessment
              </div>
              <h2 className="text-5xl md:text-7xl font-bold text-[#2d1f2d] font-outfit leading-tight tracking-tighter">
                Estimate your <br />
                <span className="text-[#e91e8c]">protection.</span>
              </h2>
              <p className="text-gray-500 text-xl leading-relaxed max-w-lg mt-8 font-medium">
                Adjust variables to see how UK risk profiling impacts your premium in real-time.
              </p>
            </div>

            <div className="bg-gray-50 p-10 rounded-[48px] border border-gray-100 space-y-6">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-white rounded-2xl text-[#e91e8c] shadow-lg">
                  <Info size={24} />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#2d1f2d]">Actuarial Accuracy</p>
                  <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                    This tool uses standard UK ABI risk models to approximate your yearly cost before full underwriting.
                  </p>
                </div>
              </div>
            </div>
            
            <Link 
              to="/quote" 
              className="inline-flex items-center gap-5 bg-[#2d1f2d] text-white px-12 py-6 rounded-3xl font-black text-lg uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-black/20 group"
            >
              Start Official Quote <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="bg-[#2d1f2d] rounded-[64px] p-8 md:p-16 shadow-[0_60px_120px_-30px_rgba(45,31,45,0.4)] text-white relative">
            <div className="space-y-12">
              
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e91e8c]">01. Vehicle Category</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'car', icon: <Car size={24} />, label: 'Car' },
                    { id: 'van', icon: <Truck size={24} />, label: 'Van' },
                    { id: 'motorcycle', icon: <Bike size={24} />, label: 'Bike' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setVehicleType(type.id as any)}
                      className={`flex flex-col items-center gap-3 p-6 rounded-[32px] border-2 transition-all duration-500 ${
                        vehicleType === type.id 
                        ? 'bg-white text-[#2d1f2d] border-white scale-105 shadow-xl' 
                        : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                      }`}
                    >
                      {type.icon}
                      <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-5">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                        <UserIcon size={12} /> Driver Age
                      </label>
                      <span className="text-2xl font-bold font-outfit">{age}<span className="text-white/30 text-xs ml-1">y</span></span>
                    </div>
                    <input 
                      type="range" min="17" max="80" value={age} 
                      onChange={(e) => setAge(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#e91e8c]"
                    />
                  </div>
                  
                  <div className="space-y-5">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                        <Calendar size={12} /> NCB Record
                      </label>
                      <span className="text-2xl font-bold font-outfit">{ncb}<span className="text-white/30 text-xs ml-1">y</span></span>
                    </div>
                    <input 
                      type="range" min="0" max="15" value={ncb} 
                      onChange={(e) => setNcb(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#e91e8c]"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-5">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                        <Zap size={12} /> Annual Miles
                      </label>
                      <span className="text-2xl font-bold font-outfit">{(mileage/1000).toFixed(0)}k<span className="text-white/30 text-xs ml-1">mi</span></span>
                    </div>
                    <input 
                      type="range" min="1000" max="30000" step="1000" value={mileage} 
                      onChange={(e) => setMileage(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#e91e8c]"
                    />
                  </div>

                  <div className="space-y-5">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                      <Shield size={12} /> Cover Level
                    </label>
                    <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/5">
                      <button 
                        onClick={() => setCoverLevel('comp')}
                        className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${coverLevel === 'comp' ? 'bg-[#e91e8c] text-white shadow-lg' : 'text-white/30 hover:text-white/50'}`}
                      >
                        Comprehensive
                      </button>
                      <button 
                        onClick={() => setCoverLevel('tpft')}
                        className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${coverLevel === 'tpft' ? 'bg-[#e91e8c] text-white shadow-lg' : 'text-white/30 hover:text-white/50'}`}
                      >
                        T.P.F.T
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-12 border-t border-white/10 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 mb-4">Estimated Premium</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-white/20 font-outfit">£</span>
                  <span className="text-8xl font-black font-outfit tracking-tighter tabular-nums leading-none">{estimate}</span>
                </div>
                <div className="inline-block mt-8 px-6 py-2 rounded-full border border-[#e91e8c]/30 text-[#e91e8c] text-[10px] font-black uppercase tracking-widest animate-pulse">
                  Indicative Rate • Fixed for 30 Days
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PremiumCalculator;
