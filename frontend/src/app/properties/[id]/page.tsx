'use client';

import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useT();
  const { token, user } = useAuth();
  const { data: prop } = useSWR(['/properties/' + id, token], ([p, tk]) => api(p, { token: tk }));
  const { data: segs, mutate } = useSWR(['/properties/' + id + '/segments', token], ([p, tk]) => api(p, { token: tk }));
  const items: any[] = (segs as any)?.items || [];
  const isLandlord = user?.role === 'landlord' || user?.role === 'admin';
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold">{(prop as any)?.title || '...'}</h1>
      <div className="text-slate-500 mb-6">{(prop as any)?.city} · {(prop as any)?.address}</div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Segments</h2>
        {isLandlord && <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>+ {t.common.create}</button>}
      </div>

      {showForm && isLandlord && (
        <SegmentForm propertyId={id} onCreated={() => { setShowForm(false); void mutate(); }} />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s: any) => (
          <SegmentCard key={s.id} s={s} canBook={user?.role === 'tenant'} onBooked={() => mutate()} />
        ))}
      </div>
    </div>
  );
}

function SegmentForm({ propertyId, onCreated }: { propertyId: string; onCreated: () => void }) {
  const { token } = useAuth();
  const [form, setForm] = useState({ code: '', title: '', area: 0, monthlyPrice: 0, depositAmount: 0, currency: 'RUB' });
  function set<K extends keyof typeof form>(k: K, v: any) { setForm((s) => ({ ...s, [k]: v })); }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api('/properties/' + propertyId + '/segments', { method: 'POST', token, body: JSON.stringify(form) });
    onCreated();
  }
  return (
    <form onSubmit={submit} className="card mb-4 grid gap-3 sm:grid-cols-3">
      <div><label className="label">Code</label><input className="input" required value={form.code} onChange={(e) => set('code', e.target.value)} /></div>
      <div className="sm:col-span-2"><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} /></div>
      <div><label className="label">Area</label><input className="input" type="number" value={form.area} onChange={(e) => set('area', Number(e.target.value))} /></div>
      <div><label className="label">Price/mo</label><input className="input" type="number" value={form.monthlyPrice} onChange={(e) => set('monthlyPrice', Number(e.target.value))} /></div>
      <div><label className="label">Deposit</label><input className="input" type="number" value={form.depositAmount} onChange={(e) => set('depositAmount', Number(e.target.value))} /></div>
      <div className="sm:col-span-3"><button className="btn-primary">Save</button></div>
    </form>
  );
}

function SegmentCard({ s, canBook, onBooked }: { s: any; canBook: boolean; onBooked: () => void }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [msg, setMsg] = useState('');
  async function book(e: React.FormEvent) {
    e.preventDefault(); setMsg('');
    try {
      await api('/segments/' + s.id + '/bookings', {
        method: 'POST', token,
        body: JSON.stringify({ startDate: start, endDate: end }),
      });
      setMsg('OK'); setOpen(false); onBooked();
    } catch (e: any) { setMsg(e?.message || 'Error'); }
  }
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500">{s.code}</div>
          <div className="font-semibold">{s.title}</div>
        </div>
        <span className={`badge ${s.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
          {s.status}
        </span>
      </div>
      <div className="mt-2 text-sm text-slate-500">{s.area} м² · {s.beds} место</div>
      <div className="mt-3 text-2xl font-bold">{s.monthlyPrice} {s.currency}<span className="text-sm font-normal text-slate-500">/мес</span></div>
      {canBook && s.status === 'available' && (
        <div className="mt-4">
          {!open ? (
            <button className="btn-primary w-full" onClick={() => setOpen(true)}>Забронировать</button>
          ) : (
            <form onSubmit={book} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input className="input" type="date" required value={start} onChange={(e) => setStart(e.target.value)} />
                <input className="input" type="date" required value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
              <button className="btn-primary w-full">Отправить запрос</button>
              {msg && <div className="text-xs text-slate-500">{msg}</div>}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
