import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from '../components/providers';
import { Toaster, GlobalErrorBoundary } from '@salesos/ui';

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
