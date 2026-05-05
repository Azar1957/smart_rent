// Мультивалютный режим. Базовая валюта — EUR. RUB не поддерживается.
// Курсы статичные (для демо-витрины достаточно). При необходимости легко
// заменить на онлайн-курсы из ЦБ/ECB.

export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'KZT' | 'AED';

export interface CurrencyDef {
  code: CurrencyCode;
  symbol: string;
  label: string;
  /** Сколько единиц этой валюты дают за 1 EUR (приближение, для витрины). */
  perEur: number;
  /** Локаль для Intl.NumberFormat по умолчанию. */
  locale: string;
  /** Минимальное число знаков после запятой. */
  minFractionDigits: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyDef> = {
  EUR: { code: 'EUR', symbol: '€', label: 'Euro', perEur: 1, locale: 'de-DE', minFractionDigits: 0 },
  USD: { code: 'USD', symbol: '$', label: 'US Dollar', perEur: 1.08, locale: 'en-US', minFractionDigits: 0 },
  GBP: { code: 'GBP', symbol: '£', label: 'British Pound', perEur: 0.84, locale: 'en-GB', minFractionDigits: 0 },
  CHF: { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc', perEur: 0.96, locale: 'de-CH', minFractionDigits: 0 },
  KZT: { code: 'KZT', symbol: '₸', label: 'Kazakh Tenge', perEur: 540, locale: 'kk-KZ', minFractionDigits: 0 },
  AED: { code: 'AED', symbol: 'AED', label: 'UAE Dirham', perEur: 3.97, locale: 'en-AE', minFractionDigits: 0 },
};

export const CURRENCY_CODES: CurrencyCode[] = ['EUR', 'USD', 'GBP', 'CHF', 'KZT', 'AED'];

export const DEFAULT_CURRENCY: CurrencyCode = 'EUR';

/** Перевести значение, выраженное в EUR, в выбранную валюту. */
export function convertFromEur(amountEur: number, target: CurrencyCode): number {
  const def = CURRENCIES[target];
  return amountEur * def.perEur;
}

/** Округление по типу валюты: тенге без копеек, евро/доллар тоже round-to-int для чистоты карточек. */
function roundForDisplay(value: number, code: CurrencyCode): number {
  if (code === 'KZT') return Math.round(value / 10) * 10; // ровные десятки тенге
  return Math.round(value);
}

/** Отформатировать сумму в заданной валюте (по умолчанию — символ валюты). */
export function formatPrice(amountEur: number, target: CurrencyCode): string {
  const def = CURRENCIES[target];
  const value = roundForDisplay(convertFromEur(amountEur, target), target);
  try {
    return new Intl.NumberFormat(def.locale, {
      style: 'currency',
      currency: target,
      maximumFractionDigits: def.minFractionDigits,
      minimumFractionDigits: def.minFractionDigits,
    }).format(value);
  } catch {
    return `${def.symbol}${value.toLocaleString('en-US')}`;
  }
}
