'use client';

import { notFound } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Heart,
  Share2,
  Phone,
  MessageSquare,
  Wifi,
  Snowflake,
  WashingMachine,
  Sofa,
  Train,
  Calendar,
  Building2,
  Ruler,
  Layers,
  Ban,
  Cigarette,
  PawPrint,
  Baby,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { formatPrice } from '@/lib/currency';
import { getListingById, type DemoListing } from '@/data/listings';

export default function ListingPage({ params }: { params: { id: string } }) {
  const item = getListingById(params.id);
  if (!item) notFound();
  return <ListingView item={item!} />;
}

function ListingView({ item }: { item: DemoListing }) {
  const currency = useAuth((s) => s.currency);
  const { t } = useT();
  const [active, setActive] = useState(0);

  const monthly = formatPrice(item.monthlyEur, currency);
  const deposit = formatPrice(item.depositEur, currency);
  const utilities = item.utilitiesEur != null ? formatPrice(item.utilitiesEur, currency) : null;

  return (
    <div className="bg-cloud">
      <div className="mx-auto max-w-page px-6 pt-6">
        {/* Хлебные крошки */}
        <nav className="text-[12px] text-slatex flex items-center gap-2 mb-4">
          <Link href="/" className="hover:text-carbon">
            {t.nav.stays}
          </Link>
          <span>›</span>
          <span>
            {item.city}, {item.country}
          </span>
          <span>›</span>
          <span className="text-carbon">{item.title}</span>
        </nav>

        {/* Заголовок */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h1 className="text-display font-semibold text-carbon">{item.title}</h1>
            <div className="flex items-center gap-2 mt-1 text-body text-slatex">
              <Star className="h-4 w-4 fill-carbon text-carbon" />
              <span className="text-carbon font-semibold">{item.rating.toFixed(2)}</span>
              <span>·</span>
              <span className="underline">{item.reviews} {t.listing.reviews}</span>
              <span>·</span>
              <MapPin className="h-3 w-3" />
              <span>
                {item.city}, {item.country}
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button className="inline-flex items-center gap-1 rounded-button px-3 py-2 text-body font-semibold text-carbon hover:bg-fog">
              <Share2 className="h-4 w-4" />
              {t.listing.share}
            </button>
            <button className="inline-flex items-center gap-1 rounded-button px-3 py-2 text-body font-semibold text-carbon hover:bg-fog">
              <Heart className="h-4 w-4" />
              {t.listing.save}
            </button>
          </div>
        </div>

        {/* Галерея */}
        <Gallery photos={item.photos} active={active} setActive={setActive} title={item.title} />

        {/* Контент: 2 колонки — основная и sticky-цена */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 mt-8">
          <div className="min-w-0">
            {/* Подзаголовок: тип / базовые параметры */}
            <div className="border-b border-mist pb-6">
              <h2 className="text-heading font-semibold text-carbon">
                {t.kind[item.kind]} · {item.city}
              </h2>
              <p className="text-body text-slatex mt-1">
                {item.rooms} {t.listing.roomsShort} · {item.area} m²
                {item.floor != null
                  ? ` · ${t.listing.floor} ${item.floor}/${item.totalFloors}`
                  : ''}
                {item.builtYear ? ` · ${t.listing.builtYear} ${item.builtYear}` : ''}
              </p>
            </div>

            {/* Хост */}
            <div className="border-b border-mist py-6 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.host.avatar}
                alt={item.host.name}
                className="h-14 w-14 rounded-full object-cover"
              />
              <div>
                <div className="text-body font-semibold text-carbon">
                  {item.host.type === 'agency' ? t.listing.hostedByAgency : t.listing.hostedBy} {item.host.name}
                </div>
                <div className="text-[12px] text-slatex">
                  {item.host.yearsOnPlatform} {t.listing.yearsHosting}
                </div>
              </div>
              <span className="ml-auto badge bg-fog text-carbon">
                <Shield className="h-3 w-3 mr-1" />
                {t.listing.verifiedHost}
              </span>
            </div>

            {/* Описание */}
            <section className="border-b border-mist py-6">
              <h3 className="text-heading-sm font-semibold text-carbon mb-2">
                {t.listing.about}
              </h3>
              <p className="text-body text-carbon whitespace-pre-line">{item.description}</p>
            </section>

            {/* Параметры таблицей */}
            <section className="border-b border-mist py-6">
              <h3 className="text-heading-sm font-semibold text-carbon mb-4">
                {t.listing.params}
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                <Row icon={<Building2 className="h-4 w-4" />} k={t.listing.kindLabel} v={t.kind[item.kind]} />
                <Row icon={<Layers className="h-4 w-4" />} k={t.listing.rooms} v={String(item.rooms)} />
                <Row icon={<Ruler className="h-4 w-4" />} k={t.listing.area} v={`${item.area} m²`} />
                {item.floor != null ? (
                  <Row
                    icon={<Layers className="h-4 w-4" />}
                    k={t.listing.floor}
                    v={`${item.floor}/${item.totalFloors}`}
                  />
                ) : null}
                {item.builtYear ? (
                  <Row
                    icon={<Calendar className="h-4 w-4" />}
                    k={t.listing.builtYear}
                    v={String(item.builtYear)}
                  />
                ) : null}
                <Row
                  icon={<Calendar className="h-4 w-4" />}
                  k={t.listing.minTermLong}
                  v={`${item.minMonths} ${t.listing.monthsShort}`}
                />
                {item.transport ? (
                  <Row icon={<Train className="h-4 w-4" />} k={t.listing.transport} v={item.transport} />
                ) : null}
              </dl>
            </section>

            {/* Удобства */}
            <section className="border-b border-mist py-6">
              <h3 className="text-heading-sm font-semibold text-carbon mb-4">
                {t.listing.amenities}
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {item.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-body text-carbon">
                    <AmenityIcon name={a} />
                    {a}
                  </li>
                ))}
              </ul>
            </section>

            {/* Правила */}
            <section className="border-b border-mist py-6">
              <h3 className="text-heading-sm font-semibold text-carbon mb-4">
                {t.listing.rules}
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Rule
                  ok={item.rules.pets}
                  okLabel={t.listing.petsAllowed}
                  noLabel={t.listing.petsNotAllowed}
                  icon={<PawPrint className="h-4 w-4" />}
                />
                <Rule
                  ok={item.rules.smoking}
                  okLabel={t.listing.smokingAllowed}
                  noLabel={t.listing.smokingNotAllowed}
                  icon={<Cigarette className="h-4 w-4" />}
                />
                <Rule
                  ok={item.rules.children}
                  okLabel={t.listing.childrenAllowed}
                  noLabel={t.listing.childrenNotAllowed}
                  icon={<Baby className="h-4 w-4" />}
                />
              </ul>
            </section>

            {/* Адрес */}
            <section className="py-6">
              <h3 className="text-heading-sm font-semibold text-carbon mb-2">
                {t.listing.location}
              </h3>
              <div className="text-body text-carbon">{item.address}</div>
              <div className="text-[12px] text-slatex mt-1">
                {item.city}, {item.country}
              </div>
              <div className="mt-4 rounded-card bg-fog border border-mist h-[260px] flex items-center justify-center text-slatex text-body">
                {t.listing.mapPlaceholder}
              </div>
            </section>
          </div>

          {/* Sticky-блок: цена + контакты */}
          <aside className="lg:sticky lg:top-[200px] lg:self-start">
            <div className="rounded-card border border-mist bg-cloud p-6 shadow-subtle-2">
              <div className="flex items-baseline gap-2">
                <span className="text-display font-bold text-carbon" style={{ letterSpacing: '-0.56px' }}>
                  {monthly}
                </span>
                <span className="text-body text-slatex">{t.listing.perMonth}</span>
              </div>

              <dl className="mt-4 text-body text-carbon space-y-2 border-b border-mist pb-4">
                <div className="flex items-center justify-between">
                  <dt className="text-slatex">{t.listing.deposit}</dt>
                  <dd className="font-semibold">{deposit}</dd>
                </div>
                {utilities ? (
                  <div className="flex items-center justify-between">
                    <dt className="text-slatex">{t.listing.utilities}</dt>
                    <dd className="font-semibold">
                      {utilities} <span className="text-slatex font-normal">{t.listing.perMonth}</span>
                    </dd>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <dt className="text-slatex">{t.listing.minTermLong}</dt>
                  <dd className="font-semibold">
                    {item.minMonths} {t.listing.monthsShort}
                  </dd>
                </div>
              </dl>

              <button className="mt-4 w-full btn-primary py-3 text-base">
                {t.listing.requestBooking}
              </button>

              <button className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-button border border-carbon py-3 text-body font-semibold text-carbon hover:bg-fog transition">
                <MessageSquare className="h-4 w-4" />
                {t.listing.writeMessage}
              </button>

              <div className="mt-5 pt-4 border-t border-mist flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.host.avatar}
                  alt={item.host.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <div className="text-body font-semibold text-carbon truncate">{item.host.name}</div>
                  <div className="text-[12px] text-slatex">
                    {item.host.type === 'agency' ? t.listing.agency : t.listing.privatePerson}
                    {' · '}
                    {item.host.yearsOnPlatform} {t.listing.yearsShort}
                  </div>
                </div>
                <a
                  href={`tel:${item.host.phoneMasked.replace(/\s|·/g, '')}`}
                  className="ml-auto inline-flex items-center gap-1 rounded-pill border border-mist px-3 py-2 text-[13px] font-semibold text-carbon hover:bg-fog"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {item.host.phoneMasked.slice(0, 7)}…
                </a>
              </div>

              <p className="mt-4 text-[12px] text-slatex">
                {t.listing.priceDisclaimer}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Gallery({
  photos,
  active,
  setActive,
  title,
}: {
  photos: string[];
  active: number;
  setActive: (i: number) => void;
  title: string;
}) {
  if (photos.length === 0) return null;
  const main = photos[active];
  const next = () => setActive((active + 1) % photos.length);
  const prev = () => setActive((active - 1 + photos.length) % photos.length);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3">
      <div className="relative aspect-[4/3] lg:aspect-[16/10] overflow-hidden rounded-card bg-pebble">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={main} alt={title} className="h-full w-full object-cover" />
        <button
          onClick={prev}
          aria-label="prev"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-cloud text-carbon flex items-center justify-center"
          style={{ boxShadow: 'var(--shadow-subtle-2)' }}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          aria-label="next"
          className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-cloud text-carbon flex items-center justify-center"
          style={{ boxShadow: 'var(--shadow-subtle-2)' }}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <span className="absolute bottom-3 right-3 bg-black/60 text-white text-caption px-2 py-1 rounded-badge">
          {active + 1} / {photos.length}
        </span>
      </div>
      <div className="hidden lg:grid grid-rows-2 grid-cols-2 gap-3">
        {photos.slice(1, 5).map((p, i) => {
          const idx = i + 1;
          return (
            <button
              key={p + idx}
              onClick={() => setActive(idx)}
              className="relative overflow-hidden rounded-card bg-pebble aspect-[4/3] hover:opacity-95 transition"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="" className="h-full w-full object-cover" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Row({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="flex items-center gap-3 py-1 border-b border-dashed border-mist">
      <span className="text-slatex">{icon}</span>
      <dt className="text-body text-slatex flex-1">{k}</dt>
      <dd className="text-body font-semibold text-carbon text-right">{v}</dd>
    </div>
  );
}

function Rule({
  ok,
  okLabel,
  noLabel,
  icon,
}: {
  ok: boolean;
  okLabel: string;
  noLabel: string;
  icon: React.ReactNode;
}) {
  return (
    <li
      className={
        'flex items-center gap-2 rounded-card border p-3 text-body ' +
        (ok ? 'border-mist text-carbon bg-cloud' : 'border-mist text-slatex bg-fog')
      }
    >
      <span className={ok ? 'text-carbon' : 'text-slatex'}>{ok ? icon : <Ban className="h-4 w-4" />}</span>
      <span>{ok ? okLabel : noLabel}</span>
    </li>
  );
}

function AmenityIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  const cls = 'h-4 w-4 text-carbon';
  if (n.includes('wi-fi') || n.includes('wifi')) return <Wifi className={cls} />;
  if (n.includes('a/c') || n.includes('air')) return <Snowflake className={cls} />;
  if (n.includes('washer') || n.includes('washing')) return <WashingMachine className={cls} />;
  if (n.includes('furnish')) return <Sofa className={cls} />;
  return <span className="inline-block h-2 w-2 rounded-full bg-carbon" />;
}
