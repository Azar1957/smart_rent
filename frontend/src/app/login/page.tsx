'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';

export default function LoginPage() {
  const { t } = useT();
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const [email, setEmail] = useState('tenant@smartrent.local');
  const [password, setPassword] = useState('Tenant12345!');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const r = await api<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuth(r.token, r.user);
      router.push('/dashboard');
    } catch (e: any) {
      setErr(e?.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">{t.auth.signIn}</h1>
      <form onSubmit={onSubmit} className="card space-y-4">
        <div>
          <label className="label">{t.auth.email}</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">{t.auth.password}</label>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button disabled={loading} type="submit" className="btn-primary w-full">
          {loading ? t.common.loading : t.auth.signIn}
        </button>
        <div className="text-xs text-slate-500">
          {t.auth.noAccount} <Link className="text-brand-600 hover:underline" href="/register">{t.auth.signUp}</Link>
        </div>
      </form>
    </div>
  );
}
