import React, { useState, useEffect } from 'react';

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
    <div className="fixed bottom-0 left-0 right-0 bg-navy text-white p-6 shadow-2xl z-50 border-t-4 border-gold">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm leading-relaxed">
            We use essential cookies to ensure proper website functionality and optional analytics cookies to improve our services. 
            By clicking "Accept", you consent to our use of cookies in accordance with our{' '}
            <a href="/#/legal/privacy" className="text-gold underline hover:text-white">Privacy Policy</a>.
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-6 py-2 border border-white text-white text-sm font-bold hover:bg-white hover:text-navy transition-all"
          >
            DECLINE
          </button>
          <button
            onClick={handleAccept}
            className="px-6 py-2 bg-gold text-navy text-sm font-bold hover:bg-white transition-all"
          >
            ACCEPT
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
