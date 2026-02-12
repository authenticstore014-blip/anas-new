
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Twitter, Linkedin, Facebook, Instagram, Mail, Phone, MapPin, Award, CheckCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const footerLinks = {
    insurance: [
      { label: "Car Insurance", href: "/quote" },
      { label: "Motorcycle Insurance", href: "/quote" },
      { label: "Van Insurance", href: "/quote" },
    ],
    customers: [
      { label: "Manage policy", href: "/customers" },
      { label: "Make a claim", href: "/contact" },
      { label: "Track a claim", href: "/customers" },
      { label: "Renew policy", href: "/customers" },
    ],
    help: [
      { label: "Contact us", href: "/contact" },
      { label: "FAQs", href: "/help" },
      { label: "Help center", href: "/help" },
      { label: "Complaints", href: "/complaints" },
    ],
    about: [
      { label: "About us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
  };

  return (
    <footer className="bg-[#2d1f2d] text-white pt-20 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Regulatory Trust Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 p-8 bg-white/5 rounded-[40px] border border-white/10 items-center">
          <div className="flex items-center gap-4">
             <div className="bg-[#e91e8c]/20 p-3 rounded-2xl">
               <Award className="text-[#e91e8c] h-8 w-8" />
             </div>
             <div>
               <h4 className="font-bold text-sm">FCA Regulated</h4>
               <p className="text-[10px] text-white/40 uppercase tracking-widest">FRN: 481413</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-[#e91e8c]/20 p-3 rounded-2xl">
               <Shield className="text-[#e91e8c] h-8 w-8" />
             </div>
             <div>
               <h4 className="font-bold text-sm">PRA Authorised</h4>
               <p className="text-[10px] text-white/40 uppercase tracking-widest">Compliant Standards</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-green-500/20 p-3 rounded-2xl">
               <CheckCircle className="text-green-500 h-8 w-8" />
             </div>
             <div>
               <h4 className="font-bold text-sm">FSCS Protected</h4>
               <p className="text-[10px] text-white/40 uppercase tracking-widest">Customer Security</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
          <div className="lg:col-span-1 space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-[#e91e8c] p-1.5 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-outfit">SwiftPolicy</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed">
              Award-winning insurance with real-time regulatory compliance. Built for your speed.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, idx) => (
                <a key={idx} href="#" className="text-white/20 hover:text-[#e91e8c] transition-colors">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Insurance</h4>
            <ul className="space-y-3">
              {footerLinks.insurance.map((link) => (
                <li key={link.label}><Link to={link.href} className="text-white/40 hover:text-[#e91e8c] transition-colors text-sm font-medium">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Customers</h4>
            <ul className="space-y-3">
              {footerLinks.customers.map((link) => (
                <li key={link.label}><Link to={link.href} className="text-white/40 hover:text-[#e91e8c] transition-colors text-sm font-medium">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.label}><Link to={link.href} className="text-white/40 hover:text-[#e91e8c] transition-colors text-sm font-medium">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">About</h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.label}><Link to={link.href} className="text-white/40 hover:text-[#e91e8c] transition-colors text-sm font-medium">{link.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-12 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs text-white/30 font-medium">© 2026 SwiftPolicy Insurance Services</p>
            <div className="flex flex-wrap gap-8 text-[10px] font-black uppercase tracking-widest text-white/30">
              <Link to="/privacy" className="hover:text-[#e91e8c]">Privacy</Link>
              <Link to="/terms" className="hover:text-[#e91e8c]">Terms</Link>
              <Link to="/cookies" className="hover:text-[#e91e8c]">Cookies</Link>
              <Link to="/complaints" className="hover:text-[#e91e8c]">Complaints</Link>
            </div>
          </div>
          
          <div className="bg-white/5 p-8 rounded-[32px] border border-white/10">
            <div className="text-[11px] text-white/40 leading-relaxed space-y-4">
              <p>SwiftPolicy Insurance Services is child company of AUTOLINE DIRECT INSURANCE CONSULTANTS LIMITED, authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority. Firm Reference Number: 481413.</p>
              <p>Registered in England No NI020828. Registered Office: Crown House, 27 Old Gloucester Street, London WC1N 3AX, UK. Telephone: 0203 137 1752.</p>
              <p>The Financial Services Compensation Scheme (FSCS) may apply to your policy if we cannot meet our obligations. This depends on the type of business and the circumstances of the claim.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
