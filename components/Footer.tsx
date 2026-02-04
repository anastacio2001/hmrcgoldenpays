
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-navy text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="space-y-4">
            <h3 className="font-serif text-2xl">GOLDENPAYS LTD</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Excellence in technological architecture and financial management. Providing boutique consultancy for global enterprises.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest text-gold">NAVIGATION</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link to="/about" className="hover:text-white transition-all duration-200 hover:translate-x-1">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition-all duration-200 hover:translate-x-1">Services</Link></li>
              <li><Link to="/methodology" className="hover:text-white transition-all duration-200 hover:translate-x-1">Methodology</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-all duration-200 hover:translate-x-1">Contact</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest text-gold">LEGAL</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link to="/legal/terms" className="hover:text-white transition-all duration-200 hover:translate-x-1">Terms & Conditions</Link></li>
              <li><Link to="/legal/privacy" className="hover:text-white transition-all duration-200 hover:translate-x-1">Privacy Policy</Link></li>
              <li><Link to="/legal/disclaimer" className="hover:text-white transition-all duration-200 hover:translate-x-1">Professional Disclaimer</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest text-gold">REGULATORY COMPLIANCE</h4>
            <div className="text-sm text-slate-300 space-y-3">
              <p>
                <span className="block font-semibold text-white">Registered Office:</span>
                Office 12 Initial Business Centre, Wilson Business Park, Manchester, UK, M40 8WN.
              </p>
              <p>
                <span className="block font-semibold text-white">Company Number:</span>
                16227513 (Registered in England & Wales)
              </p>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} GOLDENPAYS LTD. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-6">
            <span className="italic text-slate-400 uppercase tracking-tighter">B2B & Private Referral Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
