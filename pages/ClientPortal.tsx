
import React from 'react';

const ClientPortal: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-slate-100">
      <div className="max-w-md w-full px-6">
        <div className="bg-white shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-navy p-8 text-center">
            <h2 className="text-white font-serif text-2xl">Client Portal</h2>
            <p className="text-slate-400 text-xs mt-2 uppercase tracking-[0.2em]">Secure Access Required</p>
          </div>
          
          <div className="p-8">
            <div className="mb-6 p-4 bg-amber-50 border border-amber-100 text-amber-800 text-xs leading-relaxed">
              <strong>CONFIDENTIALITY NOTICE:</strong> Due to the sensitive nature of our infrastructure and financial consultancy, project documentation is strictly restricted to verified stakeholders.
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Reference ID</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm transition-all"
                  placeholder="Enter Corporate ID"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Access Token</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm transition-all"
                  placeholder="••••••••••••"
                />
              </div>
              <button className="w-full bg-navy text-white py-4 text-xs font-bold tracking-widest hover:bg-slate-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                AUTHORIZE ACCESS
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-slate-400">
                Forgotten credentials? <a href="#" className="text-gold hover:underline">Contact your Account Director</a>
              </p>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Encrypted Connection Active (AES-256)</span>
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-400">
          Access is monitored. Unauthorized attempts are logged for security compliance.
        </p>
      </div>
    </div>
  );
};

export default ClientPortal;
