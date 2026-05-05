'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { TenantDashboard } from '@/components/dashboard/TenantDashboard';
import { LandlordDashboard } from '@/components/dashboard/LandlordDashboard';

export default function DashboardPage() {
  const { t } = useT();
  const router = useRouter();
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token) router.replace('/login');
  }, [token, router]);

  if (!token || !user) return null;

  const role = user.role;

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-page px-6 py-10">
        {/* Шапка дашборда: имя, роль, email */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-body-sm text-mistx mb-2">{t.dashboard.eyebrow}</div>
            <h1 className="text-heading-sm md:text-heading font-bold text-obsidian tracking-heading">
              {t.dashboard.hello}{user.firstName ? `, ${user.firstName}` : ''}
            </h1>
            <p className="text-body-sm text-mistx mt-2">
              {user.email} ·{' '}
              <span className="badge bg-fog text-obsidian">{t.roles[role] ?? role}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/" className="btn-outline">{t.dashboard.browseStays}</Link>
            {role === 'landlord' || role === 'admin' ? (
              <Link href="/properties" className="btn-primary">{t.dashboard.manageProperties}</Link>
            ) : null}
            {role === 'tenant' ? (
              <Link href="/payments/rent" className="btn-primary">{t.dashboard.payRent}</Link>
            ) : null}
          </div>
        </div>

        {role === 'tenant' ? (
          <TenantDashboard email={user.email} />
        ) : (
          <LandlordDashboard email={user.email} />
        )}
      </div>
    </div>
  );
}
