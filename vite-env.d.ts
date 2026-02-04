/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_GA_MEASUREMENT_ID: string
  readonly VITE_CONTACT_EMAIL: string
  readonly VITE_ADMIN_EMAIL: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_ERROR_TRACKING: string
  readonly VITE_MAINTENANCE_MODE: string
  readonly VITE_SESSION_TIMEOUT: string
  readonly VITE_MAX_LOGIN_ATTEMPTS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Extend Window for analytics
interface Window {
  gtag?: (...args: any[]) => void;
  dataLayer?: any[];
}
