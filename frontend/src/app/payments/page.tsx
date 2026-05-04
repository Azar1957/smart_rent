'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';

export default function PaymentsPage() {
  const { t } = useT();
  const { token, user } = useAuth();
  const { data, mutate, isLoading } = useSWR(['/payments', token], ([p, tk]) => api(p, { token: tk }));
  const items: any[] = (data as any)?.items || [];

  async function pay(id: string) {
    await api('/payments/' + id + '/pay', { method: 'POST', token, body: JSON.stringify({ provider: 'stripe-mock' }) });
    void mutate();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-6">{t.nav.payments}</h1>
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
                <th className="px-4 py-2">Тип</th>
                <th className="px-4 py-2">Сумма</th>
                <th className="px-4 py-2">Срок</th>
                <th className="px-4 py-2">Статус</th>
                {user?.role === 'tenant' && <th className="px-4 py-2">{t.common.actions}</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-2 font-mono text-xs">{p.id}</td>
                  <td className="px-4 py-2">{p.kind}</td>
                  <td className="px-4 py-2">{p.amount} {p.currency}</td>
                  <td className="px-4 py-2">{p.dueDate || '—'}</td>
                  <td className="px-4 py-2">
                    <span className={`badge ${p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : p.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                  </td>
                  {user?.role === 'tenant' && (
                    <td className="px-4 py-2">
                      {p.status !== 'paid' && (
                        <button className="btn-primary !py-1" onClick={() => pay(p.id)}>Оплатить</button>
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
