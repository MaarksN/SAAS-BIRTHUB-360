'use client';

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { ThemeProvider } from './theme-provider';
import { ToasterHot } from './toaster-hot';
import { toast } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    queryCache: new QueryCache({
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.error?.message || error?.message || 'Something went wrong';
        toast.error(`Error: ${errorMessage}`);
      }
    }),
    mutationCache: new MutationCache({
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.error?.message || error?.message || 'Something went wrong';
        toast.error(`Mutation Error: ${errorMessage}`);
      }
    })
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ToasterHot />
        {children}
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
