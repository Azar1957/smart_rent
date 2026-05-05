'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/i18n/dictionaries';
import { DEFAULT_CURRENCY, type CurrencyCode } from './currency';

export type User = {
  id: string;
  email: string;
  role: 'admin' | 'landlord' | 'tenant';
  firstName?: string;
  lastName?: string;
  phone?: string;
  language?: Locale;
  verified?: boolean;
};

type AuthState = {
  token: string | null;
  user: User | null;
  locale: Locale;
  currency: CurrencyCode;
  setAuth: (token: string | null, user: User | null) => void;
  setLocale: (l: Locale) => void;
  setCurrency: (c: CurrencyCode) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      locale: 'en',
      currency: DEFAULT_CURRENCY,
      setAuth: (token, user) => set({ token, user }),
      setLocale: (locale) => set({ locale }),
      setCurrency: (currency) => set({ currency }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'smartrent-auth' }
  )
);
