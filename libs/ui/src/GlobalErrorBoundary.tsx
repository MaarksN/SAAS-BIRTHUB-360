'use client';

import React, { ErrorInfo } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div
      role="alert"
      className="rounded border border-red-200 bg-red-50 p-4 text-red-900"
    >
      <h2 className="text-lg font-bold">Something went wrong:</h2>
      <pre className="mt-2 text-sm">
        {(error as Error).message || String(error)}
      </pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}

export const GlobalErrorBoundary = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const logError = (error: unknown, info: ErrorInfo) => {
    // In production, send this to Sentry/LogRocket
    console.error('GlobalErrorBoundary Caught Error:', error, info);
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
      {children}
    </ErrorBoundary>
  );
};
