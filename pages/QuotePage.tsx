
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Car, ShieldCheck, ArrowRight, Loader2,
  AlertCircle, Bike, Search, ChevronDown, Lock, CheckCircle, Database,
  ArrowLeft, User as UserIcon, Calendar, Clock, CreditCard, CheckCircle2,
  Truck, HelpCircle, Info, Shield, Mail, Phone, MapPin
} from 'lucide-react';
import { QuoteData, PolicyDuration, PolicyStatus, EnforcedInsuranceType } from '../types';
import { GoogleGenAI } from "@google/genai";

// Fix: Added licenceNumber to INITIAL_STATE to align with QuoteData interface
const INITIAL_STATE: QuoteData = {
  vrm: '', 
  insurance_type: '',
  duration: '12 Months',
  make: '', model: '', year: '', fuelType: '', transmission: '', bodyType: '', engineSize: '', seats: '',
  isImported: false, annualMileage: '8000', usageType: 'Social, Domestic & Pleasure', ownership: 'Owned',
  isModified: false, modifications: '', securityFeatures: [], overnightParking: 'Driveway',
  title: 'Mr', firstName: '', lastName: '', dob: '', gender: 'Male', maritalStatus: 'Married', ukResident: true,
  yearsInUk: 'Born in UK', occupation: '', employmentStatus: 'Employed', industry: '',
  licenceType: 'Full UK', licenceHeldYears: '5+', licenceDate: '', 
  licenceNumber: '', // Added property
  hasMedicalConditions: false,
  mainDriverHistory: { hasConvictions: false, convictions: [], hasClaims: false, claims: [] },
  ncbYears: '5', isCurrentlyInsured: true, hasPreviousCancellations: false,
  additionalDrivers: [],
  postcode: '', addressLine1: '', city: '', yearsAtAddress: '5+', homeOwnership: 'Owner',
  coverLevel: 'Comprehensive', policyStartDate: new Date().toISOString().split('T')[0], voluntaryExcess: '£250',
  addons: { breakdown: false, legal: false, courtesyCar: false, windscreen: false, protectedNcb: false },
  paymentFrequency: 'monthly', payerType: 'individual',
  email: '', phone: '', contactTime: 'Anytime', marketingConsent: false, dataProcessingConsent: false,
  isAccurate: false, termsAccepted: false
};

const QuotePage: React.FC = () => {
  const { user, signup, bindPolicyManual } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuoteData>(INITIAL_STATE);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [vehicleType, setVehicleType] = useState<'car' | 'van' | 'motorcycle'>('car');
  const [vehicleValue, setVehicleValue] = useState('5000');

  const validateVRM = (vrm: string) => {
    const normalized = vrm.replace(/\s/g, '').toUpperCase();
    return normalized.length >= 5 && normalized.length <= 8;
  };

  const handleLookup = async () => {
    const vrmInput = formData.vrm.replace(/\s/g, '').toUpperCase();
    if (!vrmInput) return;
    
    if (!validateVRM(vrmInput)) {
      setLookupError("Invalid registration format. Use 5-8 chars.");
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Perform a UK DVLA vehicle lookup for registration: ${vrmInput}. Return ONLY a clean JSON object with no markdown formatting. The object should have keys: "make", "model", "year", "fuelType", and "engineSize". If the vehicle cannot be found, return {"error": "NOT_FOUND"}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { 
          systemInstruction: "You are a professional UK Vehicle Data Gateway. You specialize in retrieving accurate DVLA vehicle specifications and returning them strictly as valid JSON.",
          tools: [{googleSearch: {}}],
        }
      });

      const responseText = response.text;
      if (!responseText) throw new Error("EMPTY_RESPONSE");

      const rawText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(rawText);

      if (data.make && !data.error) {
        setFormData(prev => ({ 
          ...prev, 
          make: data.make, 
          model: data.model, 
          year: data.year?.toString() || '',
          fuelType: data.fuelType || 'Petrol',
          engineSize: data.engineSize || '',
          vrm: vrmInput
        }));
        setLookupError(null);
      } else {
        throw new Error("NOT_FOUND");
      }
    } catch (err) {
      console.error("Lookup Failure:", err);
      setLookupError("The vehicle registry is currently undergoing maintenance. Please enter your vehicle details manually.");
      setIsManualEntry(true);
    } finally {
      setIsLookingUp(false);
    }
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
        const name = `${formData.firstName} ${formData.lastName}`;
        const ok = await signup(name, formData.email, password);
        if (!ok) {
           setLookupError("An account with this email already exists. Please login.");
           setIsProcessing(false);
           return;
        }
        currentUserId = JSON.parse(localStorage.getItem('sp_session') || '{}').id;
      }

      if (currentUserId) {
        const premium = calculatePremium();
        const success = await bindPolicyManual(currentUserId, {
          vehicleType,
          duration: formData.duration,
          premium: premium.toString(),
          status: formData.duration === '1 Month' ? 'Pending Validation' : 'Active',
          details: {
            vrm: formData.vrm.toUpperCase(),
            make: formData.make,
            model: formData.model,
            year: formData.year,
            coverLevel: formData.coverLevel,
            licenceNumber: formData.licenceNumber || 'AB123456',
            address: `${formData.addressLine1}, ${formData.city}, ${formData.postcode}`,
            ncb: formData.ncbYears,
            excess: formData.voluntaryExcess
          }
        });

        if (success) {
          navigate('/customers');
        }
      }
    } catch (err) {
      console.error("Purchase Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { n: 1, label: 'Vehicle' },
    { n: 2, label: 'Driver' },
    { n: 3, label: 'Policy' },
    { n: 4, label: 'Payment' }
  ];

  return (
    <div className="min-h-screen bg-[#faf8fa] py-20">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Progress Bar */}
        <div className="mb-16 flex justify-between items-center px-8 md:px-24 relative">
          <div className="absolute top-5 left-24 right-24 h-0.5 bg-gray-200 z-0" />
          {steps.map((s) => (
            <div key={s.n} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                step >= s.n ? 'bg-[#e91e8c] text-white border-[#e91e8c]' : 'bg-white text-gray-400 border-gray-200'
              }`}>
                {step > s.n ? <CheckCircle size={20} /> : s.n}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.n ? 'text-[#e91e8c]' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[64px] p-8 md:p-16 shadow-2xl border border-gray-100 min-h-[650px] flex flex-col transition-all duration-500">
          
          {/* STEP 1: VEHICLE */}
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-6">
                <div className="bg-[#e91e8c]/10 p-4 rounded-2xl text-[#e91e8c] shadow-sm"><Car size={32} /></div>
                <div>
                  <h1 className="text-3xl font-bold font-outfit text-[#2d1f2d]">Identify Vehicle</h1>
                  <p className="text-gray-400 font-medium">Step 1: Vehicle selection and valuation</p>
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
                      placeholder="e.g. AB19 XYZ"
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

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400">Estimated Vehicle Value (£)</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 font-bold text-lg" 
                  value={vehicleValue} 
                  onChange={e => setVehicleValue(e.target.value)} 
                />
              </div>

              {formData.make && (
                <div className="p-10 bg-gray-50 rounded-[40px] border border-gray-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-white rounded-2xl shadow-sm text-green-500"><CheckCircle size={32} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400">Verified Vehicle</p>
                      <p className="text-2xl font-bold text-[#2d1f2d] font-outfit uppercase">{formData.make} {formData.model} ({formData.year})</p>
                    </div>
                  </div>
                  <button onClick={() => { setFormData(INITIAL_STATE); setIsManualEntry(false); }} className="text-[#e91e8c] text-xs font-bold hover:underline">Change</button>
                </div>
              )}

              <div className="mt-auto pt-10">
                <button 
                  disabled={!formData.make}
                  onClick={() => setStep(2)}
                  className="w-full py-6 bg-[#2d1f2d] text-white rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-30 shadow-2xl"
                >
                  Confirm Vehicle <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DRIVER */}
          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
              <div className="flex items-center gap-6">
                <div className="bg-[#e91e8c]/10 p-4 rounded-2xl text-[#e91e8c]"><UserIcon size={32} /></div>
                <div>
                  <h1 className="text-3xl font-bold font-outfit text-[#2d1f2d]">Policyholder Profile</h1>
                  <p className="text-gray-400 font-medium">Step 2: Personal details and experience</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">Legal First Name</label>
                  <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">Legal Last Name</label>
                  <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">Date of Birth</label>
                  <input type="date" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">UK Driving Licence No.</label>
                  <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold uppercase" placeholder="SMITH801015AB9BC" value={formData.licenceNumber} onChange={e => setFormData({...formData, licenceNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">Years of NCB</label>
                  <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.ncbYears} onChange={e => setFormData({...formData, ncbYears: e.target.value})}>
                    {[0,1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n} Years</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">Contact Email</label>
                  <input type="email" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">Residential Postcode</label>
                  <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold uppercase" placeholder="SW1A 1AA" value={formData.postcode} onChange={e => setFormData({...formData, postcode: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-4 mt-auto pt-10">
                <button onClick={() => setStep(1)} className="flex-1 py-5 border-2 border-gray-100 text-gray-400 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all">Back</button>
                <button 
                  disabled={!formData.firstName || !formData.email || !formData.dob}
                  onClick={() => setStep(3)}
                  className="flex-[2] py-5 bg-[#2d1f2d] text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
                >
                  Continue to Policy <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: POLICY */}
          {step === 3 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
              <div className="flex items-center gap-6">
                <div className="bg-[#e91e8c]/10 p-4 rounded-2xl text-[#e91e8c]"><ShieldCheck size={32} /></div>
                <div>
                  <h1 className="text-3xl font-bold font-outfit text-[#2d1f2d]">Policy Selection</h1>
                  <p className="text-gray-400 font-medium">Step 3: Cover level and excess</p>
                </div>
              </div>

              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Comprehensive', desc: 'Full protection + own damage.', val: 'Comprehensive' },
                    { label: 'T.P.F.T', desc: 'Third Party, Fire & Theft.', val: 'Third Party Fire & Theft' },
                    { label: 'T.P.O', desc: 'Third Party Only (Minimum).', val: 'Third Party' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setFormData({...formData, coverLevel: opt.val})}
                      className={`p-6 rounded-[32px] border-2 text-left transition-all ${formData.coverLevel === opt.val ? 'border-[#e91e8c] bg-pink-50' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <p className="font-bold text-[#2d1f2d]">{opt.label}</p>
                      <p className="text-[10px] text-gray-400 mt-2">{opt.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Duration</label>
                      <div className="flex bg-gray-50 p-2 rounded-2xl">
                        <button onClick={() => setFormData({...formData, duration: '12 Months'})} className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${formData.duration === '12 Months' ? 'bg-white shadow-sm text-[#e91e8c]' : 'text-gray-400'}`}>12 Months</button>
                        <button onClick={() => setFormData({...formData, duration: '1 Month'})} className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${formData.duration === '1 Month' ? 'bg-white shadow-sm text-[#e91e8c]' : 'text-gray-400'}`}>1 Month</button>
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Voluntary Excess</label>
                      <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.voluntaryExcess} onChange={e => setFormData({...formData, voluntaryExcess: e.target.value})}>
                        <option value="£0">£0</option><option value="£100">£100</option><option value="£250">£250</option><option value="£500">£500</option>
                      </select>
                   </div>
                   <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Policy Start Date</label>
                      <input type="date" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.policyStartDate} onChange={e => setFormData({...formData, policyStartDate: e.target.value})} />
                   </div>
                </div>
              </div>

              <div className="flex gap-4 mt-auto pt-10">
                <button onClick={() => setStep(2)} className="flex-1 py-5 border-2 border-gray-100 text-gray-400 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all">Back</button>
                <button onClick={() => setStep(4)} className="flex-[2] py-5 bg-[#2d1f2d] text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl">Finalize Quote <ArrowRight size={18} /></button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT */}
          {step === 4 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
              <div className="flex items-center gap-6">
                <div className="bg-[#e91e8c]/10 p-4 rounded-2xl text-[#e91e8c]"><CreditCard size={32} /></div>
                <div>
                  <h1 className="text-3xl font-bold font-outfit text-[#2d1f2d]">Payment & Confirmation</h1>
                  <p className="text-gray-400 font-medium">Step 4: Secure check-out</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="p-10 bg-gray-50 rounded-[48px] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest">Quote Summary</p>
                    <div className="space-y-5">
                      <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-xs font-medium text-gray-400">Vehicle</span>
                        <span className="text-xs font-black text-[#2d1f2d] uppercase">{formData.vrm}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-xs font-medium text-gray-400">Driver</span>
                        <span className="text-xs font-black text-[#2d1f2d]">{formData.firstName} {formData.lastName}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-xs font-medium text-gray-400">Cover</span>
                        <span className="text-xs font-black text-[#2d1f2d]">{formData.coverLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-400">Term</span>
                        <span className="text-xs font-black text-[#2d1f2d]">{formData.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-12 bg-[#2d1f2d] rounded-[56px] text-white flex flex-col items-center justify-center shadow-[0_40px_80px_-20px_rgba(45,31,45,0.4)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 text-white/5"><Shield size={120} /></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e91e8c] mb-2 relative z-10">Annual Premium</p>
                  <div className="flex items-end gap-1 mb-10 relative z-10">
                    <span className="text-3xl font-bold text-white/20 mb-3">£</span>
                    <span className="text-8xl font-black font-outfit tracking-tighter tabular-nums leading-none">{calculatePremium()}</span>
                  </div>
                  
                  <div className="w-full space-y-4 relative z-10">
                    <button 
                      onClick={handleFinalPurchase}
                      disabled={isProcessing}
                      className="w-full py-7 bg-[#e91e8c] text-white rounded-[32px] font-black uppercase tracking-widest text-sm hover:bg-[#c4167a] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <>Complete Purchase <ArrowRight size={20} /></>}
                    </button>
                    <div className="flex items-center justify-center gap-2 text-[9px] text-white/30 uppercase tracking-[0.2em] font-black">
                       <Lock size={12} /> SSL Encrypted Transaction
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(3)} className="px-10 py-5 border-2 border-gray-100 text-gray-400 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all">Back to Options</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default QuotePage;
