import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Logo } from '@/components/Logo';

// Substitute для HelveticaNowDisplay: Manrope (близкая геометрия, поддерживает
// тонкий и bold-вес, латиницу и кириллицу).
const display = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'smart rent — long-term apartment rental, in the language of luxury',
  description:
    'Long-term apartment and room rental marketplace. Verified hosts, transparent prices in your currency. Manage properties, leases, utilities and finances from one dashboard.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000d10',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={display.variable}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-canvas text-obsidian">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="bg-obsidian text-canvas mt-[68px]">
          <div className="mx-auto max-w-page px-6 py-[60px] grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <Logo tone="light" variant="mark" size={40} />
              <p className="mt-5 text-body-sm text-mistx max-w-md">
                Long-term apartment rental, redefined. Verified hosts, transparent
                pricing in your currency, and a single dashboard for the entire lease.
              </p>
              <p className="mt-3 text-body-sm font-bold tracking-[0.22em] uppercase text-mistx">
                Rent smart, live better.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-body-sm text-mistx">Renters</div>
              <a className="text-body-sm hover:opacity-80" href="/">Browse stays</a>
              <a className="text-body-sm hover:opacity-80" href="/login">Sign in</a>
              <a className="text-body-sm hover:opacity-80" href="/register">Create account</a>
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-body-sm text-mistx">Hosts</div>
              <a className="text-body-sm hover:opacity-80" href="/properties">Become a host</a>
              <a className="text-body-sm hover:opacity-80" href="/dashboard">Dashboard</a>
              <a className="text-body-sm hover:opacity-80" href="/payments">Payments</a>
            </div>
          </div>
          <div className="border-t border-mistx/30">
            <div className="mx-auto max-w-page px-6 py-6 flex flex-wrap items-center gap-3 text-body-sm text-mistx">
              <span>© {new Date().getFullYear()} smart rent</span>
              <span>·</span>
              <span>Powered by InterSystems IRIS</span>
              <span className="ml-auto">Demo prices in EUR, converted on the fly.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
