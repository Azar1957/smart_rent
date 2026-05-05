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
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="Smart Rent"
      className={className}
    >
      {/* Крыша-домик с маленьким окошком сверху */}
      <path
        d="M10 28 L32 8 L54 28"
        fill="none"
        stroke={stroke}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 14 L32 11 L36 14 L36 19 L28 19 Z"
        fill="none"
        stroke={stroke}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Окошко 2x2 в центре крыши — маленькие квадраты, акцентная заливка sienna */}
      <g transform="translate(29 22)">
        <rect x="0" y="0" width="2.6" height="2.6" rx="0.4" fill={accent} />
        <rect x="3.4" y="0" width="2.6" height="2.6" rx="0.4" fill={accent} />
        <rect x="0" y="3.4" width="2.6" height="2.6" rx="0.4" fill={accent} />
        <rect x="3.4" y="3.4" width="2.6" height="2.6" rx="0.4" fill={accent} />
      </g>

      {/* S — левая половина монограммы */}
      <path
        d="M28 32
           Q14 32 14 38.5
           Q14 45 21 45
           L28 45
           Q28 45 28 51
           L14 51"
        fill="none"
        stroke={stroke}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* R — правая половина монограммы (вертикаль + дуга + ножка) */}
      <path
        d="M36 51 L36 32 L44 32
           Q50 32 50 38
           Q50 44 44 44 L36 44
           M44 44 L51 51"
        fill="none"
        stroke={stroke}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
