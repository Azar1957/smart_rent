'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/i18n/dictionaries';

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
  setAuth: (token: string | null, user: User | null) => void;
  setLocale: (l: Locale) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      locale: 'ru',
      setAuth: (token, user) => set({ token, user }),
      setLocale: (locale) => set({ locale }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'smartrent-auth' }
  )
);
