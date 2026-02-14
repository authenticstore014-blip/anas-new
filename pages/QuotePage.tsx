import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Car, ShieldCheck, ArrowRight, Loader2,
  AlertCircle, Bike, Search, CheckCircle,
  Truck, Shield, User as UserIcon, CreditCard,
  Info, Clock, Fingerprint, Activity, Database, Zap
} from 'lucide-react';
import { QuoteData } from '../types';

const INITIAL_STATE: QuoteData = {
  vrm: '', 
  insurance_type: '',
  duration: '12 Months',
  make: '', model: '', year: '', fuelType: 'Petrol', transmission: 'Manual', bodyType: 'Saloon', engineSize: '', seats: '5',
  isImported: false, annualMileage: '8000', usageType: 'Social, Domestic & Pleasure', ownership: 'Owned',
  isModified: false, modifications: '', securityFeatures: [], overnightParking: 'Driveway',
  title: 'Mr', firstName: '', lastName: '', dob: '', gender: 'Male', maritalStatus: 'Married', ukResident: true,
  yearsInUk: 'Born in UK', occupation: '', employmentStatus: 'Employed', industry: '',
  licenceType: 'Full UK', licenceHeldYears: '5+', licenceDate: '', 
  licenceNumber: '',
  hasMedicalConditions: false,
  mainDriverHistory: { hasConvictions: false, convictions: [], hasClaims: false, claims: [] },
  ncbYears: '5', isCurrentlyInsured: true, hasPreviousCancellations: false,
  additionalDrivers: [],
  postcode: '', addressLine1: '', city: '', yearsAtAddress: '5+', homeOwnership: 'Owner',
  coverLevel: 'Comprehensive', policyStartDate: new Date().toISOString().split('T')[0], voluntaryExcess: '£250',
  addons: { breakdown: false, legal: false, courtesyCar: false, windscreen: false, protectedNcb: false },
  paymentFrequency: 'monthly', payerType: 'individual',
  email: '', phone: '', contactTime: 'Anytime', marketingConsent: false, dataProcessingConsent: false,
  isAccurate: false, termsAccepted: false,
  vin: '', color: ''
};

const QuotePage: React.FC = () => {
  const { user, signup, bindPolicyManual, lookupVehicle } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuoteData>(INITIAL_STATE);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupSource, setLookupSource] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [vehicleType, setVehicleType] = useState<'car' | 'van' | 'motorcycle'>('car');
  const [vehicleValue, setVehicleValue] = useState('5000');

  const handleLookup = async () => {
    if (!formData.vrm) return;
    setIsLookingUp(true);
    setLookupError(null);
    setLookupSource(null);

    const result = await lookupVehicle(formData.vrm);
    if (result.success && result.data) {
      const data = result.data;
      setFormData(prev => ({ 
        ...prev, 
        make: data.make, 
        model: data.model, 
        year: data.year?.toString() || '',
        fuelType: data.fuelType || 'Petrol',
        engineSize: data.engineSize || 'N/A',
        vin: data.vin || '',
        color: data.color || '',
        vrm: formData.vrm.toUpperCase()
      }));
      setLookupSource(result.source || 'Official Registry');
    } else {
      setLookupError(result.error || "Vehicle not found. Please enter details manually.");
      setIsManualEntry(true);
    }
    setIsLookingUp(false);
  };

  const calculatePremium = () => {
    let base = vehicleType === 'motorcycle' ? 600 : vehicleType === 'van' ? 1200 : 850;
    const valueNum = parseInt(vehicleValue) || 5000;
    base += (valueNum / 100);
    if (formData.coverLevel === 'Comprehensive') base += 250;
    if (parseInt(formData.ncbYears) > 5) base -= 200;
    if (formData.duration === '1 Month') return Math.round(base / 8);
    return Math.round(base);
  };

  const handleFinalPurchase = async () => {
    setIsProcessing(true);
    try {
      let currentUserId = user?.id;
      if (!currentUserId) {
        const password = Math.random().toString(36).substr(2, 8) + 'A1!';
        const ok = await signup(`${formData.firstName} ${formData.lastName}`, formData.email, password);
        if (!ok) {
           setLookupError("Email already in use. Please sign in.");
           setIsProcessing(false);
           return;
        }
        currentUserId = JSON.parse(localStorage.getItem('sp_session') || '{}').id;
      }

      if (currentUserId) {
        const success = await bindPolicyManual(currentUserId, {
          vehicleType,
          duration: formData.duration,
          premium: calculatePremium().toString(),
          status: 'Active',
          details: {
            vrm: formData.vrm.toUpperCase(),
            make: formData.make,
            model: formData.model,
            year: formData.year,
            coverLevel: formData.coverLevel,
            licenceNumber: formData.licenceNumber || 'TEST_LIC_123',
            address: `${formData.addressLine1}, ${formData.city}, ${formData.postcode}`,
            ncb: formData.ncbYears,
            excess: formData.voluntaryExcess,
            vin: formData.vin,
            engineSize: formData.engineSize,
            fuelType: formData.fuelType,
            color: formData.color
          }
        });
        if (success) navigate('/customers');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fa] py-20 font-inter">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Step Indicator */}
        <div className="mb-16 flex justify-between items-center px-12 relative">
          <div className="absolute top-5 left-12 right-12 h-0.5 bg-gray-100 z-0" />
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${step >= s ? 'bg-[#e91e8c] text-white shadow-lg' : 'bg-white text-gray-300 border border-gray-100'}`}>
              {step > s ? <CheckCircle size={20} /> : s}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[64px] p-8 md:p-16 shadow-2xl border border-gray-100 min-h-[600px] flex flex-col">
          
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-6">
                <div className="bg-[#e91e8c]/10 p-4 rounded-2xl text-[#e91e8c] shadow-sm"><Car size={32} /></div>
                <div>
                  <h1 className="text-3xl font-bold font-outfit text-[#2d1f2d]">Vehicle Intelligence</h1>
                  <p className="text-gray-400 font-medium">Verified registry data for Car, Van, and Motorcycle.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'car', label: 'Car', icon: <Car size={20} /> },
                  { id: 'van', label: 'Van', icon: <Truck size={20} /> },
                  { id: 'motorcycle', label: 'Bike', icon: <Bike size={20} /> }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setVehicleType(type.id as any)}
                    className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${
                      vehicleType === type.id ? 'border-[#e91e8c] bg-pink-50 text-[#e91e8c]' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {type.icon}
                    <span className="font-bold text-xs uppercase tracking-widest">{type.label}</span>
                  </button>
                ))}
              </div>

              {!isManualEntry ? (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">UK Registration</label>
                  <div className="flex gap-4">
                    <input 
                      className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-8 py-5 font-bold text-2xl uppercase tracking-widest outline-none focus:border-[#e91e8c] shadow-sm"
                      placeholder="e.g. SG71 OYK"
                      value={formData.vrm}
                      onChange={(e) => setFormData({...formData, vrm: e.target.value.toUpperCase()})}
                    />
                    <button 
                      onClick={handleLookup}
                      disabled={isLookingUp || !formData.vrm}
                      className="px-12 py-5 bg-[#2d1f2d] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-black transition-all disabled:opacity-50 shadow-xl"
                    >
                      {isLookingUp ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                      Lookup
                    </button>
                  </div>
                  {lookupError && (
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3 text-orange-700 text-xs font-bold">
                      <AlertCircle size={18} /> {lookupError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6 animate-in fade-in">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">Make</label>
                    <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">Model</label>
                    <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                  </div>
                </div>
              )}

              {formData.make && (
                <div className="p-8 bg-[#2d1f2d] rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between shadow-xl gap-8 relative overflow-hidden animate-in zoom-in-95">
                   <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none"><Shield size={120} /></div>
                   <div className="relative z-10 flex items-center gap-6">
                      <div className="w-16 h-16 bg-[#e91e8c] rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <CheckCircle size={32} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Verified Asset</p>
                          <span className="px-2 py-0.5 bg-white/10 rounded-full text-[8px] font-black text-[#e91e8c] uppercase">{lookupSource}</span>
                        </div>
                        <p className="text-3xl font-black font-outfit uppercase tracking-tighter leading-none">{formData.make} {formData.model}</p>
                        <div className="flex gap-4 mt-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/60">
                           <span className="flex items-center gap-1"><Zap size={10} /> {formData.fuelType}</span>
                           <span className="flex items-center gap-1"><Activity size={10} /> {formData.engineSize}</span>
                           <span className="flex items-center gap-1"><Clock size={10} /> {formData.year}</span>
                        </div>
                        {formData.vin && <p className="mt-2 text-[8px] font-mono text-white/20 uppercase tracking-widest">VIN: {formData.vin}</p>}
                      </div>
                   </div>
                   <button onClick={() => { setFormData(INITIAL_STATE); setIsManualEntry(false); setLookupSource(null); }} className="relative z-10 px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Reset</button>
                </div>
              )}

              <div className="mt-auto pt-10">
                <button 
                  disabled={!formData.make}
                  onClick={() => setStep(2)}
                  className="w-full py-6 bg-[#2d1f2d] text-white rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-30 shadow-2xl"
                >
                  Confirm Identity <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
               <div className="flex items-center gap-6">
                <div className="bg-[#e91e8c]/10 p-4 rounded-2xl text-[#e91e8c]"><UserIcon size={32} /></div>
                <div>
                  <h1 className="text-3xl font-bold font-outfit text-[#2d1f2d]">Driver Profile</h1>
                  <p className="text-gray-400 font-medium">Verify your identity for the insurance contract.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">First Name</label>
                  <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">Last Name</label>
                  <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">Email Address</label>
                  <input type="email" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-400">NCB Years</label>
                   <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.ncbYears} onChange={e => setFormData({...formData, ncbYears: e.target.value})}>
                     {[0,1,2,3,4,5,6,7,8,9,10,15].map(n => <option key={n} value={n}>{n} Years</option>)}
                   </select>
                </div>
              </div>

              <div className="flex gap-4 mt-auto pt-10">
                <button onClick={() => setStep(1)} className="flex-1 py-5 border-2 border-gray-100 text-gray-400 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all">Back</button>
                <button 
                  disabled={!formData.firstName || !formData.email}
                  onClick={() => setStep(3)}
                  className="flex-[2] py-5 bg-[#2d1f2d] text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
                >
                  Set Protection <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
               <div className="flex items-center gap-6">
                <div className="bg-[#e91e8c]/10 p-4 rounded-2xl text-[#e91e8c]"><ShieldCheck size={32} /></div>
                <div>
                  <h1 className="text-3xl font-bold font-outfit text-[#2d1f2d]">Protection Matrix</h1>
                  <p className="text-gray-400 font-medium">Select coverage levels and voluntary excess.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Comprehensive', val: 'Comprehensive' },
                  { label: 'T.P.F.T', val: 'Third Party Fire & Theft' },
                  { label: 'T.P.O', val: 'Third Party' }
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setFormData({...formData, coverLevel: opt.val})}
                    className={`p-6 rounded-[32px] border-2 text-left transition-all ${formData.coverLevel === opt.val ? 'border-[#e91e8c] bg-pink-50' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <p className="font-bold text-[#2d1f2d]">{opt.label}</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-black uppercase tracking-widest">Standard Cover</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Policy Term</label>
                    <div className="flex bg-gray-50 p-2 rounded-2xl border border-gray-100">
                      <button onClick={() => setFormData({...formData, duration: '12 Months'})} className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${formData.duration === '12 Months' ? 'bg-white shadow-sm text-[#e91e8c]' : 'text-gray-400'}`}>12 Months</button>
                      <button onClick={() => setFormData({...formData, duration: '1 Month'})} className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${formData.duration === '1 Month' ? 'bg-white shadow-sm text-[#e91e8c]' : 'text-gray-400'}`}>1 Month</button>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Voluntary Excess</label>
                    <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.voluntaryExcess} onChange={e => setFormData({...formData, voluntaryExcess: e.target.value})}>
                      <option value="£0">£0</option><option value="£250">£250</option><option value="£500">£500</option><option value="£1000">£1000</option>
                    </select>
                 </div>
              </div>

              <div className="flex gap-4 mt-auto pt-10">
                <button onClick={() => setStep(2)} className="flex-1 py-5 border-2 border-gray-100 text-gray-400 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all">Back</button>
                <button onClick={() => setStep(4)} className="flex-[2] py-5 bg-[#2d1f2d] text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl">Calculate Binding <ArrowRight size={18} /></button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
               <div className="flex items-center gap-6">
                <div className="bg-[#e91e8c]/10 p-4 rounded-2xl text-[#e91e8c]"><CreditCard size={32} /></div>
                <div>
                  <h1 className="text-3xl font-bold font-outfit text-[#2d1f2d]">Binding Review</h1>
                  <p className="text-gray-400 font-medium">Finalizing your annual insurance premium.</p>
                </div>
              </div>

              <div className="p-12 bg-[#2d1f2d] rounded-[56px] text-white flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e91e8c] mb-2">Estimated Premium</p>
                <div className="flex items-end gap-1 mb-12 relative z-10">
                  <span className="text-3xl font-bold text-white/20 mb-3">£</span>
                  <span className="text-8xl font-black font-outfit tracking-tighter tabular-nums leading-none">{calculatePremium()}</span>
                </div>
                
                <button 
                  onClick={handleFinalPurchase}
                  disabled={isProcessing}
                  className="w-full py-7 bg-[#e91e8c] text-white rounded-[32px] font-black uppercase tracking-widest text-sm hover:bg-[#c4167a] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <>Complete Binding <ArrowRight size={20} /></>}
                </button>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(3)} className="px-10 py-5 border-2 border-gray-100 text-gray-400 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all">Back</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default QuotePage;