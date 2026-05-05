'use client';

import Link from 'next/link';
import {
  Building2,
  Receipt,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { formatPrice } from '@/lib/currency';
import { rentalsForLandlord, readLocalized } from '@/data/demoRentals';
import type { DemoRental, DemoPayment } from '@/data/demoRentals';

export function LandlordDashboard({ email }: { email: string }) {
  const { t, locale } = useT();
  const currency = useAuth((s) => s.currency);
  const rentals = rentalsForLandlord(email);

  // Группируем все аренды по объекту: один арендодатель может иметь
  // несколько Property, но в наших демо-данных у Lukas все три комнаты
  // одного объекта; визуально удобнее группировать по адресу.
  const byProperty = groupByProperty(rentals);

  const monthlyIncome = rentals.reduce((acc, r) => acc + r.monthlyEur, 0);
  const totalUtility = rentals.reduce(
    (acc, r) => acc + r.utilityPayments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amountEur, 0),
    0,
  );
  const paidRent = rentals.reduce(
    (acc, r) => acc + r.rentPayments.filter((p) => p.status === 'paid' && p.kind === 'rent').reduce((s, p) => s + p.amountEur, 0),
    0,
  );

  return (
    <div className="space-y-10">
      {/* Сводные карточки */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<Building2 className="h-5 w-5" />}
          label={t.dashboard.rentedSegments}
          value={String(rentals.length)}
        />
        <Stat
          icon={<Receipt className="h-5 w-5" />}
          label={t.dashboard.monthlyIncome}
          value={formatPrice(monthlyIncome, currency)}
          sub={t.listing.perMonth}
        />
        <Stat
          icon={<CheckCircle2 className="h-5 w-5" />}
          label={t.dashboard.collectedRent}
          value={formatPrice(paidRent, currency)}
          sub={t.dashboard.allTime}
        />
        <Stat
          icon={<Zap className="h-5 w-5" />}
          label={t.dashboard.collectedUtilities}
          value={formatPrice(totalUtility, currency)}
          sub={t.dashboard.allTime}
        />
      </section>

      {/* Список объектов с активными арендами */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-heading-sm font-bold text-obsidian">{t.dashboard.myRentedProperties}</h2>
            <p className="text-body-sm text-mistx mt-1">{t.dashboard.myRentedPropertiesSub}</p>
          </div>
          <Link href="/properties" className="hidden sm:inline-flex nav-link">
            {t.dashboard.allProperties}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {byProperty.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {byProperty.map((g) => (
              <PropertyGroup key={g.key} group={g} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface PropertyGroupT {
  key: string;
  photo: string;
  city: string;
  country: string;
  address: string;
  title: string;
  rentals: DemoRental[];
}

function groupByProperty(rentals: DemoRental[]): PropertyGroupT[] {
  const map = new Map<string, PropertyGroupT>();
  for (const r of rentals) {
    const key = r.listingId;
    if (!map.has(key)) {
      map.set(key, {
        key,
        photo: r.photo,
        city: r.city.en,
        country: r.country.en,
        address: r.address.en,
        title: r.title.en,
        rentals: [],
      });
    }
    map.get(key)!.rentals.push(r);
  }
  return Array.from(map.values());
}

function PropertyGroup({ group }: { group: PropertyGroupT }) {
  const { t, locale } = useT();
  const currency = useAuth((s) => s.currency);

  // Локализованные значения берём из первой аренды группы.
  const first = group.rentals[0];
  const title = readLocalized(first.title, locale);
  const city = readLocalized(first.city, locale);
  const country = readLocalized(first.country, locale);
  const address = readLocalized(first.address, locale);

  const monthlySum = group.rentals.reduce((acc, r) => acc + r.monthlyEur, 0);

  // Шапка-«коллаж» — большое первое фото плюс миниатюры каждого
  // следующего сегмента: визуально показываем, что у каждого тенанта
  // своя комната с собственной фотографией.
  const heroPhoto = group.rentals[0].photo;
  const otherPhotos = group.rentals.slice(1).map((r) => r.photo);

  return (
    <article className="rounded-card border border-mist bg-canvas overflow-hidden">
      <div className="grid md:grid-cols-[300px_1fr] gap-0">
        <div className="grid grid-cols-1 gap-1 bg-pebble">
          <div className="aspect-[16/10] md:aspect-[4/3]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroPhoto} alt={title} className="w-full h-full object-cover" />
          </div>
          {otherPhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-1">
              {otherPhotos.slice(0, 4).map((p, i) => (
                <div key={p + i} className="aspect-[16/10] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="p-5">
          <div className="text-[12px] text-mistx mb-1 uppercase tracking-[0.18em]">
            {city}, {country}
          </div>
          <h3 className="text-subheading font-bold text-obsidian">{title}</h3>
          <p className="text-body-sm text-mistx mt-1">{address}</p>

          <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-body-sm">
            <div>
              <dt className="text-[12px] text-mistx">{t.dashboard.tenants}</dt>
              <dd className="font-bold">{group.rentals.length}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-mistx">{t.dashboard.monthlyTotal}</dt>
              <dd className="font-bold">{formatPrice(monthlySum, currency)}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-mistx">{t.dashboard.tenantsList}</dt>
              <dd className="font-bold truncate">
                {group.rentals.map((r) => r.tenantEmail.split('@')[0]).join(', ')}
              </dd>
            </div>
          </dl>

          {/* Список сегментов с собственным фото у каждого */}
          <ul className="mt-4 divide-y divide-mist border-t border-mist">
            {group.rentals.map((r) => (
              <SegmentRow key={r.id} rental={r} />
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function SegmentRow({ rental }: { rental: DemoRental }) {
  const { t, locale } = useT();
  const currency = useAuth((s) => s.currency);

  const lastRent = rental.rentPayments
    .filter((p) => p.kind === 'rent' && p.status === 'paid')
    .slice(-1)[0];
  const nextRent = rental.rentPayments.find((p) => p.kind === 'rent' && p.status !== 'paid');
  const lastUtility = rental.utilityPayments
    .filter((p) => p.status === 'paid')
    .slice(-1)[0];

  return (
    <li className="py-4 flex flex-wrap items-center gap-3">
      <div className="h-14 w-14 rounded-card overflow-hidden bg-pebble shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={rental.photo} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-body-sm font-bold text-obsidian">
          {rental.segmentLabel ? `${rental.segmentLabel} · ` : ''}
          {t.kind[rental.kind]}, {rental.area} m²
        </div>
        <div className="text-[12px] text-mistx truncate">{rental.tenantEmail}</div>
        <div className="text-[12px] text-mistx mt-1">
          {t.dashboard.term}: {rental.startDate} → {rental.endDate}
        </div>
      </div>
      <div className="text-right">
        <div className="text-body-sm font-bold text-obsidian">
          {formatPrice(rental.monthlyEur, currency)}
          <span className="text-mistx font-normal text-[11px]"> {t.listing.perMonth}</span>
        </div>
        {lastRent ? (
          <div className="text-[11px] text-emerald-700 inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {t.dashboard.lastRent}: {lastRent.month}
          </div>
        ) : null}
        {nextRent ? (
          <div className="text-[11px] text-mistx inline-flex items-center gap-1 ml-2">
            <Clock className="h-3 w-3" />
            {t.dashboard.nextRent}: {nextRent.dueDate}
          </div>
        ) : null}
        {lastUtility ? (
          <div className="text-[11px] text-mistx inline-flex items-center gap-1 mt-1">
            <Zap className="h-3 w-3" />
            {t.dashboard.lastUtility}: {lastUtility.month}
          </div>
        ) : null}
      </div>

      <div className="w-full md:w-auto flex flex-wrap gap-2 mt-2">
        <Link
          href={`/payments/rent?rental=${rental.id}`}
          className="btn-outline !py-2 !text-[13px]"
        >
          <Receipt className="h-4 w-4 mr-2" />
          {t.dashboard.rentHistory}
        </Link>
        <Link
          href={`/payments/utilities?rental=${rental.id}`}
          className="btn-outline !py-2 !text-[13px]"
        >
          <Zap className="h-4 w-4 mr-2" />
          {t.dashboard.utilityHistory}
        </Link>
      </div>
    </li>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-card border border-mist p-5 bg-canvas">
      <div className="flex items-center gap-3 text-mistx text-[12px] uppercase tracking-[0.18em]">
        <span className="inline-flex h-9 w-9 rounded-full bg-fog text-obsidian items-center justify-center">
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <div className="mt-4 text-heading-sm font-bold text-obsidian">{value}</div>
      {sub ? <div className="text-body-sm text-mistx mt-1">{sub}</div> : null}
    </div>
  );
}

function EmptyState() {
  const { t } = useT();
  return (
    <div className="rounded-card border border-mist bg-fog p-8 text-center">
      <p className="text-body-sm text-obsidian">{t.dashboard.noProperties}</p>
      <Link href="/properties" className="btn-primary mt-4 inline-flex">
        {t.dashboard.manageProperties}
      </Link>
    </div>
  );
}
