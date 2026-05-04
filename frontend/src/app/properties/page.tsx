'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { Plus } from 'lucide-react';

type Property = {
  id: string; title: string; city?: string; address?: string; totalRooms?: number; totalArea?: number;
};

export default function PropertiesPage() {
  const { t } = useT();
  const { token, user } = useAuth();
  const { data, mutate, isLoading } = useSWR(['/properties', token], ([p, tk]) => api(p, { token: tk }));
  const items: Property[] = (data as any)?.items || [];
  const isLandlord = user?.role === 'landlord' || user?.role === 'admin';
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.nav.properties}</h1>
        {isLandlord && (
          <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4 mr-1" />{t.common.create}
          </button>
        )}
      </div>

      {showForm && isLandlord && (
        <PropertyForm onCreated={() => { setShowForm(false); void mutate(); }} />
      )}

      {isLoading ? (
        <div className="text-slate-500">{t.common.loading}</div>
      ) : items.length === 0 ? (
        <div className="text-slate-500">{t.common.empty}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Link href={`/properties/${p.id}`} key={p.id} className="card hover:shadow-md transition">
              <div className="text-lg font-semibold">{p.title}</div>
              <div className="mt-1 text-sm text-slate-500">{p.city} · {p.address}</div>
              <div className="mt-3 text-xs text-slate-500">
                {p.totalRooms} комнат · {p.totalArea} м²
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyForm({ onCreated }: { onCreated: () => void }) {
  const { t } = useT();
  const { token } = useAuth();
  const [form, setForm] = useState({ title: '', city: '', address: '', totalRooms: 0, totalArea: 0 });
  const [err, setErr] = useState('');
  function set<K extends keyof typeof form>(k: K, v: any) { setForm((s) => ({ ...s, [k]: v })); }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    try {
      await api('/properties', { method: 'POST', token, body: JSON.stringify(form) });
      onCreated();
    } catch (e: any) { setErr(e?.message || 'Error'); }
  }
  return (
    <form onSubmit={submit} className="card mb-6 grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2"><label className="label">Title</label><input className="input" required value={form.title} onChange={(e) => set('title', e.target.value)} /></div>
      <div><label className="label">City</label><input className="input" value={form.city} onChange={(e) => set('city', e.target.value)} /></div>
      <div><label className="label">Address</label><input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} /></div>
      <div><label className="label">Rooms</label><input className="input" type="number" min={0} value={form.totalRooms} onChange={(e) => set('totalRooms', Number(e.target.value))} /></div>
      <div><label className="label">Area, m²</label><input className="input" type="number" min={0} value={form.totalArea} onChange={(e) => set('totalArea', Number(e.target.value))} /></div>
      {err && <div className="sm:col-span-2 text-sm text-red-600">{err}</div>}
      <div className="sm:col-span-2"><button type="submit" className="btn-primary">{t.common.save}</button></div>
    </form>
  );
}
