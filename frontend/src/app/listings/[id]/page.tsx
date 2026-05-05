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
  X,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { formatPrice } from '@/lib/currency';
import { getListingById, pickLocale, type DemoListing } from '@/data/listings';

export default function ListingPage({ params }: { params: { id: string } }) {
  const item = getListingById(params.id);
  if (!item) notFound();
  return <ListingView item={item!} />;
}

function ListingView({ item }: { item: DemoListing }) {
  const currency = useAuth((s) => s.currency);
  const { t, locale } = useT();
  const [active, setActive] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);

  const monthly = formatPrice(item.monthlyEur, currency);
  const deposit = formatPrice(item.depositEur, currency);
  const utilities = item.utilitiesEur != null ? formatPrice(item.utilitiesEur, currency) : null;

  const title = pickLocale(item.title, locale);
  const city = pickLocale(item.city, locale);
  const country = pickLocale(item.country, locale);
  const address = pickLocale(item.address, locale);
  const description = pickLocale(item.description, locale);
  const transport = item.transport ? pickLocale(item.transport, locale) : null;

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
            {city}, {country}
          </span>
          <span>›</span>
          <span className="text-carbon">{title}</span>
        </nav>

        {/* Заголовок */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h1 className="text-heading-sm md:text-heading font-bold text-carbon tracking-heading">
              {title}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-body-sm text-slatex">
              <Star className="h-4 w-4 fill-carbon text-carbon" />
              <span className="text-carbon font-semibold">{item.rating.toFixed(2)}</span>
              <span>·</span>
              <span className="underline">
                {item.reviews} {t.listing.reviews}
              </span>
              <span>·</span>
              <MapPin className="h-3 w-3" />
              <span>
                {city}, {country}
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-body-sm font-semibold text-carbon hover:bg-fog">
              <Share2 className="h-4 w-4" />
              {t.listing.share}
            </button>
            <button className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-body-sm font-semibold text-carbon hover:bg-fog">
              <Heart className="h-4 w-4" />
              {t.listing.save}
            </button>
          </div>
        </div>

        {/* Галерея */}
        <Gallery photos={item.photos} active={active} setActive={setActive} title={title} />

        {/* Контент: 2 колонки — основная и sticky-цена */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 mt-8">
          <div className="min-w-0">
            {/* Подзаголовок: тип / базовые параметры */}
            <div className="border-b border-mist pb-6">
              <h2 className="text-heading-sm font-bold text-carbon">
                {t.kind[item.kind]} · {city}
              </h2>
              <p className="text-body-sm text-slatex mt-1">
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
                <div className="text-body-sm font-semibold text-carbon">
                  {item.host.type === 'agency' ? t.listing.hostedByAgency : t.listing.hostedBy}{' '}
                  {item.host.name}
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
              <h3 className="text-subheading font-bold text-carbon mb-2">{t.listing.about}</h3>
              <p className="text-body-sm text-carbon whitespace-pre-line">{description}</p>
            </section>

            {/* Параметры таблицей */}
            <section className="border-b border-mist py-6">
              <h3 className="text-subheading font-bold text-carbon mb-4">{t.listing.params}</h3>
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
                {transport ? (
                  <Row icon={<Train className="h-4 w-4" />} k={t.listing.transport} v={transport} />
                ) : null}
              </dl>
            </section>

            {/* Удобства */}
            <section className="border-b border-mist py-6">
              <h3 className="text-subheading font-bold text-carbon mb-4">{t.listing.amenities}</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {item.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-body-sm text-carbon">
                    <AmenityIcon name={a} />
                    {t.amenities[a] ?? a}
                  </li>
                ))}
              </ul>
            </section>

            {/* Правила */}
            <section className="border-b border-mist py-6">
              <h3 className="text-subheading font-bold text-carbon mb-4">{t.listing.rules}</h3>
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
              <h3 className="text-subheading font-bold text-carbon mb-2">{t.listing.location}</h3>
              <div className="text-body-sm text-carbon">{address}</div>
              <div className="text-[12px] text-slatex mt-1">
                {city}, {country}
              </div>
              <div className="mt-4 rounded-card bg-fog border border-mist h-[260px] flex items-center justify-center text-slatex text-body-sm">
                {t.listing.mapPlaceholder}
              </div>
            </section>
          </div>

          {/* Sticky-блок: цена + контакты */}
          <aside className="lg:sticky lg:top-[200px] lg:self-start">
            <div className="rounded-card border border-mist bg-cloud p-6 shadow-subtle-2">
              <div className="flex items-baseline gap-2">
                <span className="text-heading-sm font-bold text-carbon" style={{ letterSpacing: '-0.3px' }}>
                  {monthly}
                </span>
                <span className="text-body-sm text-slatex">{t.listing.perMonth}</span>
              </div>

              <dl className="mt-4 text-body-sm text-carbon space-y-2 border-b border-mist pb-4">
                <div className="flex items-center justify-between">
                  <dt className="text-slatex">{t.listing.deposit}</dt>
                  <dd className="font-semibold">{deposit}</dd>
                </div>
                {utilities ? (
                  <div className="flex items-center justify-between">
                    <dt className="text-slatex">{t.listing.utilities}</dt>
                    <dd className="font-semibold">
                      {utilities}{' '}
                      <span className="text-slatex font-normal">{t.listing.perMonth}</span>
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

              <button
                type="button"
                onClick={() => {
                  setBookingDone(false);
                  setBookingOpen(true);
                }}
                className="mt-4 w-full btn-primary"
              >
                {t.listing.requestBooking}
              </button>

              <button
                type="button"
                onClick={() => {
                  setBookingDone(false);
                  setBookingOpen(true);
                }}
                className="mt-2 w-full btn-outline"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
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
                  <div className="text-body-sm font-semibold text-carbon truncate">{item.host.name}</div>
                  <div className="text-[12px] text-slatex">
                    {item.host.type === 'agency' ? t.listing.agency : t.listing.privatePerson}
                    {' · '}
                    {item.host.yearsOnPlatform} {t.listing.yearsShort}
                  </div>
                </div>
                <a
                  href={`tel:${item.host.phoneMasked.replace(/\s|·/g, '')}`}
                  className="ml-auto inline-flex items-center gap-1 rounded-full border border-mist px-3 py-2 text-[13px] font-semibold text-carbon hover:bg-fog"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {item.host.phoneMasked.slice(0, 7)}…
                </a>
              </div>

              <p className="mt-4 text-[12px] text-slatex">{t.listing.priceDisclaimer}</p>
            </div>
          </aside>
        </div>
      </div>

      {bookingOpen ? (
        <BookingModal
          item={item}
          monthly={monthly}
          deposit={deposit}
          done={bookingDone}
          onConfirm={() => setBookingDone(true)}
          onClose={() => setBookingOpen(false)}
        />
      ) : null}
    </div>
  );
}

function BookingModal({
  item,
  monthly,
  deposit,
  done,
  onConfirm,
  onClose,
}: {
  item: DemoListing;
  monthly: string;
  deposit: string;
  done: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t, locale } = useT();
  const title = pickLocale(item.title, locale);
  const address = pickLocale(item.address, locale);
  const city = pickLocale(item.city, locale);
  const country = pickLocale(item.country, locale);

  // Для демо подставим даты заезда/выезда: сегодня + minMonths.
  const today = new Date();
  const startStr = today.toISOString().slice(0, 10);
  const end = new Date(today);
  end.setMonth(end.getMonth() + item.minMonths);
  const endStr = end.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(startStr);
  const [endDate, setEndDate] = useState(endStr);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Демо: имитируем сетевой запрос.
    setTimeout(() => {
      setSubmitting(false);
      onConfirm();
    }, 600);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-obsidian/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-cloud w-full max-w-lg rounded-card shadow-subtle-2 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-mist">
          <div className="text-subheading font-bold text-carbon">
            {done ? t.bookingModal.doneTitle : t.bookingModal.title}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-fog flex items-center justify-center"
            aria-label="close"
          >
            <X className="h-5 w-5 text-carbon" />
          </button>
        </div>

        {done ? (
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <CheckCircle2 className="h-12 w-12 text-rausch" />
            <p className="text-body-sm text-carbon">
              {t.bookingModal.doneSub} <strong>{title}</strong>
            </p>
            <p className="text-[12px] text-slatex">{t.bookingModal.doneNote}</p>
            <button type="button" onClick={onClose} className="btn-primary mt-2">
              {t.bookingModal.close}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-4">
            <div className="text-[12px] text-slatex">
              {title} · {city}, {country}
              <br />
              {address}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t.bookingModal.startDate}</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">{t.bookingModal.endDate}</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">{t.bookingModal.name}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="input"
              />
            </div>

            <div>
              <label className="label">{t.bookingModal.email}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>

            <div>
              <label className="label">{t.bookingModal.note}</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="input"
                placeholder={t.bookingModal.notePh}
              />
            </div>

            <div className="rounded-card bg-fog p-3 text-[13px] text-carbon flex items-center justify-between gap-3">
              <span>
                {t.listing.deposit}: <strong>{deposit}</strong>
              </span>
              <span>
                {monthly} <span className="text-slatex">{t.listing.perMonth}</span>
              </span>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? t.common.loading : t.bookingModal.confirm}
            </button>
            <p className="text-[11px] text-slatex text-center">
              {t.bookingModal.disclaimer}
            </p>
          </form>
        )}
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
      <dt className="text-body-sm text-slatex flex-1">{k}</dt>
      <dd className="text-body-sm font-semibold text-carbon text-right">{v}</dd>
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
        'flex items-center gap-2 rounded-card border p-3 text-body-sm ' +
        (ok ? 'border-mist text-carbon bg-cloud' : 'border-mist text-slatex bg-fog')
      }
    >
      <span className={ok ? 'text-carbon' : 'text-slatex'}>
        {ok ? icon : <Ban className="h-4 w-4" />}
      </span>
      <span>{ok ? okLabel : noLabel}</span>
    </li>
  );
}

function AmenityIcon({ name }: { name: string }) {
  const cls = 'h-4 w-4 text-carbon';
  switch (name) {
    case 'wifi':
      return <Wifi className={cls} />;
    case 'ac':
      return <Snowflake className={cls} />;
    case 'washer':
    case 'dishwasher':
      return <WashingMachine className={cls} />;
    case 'furnished':
      return <Sofa className={cls} />;
    default:
      return <span className="inline-block h-2 w-2 rounded-full bg-carbon" />;
  }
}
