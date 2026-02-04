// Google Analytics Integration
export const initGA = (measurementId: string) => {
  if (typeof window === 'undefined' || !measurementId || measurementId === 'G-XXXXXXXXXX') {
    console.warn('Google Analytics not initialized: Invalid measurement ID');
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_path: window.location.pathname + window.location.hash,
    send_page_view: false, // We'll track manually
  });

  // Set default consent mode (GDPR compliant)
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
  });
};

// Track page views
export const trackPageView = (path: string) => {
  if (!window.gtag) return;
  
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (!window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track form submissions
export const trackFormSubmission = (formName: string, success: boolean) => {
  trackEvent(
    success ? 'form_submit_success' : 'form_submit_error',
    'Form',
    formName
  );
};

// Track outbound links
export const trackOutboundLink = (url: string) => {
  trackEvent('click', 'Outbound Link', url);
};

// Track file downloads
export const trackDownload = (fileName: string) => {
  trackEvent('download', 'File', fileName);
};
