'use client';

import { Star, Heart, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { formatPrice } from '@/lib/currency';
import type { DemoListing } from '@/data/listings';

export function ListingCard({ item }: { item: DemoListing }) {
  const currency = useAuth((s) => s.currency);
  const { t } = useT();

  const monthly = formatPrice(item.monthlyEur, currency);
  const deposit = formatPrice(item.depositEur, currency);

  const kindLabel = t.kind[item.kind];

  return (
    <article className="flex flex-col w-full">
      <div className="relative">
        <div className="aspect-[1/1] w-full overflow-hidden rounded-card bg-pebble">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.photo}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {item.guestFavorite ? (
          <span
            className="absolute top-3 left-3 bg-cloud text-carbon text-caption font-semibold rounded-badge px-[10px] py-[6px]"
            style={{ filter: 'drop-shadow(rgba(0,0,0,0.25) 0px 2px 6px)', letterSpacing: '0.04em' }}
          >
            {t.listing.guestFavorite}
          </span>
        ) : null}

        <button
          className="absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/40 transition"
          aria-label="save"
        >
          <Heart className="h-5 w-5 text-white" />
        </button>
      </div>

      <div className="pt-3 px-1 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-body font-semibold text-carbon line-clamp-1">{item.title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-3 w-3 fill-carbon text-carbon" />
            <span className="text-[12px] font-semibold text-carbon">{item.rating.toFixed(2)}</span>
            <span className="text-[12px] text-slatex">({item.reviews})</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[12px] text-slatex">
          <MapPin className="h-3 w-3" />
          <span>
            {item.city}, {item.country}
          </span>
        </div>

        <div className="text-[12px] text-slatex">{item.address}</div>

        <div className="text-[12px] text-slatex">
          {kindLabel} · {item.rooms} {t.listing.roomsShort} · {item.area} m²
        </div>

        <div className="mt-1 text-body text-carbon">
          <span className="font-semibold">{monthly}</span>
          <span className="text-slatex"> {t.listing.perMonth}</span>
        </div>
        <div className="text-[12px] text-slatex">
          {t.listing.deposit}: {deposit} · {t.listing.minTerm} {item.minMonths} {t.listing.monthsShort}
        </div>
      </div>
    </article>
  );
}
