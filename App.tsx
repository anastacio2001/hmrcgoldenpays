
import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import CookieConsent from './components/CookieConsent';
import ErrorBoundary from './components/ErrorBoundary';
import { initGA, trackPageView } from './utils/analytics';

// Lazy load public pages
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Methodology = lazy(() => import('./pages/Methodology'));
const ClientPortal = lazy(() => import('./pages/ClientPortal'));
const Contact = lazy(() => import('./pages/Contact'));

// Lazy load legal pages
const TermsAndConditions = lazy(() => import('./pages/legal/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const ProfessionalDisclaimer = lazy(() => import('./pages/legal/ProfessionalDisclaimer'));

// Lazy load admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Inquiries = lazy(() => import('./pages/admin/Inquiries'));
const Clients = lazy(() => import('./pages/admin/Clients'));
const Projects = lazy(() => import('./pages/admin/Projects'));
const Settings = lazy(() => import('./pages/admin/Settings'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-navy border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-500 text-sm uppercase tracking-widest">Loading...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const analyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    if (analyticsEnabled && window.gtag) {
      trackPageView(location.pathname + location.hash);
    }
  }, [location]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col selection:bg-navy selection:text-white">
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            <ProtectedRoute requireAdmin>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="inquiries" element={<Inquiries />} />
                  <Route path="clients" element={<Clients />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="settings" element={<Settings />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* Public Routes */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/methodology" element={<Methodology />} />
                  <Route path="/client-portal" element={<ClientPortal />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/legal/terms" element={<TermsAndConditions />} />
                  <Route path="/legal/privacy" element={<PrivacyPolicy />} />
                  <Route path="/legal/disclaimer" element={<ProfessionalDisclaimer />} />
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
