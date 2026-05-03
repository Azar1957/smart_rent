'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';

export default function RegisterPage() {
  const { t } = useT();
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', role: 'tenant',
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await api('/auth/register', { method: 'POST', body: JSON.stringify(form) });
      const r = await api<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, password: form.password }),
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
      <h1 className="text-2xl font-bold mb-6">{t.auth.signUp}</h1>
      <form onSubmit={onSubmit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t.auth.firstName}</label>
            <input className="input" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
          </div>
          <div>
            <label className="label">{t.auth.lastName}</label>
            <input className="input" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">{t.auth.email}</label>
          <input className="input" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div>
          <label className="label">{t.auth.password}</label>
          <input className="input" type="password" required minLength={8} value={form.password} onChange={(e) => set('password', e.target.value)} />
        </div>
        <div>
          <label className="label">{t.auth.role}</label>
          <select className="input" value={form.role} onChange={(e) => set('role', e.target.value)}>
            <option value="tenant">{t.auth.tenant}</option>
            <option value="landlord">{t.auth.landlord}</option>
          </select>
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button disabled={loading} type="submit" className="btn-primary w-full">
          {loading ? t.common.loading : t.auth.signUp}
        </button>
        <div className="text-xs text-slate-500">
          {t.auth.haveAccount} <Link className="text-brand-600 hover:underline" href="/login">{t.auth.signIn}</Link>
        </div>
      </form>
    </div>
  );
}
