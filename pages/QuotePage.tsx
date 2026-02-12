
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Car, ShieldCheck, ArrowRight, Loader2,
  AlertCircle, Bike, Search, ChevronDown, Lock, CheckCircle, Database, AlertOctagon,
  Globe, ExternalLink
} from 'lucide-react';
import { QuoteData, PaymentRecord, EnforcedInsuranceType } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const INITIAL_STATE: QuoteData = {
  vrm: '', 
  insurance_type: '',
  make: '', model: '', year: '', fuelType: '', transmission: '', bodyType: '', engineSize: '', seats: '',
  isImported: false, annualMileage: '8000', usageType: 'Social, Domestic & Pleasure', ownership: 'Owned',
  isModified: false, modifications: '', securityFeatures: [], overnightParking: 'Driveway',
  title: 'Mr', firstName: '', lastName: '', dob: '', gender: 'Male', maritalStatus: 'Married', ukResident: true,
  yearsInUk: 'Born in UK', occupation: '', employmentStatus: 'Employed', industry: '',
  licenceType: 'Full UK', licenceHeldYears: '5+', licenceDate: '', hasMedicalConditions: false,
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
  const { user, signup, queueMIDSubmission, generatePolicyPDF } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuoteData>(INITIAL_STATE);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupSuccess, setLookupSuccess] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalQuote, setFinalQuote] = useState<number | null>(null);
  const [groundingSources, setGroundingSources] = useState<{title: string, uri: string}[]>([]);

  const validateVRM = (vrm: string) => {
    const normalized = vrm.replace(/\s/g, '').toUpperCase();
    return /^[A-Z]{2}[0-9]{2}[A-Z]{3}$|^[A-Z][0-9]{1,3}[A-Z]{3}$|^[A-Z]{3}[0-9]{1,3}[A-Z]$|^[0-9]{1,4}[A-Z]{1,2}$|^[0-9]{1,3}[A-Z]{1,3}$|^[A-Z]{1,2}[0-9]{1,4}$|^[A-Z]{1,3}[0-9]{1,3}$/.test(normalized);
  };

  if (user && ['Frozen', 'Blocked', 'Removed', 'Deleted'].includes(user.status)) {
    return (
      <div className="min-h-screen bg-[#faf8fa] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[64px] p-16 text-center shadow-2xl border border-gray-100 animate-in zoom-in-95">
           <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-10">
              <Lock size={48} />
           </div>
           <h2 className="text-3xl font-bold text-[#2d1f2d] font-outfit mb-6">Service Restriction</h2>
           <p className="text-gray-500 mb-10 leading-relaxed font-medium">Policy acquisition is restricted for your account status: <span className="text-red-600 font-black">{user.status}</span>. Please contact administrative support.</p>
           <button onClick={() => navigate('/customers')} className="w-full py-5 bg-[#2d1f2d] text-white rounded-2xl font-black uppercase tracking-widest text-xs">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const executeBindingQuoteGeneration = (type: EnforcedInsuranceType): number => {
    let quote = 0;
    const randomSeed = Math.random();

    if (type === 'Comprehensive Cover') {
      quote = 3000 + (randomSeed * 999);
    } else if (type === 'Third Party Insurance') {
      quote = 1400 + (randomSeed * 1500);
    } else if (type === 'Motorcycle Insurance') {
      quote = 500 + (randomSeed * 500);
    }

    if (type === 'Motorcycle Insurance') {
      if (quote < 500) quote = 500;
    } else {
      if (quote < 1400) quote = 1400;
    }
    
    if (quote > 3999) quote = 3999;
    const finalVal = Math.round(quote);
    if (finalVal < 500 || finalVal > 3999 || finalVal === 0) throw new Error("SYSTEM INVALID: CALCULATION OUT OF BOUNDS");
    return finalVal;
  };

  const handleLookup = async () => {
    const vrmInput = formData.vrm.replace(/\s/g, '').toUpperCase();
    if (!vrmInput) return;
    
    if (!validateVRM(vrmInput)) {
      setLookupError("Invalid UK registration format. Check VRM.");
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);
    setLookupSuccess(false);
    setGroundingSources([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `
        You are a self-contained vehicle lookup module for a UK motor insurance website.
        Search for real-time UK DVLA data for the provided registration.
        Return ONLY valid JSON with exactly these fields: 
        registration_number, vehicle_category, make, model, body_type, fuel_type, 
        engine_capacity_cc, year_of_manufacture, colour, transmission, mot_status, 
        mot_expiry_date, tax_status, dvla_data_confirmed.
        If any data is unknown, use null.
        Return ONLY valid JSON. No conversational text.
      `.trim();

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Fetch official DVLA specifications for registration: ${vrmInput}`,
        config: {
          systemInstruction,
          tools: [{googleSearch: {}}],
        }
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks
        .filter(c => c.web)
        .map(c => ({ title: c.web.title || 'Official Record', uri: c.web.uri }));
      setGroundingSources(sources);

      const rawText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(rawText);

      if (data.error || !data.make) {
        setLookupError(data.error || "Vehicle not found in official UK records.");
        setIsLookingUp(false);
        return;
      }

      setFormData(prev => ({ 
        ...prev, 
        make: data.make, 
        model: data.model, 
        year: data.year_of_manufacture,
        fuelType: data.fuel_type,
        bodyType: data.body_type,
        engineSize: data.engine_capacity_cc,
        vrm: data.registration_number || vrmInput,
        transmission: data.transmission
      }));
      setLookup