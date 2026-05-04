'use client';

import { dictionaries, type Dictionary, type Locale } from '@/i18n/dictionaries';
import { useAuth } from './store';

export function useT(): { t: Dictionary; locale: Locale; setLocale: (l: Locale) => void } {
  const locale = useAuth((s) => s.locale);
  const setLocale = useAuth((s) => s.setLocale);
  return { t: dictionaries[locale], locale, setLocale };
}
