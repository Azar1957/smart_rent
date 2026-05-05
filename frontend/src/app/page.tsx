'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useT } from '@/lib/i18n';
import { DEMO_LISTINGS } from '@/data/listings';
import { ListingCard } from '@/components/ListingCard';
import { ArrowRight, ShieldCheck, Wallet, Building2, Languages } from 'lucide-react';

const CATEGORIES = ['all', 'apartment', 'studio', 'room'] as const;
type Category = (typeof CATEGORIES)[number];

export default function Home() {
  const { t } = useT();
  const [cat, setCat] = useState<Category>('all');

  const items = useMemo(() => {
    if (cat === 'all') return DEMO_LISTINGS;
    return DEMO_LISTINGS.filter((l) => l.kind === cat);
  }, [cat]);

  return (
    <div className="bg-canvas">
      <Hero />

      {/* Витрина */}
      <section className="mx-auto max-w-page px-6 pt-[68px] pb-10">
        <div className="flex items-end justify-between mb-[31px] flex-wrap gap-4">
          <div>
            <div className="text-body-sm text-mistx mb-2">{t.home.featuredEyebrow}</div>
            <h2 className="text-heading-sm md:text-heading font-bold text-obsidian tracking-heading">
              {t.home.featuredTitle}
            </h2>
            <p className="text-body-sm text-mistx mt-3 max-w-xl">{t.home.featuredSub}</p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((c) => {
              const active = c === cat;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={
                    'whitespace-nowrap rounded-full px-[22px] pt-[12px] pb-[13px] text-body-sm font-bold transition border ' +
                    (active
                      ? 'bg-obsidian text-canvas border-obsidian'
                      : 'bg-canvas text-obsidian border-obsidian/25 hover:bg-obsidian/5')
                  }
                >
                  {t.categories[c]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>

        {items.length === 0 ? (
          <div className="text-body-sm text-mistx text-center py-10">{t.common.empty}</div>
        ) : null}
      </section>

      {/* Хвалебная секция в духе Hyer "feature panel" */}
      <ValueProps />
    </div>
  );
}

function Hero() {
  const { t } = useT();
  return (
    <section className="relative min-h-[78vh] md:min-h-[88vh] flex items-end overflow-hidden">
      <Image
        src="/hero/penthouse-1920.jpg"
        alt="Manhattan penthouse interior at golden hour"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-obsidian/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-page w-full px-6 pb-[60px] pt-[120px]">
        <div className="text-canvas text-body-sm tracking-[0.2em] uppercase opacity-90 mb-5">
          {t.home.heroEyebrow}
        </div>
        <h1 className="text-canvas font-bold tracking-display leading-[0.85]
                       text-[64px] sm:text-[88px] md:text-[120px] lg:text-display
                       max-w-[12ch]">
          {t.home.heroTitle}
        </h1>
        <p className="mt-8 text-canvas/90 text-subheading max-w-xl">
          {t.home.heroSub}
        </p>

        <div className="mt-[31px] flex flex-wrap items-center gap-3">
          <Link href="#listings" className="btn-primary">
            {t.home.heroCtaPrimary}
          </Link>
          <Link href="/register" className="btn-ghost">
            {t.home.heroCtaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}

function ValueProps() {
  const { t } = useT();
  return (
    <section className="bg-obsidian text-canvas">
      <div className="mx-auto max-w-page px-6 py-[68px]">
        <div className="grid gap-10 md:grid-cols-[1.2fr_2fr] items-start">
          <div>
            <div className="text-body-sm text-mistx mb-3">{t.home.whyEyebrow}</div>
            <h2 className="text-heading-sm md:text-heading font-bold tracking-heading">
              {t.home.whyTitle}
            </h2>
            <p className="text-body-sm text-mistx mt-4 max-w-md">{t.home.whySub}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary">
                {t.home.ctaStart}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <Link href="/login" className="btn-ghost">
                {t.home.ctaDemo}
              </Link>
            </div>
          </div>

          <ul className="divide-y divide-mistx/30">
            <FeatureRow
              icon={<ShieldCheck className="h-5 w-5" />}
              title={t.home.f1Title}
              body={t.home.f1Body}
            />
            <FeatureRow
              icon={<Building2 className="h-5 w-5" />}
              title={t.home.f2Title}
              body={t.home.f2Body}
            />
            <FeatureRow
              icon={<Wallet className="h-5 w-5" />}
              title={t.home.f3Title}
              body={t.home.f3Body}
            />
            <FeatureRow
              icon={<Languages className="h-5 w-5" />}
              title={t.home.f4Title}
              body={t.home.f4Body}
            />
          </ul>
        </div>
      </div>
    </section>
  );
}

function FeatureRow({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="py-7 grid grid-cols-[40px_1fr_2fr] gap-6 items-start">
      <span className="h-10 w-10 rounded-full bg-canvas/10 text-canvas flex items-center justify-center">
        {icon}
      </span>
      <h3 className="text-subheading font-bold">{title}</h3>
      <p className="text-body-sm text-mistx">{body}</p>
    </li>
  );
}
