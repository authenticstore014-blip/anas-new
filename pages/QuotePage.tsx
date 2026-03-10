import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Car, ShieldCheck, ArrowRight, Loader2,
  AlertCircle, Bike, Search, CheckCircle,
  Truck, Shield, User as UserIcon, CreditCard,
  Info, Clock, Fingerprint, Activity, Database, Zap,
  Lock, RefreshCcw, ChevronRight, ChevronLeft,
  MapPin, Calendar, FileText, Sparkles,
  Plus, Trash2, ShieldAlert, BadgeCheck, Gavel,
  History, Users, TicketCheck, Wallet, Briefcase,
  UserCheck, Heart, Settings, Gauge, Key, Map as MapIcon,
  HelpCircle, Home, Building, UserPlus, ClipboardList,
  CheckCircle2, CreditCard as PaymentIcon,
  Edit3, RotateCcw, CalendarDays
} from 'lucide-react';
import { QuoteData, PremiumBreakdown, AdditionalDriver, PastClaim, Conviction, Policy, User } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PolicyDocumentView } from '../components/PolicyDocumentView';

const INITIAL_STATE: QuoteData = {
  vrm: '', 
  insurance_type: '',
  policy_type: 'ANNUAL',
  duration: '12 Months',
  make: '', model: '', year: '', fuel_type: 'Petrol', transmission: 'Manual', body_type: 'Saloon', engine_size: '', seats: '5',
  isImported: false, annualMileage: '8000', usageType: 'Social, Domestic & Pleasure', ownership: 'Owned',
  isModified: false, modifications: '', securityFeatures: [], overnightParking: 'Driveway',
  title: 'Mr', firstName: '', lastName: '', dob: '', gender: 'Male', maritalStatus: 'Married', ukResident: true,
  yearsInUk: 'Born in UK', occupation: '', employmentStatus: 'Employed', industry: '',
  licenceType: 'Full UK', licenceHeldYears: '5', licenceDate: '', 
  licenceNumber: '',
  points: 0,
  hasConvictions: false,
  convictions: [],
  hasMedicalConditions: false,
  mainDriverHistory: { hasConvictions: false, convictions: [], hasClaims: false, claims: [] },
  ncbYears: '5', isCurrentlyInsured: true, hasPreviousCancellations: false,
  additionalDrivers: [],
  postcode: '', addressLine1: '', addressLine2: '', city: '', county: '', state: '', country: 'United Kingdom', yearsAtAddress: '5+', homeOwnership: 'Owner',
  coverLevel: 'Comprehensive', policyStartDate: new Date().toISOString().split('T')[0], voluntaryExcess: '£250',
  addons: { breakdown: false, legal: false, courtesyCar: false, windscreen: false, protectedNcb: false, keyCover: false },
  paymentFrequency: 'monthly', payerType: 'individual',
  email: '', phone: '', contactTime: 'Anytime', marketingConsent: false, dataProcessingConsent: false,
  isAccurate: false, termsAccepted: false,
  vin: '', color: '', vehicleValue: '5000', doors: '5', engineCC: ''
};

const QuotePage: React.FC = () => {
  const { user, signup, bindPolicyManual, lookupVehicle, lookupVIN, riskConfig } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuoteData>(INITIAL_STATE);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupMethod, setLookupMethod] = useState<'REG' | 'VIN'>('REG');
  const [vehicleType, setVehicleType] = useState<'car' | 'van' | 'motorcycle'>('car');
  const [isProcessing, setIsProcessing] = useState(false);
  const [policyForEmail, setPolicyForEmail] = useState<{ policy: Policy, user: User } | null>(null);
  const emailDocumentRef = useRef<HTMLDivElement>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressResults, setAddressResults] = useState<string[]>([]);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [showAddressFields, setShowAddressFields] = useState(false);

  const [isScanningRisk, setIsScanningRisk] = useState(false);
  const [riskScanComplete, setRiskScanComplete] = useState(false);
  const [authForm, setAuthForm] = useState({ password: '', confirmPassword: '' });

  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    firstName: '',
    lastName: ''
  });

  const premiumBreakdown = useMemo((): PremiumBreakdown => {
    const iptRate = (riskConfig?.iptRate || 12) / 100;
    const adminFee = riskConfig?.adminFee || 25;
    
    const base = vehicleType === 'motorcycle' ? 300 : vehicleType === 'van' ? 550 : 500;
    let risk = (formData.points * 60) + (parseFloat(formData.vehicleValue || '5000') * 0.02);
    if (formData.usageType.includes('Business')) risk += 150;
    risk += (formData.mainDriverHistory.claims.length * 200);
    risk += (formData.additionalDrivers.length * 80);
    const ncbDisc = 1 - (Math.min(parseInt(formData.ncbYears), 9) * 0.05);
    
    let addonsTotal = 0;
    if (formData.addons.breakdown) addonsTotal += 45;
    if (formData.addons.legal) addonsTotal += 25;
    if (formData.addons.protectedNcb) addonsTotal += 35;

    const rawTotalBeforeFees = (base + risk) * ncbDisc + addonsTotal;
    const finalWithoutIPT = rawTotalBeforeFees + adminFee;
    const iptValue = finalWithoutIPT * iptRate;
    const rawFinalPrice = finalWithoutIPT + iptValue;

    let min = 0, max = 0;
    const isComp = formData.coverLevel === 'Comprehensive';
    
    if (vehicleType === 'motorcycle') {
      min = 810; max = 1700;
    } else {
      if (isComp) {
        min = 2800; max = 4500;
      } else {
        min = 1420; max = 2750;
      }
    }

    const spread = max - min;
    const rawVariationFactor = Math.max(0, Math.min(1, (rawFinalPrice - 400) / 1100));
    const jitter = (Math.random() * 0.05) * spread;
    let adjustedTotal = min + (rawVariationFactor * spread * 0.8) + jitter;

    // ISOLATED 1 MONTH PRICING BRANCH
    if (formData.policy_type === 'ONE_MONTH') {
      const isComprehensiveOneMonth = formData.coverLevel === 'Comprehensive';
      
      // Apply strict price limits for 1 month insurance
      // Comprehensive: £410 - £850
      // Third Party: £200 - £400
      min = isComprehensiveOneMonth ? 410 : 200;
      max = isComprehensiveOneMonth ? 850 : 400;
      
      const oneMonthRange = max - min;
      // Position the quote within the specific 1 month range based on driver risk profile
      adjustedTotal = min + (rawVariationFactor * oneMonthRange * 0.9) + (Math.random() * 0.1 * oneMonthRange);
    }

    const finalQuotedPrice = Math.max(min, Math.min(max, adjustedTotal));

    return {
      base, 
      riskAdjustment: risk, 
      ncbDiscount: -(risk * (1 - ncbDisc)), 
      addons: addonsTotal, 
      ipt: iptValue,
      adminFee: adminFee, 
      total: finalQuotedPrice
    };
  }, [vehicleType, formData.points, formData.vehicleValue, formData.usageType, formData.ncbYears, formData.mainDriverHistory.claims, formData.additionalDrivers, formData.addons, formData.coverLevel, formData.policy_type, riskConfig]);

  const handleLookup = async () => {
    setIsLookingUp(true);
    setLookupError(null);
    const result = lookupMethod === 'REG' ? await lookupVehicle(formData.vrm) : await lookupVIN(formData.vin || '');
    if (result.success && result.data) {
      setFormData(prev => ({ 
        ...prev, 
        ...result.data, 
        year: result.data.year?.toString() || result.data.yearOfManufacture?.toString() || '',
        vrm: result.data.registration || prev.vrm,
        fuel_type: result.data.fuelType || result.data.fuel_type || prev.fuel_type,
        engine_size: result.data.engineSize || result.data.engine_size || prev.engine_size,
        color: result.data.color || result.data.colour || prev.color
      }));
      setIsManualMode(false);
    } else {
      setLookupError(result.error || "Vehicle registry link failed. Please check input.");
    }
    setIsLookingUp(false);
  };

  const handleAddressLookup = async () => {
    if (!formData.postcode || formData.postcode.length < 5) {
      setAddressError("Please enter a valid UK postcode.");
      return;
    }
    setIsSearchingAddress(true);
    setAddressError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Find valid street addresses for the UK postcode: ${formData.postcode}. Include city, county/state, and country. Return strictly a JSON object.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              addresses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { 
                    line1: { type: Type.STRING }, 
                    line2: { type: Type.STRING },
                    city: { type: Type.STRING },
                    county: { type: Type.STRING },
                    state: { type: Type.STRING },
                    country: { type: Type.STRING }
                  },
                  required: ["line1", "city"]
                }
              }
            },
            required: ["addresses"]
          }
        }
      });
      const data = JSON.parse(response.text || '{"addresses": []}');
      if (data.addresses?.length > 0) {
        const first = data.addresses[0];
        setFormData(prev => ({
          ...prev,
          city: first.city || prev.city,
          county: first.county || prev.county,
          state: first.state || first.county || prev.state,
          country: first.country || 'United Kingdom'
        }));
        setShowAddressFields(true);
        setAddressResults(data.addresses.map((a: any) => ({
          line1: a.line1,
          line2: a.line2 || '',
          city: a.city,
          county: a.county || '',
          state: a.state || a.county || '',
          country: a.country || 'United Kingdom',
          full: `${a.line1}${a.line2 ? ', ' + a.line2 : ''}, ${a.city}${a.county ? ', ' + a.county : ''}`
        })));
      } else {
        setAddressError("Registry returned zero matches for this postcode.");
      }
    } catch (err) {
      setAddressError("Postcode identification service unreachable.");
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const runRiskScan = async () => {
    setIsScanningRisk(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRiskScanComplete(true);
    setIsScanningRisk(false);
  };

  const handleNext = () => { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleBack = () => { setStep(s => Math.max(1, s - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const addAdditionalDriver = () => {
    if (formData.additionalDrivers.length >= 3) return;
    setFormData({ 
      ...formData, 
      additionalDrivers: [...formData.additionalDrivers, {
        id: Math.random().toString(36).substr(2, 9),
        firstName: '', lastName: '', dob: '', relation: 'Spouse', occupation: '', licenceType: 'Full UK'
      }] 
    });
  };

  const sendPolicyEmail = async (policy: Policy, email: string, firstName: string, lastName: string) => {
    // Small delay to ensure the hidden component is rendered
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!emailDocumentRef.current) return;
    
    try {
      const canvas = await html2canvas(emailDocumentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('policy-document-container');
          if (el) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            el.style.backgroundColor = '#ffffff';
            
            const allElements = el.querySelectorAll('*');
            allElements.forEach((node: any) => {
              if (node.style) {
                const style = window.getComputedStyle(node);
                const bg = style.backgroundColor;
                const color = style.color;
                const border = style.borderColor;
                
                if (bg.includes('oklch') || bg.includes('oklab')) node.style.backgroundColor = '#ffffff';
                if (color.includes('oklch') || color.includes('oklab')) node.style.color = '#000000';
                if (border.includes('oklch') || border.includes('oklab')) node.style.borderColor = '#e5e7eb';
              }
            });
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      const pdfBase64 = pdf.output('datauristring');

      await fetch('/api/send-policy-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pdfBase64,
          policyId: policy.displayId || policy.id,
          firstName,
          lastName
        })
      });
    } catch (error) {
      console.error("Background email generation failed:", error);
    }
  };

  const handleFinalBinding = async () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.firstName || !cardDetails.lastName) {
      alert("Please complete all Bank Card details to proceed with policy binding.");
      return;
    }
    
    setIsProcessing(true);
    try {
      let activeUserId = user?.id;
      let activeUser = user;
      
      if (!activeUserId) {
        const created = await signup(`${formData.firstName} ${formData.lastName}`, formData.email, authForm.password, {
          address_line1: formData.addressLine1,
          address_line2: formData.addressLine2,
          city: formData.city,
          county: formData.county,
          state: formData.state,
          country: formData.country,
          postcode: formData.postcode
        });
        if (!created) { setIsProcessing(false); return; }
        activeUser = JSON.parse(localStorage.getItem('sp_session') || '{}');
        activeUserId = activeUser?.id;
      }
      
      if (activeUserId && activeUser) {
        const lastFour = cardDetails.number.replace(/\s/g, '').slice(-4);
        const cardMeta = {
          cardLastFour: lastFour,
          cardholderName: `${cardDetails.firstName} ${cardDetails.lastName}`,
          cardExpiry: cardDetails.expiry
        };

        const durationDays = formData.policy_type === 'ONE_MONTH' ? 30 : 365;

        const createdPolicy = await bindPolicyManual(activeUserId, {
          vehicleType, 
          policy_type: formData.policy_type,
          duration: formData.duration,
          premium: premiumBreakdown.total.toFixed(2),
          paymentStatus: 'Paid',
          details: { 
            ...formData, 
            ...cardMeta,
            breakdown: premiumBreakdown, 
            expiryDate: new Date(Date.now() + (durationDays * 24 * 60 * 60 * 1000)).toISOString() 
          }
        });

        if (createdPolicy) {
          // Trigger background email sending
          setPolicyForEmail({ policy: createdPolicy, user: activeUser });
          // Fire and forget email sending
          sendPolicyEmail(createdPolicy, formData.email, formData.firstName, formData.lastName);
        }

        navigate('/portal');
      }
    } catch (e) { console.error(e); }
    finally { setIsProcessing(false); }
  };

  const StepHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) => (
    <div className="flex items-center gap-6 mb-12 border-b border-gray-50 pb-8">
      <div className="bg-[#e91e8c]/10 p-5 rounded-3xl text-[#e91e8c]">
        <Icon size={36} strokeWidth={2.5} />
      </div>
      <div>
        <h1 className="text-3xl font-bold font-outfit text-[#2d1f2d] tracking-tight">{title}</h1>
        <p className="text-gray-400 font-medium text-sm">{subtitle}</p>
      </div>
    </div>
  );

  const FormLabel = ({ label, required = false, tooltip = "" }: { label: string, required?: boolean, tooltip?: string }) => (
    <div className="flex items-center gap-2 mb-3">
      <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">
        {label} {required && <span className="text-[#e91e8c]">*</span>}
      </label>
      {tooltip && (
        <div className="group relative">
          <HelpCircle size={14} className="text-gray-300 cursor-help hover:text-[#e91e8c] transition-colors" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-4 bg-[#2d1f2d] text-white text-[10px] font-bold rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl leading-relaxed">
            {tooltip}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="animate-in fade-in duration-500 space-y-8">
            <StepHeader icon={UserIcon} title="Personal Information" subtitle="Step 1: Establishing the policy proposer identity." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <FormLabel label="Title & Name" required />
                  <div className="flex gap-3">
                    <select className="w-24 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}>
                      <option>Mr</option><option>Mrs</option><option>Ms</option><option>Dr</option>
                    </select>
                    <input className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="First Name" />
                  </div>
                </div>
                <div>
                  <FormLabel label="Last Name" required />
                  <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div>
                  <FormLabel label="Date of Birth" required />
                  <input type="date" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
                <div>
                  <FormLabel label="Marital Status" />
                  <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none" value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value})}>
                    <option>Married</option><option>Single</option><option>Divorced</option><option>Civil Partnered</option>
                  </select>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <FormLabel label="Occupation & Job Title" tooltip="Your primary employment role affects your risk profile." />
                  <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} placeholder="e.g. IT Consultant" />
                </div>
                <div className="relative">
                  <FormLabel label="Postcode" required />
                  <div className="relative">
                    <input className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none uppercase" placeholder="e.g. SW1A 1AA" value={formData.postcode} onChange={e => setFormData({...formData, postcode: e.target.value.toUpperCase()})} />
                    <button onClick={handleAddressLookup} disabled={isSearchingAddress} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[#2d1f2d] text-white rounded-xl hover:bg-black transition-all disabled:opacity-30">
                      {isSearchingAddress ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    </button>
                  </div>
                  {addressError && <p className="mt-2 text-[10px] font-bold text-red-500">{addressError}</p>}
                  {!showAddressFields && (
                    <button 
                      onClick={() => setShowAddressFields(true)}
                      className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#e91e8c] hover:underline flex items-center gap-1"
                    >
                      <Edit3 size={12} /> Enter address manually
                    </button>
                  )}
                  {addressResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-48 overflow-y-auto animate-in slide-in-from-top-2">
                      {addressResults.map((addr: any, i) => (
                        <button 
                          key={i} 
                          onClick={() => { 
                            setFormData({
                              ...formData, 
                              addressLine1: addr.line1, 
                              addressLine2: addr.line2,
                              city: addr.city,
                              county: addr.county,
                              state: addr.state,
                              country: addr.country
                            }); 
                            setAddressResults([]); 
                            setShowAddressFields(true);
                          }} 
                          className="w-full text-left px-6 py-4 text-sm font-bold text-gray-600 hover:bg-pink-50 hover:text-[#e91e8c] border-b border-gray-50 last:border-0"
                        >
                          {addr.full}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {showAddressFields && (
                  <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <FormLabel label="Address Line 1" required />
                      <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none" value={formData.addressLine1} onChange={e => setFormData({...formData, addressLine1: e.target.value})} placeholder="House number and street name" />
                    </div>
                    <div>
                      <FormLabel label="Address Line 2 (Optional)" />
                      <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none" value={formData.addressLine2} onChange={e => setFormData({...formData, addressLine2: e.target.value})} placeholder="Apartment, suite, unit, etc." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FormLabel label="City" required />
                        <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                      </div>
                      <div>
                        <FormLabel label="State / Province" required />
                        <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <FormLabel label="Country" required />
                      <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                    </div>
                  </div>
                )}
                <div>
                  <FormLabel label="Time at Current Address" />
                  <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none" value={formData.yearsAtAddress} onChange={e => setFormData({...formData, yearsAtAddress: e.target.value})}>
                    <option>0-1 Year</option><option>1-3 Years</option><option>3-5 Years</option><option>5+ Years</option>
                  </select>
                </div>
                <div>
                  <FormLabel label="Contact Email" required />
                  <input type="email" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="your@email.com" />
                </div>
              </div>
            </div>
            <div className="pt-10 flex justify-end">
              <button onClick={handleNext} disabled={!formData.firstName || !formData.lastName || !formData.postcode} className="px-14 py-6 bg-[#2d1f2d] text-white rounded-[32px] font-black uppercase tracking-[0.3em] text-xs flex items-center gap-4 hover:bg-black transition-all shadow-2xl disabled:opacity-30">Next: History <ChevronRight size={18} /></button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-in slide-in-from-right-8 duration-500 space-y-8">
            <StepHeader icon={Key} title="Driving History" subtitle="Step 2: Assessing road experience and licensing." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <FormLabel label="Driving Licence Type" required />
                  <div className="grid grid-cols-2 gap-4">
                    {['Full UK', 'Provisional UK', 'EU Licence', 'International'].map(type => (
                      <button key={type} onClick={() => setFormData({...formData, licenceType: type})} className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.licenceType === type ? 'border-[#e91e8c] bg-pink-50 text-[#e91e8c]' : 'border-gray-50 text-gray-400 hover:border-gray-200'}`}>
                        <p className="text-[10px] font-black uppercase tracking-widest">{type}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <FormLabel label="Years Driving Experience" />
                  <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none" value={formData.licenceHeldYears} onChange={e => setFormData({...formData, licenceHeldYears: e.target.value})}>
                    <option>0 (New Driver)</option><option>1</option><option>2</option><option>3</option><option>5</option><option>10+</option>
                  </select>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <FormLabel label="Endorsements or Points" tooltip="Declare any penalty points on your licence from the last 5 years." />
                  <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                    {[0, 3, 6, 9].map(p => (
                      <button key={p} onClick={() => setFormData({...formData, points: p})} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black transition-all ${formData.points === p ? 'bg-white text-[#e91e8c] shadow-md' : 'text-gray-400'}`}>{p} Points</button>
                    ))}
                    <button onClick={() => setFormData({...formData, points: 12})} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black transition-all ${formData.points >= 12 ? 'bg-white text-red-500 shadow-md' : 'text-gray-400'}`}>12+</button>
                  </div>
                </div>
                <div>
                  <FormLabel label="No Claims Discount (Years)" />
                  <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none" value={formData.ncbYears} onChange={e => setFormData({...formData, ncbYears: e.target.value})}>
                    <option>0</option><option>1</option><option>2</option><option>3</option><option>5</option><option>9+</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="pt-10 flex justify-between">
              <button onClick={handleBack} className="px-10 py-5 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-[#2d1f2d] transition-all flex items-center gap-2"><ChevronLeft size={16}/> Back</button>
              <button onClick={handleNext} className="px-14 py-6 bg-[#2d1f2d] text-white rounded-[32px] font-black uppercase tracking-[0.3em] text-xs flex items-center gap-4 hover:bg-black transition-all shadow-2xl">Step 3: Asset <ChevronRight size={18} /></button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-in fade-in duration-500 space-y-10">
            <StepHeader icon={Car} title="Vehicle Asset Verification" subtitle="Step 3: Official DVLA/MIB record lookup or manual configuration." />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'car', icon: Car, label: 'Private Car' },
                { id: 'van', icon: Truck, label: 'Commercial Van' },
                { id: 'motorcycle', icon: Bike, label: 'Motorcycle' }
              ].map(type => (
                <button key={type.id} onClick={() => setVehicleType(type.id as any)} className={`p-8 rounded-[32px] border-2 flex flex-col items-center gap-4 transition-all ${vehicleType === type.id ? 'border-[#e91e8c] bg-pink-50 text-[#e91e8c] shadow-lg' : 'border-gray-50 text-gray-400 hover:border-gray-200'}`}>
                  <type.icon size={32} />
                  <span className="font-black text-[10px] uppercase tracking-widest">{type.label}</span>
                </button>
              ))}
            </div>

            <div className="flex bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200 max-w-md mx-auto">
               <button onClick={() => setIsManualMode(false)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${!isManualMode ? 'bg-white text-[#e91e8c] shadow-md' : 'text-gray-400 hover:text-gray-600'}`}><Search size={14} /> Registry Lookup</button>
               <button onClick={() => setIsManualMode(true)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isManualMode ? 'bg-white text-[#e91e8c] shadow-md' : 'text-gray-400 hover:text-gray-600'}`}><Edit3 size={14} /> Manual Entry</button>
            </div>

            {!isManualMode ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-[24px] px-8 py-6 font-mono font-bold text-3xl uppercase tracking-[0.2em] outline-none focus:border-[#e91e8c] transition-all" placeholder='e.g. SG71 OYK' value={formData.vrm} onChange={e => setFormData({...formData, vrm: e.target.value.toUpperCase()})} />
                  <button onClick={handleLookup} disabled={isLookingUp || !formData.vrm} className="px-12 py-6 bg-[#2d1f2d] text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl disabled:opacity-30">
                    {isLookingUp ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />} Registry Lookup
                  </button>
                </div>
                {lookupError && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[11px] font-bold flex items-center gap-3 animate-in shake duration-300"><AlertCircle size={16}/> {lookupError}</div>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-500">
                <div><FormLabel label="Make" required /><input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold outline-none focus:border-[#e91e8c]" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value.toUpperCase()})} placeholder="e.g. FORD" /></div>
                <div><FormLabel label="Model" required /><input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold outline-none focus:border-[#e91e8c]" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value.toUpperCase()})} placeholder="e.g. FIESTA" /></div>
                <div><FormLabel label="Year of Manufacture" required /><input type="number" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold outline-none focus:border-[#e91e8c]" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="2022" /></div>
                <div><FormLabel label="Fuel Type" /><select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold outline-none focus:border-[#e91e8c]" value={formData.fuel_type} onChange={e => setFormData({...formData, fuel_type: e.target.value})}><option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select></div>
                <div><FormLabel label="Colour" /><input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold outline-none focus:border-[#e91e8c]" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} placeholder="e.g. Metallic Blue" /></div>
                <div><FormLabel label="Engine Size" /><input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold outline-none focus:border-[#e91e8c]" value={formData.engine_size} onChange={e => setFormData({...formData, engine_size: e.target.value})} placeholder="e.g. 1598cc" /></div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
               <div><FormLabel label="Estimated Value (£)" /><input type="number" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold outline-none focus:border-[#e91e8c]" value={formData.vehicleValue} onChange={e => setFormData({...formData, vehicleValue: e.target.value})} /></div>
               <div><FormLabel label="Annual Mileage" /><select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold outline-none focus:border-[#e91e8c]" value={formData.annualMileage} onChange={e => setFormData({...formData, annualMileage: e.target.value})}><option>3000</option><option>5000</option><option>8000</option><option>10000</option><option>15000</option><option>20000+</option></select></div>
            </div>

            <div className="pt-10 border-t border-gray-100 flex justify-between">
              <button onClick={handleBack} className="px-10 py-5 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-[#2d1f2d] transition-all flex items-center gap-2"><ChevronLeft size={16}/> Back</button>
              <button onClick={handleNext} disabled={!formData.make || !formData.model} className="px-14 py-6 bg-[#2d1f2d] text-white rounded-[32px] font-black uppercase tracking-[0.3em] text-xs flex items-center gap-4 hover:bg-black transition-all shadow-2xl disabled:opacity-30">Step 4: Coverage <ChevronRight size={18} /></button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="animate-in slide-in-from-right-8 duration-500 space-y-10">
            <StepHeader icon={ShieldCheck} title="Coverage Requirements" subtitle="Step 4: Customizing your policy protection level and term." />
            
            <div className="space-y-6">
              <FormLabel label="Select Insurance Product" required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setFormData({...formData, policy_type: 'ANNUAL', duration: '12 Months'})}
                  className={`p-8 rounded-[32px] border-2 text-left transition-all flex flex-col gap-2 ${formData.policy_type === 'ANNUAL' ? 'border-[#e91e8c] bg-pink-50 shadow-lg' : 'border-gray-50 text-gray-400 hover:border-gray-200'}`}
                >
                  <ShieldCheck size={28} className={formData.policy_type === 'ANNUAL' ? 'text-[#e91e8c]' : ''} />
                  <div>
                    <p className="font-black text-sm uppercase">Annual Insurance</p>
                    <p className="text-xs opacity-60">Full 12 months coverage with renewal options.</p>
                  </div>
                </button>
                <button 
                  onClick={() => setFormData({...formData, policy_type: 'ONE_MONTH', duration: '1 Month', paymentFrequency: 'annually'})}
                  className={`p-8 rounded-[32px] border-2 text-left transition-all flex flex-col gap-2 ${formData.policy_type === 'ONE_MONTH' ? 'border-[#e91e8c] bg-pink-50 shadow-lg' : 'border-gray-50 text-gray-400 hover:border-gray-200'}`}
                >
                  <CalendarDays size={28} className={formData.policy_type === 'ONE_MONTH' ? 'text-[#e91e8c]' : ''} />
                  <div>
                    <p className="font-black text-sm uppercase">1 Month Insurance</p>
                    <p className="text-xs opacity-60">Temporary 30-day coverage for flexibility.</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div><FormLabel label="Type of Cover" required /><div className="space-y-3">{['Comprehensive', 'Third Party, Fire & Theft', 'Third Party Only'].map(level => (<button key={level} onClick={() => setFormData({...formData, coverLevel: level})} className={`w-full p-6 rounded-3xl border-2 flex items-center justify-between text-left transition-all ${formData.coverLevel === level ? 'border-[#e91e8c] bg-pink-50' : 'border-gray-50 text-gray-400 hover:border-gray-200'}`}><span className="font-bold text-sm">{level}</span>{formData.coverLevel === level && <CheckCircle size={18} className="text-[#e91e8c]" />}</button>))}</div></div>
                <div><FormLabel label="Policy Start Date" /><input type="date" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold outline-none focus:border-[#e91e8c]" value={formData.policyStartDate} onChange={e => setFormData({...formData, policyStartDate: e.target.value})} /></div>
              </div>
              <div className="space-y-6">
                <div><FormLabel label="Voluntary Excess" /><select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold outline-none focus:border-[#e91e8c]" value={formData.voluntaryExcess} onChange={e => setFormData({...formData, voluntaryExcess: e.target.value})}><option>£0</option><option>£100</option><option>£250</option><option>£500</option><option>£1000</option></select></div>
                <div className="p-8 bg-[#2d1f2d] rounded-[40px] text-white"><h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e91e8c] mb-2">Pricing Matrix Update</h4><p className="text-xs text-white/50 leading-relaxed mb-6">Changing your excess or cover level updates your estimated premium in real-time.</p><div className="flex items-end gap-2"><span className="text-4xl font-black font-outfit tracking-tighter">£{premiumBreakdown.total.toFixed(0)}</span><span className="text-[10px] font-bold text-white/30 uppercase tracking-widest pb-1">/ {formData.duration === '1 Month' ? 'Total Cover' : 'Annual'}</span></div></div>
              </div>
            </div>
            <div className="pt-10 border-t border-gray-100 flex justify-between">
              <button onClick={handleBack} className="px-10 py-5 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-[#2d1f2d] transition-all flex items-center gap-2"><ChevronLeft size={16}/> Back</button>
              <button onClick={handleNext} className="px-14 py-6 bg-[#2d1f2d] text-white rounded-[32px] font-black uppercase tracking-[0.3em] text-xs flex items-center gap-4 hover:bg-black transition-all shadow-2xl">Step 5: Security <ChevronRight size={18} /></button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="animate-in fade-in duration-500 space-y-10">
            <StepHeader icon={Fingerprint} title="Security & Asset Safety" subtitle="Step 5: How the vehicle is protected when idle." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div><FormLabel label="Security Features" /><div className="grid grid-cols-1 gap-3">{[{ id: 'alarm', label: 'Factory Fitted Alarm', icon: <Activity size={16}/> }, { id: 'immobiliser', label: 'Immobiliser System', icon: <Lock size={16}/> }, { id: 'tracker', label: 'GPS Tracking Device', icon: <MapPin size={16}/> }].map(f => (<button key={f.id} onClick={() => { const features = [...formData.securityFeatures]; const idx = features.indexOf(f.id); if (idx > -1) features.splice(idx, 1); else features.push(f.id); setFormData({...formData, securityFeatures: features}); }} className={`p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${formData.securityFeatures.includes(f.id) ? 'border-[#e91e8c] bg-pink-50' : 'border-gray-50 hover:border-gray-200'}`}><div className="flex items-center gap-4"><div className={`p-2.5 rounded-lg ${formData.securityFeatures.includes(f.id) ? 'bg-[#e91e8c] text-white' : 'bg-gray-100 text-gray-400'}`}>{f.icon}</div><span className={`font-bold text-sm ${formData.securityFeatures.includes(f.id) ? 'text-[#e91e8c]' : 'text-gray-500'}`}>{f.label}</span></div>{formData.securityFeatures.includes(f.id) && <CheckCircle size={18} className="text-[#e91e8c]" />}</button>))}</div></div>
              </div>
              <div className="space-y-6">
                <div><FormLabel label="Parking Location" /><div className="grid grid-cols-2 gap-4">{['Driveway', 'Garage', 'On Street', 'Private Car Park'].map(p => (<button key={p} onClick={() => setFormData({...formData, overnightParking: p})} className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.overnightParking === p ? 'border-[#e91e8c] bg-pink-50 text-[#e91e8c]' : 'border-gray-50 text-gray-400 hover:border-gray-200'}`}><p className="text-[10px] font-black uppercase tracking-widest">{p}</p></button>))}</div></div>
                <div><FormLabel label="Ownership Status" /><select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[#2d1f2d] font-bold outline-none focus:border-[#e91e8c]" value={formData.ownership} onChange={e => setFormData({...formData, ownership: e.target.value})}><option>Owned Outright</option><option>Financed / Loan</option><option>Leased (Personal)</option><option>Leased (Business)</option></select></div>
              </div>
            </div>
            <div className="pt-10 border-t border-gray-100 flex justify-between">
              <button onClick={handleBack} className="px-10 py-5 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-[#2d1f2d] transition-all flex items-center gap-2"><ChevronLeft size={16}/> Back</button>
              <button onClick={handleNext} className="px-14 py-6 bg-[#2d1f2d] text-white rounded-[32px] font-black uppercase tracking-[0.3em] text-xs flex items-center gap-4 hover:bg-black transition-all shadow-2xl">Step 6: Drivers <ChevronRight size={18} /></button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="animate-in slide-in-from-right-8 duration-500 space-y-10">
            <StepHeader icon={Users} title="Additional Drivers" subtitle="Step 6: Adding family or colleagues to the policy." />
            <div className="space-y-6">{formData.additionalDrivers.map((driver, index) => (<div key={driver.id} className="p-10 bg-white border-2 border-gray-50 rounded-[48px] relative animate-in zoom-in-95 shadow-sm"><button onClick={() => setFormData({ ...formData, additionalDrivers: formData.additionalDrivers.filter(d => d.id !== driver.id) })} className="absolute top-10 right-10 p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={20}/></button><div className="grid grid-cols-1 md:grid-cols-3 gap-8"><div><FormLabel label="First Name" required /><input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#e91e8c]" value={driver.firstName} onChange={e => { const updated = [...formData.additionalDrivers]; updated[index].firstName = e.target.value; setFormData({ ...formData, additionalDrivers: updated }); }} /></div><div><FormLabel label="Last Name" required /><input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#e91e8c]" value={driver.lastName} onChange={e => { const updated = [...formData.additionalDrivers]; updated[index].lastName = e.target.value; setFormData({ ...formData, additionalDrivers: updated }); }} /></div><div><FormLabel label="Relation" /><select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#e91e8c]" value={driver.relation} onChange={e => { const updated = [...formData.additionalDrivers]; updated[index].relation = e.target.value; setFormData({ ...formData, additionalDrivers: updated }); }}><option>Spouse / Partner</option><option>Child</option><option>Parent</option><option>Employee</option></select></div></div></div>))}{formData.additionalDrivers.length < 3 && (<button onClick={addAdditionalDriver} className="w-full py-12 border-4 border-dashed border-gray-50 rounded-[48px] text-gray-300 font-black uppercase tracking-[0.2em] text-xs hover:border-[#e91e8c] hover:text-[#e91e8c] hover:bg-pink-50 transition-all flex items-center justify-center gap-4 group"><UserPlus size={24} className="group-hover:scale-110 transition-transform" /> Add Additional Driver</button>)}</div>
            <div className="pt-10 border-t border-gray-100 flex justify-between">
              <button onClick={handleBack} className="px-10 py-5 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-[#2d1f2d] transition-all flex items-center gap-2"><ChevronLeft size={16}/> Back</button>
              <button onClick={handleNext} className="px-14 py-6 bg-[#2d1f2d] text-white rounded-[32px] font-black uppercase tracking-[0.3em] text-xs flex items-center gap-4 hover:bg-black transition-all shadow-2xl">Step 7: History <ChevronRight size={18} /></button>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="animate-in slide-in-from-right-8 duration-500 space-y-10">
            <StepHeader icon={History} title="Insurance History" subtitle="Step 7: Disclosing previous cover and claims." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10"><div className="space-y-6"><div><FormLabel label="Currently Insured?" /><div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">{[true, false].map(val => (<button key={val.toString()} onClick={() => setFormData({...formData, isCurrentlyInsured: val})} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black transition-all ${formData.isCurrentlyInsured === val ? 'bg-[#2d1f2d] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>{val ? 'YES' : 'NO'}</button>))}</div></div><div><FormLabel label="Has Previous Cancellations?" /><div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">{[true, false].map(val => (<button key={val.toString()} onClick={() => setFormData({...formData, hasPreviousCancellations: val})} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black transition-all ${formData.hasPreviousCancellations === val ? 'bg-red-50 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>{val ? 'YES' : 'NO'}</button>))}</div></div></div><div className="space-y-6"><div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100"><h4 className="font-bold text-sm text-[#2d1f2d] mb-3 flex items-center gap-2"><ClipboardList size={18}/> Disclosure Registry</h4><p className="text-xs text-gray-400 leading-relaxed">SwiftPolicy cross-checks all historical data with the Claims and Underwriting Exchange (CUE). Accurate disclosure prevents future policy termination.</p></div></div></div>
            <div className="pt-10 border-t border-gray-100 flex justify-between">
              <button onClick={handleBack} className="px-10 py-5 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-[#2d1f2d] transition-all flex items-center gap-2"><ChevronLeft size={16}/> Back</button>
              <button onClick={handleNext} className="px-14 py-6 bg-[#2d1f2d] text-white rounded-[32px] font-black uppercase tracking-[0.3em] text-xs flex items-center gap-4 hover:bg-black transition-all shadow-2xl">Step 8: Payment <ChevronRight size={18} /></button>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="animate-in fade-in duration-500 space-y-10">
            <StepHeader icon={PaymentIcon} title="Payment Structure" subtitle="Step 8: Finalizing the premium settlement plan." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <FormLabel label="Payment Frequency" />
                  <div className="grid grid-cols-2 gap-4">
                    {[{ id: 'monthly', label: 'Monthly Direct Debit', desc: 'Spread the cost.', disabled: formData.policy_type === 'ONE_MONTH' }, { id: 'annually', label: 'Annual Payment', desc: 'Save on credit charges.' }].map(opt => (
                      <button 
                        key={opt.id} 
                        type="button"
                        disabled={opt.disabled}
                        onClick={() => setFormData({...formData, paymentFrequency: opt.id as any})} 
                        className={`p-6 rounded-[32px] border-2 text-left transition-all ${formData.paymentFrequency === opt.id ? 'border-[#e91e8c] bg-pink-50 shadow-md' : 'border-gray-50 text-gray-400 hover:border-gray-200'} ${opt.disabled ? 'opacity-30 grayscale cursor-not-allowed border-dashed' : 'cursor-pointer'}`}
                      >
                        <p className={`font-black text-[10px] uppercase tracking-widest mb-1 ${formData.paymentFrequency === opt.id ? 'text-[#e91e8c]' : 'text-gray-400'}`}>{opt.label}</p>
                        <p className="text-[11px] text-gray-400 font-medium">{opt.disabled ? 'Restricted for 1 Month Insurance' : opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100"><div className="flex items-center gap-4 mb-6"><div className="p-3 bg-white rounded-2xl shadow-sm"><Lock size={20} className="text-gray-400" /></div><p className="text-xs font-bold text-gray-500">Secure Direct Debit Gateway</p></div><p className="text-[10px] text-gray-400 leading-relaxed italic">Payment details are encrypted and handled via our FCA-compliant clearing partner. You will be prompted for secure verification in the next step.</p></div>
              </div>
              <div className="space-y-6">
                <div className="bg-[#2d1f2d] p-10 rounded-[56px] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#e91e8c]/10 rounded-bl-[80px]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e91e8c] mb-10">Premium Summary</p>
                  <div className="space-y-4 mb-12">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-40">
                      <span>Base Rate</span>
                      <span>£{premiumBreakdown.base.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-40">
                      <span>NCB Saving</span>
                      <span className="text-green-400">-£{Math.abs(premiumBreakdown.ncbDiscount).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span>Net Total</span>
                      <span className="text-2xl font-black font-outfit">£{premiumBreakdown.total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {formData.paymentFrequency === 'monthly' && formData.policy_type === 'ANNUAL' && (
                    <div className="mt-8 pt-8 border-t border-white/10 animate-in fade-in slide-in-from-top-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#e91e8c]">Monthly Installment</p>
                          <p className="text-3xl font-black font-outfit mt-1">£{(premiumBreakdown.total / 12).toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Total of 12 payments</p>
                          <p className="text-[10px] font-bold text-white/60 mt-1">0% APR Interest Free</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mt-8">
                    <Shield size={12}/> Guaranteed for 30 Days
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-10 border-t border-gray-100 flex justify-between">
              <button onClick={handleBack} className="px-10 py-5 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-[#2d1f2d] transition-all flex items-center gap-2"><ChevronLeft size={16}/> Back</button>
              <button onClick={handleNext} className="px-14 py-6 bg-[#2d1f2d] text-white rounded-[32px] font-black uppercase tracking-[0.3em] text-xs flex items-center gap-4 hover:bg-black transition-all shadow-2xl">Final Step: Options <ChevronRight size={18} /></button>
            </div>
          </div>
        );
      case 9:
        return (
          <div className="animate-in slide-in-from-right-8 duration-500 space-y-10">
            <StepHeader icon={Settings} title="Final Options & NCD" subtitle="Step 9: Reviewing supplementary policy benefits." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div><FormLabel label="NCD Bonus Protection" /><button onClick={() => setFormData({...formData, addons: {...formData.addons, protectedNcb: !formData.addons.protectedNcb}})} className={`w-full p-6 rounded-[32px] border-2 flex items-center justify-between text-left transition-all ${formData.addons.protectedNcb ? 'border-[#e91e8c] bg-pink-50 shadow-md' : 'border-gray-50 hover:border-gray-200'}`}><div className="flex items-center gap-4"><div className={`p-3 rounded-2xl ${formData.addons.protectedNcb ? 'bg-[#e91e8c] text-white' : 'bg-gray-100 text-gray-400'}`}><ShieldCheck size={20}/></div><p className="font-bold text-sm">Protect My Discount (+£35)</p></div>{formData.addons.protectedNcb && <CheckCircle size={18} className="text-[#e91e8c]" />}</button></div>
                <div><FormLabel label="Motoring Organization Member?" /><div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">{['None', 'AA', 'RAC', 'Other'].map(m => (<button key={m} onClick={() => {}} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black transition-all ${m === 'None' ? 'bg-[#2d1f2d] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>{m}</button>))}</div></div>
              </div>
              <div className="space-y-6">{!riskScanComplete ? (<button onClick={runRiskScan} disabled={isScanningRisk} className="w-full py-10 bg-[#2d1f2d] text-white rounded-[40px] font-black uppercase tracking-[0.3em] text-xs flex flex-col items-center justify-center gap-4 hover:bg-black transition-all shadow-xl group disabled:opacity-50">{isScanningRisk ? <Loader2 size={32} className="animate-spin text-[#e91e8c]" /> : <Shield size={32} className="text-[#e91e8c] group-hover:scale-110 transition-transform" />}{isScanningRisk ? 'Underwriting Analysis...' : 'Perform Final Risk Audit'}</button>) : (<div className="p-10 bg-green-50 border-2 border-green-100 rounded-[40px] flex items-center gap-6 animate-in zoom-in-95"><div className="w-16 h-16 bg-green-500 rounded-3xl flex items-center justify-center text-white shadow-lg"><CheckCircle2 size={32}/></div><div><p className="text-[10px] font-black uppercase text-green-600 tracking-widest mb-1">Audit Passed</p><p className="font-bold text-[#2d1f2d] text-lg">Underwriting verified.</p></div></div>)}</div>
            </div>
            <div className="pt-10 border-t border-gray-100 flex justify-between">
              <button onClick={handleBack} className="px-10 py-5 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-[#2d1f2d] transition-all flex items-center gap-2"><ChevronLeft size={16}/> Back</button>
              <button onClick={handleNext} disabled={!riskScanComplete} className="px-14 py-6 bg-[#2d1f2d] text-white rounded-[32px] font-black uppercase tracking-[0.3em] text-xs flex items-center gap-4 hover:bg-black transition-all shadow-2xl disabled:opacity-30">Review Final Quote <ChevronRight size={18} /></button>
            </div>
          </div>
        );
      case 10:
        return (
          <div className="animate-in zoom-in-95 duration-700 space-y-12">
             <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-2xl border-4 border-white"><ShieldCheck size={48}/></div>
                <h1 className="text-4xl font-black font-outfit text-[#2d1f2d] uppercase tracking-tighter">Agreement Finalized</h1>
                <p className="text-gray-400 font-medium">Agreement verified and ready for secure binding.</p>
             </div>

             <div className="bg-[#2d1f2d] rounded-[64px] p-10 md:p-16 text-white space-y-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#e91e8c]/5 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row justify-between items-center gap-8 border-b border-white/10 pb-12">
                   <div><p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-3">Total Amount Due</p><p className="text-6xl font-black font-outfit tracking-tighter">£{premiumBreakdown.total.toFixed(2)}</p></div>
                   <div className="flex flex-col items-center sm:items-end gap-2"><span className="px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Immediate Cover Enabled</span><p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Includes {riskConfig?.iptRate || 12}% IPT</p></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-5"><div className="flex justify-between text-xs font-black uppercase tracking-[0.2em]"><span className="opacity-40">Proposer</span><span>{formData.firstName} {formData.lastName}</span></div><div className="flex justify-between text-xs font-black uppercase tracking-[0.2em]"><span className="opacity-40">Vehicle</span><span className="text-[#e91e8c]">{formData.vrm}</span></div><div className="flex justify-between text-xs font-black uppercase tracking-[0.2em]"><span className="opacity-40">Product Type</span><span>{formData.policy_type === 'ONE_MONTH' ? '1 Month Insurance' : 'Annual Protection'}</span></div></div>
                   <div className="space-y-5"><div className="flex justify-between text-xs font-black uppercase tracking-[0.2em]"><span className="opacity-40">Settlement</span><span className="capitalize">{formData.paymentFrequency === 'annually' ? 'One-Time Payment' : 'Direct Debit'}</span></div><div className="flex justify-between text-xs font-black uppercase tracking-[0.2em]"><span className="opacity-40">Excess</span><span>{formData.voluntaryExcess}</span></div><div className="flex justify-between text-xs font-black uppercase tracking-[0.2em]"><span className="opacity-40">Duration</span><span>{formData.duration}</span></div></div>
                </div>

                <div className="pt-12 border-t border-white/10 space-y-8">
                   <div className="flex items-center gap-4">
                      <div className="bg-[#e91e8c]/10 p-3 rounded-2xl text-[#e91e8c]"><PaymentIcon size={24}/></div>
                      <div>
                        <h3 className="text-xl font-bold font-outfit uppercase tracking-widest">Premium Settlement</h3>
                        <p className="text-xs text-white/40 font-bold">Secure Bank Card Registration</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3"><FormLabel label="Card Number" required /><input className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#e91e8c]" placeholder="XXXX XXXX XXXX XXXX" value={cardDetails.number} onChange={e => setCardDetails({...cardDetails, number: e.target.value})} /></div>
                      <div className="space-y-3"><FormLabel label="Expiry Date (MM/YY)" required /><input className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#e91e8c]" placeholder="MM/YY" value={cardDetails.expiry} onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})} /></div>
                      <div className="space-y-3"><FormLabel label="Cardholder First Name" required /><input className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#e91e8c]" placeholder="First Name" value={cardDetails.firstName} onChange={e => setCardDetails({...cardDetails, firstName: e.target.value})} /></div>
                      <div className="space-y-3"><FormLabel label="Cardholder Surname" required /><input className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#e91e8c]" placeholder="Surname" value={cardDetails.lastName} onChange={e => setCardDetails({...cardDetails, lastName: e.target.value})} /></div>
                   </div>
                </div>

                {!user && (
                   <div className="space-y-6 pt-12 border-t border-white/10">
                      <div><FormLabel label="Final Security Verification" /><input type="password" placeholder="Create your secure access password" className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-8 py-6 outline-none focus:border-[#e91e8c] transition-all text-xl font-bold" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} /></div>
                   </div>
                )}
                
                <div className="flex flex-col md:flex-row gap-4 pt-6">
                  <button onClick={handleBack} className="md:w-1/3 py-8 bg-white/5 border border-white/10 text-white rounded-[40px] font-black uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-3"><ChevronLeft size={18} /> Review Details</button>
                  <button onClick={handleFinalBinding} disabled={isProcessing} className="flex-1 py-8 bg-[#e91e8c] text-white rounded-[40px] font-black uppercase tracking-[0.4em] text-sm hover:bg-[#c4167a] transition-all flex items-center justify-center gap-6 shadow-2xl active:scale-[0.98] disabled:opacity-50">{isProcessing ? <Loader2 size={24} className="animate-spin" /> : <>Bind Policy & Secure Cover <ArrowRight size={24}/></>}</button>
                </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fa] py-20 font-inter text-[#2d1f2d]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-20 overflow-x-auto pb-6 scrollbar-hide">
          <div className="flex justify-between items-center min-w-[900px] px-12 relative">
            <div className="absolute top-6 left-12 right-12 h-1 bg-gray-100 z-0" />
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
              <div key={s} className="relative z-10 flex flex-col items-center gap-4">
                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center font-black text-xs transition-all duration-700 border-4 ${step >= s ? 'bg-[#e91e8c] border-[#e91e8c] text-white shadow-2xl shadow-pink-900/40' : 'bg-white text-gray-200 border-gray-50'}`}>{step > s ? <CheckCircle size={28} strokeWidth={3} /> : s}</div>
                <span className={`text-[8px] font-black uppercase tracking-[0.2em] text-center whitespace-nowrap ${step >= s ? 'text-[#e91e8c]' : 'text-gray-300'}`}>{['Identity', 'History', 'Asset', 'Cover', 'Safety', 'Drivers', 'Registry', 'Billing', 'Final', 'Binding'][s-1]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-[80px] p-10 md:p-24 shadow-2xl shadow-pink-900/5 border border-gray-100 min-h-[750px] flex flex-col relative overflow-hidden"><div className="absolute top-0 right-0 w-64 h-64 bg-[#e91e8c]/5 rounded-bl-[200px] pointer-events-none" />{renderStep()}</div>
        
        {/* HIDDEN DOCUMENT GENERATOR FOR EMAIL ATTACHMENT */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '210mm' }}>
           {policyForEmail && (
             <PolicyDocumentView 
               policy={policyForEmail.policy} 
               user={policyForEmail.user} 
               documentRef={emailDocumentRef} 
             />
           )}
        </div>
      </div>
    </div>
  );
};

export default QuotePage;