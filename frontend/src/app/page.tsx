'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useT } from '@/lib/i18n';
import { DEMO_LISTINGS } from '@/data/listings';
import { ListingCard } from '@/components/ListingCard';
import { Building2, FileSignature, Wallet } from 'lucide-react';

const CATEGORIES = ['all', 'apartment', 'studio', 'room'] as const;
type Category = (typeof CATEGORIES)[number];

export default function Home() {
  const { t } = useT();
  const [cat, setCat] = useState<Category>('all');

  const items = useMemo(() => {
    if (cat === 'all') return DEMO_LISTINGS;
    return DEMO_LISTINGS.filter((l) => l.kind === cat);
  }, [cat]);

  const cities = useMemo(
    () => Array.from(new Set(DEMO_LISTINGS.slice(0, 6).map((l) => l.city))),
    []
  );

  return (
    <div className="bg-fog">
      {/* Категории — pill-фильтры (Airbnb-style) */}
      <section className="mx-auto max-w-page px-6 pt-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((c) => {
            const active = c === cat;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={
                  'px-4 py-2 rounded-button text-body font-medium border transition whitespace-nowrap ' +
                  (active
                    ? 'bg-carbon text-cloud border-carbon'
                    : 'bg-transparent text-carbon border-carbon hover:bg-fog')
                }
              >
                {t.categories[c]}
              </button>
            );
          })}
          <div className="flex items-center gap-2 ml-auto text-[12px] text-slatex hidden md:flex">
            {t.home.popularCities}: {cities.join(' · ')}
          </div>
        </div>
      </section>

      {/* Витрина */}
      <section className="mx-auto max-w-page px-6 pt-6 pb-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-heading font-semibold text-carbon" style={{ letterSpacing: '-0.2px' }}>
              {t.home.featuredTitle} →
            </h2>
            <p className="text-body text-slatex mt-1">{t.home.featuredSub}</p>
          </div>
        </div>

        <div className="grid gap-x-6 gap-y-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>

        {items.length === 0 ? (
          <div className="text-body text-slatex text-center py-10">{t.common.empty}</div>
        ) : null}
      </section>

      {/* Преимущества платформы — компактная секция */}
      <section className="mx-auto max-w-page px-6 pb-16">
        <h2 className="text-heading font-semibold text-carbon mb-4" style={{ letterSpacing: '-0.2px' }}>
          {t.home.whySmartRent}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon={<Building2 className="h-5 w-5" />} title={t.home.f1Title} body={t.home.f1Body} />
          <Feature icon={<FileSignature className="h-5 w-5" />} title={t.home.f2Title} body={t.home.f2Body} />
          <Feature icon={<Wallet className="h-5 w-5" />} title={t.home.f3Title} body={t.home.f3Body} />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register" className="btn-primary">
            {t.home.ctaStart}
          </Link>
          <Link href="/login" className="btn-outline">
            {t.home.ctaDemo}
          </Link>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-card bg-cloud border border-mist p-5">
      <div className="h-10 w-10 rounded-full bg-fog text-carbon flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-3 text-heading-sm font-semibold text-carbon">{title}</h3>
      <p className="mt-1 text-body text-slatex">{body}</p>
    </div>
  );
}
