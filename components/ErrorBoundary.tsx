import React, { Component, ErrorInfo, ReactNode } from 'react';
import { isStaleChunkError, reloadForNewBuild } from '../utils/staleBuild';

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
    // A chunk from a previous deploy: reload once onto the current build.
    if (isStaleChunkError(error) && reloadForNewBuild()) return;
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const stale = isStaleChunkError(this.state.error);
      return (
        <div className="flex min-h-screen items-center justify-center bg-obsidian bg-grid px-6 text-center text-white">
          <div className="max-w-md">
            <p className="font-mono text-sm text-accent">{stale ? 'Update available' : 'Error'}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              {stale ? 'A new version of this site is available.' : 'Something went wrong.'}
            </h1>
            <p className="mt-4 text-slate-400">
              {stale ? 'Reload the page to continue.' : 'Please reload the page. If the problem persists, contact enquiries@goldenpays.uk.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-8 inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
