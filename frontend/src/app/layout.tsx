import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Smart Rent — долгосрочная аренда комнат',
  description:
    'Платформа долгосрочной аренды комнат в квартирах. Управление объектами, договорами, коммунальными платежами и финансами в одном окне.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b1220',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Smart Rent · powered by InterSystems IRIS
        </footer>
      </body>
    </html>
  );
}
