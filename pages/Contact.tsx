
import React, { useState } from 'react';
import Toast from '../components/Toast';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    inquiry: '',
    message: '',
    consent: false,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consent) {
      setToast({ show: true, message: 'Please acknowledge the terms before submitting.', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      // Map form data to API format
      const apiData = {
        name: formData.fullName,
        company: formData.company,
        email: formData.email,
        service: formData.inquiry || 'General Inquiry',
        message: formData.message
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit inquiry');
      }

      setToast({ 
        show: true, 
        message: 'Your formal inquiry has been received. Our team will review and respond within 2 business days.', 
        type: 'success' 
      });
      
      // Reset form
      setFormData({
        fullName: '',
        company: '',
        email: '',
        inquiry: '',
        message: '',
        consent: false,
      });
    } catch (error) {
      console.error('Contact form error:', error);
      setToast({ 
        show: true, 
        message: 'Failed to submit inquiry. Please try again or contact us directly at enquiries@goldenpays.uk', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="pt-32 pb-24 bg-white">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Left Side: Info */}
          <div className="space-y-12">
            <div>
              <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase block mb-4">Get in Touch</span>
              <h1 className="font-serif text-5xl text-navy mb-8">Consultation Request</h1>
              <p className="text-slate-500 text-lg leading-relaxed">
                GOLDENPAYS LTD operates exclusively through private referral and selected B2B outreach. If you are interested in our advisory services, please submit a formal inquiry.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-slate-100 flex items-center justify-center text-navy shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <div>
                  <h4 className="font-bold text-navy text-sm uppercase tracking-wider">Registered HQ</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Office 12 Initial Business Centre,<br />
                    Wilson Business Park, Manchester,<br />
                    UK, M40 8WN
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-slate-100 flex items-center justify-center text-navy shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <h4 className="font-bold text-navy text-sm uppercase tracking-wider">Electronic Inquiries</h4>
                  <p className="text-slate-500 text-sm">enquiries@goldenpays.uk</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-navy text-white">
              <h3 className="text-gold font-bold text-xs uppercase tracking-widest mb-3">Privacy & Compliance</h3>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                Strictly B2B & Private Referral. We operate under a high-confidentiality framework for all consultancy engagements. In compliance with HMRC and AML regulations, all new clients undergo a mandatory KYC (Know Your Customer) assessment before project commencement.
              </p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="bg-slate-50 p-10 border border-slate-200 shadow-lg">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-navy focus:outline-none text-sm transition-all" 
                    placeholder="John Doe" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Company Name</label>
                  <input 
                    type="text" 
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-navy focus:outline-none text-sm transition-all" 
                    placeholder="Enterprise Ltd" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Professional Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-navy focus:outline-none text-sm transition-all" 
                  placeholder="j.doe@enterprise.com" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Nature of Inquiry</label>
                <select 
                  name="inquiry"
                  value={formData.inquiry}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-navy focus:outline-none text-sm transition-all"
                >
                  <option value="">Select Service Area</option>
                  <option value="Infrastructure Audit">Infrastructure Audit</option>
                  <option value="Strategic Advisory">Strategic Advisory</option>
                  <option value="Cloud Migration">Cloud Migration</option>
                  <option value="Compliance Review">Compliance Review</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Brief Overview</label>
                <textarea 
                  rows={4} 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-navy focus:outline-none text-sm transition-all" 
                  placeholder="Describe the scale and scope of the required advisory..."
                />
              </div>

              <div className="flex items-start space-x-3">
                <input 
                  type="checkbox" 
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  className="mt-1 cursor-pointer" 
                />
                <p className="text-[10px] text-slate-500 italic">I acknowledge that GOLDENPAYS LTD reserves the right to decline any engagement and that this inquiry does not constitute a contract for services.</p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-navy text-white py-5 text-xs font-bold tracking-widest hover:bg-slate-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'PROCESSING...' : 'SUBMIT FORMAL INQUIRY'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
