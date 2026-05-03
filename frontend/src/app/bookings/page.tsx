'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';

export default function BookingsPage() {
  const { t } = useT();
  const { token, user } = useAuth();
  const { data, mutate, isLoading } = useSWR(['/bookings', token], ([p, tk]) => api(p, { token: tk }));
  const items: any[] = (data as any)?.items || [];
  const isLandlord = user?.role === 'landlord' || user?.role === 'admin';

  async function approve(id: string) {
    await api('/bookings/' + id + '/approve', { method: 'POST', token });
    void mutate();
  }
  async function reject(id: string) {
    const reason = prompt('Причина отказа?') || '';
    await api('/bookings/' + id + '/reject', { method: 'POST', token, body: JSON.stringify({ reason }) });
    void mutate();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-6">{t.nav.bookings}</h1>
      {isLoading ? (
        <div className="text-slate-500">{t.common.loading}</div>
      ) : items.length === 0 ? (
        <div className="text-slate-500">{t.common.empty}</div>
      ) : (
        <div className="overflow-x-auto card p-0">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500 bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Сегмент</th>
                <th className="px-4 py-2">Период</th>
                <th className="px-4 py-2">Сумма</th>
                <th className="px-4 py-2">Статус</th>
                {isLandlord && <th className="px-4 py-2">{t.common.actions}</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-2 font-mono text-xs">{b.id}</td>
                  <td className="px-4 py-2">#{b.segmentId}</td>
                  <td className="px-4 py-2">{b.startDate} → {b.endDate}</td>
                  <td className="px-4 py-2">{b.totalPrice} {b.currency}</td>
                  <td className="px-4 py-2"><span className="badge bg-slate-100 text-slate-700">{b.status}</span></td>
                  {isLandlord && (
                    <td className="px-4 py-2 space-x-2">
                      {b.status === 'pending' && (
                        <>
                          <button className="btn-primary !py-1" onClick={() => approve(b.id)}>Одобрить</button>
                          <button className="btn-ghost !py-1" onClick={() => reject(b.id)}>Отклонить</button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
