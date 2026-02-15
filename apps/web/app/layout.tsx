import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from '../components/providers';
import { Toaster } from '../components/sonner';
import { GlobalErrorBoundary } from '@salesos/ui';
import { ServiceWorkerRegister } from '../components/ServiceWorkerRegister';

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
    <html lang="en" suppressHydrationWarning>
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
