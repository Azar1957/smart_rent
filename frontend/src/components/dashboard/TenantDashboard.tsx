'use client';

import Link from 'next/link';
import {
  Home,
  Receipt,
  Zap,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { formatPrice } from '@/lib/currency';
import { rentalsForTenant, readLocalized } from '@/data/demoRentals';
import { DEMO_LISTINGS, pickLocale } from '@/data/listings';
import { ListingCard } from '@/components/ListingCard';
import type { DemoRental, DemoPayment } from '@/data/demoRentals';

export function TenantDashboard({ email }: { email: string }) {
  const { t, locale } = useT();
  const currency = useAuth((s) => s.currency);
  const rentals = rentalsForTenant(email);

  // Подборка новых предложений: показываем 4 листинга, исключая те, что
  // уже арендуются (по listingId).
  const usedListingIds = new Set(rentals.map((r) => r.listingId));
  const recommendations = DEMO_LISTINGS.filter((l) => !usedListingIds.has(l.id)).slice(0, 4);

  const totalRent = rentals.reduce((acc, r) => acc + r.monthlyEur, 0);
  const upcoming = nextUpcomingRentPayment(rentals);

  return (
    <div className="space-y-10">
      {/* Сводные карточки */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          icon={<Home className="h-5 w-5" />}
          label={t.dashboard.activeRentals}
          value={String(rentals.length)}
        />
        <Stat
          icon={<Receipt className="h-5 w-5" />}
          label={t.dashboard.totalMonthly}
          value={formatPrice(totalRent, currency)}
          sub={t.listing.perMonth}
        />
        <Stat
          icon={<Calendar className="h-5 w-5" />}
          label={t.dashboard.nextPayment}
          value={upcoming ? formatPrice(upcoming.amountEur, currency) : '—'}
          sub={upcoming ? upcoming.dueDate : t.dashboard.noUpcoming}
          accent={!!upcoming}
        />
      </section>

      {/* Мои аренды */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-heading-sm font-bold text-obsidian">{t.dashboard.myRentals}</h2>
            <p className="text-body-sm text-mistx mt-1">{t.dashboard.myRentalsSub}</p>
          </div>
        </div>

        {rentals.length === 0 ? (
          <EmptyRentals />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {rentals.map((r) => (
              <RentalCard key={r.id} rental={r} />
            ))}
          </div>
        )}
      </section>

      {/* Быстрые действия — оплата */}
      <section>
        <h2 className="text-heading-sm font-bold text-obsidian mb-6">{t.dashboard.payments}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ActionCard
            href="/payments/rent"
            icon={<Receipt className="h-5 w-5" />}
            title={t.dashboard.payRentTitle}
            sub={t.dashboard.payRentSub}
            cta={t.dashboard.viewHistory}
          />
          <ActionCard
            href="/payments/utilities"
            icon={<Zap className="h-5 w-5" />}
            title={t.dashboard.payUtilitiesTitle}
            sub={t.dashboard.payUtilitiesSub}
            cta={t.dashboard.viewHistory}
          />
        </div>
      </section>

      {/* Подборка новых предложений */}
      {recommendations.length ? (
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-heading-sm font-bold text-obsidian">
                {t.dashboard.recommendationsTitle}
              </h2>
              <p className="text-body-sm text-mistx mt-1">{t.dashboard.recommendationsSub}</p>
            </div>
            <Link href="/" className="hidden sm:inline-flex nav-link">
              {t.dashboard.allListings}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid gap-x-6 gap-y-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function RentalCard({ rental }: { rental: DemoRental }) {
  const { t, locale } = useT();
  const currency = useAuth((s) => s.currency);

  // Если есть демо-листинг с тем же id — даём ссылку на него; иначе на /payments/rent.
  const hasListing = DEMO_LISTINGS.some((l) => l.id === rental.listingId);
  const detailHref = hasListing ? `/listings/${rental.listingId}` : '/payments/rent';

  const title = readLocalized(rental.title, locale);
  const city = readLocalized(rental.city, locale);
  const country = readLocalized(rental.country, locale);
  const address = readLocalized(rental.address, locale);

  return (
    <article className="rounded-card border border-mist bg-canvas overflow-hidden">
      <Link href={detailHref} className="block group">
        <div className="aspect-[16/9] bg-pebble overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={rental.photo}
            alt={title}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <div className="p-5">
          <div className="text-[12px] text-mistx mb-1 uppercase tracking-[0.18em]">
            {t.kind[rental.kind]}
            {rental.segmentLabel ? ` · ${rental.segmentLabel}` : ''}
          </div>
          <h3 className="text-subheading font-bold text-obsidian">{title}</h3>
          <p className="text-body-sm text-mistx mt-1">
            {city}, {country} · {address}
          </p>

          <dl className="mt-4 grid grid-cols-3 gap-4 text-body-sm">
            <div>
              <dt className="text-[12px] text-mistx">{t.listing.perMonth}</dt>
              <dd className="font-bold">{formatPrice(rental.monthlyEur, currency)}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-mistx">{t.listing.deposit}</dt>
              <dd className="font-bold">{formatPrice(rental.depositEur, currency)}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-mistx">{t.listing.utilities}</dt>
              <dd className="font-bold">
                {formatPrice(rental.utilitiesEur, currency)}
                <span className="text-mistx font-normal text-[11px]"> {t.listing.perMonth}</span>
              </dd>
            </div>
          </dl>

          <div className="mt-4 text-[12px] text-mistx">
            {t.dashboard.term}: {rental.startDate} → {rental.endDate}
          </div>
        </div>
      </Link>

      <div className="px-5 pb-5 flex flex-wrap gap-2">
        <Link href="/payments/rent" className="btn-primary !py-2 !text-[13px]">
          {t.dashboard.payRent}
        </Link>
        <Link href="/payments/utilities" className="btn-outline !py-2 !text-[13px]">
          {t.dashboard.payUtilities}
        </Link>
      </div>
    </article>
  );
}

function nextUpcomingRentPayment(rentals: DemoRental[]): DemoPayment | undefined {
  let best: DemoPayment | undefined;
  for (const r of rentals) {
    for (const p of r.rentPayments) {
      if (p.status !== 'pending' && p.status !== 'overdue') continue;
      if (!best || p.dueDate < best.dueDate) best = p;
    }
  }
  return best;
}

function Stat({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-card border border-mist p-5 bg-canvas">
      <div className="flex items-center gap-3 text-mistx text-[12px] uppercase tracking-[0.18em]">
        <span
          className={
            'inline-flex h-9 w-9 rounded-full items-center justify-center ' +
            (accent ? 'bg-rausch text-canvas' : 'bg-fog text-obsidian')
          }
        >
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <div className="mt-4 text-heading-sm font-bold text-obsidian">{value}</div>
      {sub ? <div className="text-body-sm text-mistx mt-1">{sub}</div> : null}
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  sub,
  cta,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-card border border-mist p-5 bg-canvas flex items-start gap-4 hover:bg-fog transition"
    >
      <span className="inline-flex h-10 w-10 rounded-full bg-fog text-obsidian items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="flex-1">
        <div className="text-subheading font-bold text-obsidian">{title}</div>
        <div className="text-body-sm text-mistx mt-1">{sub}</div>
        <div className="mt-3 inline-flex items-center gap-1 text-body-sm font-bold text-obsidian">
          {cta}
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

function EmptyRentals() {
  const { t } = useT();
  return (
    <div className="rounded-card border border-mist bg-fog p-8 text-center">
      <p className="text-body-sm text-obsidian">{t.dashboard.noRentals}</p>
      <Link href="/" className="btn-primary mt-4 inline-flex">
        {t.dashboard.browseStays}
      </Link>
    </div>
  );
}

// Утилита, чтобы статусы платежей подсвечивались иконкой / цветом.
export function StatusBadge({ status }: { status: DemoPayment['status'] }) {
  const { t } = useT();
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 text-body-sm text-emerald-700">
        <CheckCircle2 className="h-4 w-4" /> {t.paymentStatus.paid}
      </span>
    );
  }
  if (status === 'overdue') {
    return (
      <span className="inline-flex items-center gap-1 text-body-sm text-rausch">
        <AlertTriangle className="h-4 w-4" /> {t.paymentStatus.overdue}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-body-sm text-obsidian">
      <Clock className="h-4 w-4" /> {t.paymentStatus.pending}
    </span>
  );
}
