'use client';

import useSWR from 'swr';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';

const fetcher = (path: string, token: string) => api(path, { token });

export default function DashboardPage() {
  const { t } = useT();
  const router = useRouter();
  const { token, user } = useAuth();

  useEffect(() => { if (!token) router.replace('/login'); }, [token, router]);

  const role = user?.role || 'tenant';
  const path = role === 'tenant' ? '/dashboard/tenant' : '/dashboard/landlord';
  const { data, isLoading } = useSWR(token ? [path, token] : null, ([p, tk]) => fetcher(p, tk));

  if (!token) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.nav.dashboard}</h1>
        <div className="text-sm text-slate-500">
          {user?.email} · <span className="badge bg-brand-100 text-brand-700">{user?.role}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-slate-500">{t.common.loading}</div>
      ) : role === 'tenant' ? (
        <TenantDash data={data as any} t={t} />
      ) : (
        <LandlordDash data={data as any} t={t} />
      )}
    </div>
  );
}

function TenantDash({ data, t }: { data: any; t: any }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="card">
        <div className="text-xs text-slate-500">{t.dash.activeLeases}</div>
        <div className="mt-2 text-3xl font-bold">{data?.activeLeases ?? 0}</div>
      </div>
      <div className="card sm:col-span-2">
        <div className="text-xs text-slate-500 mb-2">{t.dash.nextPayment}</div>
        {data?.nextPayment ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">{data.nextPayment.kind}</div>
              <div className="text-2xl font-bold">{data.nextPayment.amount} {data.nextPayment.currency}</div>
            </div>
            <div className="text-sm text-slate-500">{String(data.nextPayment.dueDate || '')}</div>
          </div>
        ) : (
          <div className="text-slate-500">{t.dash.noPayments}</div>
        )}
      </div>
    </div>
  );
}

function LandlordDash({ data, t }: { data: any; t: any }) {
  const income: { month: string; amount: number }[] = data?.income || [];
  const max = Math.max(1, ...income.map((x) => Number(x.amount) || 0));
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="card lg:col-span-2">
        <div className="text-xs text-slate-500 mb-3">{t.dash.incomeByMonth}</div>
        {income.length === 0 ? (
          <div className="text-slate-500">{t.common.empty}</div>
        ) : (
          <div className="flex items-end gap-3 h-48">
            {income.map((x) => (
              <div key={x.month} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full bg-brand-500/80 rounded-t-md" style={{ height: `${(Number(x.amount) / max) * 100}%` }} />
                <div className="text-[10px] text-slate-500">{x.month}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-6">
        <div className="card">
          <div className="text-xs text-slate-500">{t.dash.overdue}</div>
          <div className="mt-2 text-3xl font-bold text-red-600">{data?.overdueAmount ?? 0}</div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-500 mb-2">{t.dash.segmentsByStatus}</div>
          <ul className="space-y-1 text-sm">
            {Object.entries(data?.segmentsByStatus || {}).map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span className="capitalize">{k}</span>
                <span className="font-medium">{String(v)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
