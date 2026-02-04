import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Send to error tracking service (Sentry, etc.) in production
    if (import.meta.env.PROD) {
      // window.Sentry?.captureException(error);
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-navy flex items-center justify-center px-6">
          <div className="max-w-2xl bg-white p-12 rounded-sm shadow-2xl text-center">
            <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="font-serif text-4xl text-navy mb-4">System Error</h1>
            <p className="text-slate-600 mb-8 leading-relaxed">
              An unexpected error has occurred. Our technical team has been notified and is investigating the issue.
            </p>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-8 text-left">
              <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">Error Details</p>
              <code className="text-sm text-red-600 break-all">{this.state.error?.message}</code>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-navy text-white px-8 py-3 text-sm font-bold tracking-widest hover:bg-slate-800 transition-all"
            >
              RETURN TO HOMEPAGE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
