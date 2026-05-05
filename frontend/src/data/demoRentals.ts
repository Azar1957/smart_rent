// Демо-набор «активных аренд» для личного кабинета.
//
// На бэкенде у нас уже есть Lease/Payment в IRIS-фикстурах
// (см. iris/src/SmartRent/Setup/Fixtures.cls), но REST `/leases` отдаёт
// только id-ссылки на сегмент и базовую цену — без фотографий, описания
// и адреса. Для богатой витрины личного кабинета мы держим параллельный
// «снимок» демо-данных на фронте, чтобы дашборд работал автономно даже
// без подключения к API.
//
// Когда фронт смонтирован к реальному IRIS, можно одновременно показывать
// API-данные (актуальные leases) и эти богатые описания, сопоставив их по
// listingId/tenantEmail.

import type { Locale } from '@/i18n/dictionaries';
import type { LocalizedText } from './listings';

export interface DemoPayment {
  id: string;
  /** YYYY-MM, для группировки и сортировки. */
  month: string;
  amountEur: number;
  status: 'paid' | 'pending' | 'overdue';
  paidAt?: string;
  dueDate: string;
  /** rent | deposit | utility */
  kind: 'rent' | 'deposit' | 'utility';
  description: LocalizedText;
  /** Только для коммуналки. */
  utilityKind?: 'electricity' | 'water' | 'internet';
}

export interface DemoRental {
  id: string;
  /** Email арендатора, как в IRIS-фикстурах. */
  tenantEmail: string;
  /** Email арендодателя. */
  landlordEmail: string;
  /** Привязка к demo-листингу из data/listings.ts (lis-XXX) для фото и описания. */
  listingId: string;
  /** Тип сегмента: вся квартира или комната. */
  kind: 'apartment' | 'studio' | 'room';
  /** Метка комнаты, если это комната ('R1', 'R2', ...). */
  segmentLabel?: string;
  /** Локальная копия наиболее важных полей объявления (на случай, если
   *  listingId не найден в DEMO_LISTINGS). */
  title: LocalizedText;
  city: LocalizedText;
  country: LocalizedText;
  address: LocalizedText;
  photo: string;
  area: number;
  rooms: number;
  /** Цена месяц / депозит в EUR. */
  monthlyEur: number;
  depositEur: number;
  utilitiesEur: number;
  /** ISO-даты периода аренды. */
  startDate: string;
  endDate: string;
  status: 'active' | 'finished';
  /** История арендных платежей (depo + rent + pending). */
  rentPayments: DemoPayment[];
  /** История коммунальных платежей. */
  utilityPayments: DemoPayment[];
}

const today = new Date('2026-05-05');
function offsetDate(days: number) {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function offsetMonth(months: number) {
  const d = new Date(today);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 7);
}
function offsetMonthDate(months: number, day = 1) {
  const d = new Date(today);
  d.setMonth(d.getMonth() + months, day);
  return d.toISOString().slice(0, 10);
}

const lt = (en: string, es: string, ru: string): LocalizedText => ({ en, es, ru });

function rentHistory(prefix: string, months: number, monthlyEur: number, depositEur: number): DemoPayment[] {
  const out: DemoPayment[] = [];
  out.push({
    id: `${prefix}-dep`,
    month: offsetMonth(-months),
    amountEur: depositEur,
    status: 'paid',
    paidAt: offsetMonthDate(-months, 5),
    dueDate: offsetMonthDate(-months, 1),
    kind: 'deposit',
    description: lt('Security deposit', 'Depósito de garantía', 'Депозит'),
  });
  for (let i = months; i >= 1; i--) {
    const m = offsetMonth(-i);
    out.push({
      id: `${prefix}-rent-${m}`,
      month: m,
      amountEur: monthlyEur,
      status: 'paid',
      paidAt: offsetMonthDate(-i, 3),
      dueDate: offsetMonthDate(-i, 1),
      kind: 'rent',
      description: lt(`Rent for ${m}`, `Alquiler ${m}`, `Аренда ${m}`),
    });
  }
  out.push({
    id: `${prefix}-rent-pending`,
    month: offsetMonth(0),
    amountEur: monthlyEur,
    status: 'pending',
    dueDate: offsetDate(7),
    kind: 'rent',
    description: lt(
      `Rent for ${offsetMonth(0)}`,
      `Alquiler ${offsetMonth(0)}`,
      `Аренда ${offsetMonth(0)}`,
    ),
  });
  return out;
}

function utilityHistory(prefix: string, months: number): DemoPayment[] {
  const kinds: Array<{ k: DemoPayment['utilityKind']; e: number; lbl: LocalizedText }> = [
    { k: 'electricity', e: 62.5, lbl: lt('Electricity', 'Electricidad', 'Электричество') },
    { k: 'water',       e: 18.4, lbl: lt('Water',       'Agua',         'Вода') },
    { k: 'internet',    e: 35.0, lbl: lt('Internet',    'Internet',     'Интернет') },
  ];
  const out: DemoPayment[] = [];
  for (let i = months; i >= 1; i--) {
    const m = offsetMonth(-i);
    for (const { k, e, lbl } of kinds) {
      out.push({
        id: `${prefix}-util-${m}-${k}`,
        month: m,
        amountEur: e,
        status: 'paid',
        paidAt: offsetMonthDate(-i, 12),
        dueDate: offsetMonthDate(-i, 14),
        kind: 'utility',
        utilityKind: k,
        description: lt(
          `${lbl.en} for ${m}`,
          `${lbl.es} ${m}`,
          `${lbl.ru} ${m}`,
        ),
      });
    }
  }
  return out;
}

export const DEMO_RENTALS: DemoRental[] = [
  {
    id: 'rent-anna',
    tenantEmail: 'anna.kowalski@smartrent.demo',
    landlordEmail: 'marta.vidal@smartrent.demo',
    listingId: 'lis-001',
    kind: 'apartment',
    title: lt(
      'Bright apartment near Sagrada Família',
      'Piso luminoso junto a la Sagrada Família',
      'Светлая квартира у Саграда Фамилия',
    ),
    city: lt('Barcelona', 'Barcelona', 'Барселона'),
    country: lt('Spain', 'España', 'Испания'),
    address: lt('Carrer de Mallorca, 401', 'Carrer de Mallorca, 401', 'Carrer de Mallorca, 401'),
    photo:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
    area: 64,
    rooms: 2,
    monthlyEur: 1450,
    depositEur: 1450,
    utilitiesEur: 90,
    startDate: offsetMonthDate(-4, 1),
    endDate: offsetMonthDate(8, 1),
    status: 'active',
    rentPayments: rentHistory('anna', 4, 1450, 1450),
    utilityPayments: utilityHistory('anna', 4),
  },
  {
    id: 'rent-noah',
    tenantEmail: 'noah.fischer@smartrent.demo',
    landlordEmail: 'lukas.berger@smartrent.demo',
    listingId: 'lis-002',
    kind: 'room',
    segmentLabel: 'R1',
    title: lt(
      'Master room in Mitte',
      'Habitación principal en Mitte',
      'Большая комната в Митте',
    ),
    city: lt('Berlin', 'Berlín', 'Берлин'),
    country: lt('Germany', 'Alemania', 'Германия'),
    address: lt('Linienstraße 44, R1', 'Linienstraße 44, R1', 'Linienstraße 44, R1'),
    photo:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
    area: 22,
    rooms: 1,
    monthlyEur: 720,
    depositEur: 720,
    utilitiesEur: 75,
    startDate: offsetMonthDate(-6, 1),
    endDate: offsetMonthDate(6, 1),
    status: 'active',
    rentPayments: rentHistory('noah', 6, 720, 720),
    utilityPayments: utilityHistory('noah', 4),
  },
  {
    id: 'rent-isa',
    tenantEmail: 'isabella.romano@smartrent.demo',
    landlordEmail: 'lukas.berger@smartrent.demo',
    listingId: 'lis-002',
    kind: 'room',
    segmentLabel: 'R2',
    title: lt(
      'Sunny double room in Mitte',
      'Habitación doble soleada en Mitte',
      'Солнечная двойная в Митте',
    ),
    city: lt('Berlin', 'Berlín', 'Берлин'),
    country: lt('Germany', 'Alemania', 'Германия'),
    address: lt('Linienstraße 44, R2', 'Linienstraße 44, R2', 'Linienstraße 44, R2'),
    photo:
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1600&q=80',
    area: 16,
    rooms: 1,
    monthlyEur: 580,
    depositEur: 580,
    utilitiesEur: 70,
    startDate: offsetMonthDate(-3, 1),
    endDate: offsetMonthDate(9, 1),
    status: 'active',
    rentPayments: rentHistory('isa', 3, 580, 580),
    utilityPayments: utilityHistory('isa', 4),
  },
  {
    id: 'rent-liam',
    tenantEmail: 'liam.oconnor@smartrent.demo',
    landlordEmail: 'lukas.berger@smartrent.demo',
    listingId: 'lis-002',
    kind: 'room',
    segmentLabel: 'R3',
    title: lt(
      'Quiet single room in Mitte',
      'Habitación individual tranquila en Mitte',
      'Тихая одиночная в Митте',
    ),
    city: lt('Berlin', 'Berlín', 'Берлин'),
    country: lt('Germany', 'Alemania', 'Германия'),
    address: lt('Linienstraße 44, R3', 'Linienstraße 44, R3', 'Linienstraße 44, R3'),
    photo:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
    area: 12,
    rooms: 1,
    monthlyEur: 460,
    depositEur: 460,
    utilitiesEur: 55,
    startDate: offsetMonthDate(-2, 1),
    endDate: offsetMonthDate(10, 1),
    status: 'active',
    rentPayments: rentHistory('liam', 2, 460, 460),
    utilityPayments: utilityHistory('liam', 4),
  },
  {
    id: 'rent-tenant-legacy',
    tenantEmail: 'tenant@smartrent.local',
    landlordEmail: 'landlord@smartrent.local',
    listingId: 'lis-001',
    kind: 'apartment',
    title: lt(
      'Bright apartment near Sagrada Família',
      'Piso luminoso junto a la Sagrada Família',
      'Светлая квартира у Саграда Фамилия',
    ),
    city: lt('Barcelona', 'Barcelona', 'Барселона'),
    country: lt('Spain', 'España', 'Испания'),
    address: lt('Carrer de Mallorca, 401', 'Carrer de Mallorca, 401', 'Carrer de Mallorca, 401'),
    photo:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
    area: 64,
    rooms: 2,
    monthlyEur: 1450,
    depositEur: 1450,
    utilitiesEur: 90,
    startDate: offsetMonthDate(-1, 5),
    endDate: offsetMonthDate(11, 5),
    status: 'active',
    rentPayments: rentHistory('legacy', 1, 1450, 1450),
    utilityPayments: utilityHistory('legacy', 1),
  },
];

/** Найти все аренды по email арендатора. */
export function rentalsForTenant(email: string): DemoRental[] {
  const e = email.toLowerCase();
  return DEMO_RENTALS.filter((r) => r.tenantEmail.toLowerCase() === e);
}

/** Найти все аренды по email арендодателя (его сданные объекты). */
export function rentalsForLandlord(email: string): DemoRental[] {
  const e = email.toLowerCase();
  return DEMO_RENTALS.filter((r) => r.landlordEmail.toLowerCase() === e);
}

/** Прочитать локализованную строку. */
export function readLocalized(text: LocalizedText, locale: Locale): string {
  return text[locale] || text.en;
}

/** ID одной аренды по id ИЛИ undefined. */
export function rentalById(id: string): DemoRental | undefined {
  return DEMO_RENTALS.find((r) => r.id === id);
}
