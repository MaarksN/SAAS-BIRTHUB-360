'use client';

import { useEffect } from 'react';
import { Button } from '@salesos/ui';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center bg-background">
      <div className="rounded-full bg-destructive/10 p-6 animate-in fade-in zoom-in duration-300">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-500 delay-100">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
          500 - Server Error
        </h2>
        <p className="max-w-[600px] text-muted-foreground text-lg">
          Oops! Something went wrong on our end. We're tracking this issue and will fix it shortly.
        </p>
        {process.env.NODE_ENV === 'development' && (
             <p className="text-sm text-destructive bg-destructive/10 p-2 rounded mt-2 max-w-lg mx-auto overflow-auto font-mono text-left">
                {error.message}
             </p>
        )}
      </div>
      <div className="flex gap-4 animate-in slide-in-from-bottom-4 duration-500 delay-200">
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          Go Home
        </Button>
        <Button onClick={() => reset()}>Try Again</Button>
      </div>
    </div>
  );
}
