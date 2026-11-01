import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
    // Initialize analytics here when user accepts
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
    // Disable analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-obsidian/95 p-5 text-slate-300 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <p className="text-sm leading-relaxed">
          We use essential storage to run this site and, with your permission, analytics cookies to improve it. See our{' '}
          <Link to="/legal/privacy" className="text-accent underline hover:text-white">Privacy Policy</Link>.
        </p>
        <div className="flex shrink-0 gap-3">
          <button onClick={handleDecline} className="rounded-md border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
            Decline
          </button>
          <button onClick={handleAccept} className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
