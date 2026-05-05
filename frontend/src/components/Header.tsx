'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { LOCALES } from '@/i18n/dictionaries';
import { CURRENCY_CODES, CURRENCIES } from '@/lib/currency';
import { LogOut, Globe2, Search, Menu, User as UserIcon } from 'lucide-react';

export function Header() {
  const { t, locale, setLocale } = useT();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const currency = useAuth((s) => s.currency);
  const setCurrency = useAuth((s) => s.setCurrency);

  useEffect(() => {
    if (user?.language && user.language !== locale) setLocale(user.language);
  }, [user, locale, setLocale]);

  return (
    <header className="sticky top-0 z-30 bg-cloud border-b border-mist">
      <div className="mx-auto max-w-page px-6 h-[80px] flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 text-rausch font-bold text-[22px] tracking-[-0.2px]">
          <Logo />
          <span className="hidden sm:inline">smart rent</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2 ml-2">
          <Link href="/" className="nav-link-active">{t.nav.stays}</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="nav-link">{t.nav.dashboard}</Link>
              <Link href="/properties" className="nav-link">{t.nav.properties}</Link>
              <Link href="/bookings" className="nav-link">{t.nav.bookings}</Link>
              <Link href="/payments" className="nav-link">{t.nav.payments}</Link>
            </>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href={user ? '/properties' : '/register'}
            className="hidden md:inline-flex nav-link"
          >
            {t.nav.becomeHost}
          </Link>

          <CurrencySwitcher value={currency} onChange={setCurrency} />
          <LocaleSwitcher value={locale} onChange={setLocale} />

          {user ? (
            <button
              onClick={logout}
              className="inline-flex items-center gap-1 ml-1 rounded-pill border border-mist px-3 py-2 text-body font-semibold text-carbon hover:shadow-subtle-2 transition"
              aria-label={t.nav.logout}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t.nav.logout}</span>
            </button>
          ) : (
            <UserMenu loginLabel={t.nav.login} registerLabel={t.nav.register} />
          )}
        </div>
      </div>

      {/* Search bar pill — компактный, центрированный */}
      <div className="hidden md:flex justify-center pb-4">
        <div
          className="flex items-center bg-cloud rounded-pill h-[60px] divide-x divide-mist"
          style={{ boxShadow: 'var(--shadow-subtle)' }}
        >
          <SearchSegment label={t.search.where} placeholder={t.search.wherePh} />
          <SearchSegment label={t.search.from} placeholder={t.search.datePh} />
          <SearchSegment label={t.search.to} placeholder={t.search.datePh} />
          <SearchSegment label={t.search.who} placeholder={t.search.whoPh} />
          <button
            className="m-2 h-[44px] w-[44px] rounded-full bg-rausch hover:bg-rausch-deep text-white flex items-center justify-center transition"
            aria-label={t.search.button}
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function SearchSegment({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="px-5 py-2 hover:bg-fog rounded-pill transition cursor-pointer min-w-[150px]">
      <div className="text-[12px] font-semibold text-carbon">{label}</div>
      <div className="text-body text-slatex">{placeholder}</div>
    </div>
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
    <label className="inline-flex items-center gap-1 rounded-pill px-3 py-2 hover:bg-fog cursor-pointer transition">
      <span className="text-body font-semibold text-carbon">{CURRENCIES[value].symbol}</span>
      <select
        aria-label="Currency"
        className="bg-transparent text-body font-semibold text-carbon focus:outline-none cursor-pointer"
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
    <label className="inline-flex items-center gap-1 rounded-pill px-3 py-2 hover:bg-fog cursor-pointer transition">
      <Globe2 className="h-4 w-4 text-carbon" />
      <select
        aria-label="Language"
        className="bg-transparent text-body font-semibold text-carbon focus:outline-none cursor-pointer"
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

function UserMenu({ loginLabel, registerLabel }: { loginLabel: string; registerLabel: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-pill border border-mist px-2 py-1 ml-1 hover:shadow-subtle-2 transition"
      style={{ minHeight: 42 }}
    >
      <Link
        href="/login"
        className="px-3 py-1 text-body font-semibold text-carbon hover:bg-fog rounded-button transition"
      >
        {loginLabel}
      </Link>
      <Link
        href="/register"
        className="h-8 w-8 rounded-full bg-carbon text-white flex items-center justify-center"
        aria-label={registerLabel}
      >
        <UserIcon className="h-4 w-4" />
      </Link>
      <button
        className="h-8 w-8 rounded-full bg-fog text-carbon flex items-center justify-center"
        aria-label="menu"
        type="button"
      >
        <Menu className="h-4 w-4" />
      </button>
    </div>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
      <path
        d="M16 1c2.4 0 4.4 1.4 5.6 3.5 4 7 8 13.7 11.7 19.6 1 1.7 1.5 3.4 1.4 5.1-.1 2.4-1.7 4.5-3.9 5.4-3.4 1.4-7-.1-9.4-2.6-1.7-1.8-3.4-3.6-5.4-5.5-2 1.9-3.7 3.7-5.4 5.5-2.4 2.5-6 4-9.4 2.6-2.2-.9-3.8-3-3.9-5.4-.1-1.7.4-3.4 1.4-5.1C2.4 18.2 6.4 11.5 10.4 4.5 11.6 2.4 13.6 1 16 1Z"
        fill="currentColor"
      />
    </svg>
  );
}
