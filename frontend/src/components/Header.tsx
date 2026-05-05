'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { LOCALES } from '@/i18n/dictionaries';
import { CURRENCY_CODES, CURRENCIES } from '@/lib/currency';
import { Globe2, Menu, User as UserIcon, LogOut } from 'lucide-react';

export function Header() {
  const { t, locale, setLocale } = useT();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const currency = useAuth((s) => s.currency);
  const setCurrency = useAuth((s) => s.setCurrency);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.language && user.language !== locale) setLocale(user.language);
  }, [user, locale, setLocale]);

  return (
    <header className="sticky top-0 z-30 bg-canvas/95 backdrop-blur border-b border-obsidian/10">
      <div className="mx-auto max-w-page px-6 h-[80px] flex items-center gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-obsidian font-bold text-heading-sm tracking-[-0.3px]"
        >
          <Logo />
          <span>smart rent</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 ml-8">
          <Link href="/" className="nav-link-active">
            {t.nav.stays}
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="nav-link">
                {t.nav.dashboard}
              </Link>
              <Link href="/properties" className="nav-link">
                {t.nav.properties}
              </Link>
              <Link href="/bookings" className="nav-link">
                {t.nav.bookings}
              </Link>
              <Link href="/payments" className="nav-link">
                {t.nav.payments}
              </Link>
            </>
          ) : null}
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
            <Link onClick={() => setMenuOpen(false)} href="/" className="nav-link">
              {t.nav.stays}
            </Link>
            {user ? (
              <>
                <Link onClick={() => setMenuOpen(false)} href="/dashboard" className="nav-link">
                  {t.nav.dashboard}
                </Link>
                <Link onClick={() => setMenuOpen(false)} href="/properties" className="nav-link">
                  {t.nav.properties}
                </Link>
                <Link onClick={() => setMenuOpen(false)} href="/bookings" className="nav-link">
                  {t.nav.bookings}
                </Link>
                <Link onClick={() => setMenuOpen(false)} href="/payments" className="nav-link">
                  {t.nav.payments}
                </Link>
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
              </>
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

function Logo() {
  return (
    <span
      className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-obsidian text-canvas font-bold"
      aria-hidden
    >
      <span className="text-[14px] leading-none">SR</span>
    </span>
  );
}
