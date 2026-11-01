import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Toast from '../components/Toast';
import { COMPANY, OFFERINGS } from '../data/site';
import { PageHeader, btnPrimary } from '../components/ui';
import { supabase } from '../lib/supabase';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Must match the inquiries_service_check constraint in supabase/migrations
const SERVICE_OPTIONS = [...OFFERINGS.map((o) => o.title), 'Custom Project', 'Other'];

const inputClass = 'w-full rounded-md border border-steel bg-white px-4 py-3 text-sm transition focus:border-accent focus:outline-none';
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500';

const Contact: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselected = OFFERINGS.find((o) => o.id === searchParams.get('package'))?.title ?? '';

  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    inquiry: preselected,
    message: '',
    consent: false,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.consent) {
      setToast({ show: true, message: 'Please confirm you have read the Privacy Policy.', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      if (!supabase) throw new Error('Enquiry service is not configured');
      const { error } = await supabase.from('inquiries').insert({
        name: formData.fullName,
        company: formData.company || null,
        email: formData.email,
        service: formData.inquiry,
        message: formData.message,
      });

      if (error) {
        // Rate-limit errors carry a user-facing hint from the database trigger.
        throw new Error(error.message === 'rate_limited' && error.hint ? error.hint : error.message);
      }

      setToast({ show: true, message: 'Thank you. We will reply within 2 business days.', type: 'success' });
      setFormData({ fullName: '', company: '', email: '', inquiry: '', message: '', consent: false });
    } catch (error) {
      console.error('Contact form error:', error);
      const rateLimited = error instanceof Error && /^(Too many|The enquiry service is busy)/.test(error.message);
      setToast({
        show: true,
        message: rateLimited
          ? `${(error as Error).message} You can also email ${COMPANY.email}.`
          : `Submission failed. Please try again or email ${COMPANY.email}.`,
        type: 'error',
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
    <div>
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      <PageHeader
        eyebrow="Contact"
        title="Start a project or ask a question."
        intro="Tell us what you need built, integrated or hosted. For fixed-price packages you can also purchase directly from the services page."
      />

      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-20 lg:grid-cols-5">
        <aside className="space-y-8 text-sm lg:col-span-2">
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Email</h2>
            <a href={`mailto:${COMPANY.email}`} className="mt-1 block text-obsidian hover:text-accent-dark">{COMPANY.email}</a>
          </div>
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Registered office</h2>
            <address className="mt-1 not-italic leading-relaxed text-obsidian">
              {COMPANY.officeLines.map((line) => <span key={line} className="block">{line}</span>)}
            </address>
          </div>
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Company</h2>
            <p className="mt-1 text-obsidian">{COMPANY.name} · No. <span className="font-mono">{COMPANY.number}</span></p>
          </div>
          <div className="rounded-xl bg-mist p-6">
            <p className="font-semibold text-obsidian">Ready to buy?</p>
            <p className="mt-1 text-slate-600">Packages with published prices can be purchased online.</p>
            <Link to="/services" className="mt-3 inline-block font-semibold text-accent-dark hover:underline">View productized services →</Link>
          </div>
        </aside>

        <form className="space-y-6 rounded-xl border border-steel bg-mist p-8 lg:col-span-3" onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="fullName" className={labelClass}>Full name</label>
              <input id="fullName" type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="company" className={labelClass}>Company <span className="normal-case tracking-normal text-slate-400">(optional)</span></label>
              <input id="company" type="text" name="company" value={formData.company} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} />
          </div>

          <div>
            <label htmlFor="inquiry" className={labelClass}>Service</label>
            <select id="inquiry" name="inquiry" value={formData.inquiry} onChange={handleChange} required className={inputClass}>
              <option value="">Select a service</option>
              {SERVICE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="message" className={labelClass}>Project details</label>
            <textarea
              id="message"
              rows={5}
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              minLength={10}
              className={inputClass}
              placeholder="What do you need built, integrated or hosted? Include any deadlines."
            />
          </div>

          <label className="flex items-start gap-3 text-xs text-slate-600">
            <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} className="mt-0.5 accent-accent" />
            <span>
              I agree that GOLDENPAYS LTD may use these details to respond to my enquiry, as described in the{' '}
              <Link to="/legal/privacy" className="underline">Privacy Policy</Link>.
            </span>
          </label>

          <button type="submit" disabled={loading} className={`${btnPrimary} w-full py-4 disabled:cursor-not-allowed disabled:opacity-50`}>
            {loading ? 'Sending…' : 'Send enquiry'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
