import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Car, ShieldCheck, ArrowRight, Loader2,
  AlertCircle, Bike, Search, CheckCircle,
  Truck, Shield, User as UserIcon, CreditCard,
  Info, Clock, Fingerprint, Activity, Database, Zap,
  Lock, PenTool, RefreshCcw, Settings, ChevronRight
} from 'lucide-react';
import { QuoteData, PremiumBreakdown } from '../types';

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;
// Standard UK Registration Format: 2 letters, 2 numbers, space (optional), 3 letters
const UK_REG_REGEX = /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$|^[A-Z]{1,3}\s?[0-9]{1,4}$|^[0-9]{1,4}\s?[A-Z]{1,3}$/i;

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
  vin: '', color: '', vehicleValue: '5000'
};

const QuotePage: React.FC = () => {
  const { user, signup, bindPolicyManual, lookupVehicle, lookupVIN } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuoteData>(INITIAL_STATE);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupSource, setLookupSource] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [lookupMethod, setLookupMethod] = useState<'REG' | 'VIN'>('REG');
  const [vehicleType, setVehicleType] = useState<'car' | 'van' | 'motorcycle'>('car');

  const populateFields = (data: any, source: string) => {
    setFormData(prev => ({ 
      ...prev, 
      make: data.make, 
      model: data.model, 
      year: data.year?.toString() || '',
      fuelType: data.fuelType || 'Petrol',
      engineSize: data.engineSize || 'N/A',
      vin: data.vin || prev.vin,
      color: data.color || '',
      vrm: data.registration || prev.vrm
    }));
    setLookupSource(source);
    setIsManualEntry(false);
  };

  const handleVINLookup = async () => {
    const cleanVin = formData.vin.trim().toUpperCase().replace(/\s/g, '');
    if (!cleanVin || !VIN_REGEX.test(cleanVin)) {
      setLookupError("Please enter a valid 17-character VIN (A-Z, 0-9).");
      return;
    }
    setIsLookingUp(true);
    setLookupError(null);
    const result = await lookupVIN(cleanVin);
    if (result.success && result.data) {
      populateFields(result.data, result.source || 'VIN Gateway');
    } else {
      if (formData.vrm) {
        setLookupError("VIN recognition failed. Attempting primary registration lookup...");
        handleRegLookup();
      } else {
        setLookupError(result.error || "Asset not found in registry. Please enter manually.");
        setIsManualEntry(true);
      }
    }
    setIsLookingUp(false);
  };

  const handleRegLookup = async () => {
    const cleanReg = formData.vrm.trim().toUpperCase().replace(/\s/g, '');
    
    if (!cleanReg) {
      setLookupError("Registration is required.");
      return;
    }

    if (!UK_REG_REGEX.test(cleanReg)) {
      setLookupError("Invalid registration format. Please enter a valid UK number plate.");
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);
    const result = await lookupVehicle(cleanReg);
    if (result.success && result.data) {
      populateFields(result.data, result.source || 'Official Registry');
    } else {
      setLookupError(result.error || "Vehicle not found. Verify your registration or enter manually.");
      setIsManualEntry(true);
    }
    setIsLookingUp(false);
  };

  const premiumBreakdown = useMemo((): PremiumBreakdown => {
    const base = 450.00;
    let riskAdjustment = 0;
    
    if (vehicleType === 'van') riskAdjustment += 350;
    if (vehicleType === 'motorcycle') riskAdjustment -= 50;

    const val = parseFloat(formData.vehicleValue || '5000');
    riskAdjustment += (val * 0.02);

    if (formData.coverLevel === 'Comprehensive') riskAdjustment += 150;

    const ncbYears = parseInt(formData.ncbYears || '0');
    const ncbDiscount = -((base + riskAdjustment) * (Math.min(ncbYears, 9) * 0.05));

    let addonsCost = 0;
    if (formData.addons.breakdown) addonsCost += 45;
    if (formData.addons.legal) addonsCost += 25;
    if (formData.addons.protectedNcb) addonsCost += 35;

    const subtotal = base + riskAdjustment + ncbDiscount + addonsCost;
    const ipt = subtotal * 0.12; 
    const adminFee = 25.00;
    const total = subtotal + ipt + adminFee;

    let firstMonthCharge = total;
    let remainingBalance = 0;
    if (formData.duration === '12 Months' && formData.paymentFrequency === 'monthly') {
      firstMonthCharge = total / 12;
      remainingBalance = total - firstMonthCharge;
    }

    return {
      base,
      riskAdjustment,
      ncbDiscount,
      addons: addonsCost,
      ipt,
      adminFee,
      total,
      firstMonthCharge,
      fullAnnualPremium: formData.duration === '12 Months' ? total : undefined,
      remainingBalance
    };
  }, [vehicleType, formData.vehicleValue, formData.coverLevel, formData.ncbYears, formData.addons, formData.duration, formData.paymentFrequency]);

  const handleFinalPurchase = async () => {
    setIsProcessing(true);
    try {
      let currentUserId = user?.id;
      if (!currentUserId) {
        const password = Math.random().toString(36).substr(2, 8) + 'A1!';
        const ok = await signup(`${formData.firstName} ${formData.lastName}`, formData.email, password);
        if (!ok) {
           setLookupError("Operational collision. Email already enrolled.");
           setIsProcessing(false);
           return;
        }
        currentUserId = JSON.parse(localStorage.getItem('sp_session') || '{}').id;
      }

      if (currentUserId) {
        const now = new Date();
        const expiry = new Date();
        expiry.setFullYear(now.getFullYear() + 1);

        const success = await bindPolicyManual(currentUserId, {
          vehicleType,
          duration: formData.duration,
          premium: premiumBreakdown.total.toFixed(2),
          status: 'Pending Validation', 
          details: {
            vrm: formData.vrm.toUpperCase(),
            make: formData.make,
            model: formData.model,
            year: formData.year,
            coverLevel: formData.coverLevel,
            licenceNumber: formData.licenceNumber || 'GB-AUTH-001',
            address: `${formData.addressLine1}, ${formData.city}, ${formData.postcode}`,
            ncb: formData.ncbYears,
            excess: formData.voluntaryExcess,
            vin: formData.vin,
            engineSize: formData.engineSize,
            fuelType: formData.fuelType,
            color: formData.color,
            vehicleValue: formData.vehicleValue,
            firstName: formData.firstName,
            lastName: formData.lastName,
            dob: formData.dob,
            email: formData.email,
            phone: formData.phone,
            yearsExperience: formData.licenceHeldYears,
            issueDate: now.toISOString(),
            startDate: formData.policyStartDate,
            expiryDate: expiry.toISOString(),
            paymentRef: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            paymentFrequency: formData.paymentFrequency,
            breakdown: premiumBreakdown
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
        
        <div className="mb-16 flex justify-between items-center px-12 relative">
          <div className="absolute top-5 left-12 right-12 h-0.5 bg-gray-200 z-0" />
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="relative z-10 flex flex-col items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ${
                step >= s ? 'bg-[#e91e8c] text-white shadow-[0_0_20px_rgba(233,30,140,0.4)]' : 'bg-white text-gray-300 border border-gray-100'
              }`}>
                {step > s ? <CheckCircle size={20} /> : s}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${step >= s ? 'text-[#e91e8c]' : 'text-gray-300'}`}>
                {s === 1 ? 'Asset' : s === 2 ? 'Identity' : s === 3 ? 'Cover' : 'Bind'}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[64px] p-8 md:p-16 shadow-2xl border border-gray-100 min-h-[600px] flex flex-col transition-all duration-500">
          
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-6">
                <div className="bg-[#e91e8c]/10 p-4 rounded-2xl text-[#e91e8c] shadow-sm"><Car size={32} /></div>
                <div>
                  <h1 className="text-3xl font-bold font-outfit text-[#2d1f2d]">Vehicle Intelligence</h1>
                  <p className="text-gray-400 font-medium">Verified data extraction via UK National Registers.</p>
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

              <div className="bg-gray-100/50 p-2 rounded-2xl border border-gray-200 flex gap-2">
                 <button onClick={() => setLookupMethod('REG')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${lookupMethod === 'REG' ? 'bg-[#2d1f2d] text-white shadow-xl' : 'text-gray-400 hover:text-[#2d1f2d]'}`}>Primary Registration</button>
                 <button onClick={() => setLookupMethod('VIN')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${lookupMethod === 'VIN' ? 'bg-[#2d1f2d] text-white shadow-xl' : 'text-gray-400 hover:text-[#2d1f2d]'}`}>VIN Intelligence</button>
              </div>

              {!isManualEntry ? (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">{lookupMethod === 'REG' ? 'UK Registration' : '17-Character Chassis Number (VIN)'}</label>
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                       <input 
                        className={`w-full bg-gray-50 border rounded-2xl px-8 py-5 font-bold text-2xl uppercase tracking-widest outline-none transition-all focus:border-[#e91e8c] shadow-sm font-mono ${lookupMethod === 'VIN' ? 'text-lg' : ''}`}
                        placeholder={lookupMethod === 'REG' ? 'e.g. SG71 OYK' : '17-CHAR VIN'}
                        value={lookupMethod === 'REG' ? formData.vrm : formData.vin}
                        onChange={(e) => lookupMethod === 'REG' ? setFormData({...formData, vrm: e.target.value.toUpperCase()}) : setFormData({...formData, vin: e.target.value.toUpperCase()})}
                      />
                      {lookupMethod === 'VIN' && <Fingerprint size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-200" />}
                    </div>
                    <button 
                      onClick={lookupMethod === 'REG' ? handleRegLookup : handleVINLookup}
                      disabled={isLookingUp || (lookupMethod === 'REG' ? !formData.vrm : !formData.vin)}
                      className="px-12 py-5 bg-[#2d1f2d] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-black transition-all disabled:opacity-50 shadow-xl"
                    >
                      {isLookingUp ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                      Identify
                    </button>
                  </div>
                  {lookupError && (
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3 text-orange-700 text-xs font-bold animate-in shake duration-300">
                      <AlertCircle size={18} /> {lookupError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in bg-gray-50 p-8 rounded-[40px] border border-gray-100 shadow-inner">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Vehicle Make</label>
                    <input className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 font-bold focus:border-[#e91e8c] outline-none" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Vehicle Model</label>
                    <input className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 font-bold focus:border-[#e91e8c] outline-none" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                  </div>
                  <button onClick={() => setIsManualEntry(false)} className="md:col-span-2 text-xs font-black uppercase tracking-widest text-[#e91e8c] flex items-center gap-2 justify-center py-2"><RefreshCcw size={14}/> Back to Lookup</button>
                </div>
              )}

              {formData.make && !isManualEntry && (
                <div className="p-10 bg-[#2d1f2d] rounded-[48px] text-white flex flex-col md:flex-row items-center justify-between shadow-2xl gap-8 relative overflow-hidden animate-in zoom-in-95 duration-500">
                   <div className="absolute top-0 right-0 p-10 text-white/5 pointer-events-none"><Shield size={160} /></div>
                   <div className="relative z-10 flex items-center gap-8">
                      <div className="w-20 h-20 bg-[#e91e8c] rounded-3xl flex items-center justify-center text-white shadow-[0_15px_30px_rgba(233,30,140,0.4)]">
                        <CheckCircle size={40} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-[10px] font-black uppercase text-[#e91e8c] tracking-[0.3em]">Identity Verified</p>
                          <span className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-black text-white/60 uppercase tracking-widest">{lookupSource}</span>
                        </div>
                        <p className="text-4xl font-black font-outfit uppercase tracking-tighter leading-none mb-4">{formData.make} {formData.model}</p>
                        <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                           <span className="flex items-center gap-2"><Zap size={12} className="text-[#e91e8c]"/> {formData.fuelType}</span>
                           <span className="flex items-center gap-2"><Activity size={12} className="text-[#e91e8c]"/> {formData.engineSize}</span>
                           <span className="flex items-center gap-2"><Clock size={12} className="text-[#e91e8c]"/> {formData.year}</span>
                        </div>
                        {formData.vin && <p className="mt-4 text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">CHASSIS: {formData.vin}</p>}
                      </div>
                   </div>
                   <div className="relative z-10 flex flex-col gap-2">
                      <button onClick={() => { setIsManualEntry(true); }} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"><PenTool size={12}/> Edit Specs</button>
                      <button onClick={() => { setFormData(INITIAL_STATE); setLookupSource(null); }} className="px-6 py-3 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-white/40 hover:text-white">Switch Vehicle</button>
                   </div>
                </div>
              )}

              <div className="mt-auto pt-10">
                <button 
                  disabled={!formData.make}
                  onClick={() => setStep(2)}
                  className="w-full py-7 bg-[#2d1f2d] text-white rounded-[32px] font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-black transition-all disabled:opacity-30 shadow-2xl group"
                >
                  Verify the Vehicle <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {step >= 2 && (
             <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                {step === 2 && (
                    <div className="space-y-10">
                        <div className="flex items-center gap-6">
                            <div className="bg-[#e91e8c]/10 p-4 rounded-2xl text-[#e91e8c]"><UserIcon size={32} /></div>
                            <div>
                                <h1 className="text-3xl font-bold font-outfit text-[#2d1f2d]">Risk Profile</h1>
                                <p className="text-gray-400 font-medium">Verify driver identity and insurance history.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Legal First Name</label>
                                <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold focus:border-[#e91e8c] outline-none" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Legal Last Name</label>
                                <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold focus:border-[#e91e8c] outline-none" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Swift" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Date of Birth</label>
                                <input type="date" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold focus:border-[#e91e8c] outline-none" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Secure Contact Email</label>
                                <input type="email" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold focus:border-[#e91e8c] outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@address.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Claims Free Record (NCB)</label>
                                <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold focus:border-[#e91e8c] outline-none appearance-none" value={formData.ncbYears} onChange={e => setFormData({...formData, ncbYears: e.target.value})}>
                                    {[0,1,2,3,4,5,6,7,8,9,10,15].map(n => <option key={n} value={n}>{n} Years No Claims</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Estimated Vehicle Value (£)</label>
                                <input type="number" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold focus:border-[#e91e8c] outline-none" value={formData.vehicleValue} onChange={e => setFormData({...formData, vehicleValue: e.target.value})} placeholder="5000" />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-auto pt-10">
                            <button onClick={() => setStep(1)} className="flex-1 py-6 border-2 border-gray-100 text-gray-400 rounded-[28px] font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all">Back</button>
                            <button 
                                disabled={!formData.firstName || !formData.email}
                                onClick={() => setStep(3)}
                                className="flex-[2] py-6 bg-[#2d1f2d] text-white rounded-[28px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
                            >
                                Policy Configuration <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="space-y-10">
                        <div className="flex items-center gap-6">
                            <div className="bg-[#e91e8c]/10 p-4 rounded-2xl text-[#e91e8c]"><ShieldCheck size={32} /></div>
                            <div>
                                <h1 className="text-3xl font-bold font-outfit text-[#2d1f2d]">Protection Matrix</h1>
                                <p className="text-gray-400 font-medium">Select coverage tiers and voluntary excess.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Comprehensive', val: 'Comprehensive', desc: 'Full Asset Protection' },
                                { label: 'T.P.F.T', val: 'Third Party Fire & Theft', desc: 'Standard Shield' },
                                { label: 'T.P.O', val: 'Third Party', desc: 'Minimum Legal' }
                            ].map((opt) => (
                                <button
                                    key={opt.val}
                                    onClick={() => setFormData({...formData, coverLevel: opt.val})}
                                    className={`p-8 rounded-[40px] border-2 text-left transition-all ${formData.coverLevel === opt.val ? 'border-[#e91e8c] bg-pink-50 shadow-xl scale-105' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <p className={`font-bold font-outfit text-lg ${formData.coverLevel === opt.val ? 'text-[#e91e8c]' : 'text-[#2d1f2d]'}`}>{opt.label}</p>
                                    <p className="text-[9px] text-gray-400 mt-2 font-black uppercase tracking-widest">{opt.desc}</p>
                                </button>
                            ))}
                        </div>
                        <div className="p-8 bg-gray-50 border border-gray-100 rounded-[32px] space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Optional Cover Add-ons</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <label className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl cursor-pointer">
                                 <span className="text-xs font-bold">24/7 Breakdown Assist</span>
                                 <input type="checkbox" checked={formData.addons.breakdown} onChange={e => setFormData({...formData, addons: {...formData.addons, breakdown: e.target.checked}})} className="w-5 h-5 accent-[#e91e8c]" />
                              </label>
                              <label className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl cursor-pointer">
                                 <span className="text-xs font-bold">Legal Protection</span>
                                 <input type="checkbox" checked={formData.addons.legal} onChange={e => setFormData({...formData, addons: {...formData.addons, legal: e.target.checked}})} className="w-5 h-5 accent-[#e91e8c]" />
                              </label>
                           </div>
                        </div>
                        <div className="flex gap-4 mt-auto pt-10">
                            <button onClick={() => setStep(2)} className="flex-1 py-6 border-2 border-gray-100 text-gray-400 rounded-[28px] font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all">Back</button>
                            <button onClick={() => setStep(4)} className="flex-[2] py-6 bg-[#2d1f2d] text-white rounded-[28px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl">Underwrite Quote <ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}
                {step === 4 && (
                    <div className="space-y-10">
                        <div className="flex items-center gap-6">
                            <div className="bg-[#e91e8c]/10 p-4 rounded-2xl text-[#e91e8c]"><CreditCard size={32} /></div>
                            <div>
                                <h1 className="text-3xl font-bold font-outfit text-[#2d1f2d]">Final Underwriting Breakdown</h1>
                                <p className="text-gray-400 font-medium">Verified premium calculation for legal binding.</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-4">
                              <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100">
                                 <h4 className="text-xs font-black uppercase tracking-widest text-[#e91e8c] mb-6">Financial Summary</h4>
                                 <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                       <span className="text-gray-400 font-medium">Base Underwriting</span>
                                       <span className="font-black text-[#2d1f2d]">£{premiumBreakdown.base.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                       <span className="text-gray-400 font-medium">Risk Adjustment Loading</span>
                                       <span className="font-black text-[#2d1f2d]">£{premiumBreakdown.riskAdjustment.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                       <span className="text-gray-400 font-medium">{formData.ncbYears}yr No Claims Discount</span>
                                       <span className="font-black text-green-600">£{premiumBreakdown.ncbDiscount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                       <span className="text-gray-400 font-medium">Optional Add-ons</span>
                                       <span className="font-black text-[#2d1f2d]">£{premiumBreakdown.addons.toFixed(2)}</span>
                                    </div>
                                    <div className="h-px bg-gray-200 my-4" />
                                    <div className="flex justify-between items-center text-sm">
                                       <span className="text-gray-400 font-medium">Tax (12% IPT)</span>
                                       <span className="font-black text-[#2d1f2d]">£{premiumBreakdown.ipt.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                       <span className="text-gray-400 font-medium">Administration Fee</span>
                                       <span className="font-black text-[#2d1f2d]">£{premiumBreakdown.adminFee.toFixed(2)}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="p-10 bg-[#2d1f2d] rounded-[48px] text-white flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-1 bg-[#e91e8c] opacity-50" />
                              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#e91e8c] mb-6">Total Premium Payable</p>
                              <div className="flex items-end gap-2 mb-10">
                                 <span className="text-4xl font-bold text-white/20 mb-4 font-outfit">£</span>
                                 <span className="text-8xl font-black font-outfit tracking-tighter tabular-nums leading-none">{premiumBreakdown.total.toFixed(2)}</span>
                              </div>
                              <button 
                                 onClick={handleFinalPurchase}
                                 disabled={isProcessing}
                                 className="w-full py-8 bg-[#e91e8c] text-white rounded-[32px] font-black uppercase tracking-[0.3em] text-sm hover:bg-[#c4167a] transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 disabled:opacity-50"
                              >
                                 {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <>Pay & Bind Policy <ChevronRight size={20} /></>}
                              </button>
                           </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep(3)} className="px-12 py-5 border-2 border-gray-100 text-gray-400 rounded-[28px] font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all">Back</button>
                        </div>
                    </div>
                )}
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default QuotePage;