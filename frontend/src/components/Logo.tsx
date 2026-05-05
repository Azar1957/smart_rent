'use client';

import clsx from 'clsx';

/**
 * Логотип Smart Rent.
 * Все режимы используют одну и ту же векторную пиктограмму (стилизованные
 * S+R с крышей-домиком и окошком), различаются только wordmark/тэглайн.
 *
 * Цвета берутся из текущей темы — `tone="dark"` (по умолчанию) для светлого
 * фона и `tone="light"` для obsidian-секций (footer).
 */
export type LogoTone = 'dark' | 'light';

export interface LogoProps {
  tone?: LogoTone;
  /** 'icon'   — только пиктограмма (для favicon, аватарок).
   *  'mark'   — пиктограмма + 'smart rent' в одну строку (для header).
   *  'lockup' — пиктограмма сверху + 'SMART RENT' + tagline (для footer / brand-секций). */
  variant?: 'icon' | 'mark' | 'lockup';
  /** Высота иконки в px (wordmark подстраивается). */
  size?: number;
  className?: string;
  /** Показывать ли строку tagline под `lockup`. По умолчанию true. */
  withTagline?: boolean;
}

export function Logo({
  tone = 'dark',
  variant = 'mark',
  size = 28,
  className,
  withTagline = true,
}: LogoProps) {
  const stroke = tone === 'dark' ? '#000d10' : '#ffffff';
  const accent = '#bc7155';
  const muted = tone === 'dark' ? '#8e8e95' : 'rgba(255,255,255,0.55)';

  if (variant === 'icon') {
    return <LogoIcon stroke={stroke} accent={accent} size={size} className={className} />;
  }

  if (variant === 'lockup') {
    return (
      <div className={clsx('inline-flex flex-col items-center gap-3', className)}>
        <LogoIcon stroke={stroke} accent={accent} size={size} />
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-2 font-bold tracking-[0.18em]" style={{ fontSize: size * 0.85 }}>
            <span style={{ color: stroke }}>SMART</span>
            <span style={{ color: accent }}>RENT</span>
          </div>
          {withTagline ? (
            <div className="flex items-center gap-3 mt-2 w-full justify-center">
              <span aria-hidden className="h-px w-12" style={{ background: muted }} />
              <span
                className="font-semibold tracking-[0.22em] uppercase"
                style={{ fontSize: Math.max(10, size * 0.32), color: muted }}
              >
                Rent smart, live better
              </span>
              <span aria-hidden className="h-px w-12" style={{ background: muted }} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // 'mark' — иконка + wordmark в строку (для header).
  const wordSize = Math.max(14, Math.round(size * 0.7));
  return (
    <span className={clsx('inline-flex items-center gap-[10px]', className)}>
      <LogoIcon stroke={stroke} accent={accent} size={size} />
      <span
        className="font-bold tracking-[0.14em] leading-none"
        style={{ fontSize: wordSize }}
      >
        <span style={{ color: stroke }}>SMART</span>{' '}
        <span style={{ color: accent }}>RENT</span>
      </span>
    </span>
  );
}

function LogoIcon({
  stroke,
  accent,
  size,
  className,
}: {
  stroke: string;
  accent: string;
  size: number;
  className?: string;
}) {
  // Геометрия повторяет референс: широкая крыша-домик с маленьким мансардным
  // окошком, под ней массивные стилизованные S и R — толстые «почти fill»
  // обводки, опирающиеся на общую горизонтальную полку (нижний край дома).
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label="Smart Rent"
      className={className}
    >
      <g
        fill="none"
        stroke={stroke}
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeMiterlimit="2"
      >
        {/* Скаты крыши с лёгким карнизом — две сходящиеся линии */}
        <path d="M22 92 L100 22 L178 92" strokeWidth="11" />
        {/* Мансарда — маленькая «башенка» под коньком */}
        <path d="M88 41 L100 30 L112 41 L112 58 L88 58 Z" strokeWidth="6" />

        {/* Нижняя полка дома — общая опора для букв */}
        <path d="M22 158 L178 158" strokeWidth="11" />

        {/* Литера S — толстая горизонтальная «зигзаг»-форма как в референсе */}
        <path
          d="M86 80
             L40 80
             L40 112
             L86 112
             L86 144
             L40 144"
          strokeWidth="13"
        />

        {/* Литера R — вертикаль с круглой петлёй и наклонной ножкой */}
        <path d="M114 144 L114 80 L150 80" strokeWidth="13" />
        <path d="M150 80 A18 18 0 0 1 150 116 L114 116" strokeWidth="13" />
        <path d="M132 116 L160 144" strokeWidth="13" />
      </g>

      {/* Окошко 2x2 в крыше — единственное цветное пятно (sienna) */}
      <g transform="translate(92 42)" fill={accent}>
        <rect x="0" y="0" width="6" height="6" rx="0.6" />
        <rect x="9" y="0" width="6" height="6" rx="0.6" />
        <rect x="0" y="9" width="6" height="6" rx="0.6" />
        <rect x="9" y="9" width="6" height="6" rx="0.6" />
      </g>
    </svg>
  );
}
