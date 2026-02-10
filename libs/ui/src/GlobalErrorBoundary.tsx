'use client';

import React, { ErrorInfo } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className="p-4 bg-red-50 text-red-900 border border-red-200 rounded">
      <h2 className="text-lg font-bold">Something went wrong:</h2>
      <pre className="text-sm mt-2">{(error as Error).message || String(error)}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}

export const GlobalErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const logError = (error: unknown, info: ErrorInfo) => {
    // In production, send this to Sentry/LogRocket
    console.error("GlobalErrorBoundary Caught Error:", error, info);
  };

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
    >
      {children}
    </ErrorBoundary>
  );
};
