
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, Phone, MapPin, Globe, Send, CheckCircle2, 
  AlertCircle, ShieldCheck, Loader2, MessageSquare,
  HelpCircle, Sparkles, ChevronDown, CheckCircle, Clock, RefreshCw, X
} from 'lucide-react';
import { InquiryType } from '../types';
import { useLocation, Link } from 'react-router-dom';

const CATEGORIES: InquiryType[] = ['General', 'Quote', 'Payment', 'Claim', 'Technical', 'Feedback'];

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  captcha?: string;
  consent?: string;
}

const ContactPage: React.FC = () => {
  const { submitInquiry } = useAuth();
  const location = useLocation();
  const formRef = useRef<HTMLDivElement>(null);
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Anti-bot state
  const [honeypot, setHoneypot] = useState('');
  const [captcha, setCaptcha] = useState({ q: '', a: 0 });
  const [userCaptcha, setUserCaptcha] = useState('');

  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    subject: '', 
    type: 'General' as InquiryType,
    message: '',
    consent: false
  });

  const generateCaptcha = useCallback(() => {
    const num1 = Math.floor(Math.random() * 12) + 1;
    const num2 = Math.floor(Math.random() * 12) + 1;
    setCaptcha({ q: `${num1} + ${num2}`, a: num1 + num2 });
    setUserCaptcha('');
  }, []);

  useEffect(() => {
    generateCaptcha();
    if (location.hash === '#contact-form' && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location, generateCaptcha]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => !phone || /^(\+44|0)7\d{9}$|^(\+44|0)\d{9,10}$/.test(phone.replace(/\s/g, ''));

  const validateForm = (isFinal: boolean = false): boolean => {
    const errors: FormErrors = {};
    
    if (formData.name.trim().length < 3) {
      errors.name = "Full legal name is required (minimum 3 characters).";
    }

    if (!validateEmail(formData.email)) {
      errors.email = "Please provide a valid email address.";
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = "Invalid UK phone number format.";
    }

    if (formData.subject.trim().length < 5) {
      errors.subject = "Subject must be at least 5 characters.";
    }

    if (formData.message.trim().length < 20) {
      errors.message = "Please describe your inquiry in more detail (min 20 characters).";
    }

    if (isFinal) {
      if (parseInt(userCaptcha) !== captcha.a) {
        errors.captcha = "Verification calculation is incorrect.";
      }

      if (!formData.consent) {
        errors.consent = "You must agree to the data processing terms.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setTouched({
      name: true, email: true, subject: true, message: true, captcha: true, consent: true
    });

    // Bot detection (Honeypot) - silent fail for bots
    if (honeypot) return; 

    if (!validateForm(true)) {
      setGeneralError("Please review the form and correct any errors.");
      return;
    }

    setIsLoading(true);

    try {
      const success = await submitInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        type: formData.type,
        message: formData.message,
        consent: formData.consent
      });

      if (success) {
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error("Persistence error");
      }
    } catch (err) {
      setGeneralError("Network failure. Your message could not be sent. Please try again or call our support line.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fa] py-20">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e91e8c]/5 text-[#e91e8c] text-xs font-black uppercase tracking-widest mb-6">
            <Sparkles size={14} /> Official Support Line
          </div>
          <h1 className="text-4xl md:text-7xl font-bold font-outfit mb-6 text-[#2d1f2d] tracking-tighter">How can we help?</h1>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed">
            Direct routing to our specialist teams. Monitored 24/7 at <span className="text-[#e91e8c] font-black underline decoration-2 underline-offset-4">info@swiftpolicy.co.uk</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12" id="contact-form" ref={formRef}>
          
          <div className="lg:col-span-2">
            <div className="bg-white p-10 md:p-16 rounded-[64px] border border-gray-100 shadow-2xl relative overflow-hidden transition-all duration-700">
              
              {isSubmitted ? (
                <div className="text-center animate-in zoom-in-95 duration-500 py-16">
                  <div className="w-24 h-24 bg-green-50 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-green-100 shadow-xl shadow-green-900/5">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </div>
                  <h2 className="text-4xl font-bold text-[#2d1f2d] mb-6 font-outfit">Transmission Successful</h2>
                  <p className="text-gray-500 text-xl max-w-md mx-auto mb-12 leading-relaxed">
                    Your inquiry has been logged and routed to <span className="font-black text-[#2d1f2d]">info@swiftpolicy.co.uk</span>. 
                    <br/><br/>
                    A case reference has been sent to your email.
                  </p>
                  <button 
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ ...formData, subject: '', message: '', consent: false });
                      setTouched({});
                      generateCaptcha();
                    }}
                    className="px-12 py-5 bg-[#2d1f2d] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#e91e8c]/10 rounded-2xl flex items-center justify-center text-[#e91e8c]">
                        <MessageSquare size={28} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold font-outfit text-[#2d1f2d]">Secure Message Box</h2>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-[0.2em]">FCA Complaint & Secure</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end">
                      <Clock className="text-[#e91e8c] mb-1" size={18} />
                      <p className="text-lg font-bold text-[#e91e8c]">~14m Reply</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                    
                    {generalError && (
                      <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 text-sm font-bold animate-in shake duration-300">
                        <AlertCircle size={20} /> {generalError}
                      </div>
                    )}

                    <input type="text" className="hidden" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} autoComplete="off" aria-hidden="true" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Name Field */}
                      <div className="space-y-3">
                        <label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Full Legal Name *</label>
                        <input 
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          onBlur={() => handleBlur('name')}
                          className={`w-full border rounded-2xl px-6 py-5 text-[#2d1f2d] font-bold outline-none transition-all ${
                            touched.name && fieldErrors.name ? 'border-red-400 bg-red-50' : 'bg-gray-50 border-gray-100 focus:border-[#e91e8c] focus:bg-white'
                          }`}
                          placeholder="First & Last Name" 
                        />
                        {touched.name && fieldErrors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.name}</p>}
                      </div>

                      {/* Email Field */}
                      <div className="space-y-3">
                        <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Contact Email *</label>
                        <input 
                          id="email"
                          required
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          onBlur={() => handleBlur('email')}
                          className={`w-full border rounded-2xl px-6 py-5 text-[#2d1f2d] font-bold outline-none transition-all ${
                            touched.email && fieldErrors.email ? 'border-red-400 bg-red-50' : 'bg-gray-50 border-gray-100 focus:border-[#e91e8c] focus:bg-white'
                          }`}
                          placeholder="your@email.com" 
                        />
                        {touched.email && fieldErrors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.email}</p>}
                      </div>

                      {/* Phone Field */}
                      <div className="space-y-3">
                        <label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Phone Number</label>
                        <input 
                          id="phone"
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          onBlur={() => handleBlur('phone')}
                          className={`w-full border rounded-2xl px-6 py-5 text-[#2d1f2d] font-bold outline-none transition-all ${
                            touched.phone && fieldErrors.phone ? 'border-red-400 bg-red-50' : 'bg-gray-50 border-gray-100 focus:border-[#e91e8c] focus:bg-white'
                          }`}
                          placeholder="e.g. 07123 456789" 
                        />
                        {touched.phone && fieldErrors.phone && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.phone}</p>}
                      </div>

                      {/* Category Selector */}
                      <div className="space-y-3">
                        <label htmlFor="type" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Inquiry Type *</label>
                        <div className="relative">
                          <select 
                            id="type"
                            required
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value as InquiryType})}
                            className="w-full appearance-none bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none transition-all cursor-pointer pr-12"
                          >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c} Support</option>)}
                          </select>
                          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={20} />
                        </div>
                      </div>

                      {/* Subject Field */}
                      <div className="space-y-3 md:col-span-2">
                        <label htmlFor="subject" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Inquiry Subject *</label>
                        <input 
                          id="subject"
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          onBlur={() => handleBlur('subject')}
                          className={`w-full border rounded-2xl px-6 py-5 text-[#2d1f2d] font-bold outline-none transition-all ${
                            touched.subject && fieldErrors.subject ? 'border-red-400 bg-red-50' : 'bg-gray-50 border-gray-100 focus:border-[#e91e8c] focus:bg-white'
                          }`}
                          placeholder="Briefly describe the reason for contact" 
                        />
                        {touched.subject && fieldErrors.subject && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.subject}</p>}
                      </div>

                      {/* Message Field */}
                      <div className="space-y-3 md:col-span-2">
                        <label htmlFor="message" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Full Message / Inquiry *</label>
                        <textarea 
                          id="message"
                          required
                          rows={6} 
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          onBlur={() => handleBlur('message')}
                          className={`w-full border rounded-[32px] px-8 py-6 text-[#2d1f2d] font-medium outline-none transition-all resize-none ${
                            touched.message && fieldErrors.message ? 'border-red-400 bg-red-50' : 'bg-gray-50 border-gray-100 focus:border-[#e91e8c] focus:bg-white'
                          }`}
                          placeholder="Please provide full details of your inquiry..."
                        ></textarea>
                        {touched.message && fieldErrors.message && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.message}</p>}
                      </div>
                    </div>

                    {/* CAPTCHA and Consent Section */}
                    <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 space-y-8">
                      {/* Math CAPTCHA */}
                      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Security Check</span>
                            <div className="flex items-center gap-3">
                               <div className="px-4 py-2 bg-[#2d1f2d] text-[#e91e8c] rounded-xl font-black text-xl font-mono tracking-tighter">
                                 {captcha.q} = ?
                               </div>
                               <button type="button" onClick={generateCaptcha} className="p-2 text-gray-300 hover:text-[#e91e8c] transition-colors" title="New Challenge">
                                  <RefreshCw size={18} />
                               </button>
                            </div>
                         </div>
                         <div className="flex-grow space-y-1">
                            <input 
                               required
                               type="number"
                               value={userCaptcha}
                               onChange={(e) => setUserCaptcha(e.target.value)}
                               className={`w-full border rounded-xl px-4 py-3 font-black text-lg text-center outline-none ${
                                 touched.captcha && fieldErrors.captcha ? 'border-red-400' : 'border-gray-100 focus:border-[#e91e8c]'
                               }`}
                               placeholder="Result"
                            />
                            {touched.captcha && fieldErrors.captcha && <p className="text-[9px] text-red-500 font-bold text-center">{fieldErrors.captcha}</p>}
                         </div>
                      </div>

                      {/* Consent Checkbox */}
                      <div className="space-y-3">
                        <label className="flex items-start gap-4 cursor-pointer group">
                          <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                            formData.consent ? 'bg-[#e91e8c] border-[#e91e8c]' : (touched.consent && fieldErrors.consent ? 'border-red-400' : 'border-gray-200')
                          }`}>
                            {formData.consent && <CheckCircle className="text-white" size={16} />}
                          </div>
                          <input type="checkbox" className="hidden" checked={formData.consent} onChange={(e) => setFormData({...formData, consent: e.target.checked})} />
                          <span className="text-sm font-bold text-gray-600 leading-relaxed">
                            I understand that my inquiry will be routed to <span className="text-[#e91e8c]">info@swiftpolicy.co.uk</span> and stored in accordance with the <Link to="/privacy" className="text-[#e91e8c] underline">Privacy Policy</Link>.
                          </span>
                        </label>
                        {touched.consent && fieldErrors.consent && <p className="text-[10px] text-red-500 font-bold ml-10">{fieldErrors.consent}</p>}
                      </div>
                    </div>

                    <button 
                      disabled={isLoading}
                      className="w-full py-6 bg-[#2d1f2d] text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-4 shadow-xl disabled:opacity-50 hover:bg-black group"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                           <Loader2 className="animate-spin" size={20} />
                           <span>Logging Transaction...</span>
                        </div>
                      ) : (
                        <>Transmit Message <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-xl space-y-10">
              <h3 className="text-2xl font-bold font-outfit text-[#2d1f2d]">Expert Support</h3>
              
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[#e91e8c]/10 flex items-center justify-center text-[#e91e8c]">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-1">UK Phone Line</p>
                  <p className="text-xl font-bold text-[#2d1f2d]">0203 137 1752</p>
               </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Official Domain</p>
                  <p className="text-xl font-bold text-[#2d1f2d] break-all">info@swiftpolicy.co.uk</p>
                </div>
              </div>
            </div>

            <div className="bg-[#2d1f2d] p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
              <MapPin className="text-[#e91e8c] mb-6" size={32} />
              <h3 className="text-2xl font-bold font-outfit mb-6">Headquarters</h3>
              <p className="text-lg text-white/70 leading-relaxed font-bold">
                Crown House,<br />
                27 Old Gloucester Street,<br />
                London WC1N 3AX, UK
              </p>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#e91e8c]/10 rounded-full blur-3xl" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
