
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Shield, ArrowRight, Mail, Lock, User, AlertCircle, CheckCircle2, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';

interface AuthErrors {
  [key: string]: string;
}

const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('reset');
  
  const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'reset'>(resetToken ? 'reset' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [formErrors, setFormErrors] = useState<AuthErrors>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { user, login, signup, requestPasswordReset, resetPasswordWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/customers');
  }, [user, navigate]);

  const validate = () => {
    const errors: AuthErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (view !== 'reset' && !emailRegex.test(email)) errors.email = 'Valid email is required';
    
    if (['login', 'signup', 'reset'].includes(view)) {
      if (password.length < 6) errors.password = 'Min 6 characters required';
    }

    if (view === 'signup' && (!name || name.length < 2)) errors.name = 'Full legal name required';
    
    if (view === 'reset' && password !== confirmPassword) {
      errors.confirmPassword = 'Keys do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validate()) return;
    setLoading(true);

    try {
      if (view === 'login') {
        const res = await login(email, password);
        if (res.success) {
          setSuccess('Access verified. Redirecting...');
          setTimeout(() => navigate('/customers'), 1000);
        } else {
          setError(res.message);
        }
      } else if (view === 'signup') {
        const res = await signup(name, email, password);
        if (res) {
          setSuccess('Enrollment successful. Redirecting to portal...');
          setTimeout(() => navigate('/customers'), 1500);
        } else {
          setError('Email domain already registered or reserved.');
        }
      } else if (view === 'forgot') {
        const found = await requestPasswordReset(email);
        if (found) {
          setSuccess('Recovery link dispatched. Check your inbox.');
        } else {
          setError('No associated account found.');
        }
      } else if (view === 'reset') {
        const ok = await resetPasswordWithToken(resetToken || '', password);
        if (ok) {
          setSuccess('Credentials updated. Returning to login...');
          setTimeout(() => {
            navigate('/auth');
            setView('login');
          }, 2000);
        } else {
          setError('Link expired or token invalid.');
        }
      }
    } catch (err) {
      setError('Operational error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label: string, field: string, value: string, setValue: (val: string) => void, placeholder: string, type: string = 'text', Icon: any) => {
    const isInvalid = !!formErrors[field];
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-[#2d1f2d]/30 ml-1">{label}</label>
        <div className="relative">
          <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isInvalid ? 'text-red-400' : 'text-[#e91e8c]/30'}`} size={18} />
          <input
            type={inputType}
            required
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (formErrors[field]) {
                const newErrors = { ...formErrors };
                delete newErrors[field];
                setFormErrors(newErrors);
              }
            }}
            className={`w-full border rounded-2xl pl-12 pr-${isPassword ? '12' : '6'} py-4 text-base focus:outline-none transition-all ${
              isInvalid ? 'bg-red-50 border-red-200 focus:border-red-400' : 'bg-gray-50 border-gray-100 focus:border-[#e91e8c]'
            }`}
            placeholder={placeholder}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e91e8c] transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {isInvalid && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1 ml-1"><AlertCircle size={10} /> {formErrors[field]}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#faf8fa] flex items-center justify-center p-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <Link to="/" className="inline-flex bg-[#2d1f2d] p-4 rounded-2xl shadow-xl mb-6">
            <Shield className="text-[#e91e8c] h-8 w-8" />
          </Link>
          <h1 className="text-4xl font-bold text-[#2d1f2d] mb-2 font-outfit">
            {view === 'login' ? 'Portal Access' : view === 'signup' ? 'New Enrollment' : view === 'forgot' ? 'Recovery' : 'Reset Keys'}
          </h1>
          <p className="text-gray-400 font-medium">
            {view === 'login' ? 'Enter your secure keys to continue' : 'Secure, regulated policy management'}
          </p>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            {(error || success) && (
              <div className={`p-5 rounded-2xl flex items-center gap-4 text-xs font-bold ${error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {error || success}
              </div>
            )}

            {view === 'signup' && renderField('Legal Full Name', 'name', name, setName, 'Johnathan Swift', 'text', User)}
            {view !== 'reset' && renderField('Account Email', 'email', email, setEmail, 'email@address.com', 'email', Mail)}

            {['login', 'signup', 'reset'].includes(view) && (
              <div className="space-y-6">
                {renderField(view === 'reset' ? 'New Access Key' : 'Access Key', 'password', password, setPassword, '••••••••', 'password', Lock)}
                {view === 'reset' && renderField('Confirm Access Key', 'confirmPassword', confirmPassword, setConfirmPassword, '••••••••', 'password', KeyRound)}
                {view === 'login' && (
                   <div className="flex justify-end pr-1">
                      <button type="button" onClick={() => setView('forgot')} className="text-[10px] font-black uppercase tracking-widest text-[#e91e8c] hover:underline">Forgot Access Key?</button>
                   </div>
                )}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#2d1f2d] text-white rounded-2xl py-5 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>{view === 'login' ? 'Verify & Enter' : view === 'signup' ? 'Complete Enrollment' : 'Send Recovery Link'} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-50 text-center">
            {view === 'login' ? (
              <button onClick={() => setView('signup')} className="text-sm font-bold text-[#e91e8c] hover:underline">New user? Enroll today</button>
            ) : (
              <button onClick={() => setView('login')} className="text-sm font-bold text-[#e91e8c] hover:underline">Return to portal entry</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
