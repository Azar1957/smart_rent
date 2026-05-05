'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { LOCALES } from '@/i18n/dictionaries';
import { CURRENCY_CODES, CURRENCIES } from '@/lib/currency';
import { Globe2, Menu, LogOut } from 'lucide-react';
import { Logo } from '@/components/Logo';

interface NavItem {
  href: string;
  label: string;
  /** Префиксы, которые тоже должны считаться «этой» вкладкой. */
  matchPrefixes?: string[];
}

export function Header() {
  const { t, locale, setLocale } = useT();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const currency = useAuth((s) => s.currency);
  const setCurrency = useAuth((s) => s.setCurrency);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname() || '/';

  // Подсветка вкладки. Stays активна на главной и страницах объявлений
  // (`/listings/...`); Payments — на хабе и его подмаршрутах
  // (`/payments/rent`, `/payments/utilities`); Properties — на
  // `/properties` и `/properties/:id`.
  const items: NavItem[] = [
    { href: '/', label: t.nav.stays, matchPrefixes: ['/listings'] },
    ...(user
      ? [
          { href: '/dashboard', label: t.nav.dashboard },
          { href: '/properties', label: t.nav.properties, matchPrefixes: ['/properties/'] },
          { href: '/bookings', label: t.nav.bookings },
          { href: '/payments', label: t.nav.payments, matchPrefixes: ['/payments/'] },
        ]
      : []),
  ];

  function isActive(item: NavItem) {
    if (item.href === '/') return pathname === '/' || (item.matchPrefixes ?? []).some((p) => pathname.startsWith(p));
    if (pathname === item.href) return true;
    if (pathname.startsWith(item.href + '/')) return true;
    return (item.matchPrefixes ?? []).some((p) => pathname.startsWith(p));
  }

  return (
    <header className="sticky top-0 z-30 bg-canvas/95 backdrop-blur border-b border-obsidian/10">
      <div className="mx-auto max-w-page px-6 h-[80px] flex items-center gap-6">
        <Link href="/" aria-label="Smart Rent — home" className="flex items-center">
          <Logo tone="dark" variant="mark" size={36} />
        </Link>

        <nav className="hidden lg:flex items-center gap-6 ml-8">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              aria-current={isActive(it) ? 'page' : undefined}
              className={isActive(it) ? 'nav-link-active' : 'nav-link'}
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <CurrencySwitcher value={currency} onChange={setCurrency} />
          <LocaleSwitcher value={locale} onChange={setLocale} />

          {user ? (
            <button onClick={logout} className="btn-obsidian hidden md:inline-flex">
              <LogOut className="h-4 w-4 mr-2" />
              {t.nav.logout}
            </button>
          ) : (
            <>
              <Link href="/login" className="hidden md:inline-flex nav-link">
                {t.nav.login}
              </Link>
              <Link href="/register" className="btn-primary hidden md:inline-flex">
                {t.nav.becomeHost}
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((s) => !s)}
            className="lg:hidden h-10 w-10 rounded-full bg-obsidian text-canvas flex items-center justify-center"
            aria-label="menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="lg:hidden border-t border-obsidian/10 bg-canvas">
          <div className="mx-auto max-w-page px-6 py-4 flex flex-col gap-3">
            {items.map((it) => (
              <Link
                key={it.href}
                onClick={() => setMenuOpen(false)}
                href={it.href}
                aria-current={isActive(it) ? 'page' : undefined}
                className={isActive(it) ? 'nav-link-active' : 'nav-link'}
              >
                {it.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="btn-obsidian self-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t.nav.logout}
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link onClick={() => setMenuOpen(false)} href="/login" className="btn-outline">
                  {t.nav.login}
                </Link>
                <Link onClick={() => setMenuOpen(false)} href="/register" className="btn-primary">
                  {t.nav.becomeHost}
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function CurrencySwitcher({
  value,
  onChange,
}: {
  value: keyof typeof CURRENCIES;
  onChange: (c: keyof typeof CURRENCIES) => void;
}) {
  return (
    <label className="hidden sm:inline-flex items-center gap-1 rounded-full px-3 py-2 hover:bg-obsidian/5 cursor-pointer transition">
      <span className="text-body-sm font-bold text-obsidian">{CURRENCIES[value].symbol}</span>
      <select
        aria-label="Currency"
        className="bg-transparent text-body-sm font-bold text-obsidian focus:outline-none cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value as keyof typeof CURRENCIES)}
      >
        {CURRENCY_CODES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}

function LocaleSwitcher({
  value,
  onChange,
}: {
  value: (typeof LOCALES)[number];
  onChange: (l: (typeof LOCALES)[number]) => void;
}) {
  return (
    <label className="hidden sm:inline-flex items-center gap-1 rounded-full px-3 py-2 hover:bg-obsidian/5 cursor-pointer transition">
      <Globe2 className="h-4 w-4 text-obsidian" />
      <select
        aria-label="Language"
        className="bg-transparent text-body-sm font-bold text-obsidian focus:outline-none cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value as (typeof LOCALES)[number])}
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {l.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
