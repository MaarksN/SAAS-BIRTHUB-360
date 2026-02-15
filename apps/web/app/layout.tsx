import '../styles/globals.css';

import { GlobalErrorBoundary } from '@salesos/ui';
import { Inter } from 'next/font/google';

import { Providers } from '../components/providers';
import { ServiceWorkerRegister } from '../components/ServiceWorkerRegister';
import { Toaster } from '../components/sonner';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'SalesOS Ultimate',
  description: 'Unified Sales Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ServiceWorkerRegister />
        <Providers>
          <GlobalErrorBoundary>
            {children}
          </GlobalErrorBoundary>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
