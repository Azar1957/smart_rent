'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { LOCALES } from '@/i18n/dictionaries';
import { Building2, LogOut, Globe2 } from 'lucide-react';

export function Header() {
  const { t, locale, setLocale } = useT();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  useEffect(() => {
    if (user?.language && user.language !== locale) setLocale(user.language);
  }, [user, locale, setLocale]);

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <Building2 className="h-5 w-5 text-brand-600" />
          {t.appName}
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm text-slate-700 dark:text-slate-300 ml-4">
          {user ? (
            <>
              <Link className="px-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" href="/dashboard">{t.nav.dashboard}</Link>
              <Link className="px-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" href="/properties">{t.nav.properties}</Link>
              <Link className="px-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" href="/bookings">{t.nav.bookings}</Link>
              <Link className="px-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" href="/payments">{t.nav.payments}</Link>
            </>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Globe2 className="h-4 w-4" />
            <select
              aria-label="Language"
              className="bg-transparent text-xs focus:outline-none"
              value={locale}
              onChange={(e) => setLocale(e.target.value as (typeof LOCALES)[number])}
            >
              {LOCALES.map((l) => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
              ))}
            </select>
          </div>
          {user ? (
            <button onClick={logout} className="btn-ghost"><LogOut className="h-4 w-4 mr-1" />{t.nav.logout}</button>
          ) : (
            <>
              <Link className="btn-ghost" href="/login">{t.nav.login}</Link>
              <Link className="btn-primary" href="/register">{t.nav.register}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
