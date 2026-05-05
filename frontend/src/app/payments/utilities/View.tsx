'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';
import {
  rentalsForLandlord,
  rentalsForTenant,
  rentalById,
} from '@/data/demoRentals';
import { PaymentsTable } from '@/components/dashboard/PaymentsTable';

export default function UtilitiesPaymentsView() {
  const { t } = useT();
  const router = useRouter();
  const params = useSearchParams();
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token) router.replace('/login');
  }, [token, router]);

  const rentals = useMemo(() => {
    if (!user) return [];
    const all =
      user.role === 'tenant' ? rentalsForTenant(user.email) : rentalsForLandlord(user.email);
    const rentalId = params.get('rental');
    if (rentalId) {
      const r = rentalById(rentalId);
      if (r) return [r];
    }
    return all;
  }, [user, params]);

  if (!token || !user) return null;

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-page px-6 py-10">
        <div className="text-body-sm text-mistx mb-2">{t.payments.eyebrow}</div>
        <h1 className="text-heading-sm md:text-heading font-bold text-obsidian tracking-heading">
          {t.payments.utilTitle}
        </h1>
        <p className="text-body-sm text-mistx mt-2 max-w-xl">
          {user.role === 'tenant' ? t.payments.utilSubTenant : t.payments.utilSubLandlord}
        </p>

        <nav className="mt-6 flex items-center gap-3 text-body-sm">
          <Link href="/dashboard" className="nav-link">
            ← {t.nav.dashboard}
          </Link>
          <span className="text-mistx">·</span>
          <Link href="/payments/rent" className="nav-link">
            {t.payments.rentTabTitle}
          </Link>
        </nav>

        <div className="mt-8">
          <PaymentsTable rentals={rentals} filterKind="utility" role={user.role} />
        </div>
      </div>
    </div>
  );
}
