
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CookieConsent from './components/CookieConsent';
import ErrorBoundary from './components/ErrorBoundary';
import { initGA, trackPageView } from './utils/analytics';

// Lazy load public pages
const Solutions = lazy(() => import('./pages/Solutions'));
const Services = lazy(() => import('./pages/Services'));
const SaasCatalog = lazy(() => import('./pages/SaasCatalog'));
const Verify = lazy(() => import('./pages/Verify'));
const Company = lazy(() => import('./pages/Company'));
const Contact = lazy(() => import('./pages/Contact'));
const ThankYou = lazy(() => import('./pages/ThankYou'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy load legal pages
const TermsAndConditions = lazy(() => import('./pages/legal/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const RefundPolicy = lazy(() => import('./pages/legal/RefundPolicy'));

// Admin area (own bundle, includes auth)
const AdminApp = lazy(() => import('./pages/admin/AdminApp'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-obsidian">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-accent" aria-label="Loading" />
  </div>
);

const App: React.FC = () => {
  const location = useLocation();

  // Initialize Google Analytics
  React.useEffect(() => {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    const analyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    
    if (analyticsEnabled && gaId && gaId !== 'G-XXXXXXXXXX') {
      initGA(gaId);
    }
  }, []);

  // Track page views and scroll to top on route change
  React.useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0 });
    
    const analyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    if (analyticsEnabled && window.gtag) {
      trackPageView(location.pathname);
    }
  }, [location]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminApp />} />

          {/* Public Routes */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/solutions" element={<Solutions />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/saas" element={<SaasCatalog />} />
                  <Route path="/verify" element={<Verify />} />
                  <Route path="/company" element={<Company />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/thank-you" element={<ThankYou />} />
                  <Route path="/legal/terms" element={<TermsAndConditions />} />
                  <Route path="/legal/privacy" element={<PrivacyPolicy />} />
                  <Route path="/legal/refunds" element={<RefundPolicy />} />

                  {/* Redirects from the previous site structure */}
                  <Route path="/about" element={<Navigate to="/company" replace />} />
                  <Route path="/methodology" element={<Navigate to="/solutions" replace />} />
                  <Route path="/client-portal" element={<Navigate to="/services" replace />} />
                  <Route path="/legal/disclaimer" element={<Navigate to="/legal/terms" replace />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <CookieConsent />
            </>
          } />
        </Routes>
      </Suspense>
    </div>
    </ErrorBoundary>
  );
};

export default App;
