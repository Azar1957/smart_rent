import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'smart rent — long-term room rental',
  description:
    'Long-term apartment and room rental marketplace. Manage properties, leases, utilities and finances from one dashboard.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-fog text-carbon">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="bg-fog border-t border-mist mt-8">
          <div className="mx-auto max-w-page px-6 py-6 flex flex-wrap items-center gap-3 text-[12px] text-slatex">
            <span>© {new Date().getFullYear()} smart rent</span>
            <span>·</span>
            <span>Powered by InterSystems IRIS</span>
            <span className="ml-auto">Demo prices in EUR, converted on the fly.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
