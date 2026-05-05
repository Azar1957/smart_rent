// Демо-витрина для главной страницы.
// Все текстовые поля локализованы en/es/ru. Цены хранятся в EUR, отображение
// пересчитывается на лету через lib/currency.ts. Фотографии — публичные
// изображения Unsplash. Все объекты — за пределами России (по требованию).

import type { Locale } from '@/i18n/dictionaries';

export type LocalizedText = Record<Locale, string>;

export interface DemoListing {
  id: string;
  title: LocalizedText;
  city: LocalizedText;
  country: LocalizedText;
  address: LocalizedText;
  /** Тип помещения: целая квартира / студия / комната */
  kind: 'apartment' | 'studio' | 'room';
  rooms: number;
  area: number; // m²
  /** Этаж / всего этажей */
  floor?: number;
  totalFloors?: number;
  /** Год постройки. */
  builtYear?: number;
  /** Месячная плата в EUR. */
  monthlyEur: number;
  /** Депозит в EUR. */
  depositEur: number;
  /** Сервисный сбор / коммуналка примерно, EUR/мес. */
  utilitiesEur?: number;
  /** Минимальный срок в месяцах. */
  minMonths: number;
  /** Включенные удобства (короткие универсальные строки — переводятся в UI на лету). */
  amenities: string[];
  /** Чем разрешено / запрещено. */
  rules: { pets: boolean; smoking: boolean; children: boolean };
  /** Расширенное описание. */
  description: LocalizedText;
  /** Метро / транспорт ближайший. */
  transport?: LocalizedText;
  /** Рейтинг 0..5 и кол-во отзывов — чисто визуальный сигнал доверия. */
  rating: number;
  reviews: number;
  guestFavorite?: boolean;
  /** Главное фото для карточки в витрине. */
  photo: string;
  /** Галерея для страницы объявления. */
  photos: string[];
  /** Хост / собственник. */
  host: {
    name: string;
    type: 'private' | 'agency';
    yearsOnPlatform: number;
    avatar: string;
    phoneMasked: string;
  };
}

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Хелпер: вытащить нужную локаль с фолбэком на английский. */
export function pickLocale(text: LocalizedText | undefined, locale: Locale): string {
  if (!text) return '';
  return text[locale] || text.en || '';
}

export const DEMO_LISTINGS: DemoListing[] = [
  {
    id: 'lis-001',
    title: {
      en: 'Bright apartment near Sagrada Família',
      es: 'Piso luminoso junto a la Sagrada Família',
      ru: 'Светлая квартира у Саграда Фамилия',
    },
    city: { en: 'Barcelona', es: 'Barcelona', ru: 'Барселона' },
    country: { en: 'Spain', es: 'España', ru: 'Испания' },
    address: {
      en: 'Carrer de Mallorca, 401',
      es: 'Carrer de Mallorca, 401',
      ru: 'Carrer de Mallorca, 401',
    },
    kind: 'apartment',
    rooms: 2,
    area: 64,
    floor: 4,
    totalFloors: 6,
    builtYear: 1962,
    monthlyEur: 1450,
    depositEur: 1450,
    utilitiesEur: 90,
    minMonths: 6,
    amenities: ['wifi', 'ac', 'washer', 'balcony', 'furnished', 'lift'],
    rules: { pets: true, smoking: false, children: true },
    description: {
      en: 'A bright two-room apartment in Eixample, three minutes from Sagrada Família. Fully furnished and equipped, with a balcony onto the inner courtyard. 1962 brick building with a quiet stairwell and a lift.',
      es: 'Piso luminoso de dos habitaciones en el Eixample, a tres minutos de la Sagrada Família. Totalmente amueblado y equipado, con balcón al patio interior. Edificio de ladrillo de 1962 con escalera tranquila y ascensor.',
      ru: 'Светлая двухкомнатная квартира в Эшампле, в трёх минутах от Саграда Фамилия. Полностью меблирована и оборудована техникой, балкон во внутренний двор. Дом 1962 года, кирпич, тихая лестничная клетка, лифт.',
    },
    transport: {
      en: 'Metro L2 / L5 Sagrada Família — 4 min',
      es: 'Metro L2 / L5 Sagrada Família — 4 min',
      ru: 'Metro L2 / L5 Sagrada Família — 4 мин',
    },
    rating: 4.92,
    reviews: 184,
    guestFavorite: true,
    photo: u('photo-1502672260266-1c1ef2d93688'),
    photos: [
      u('photo-1502672260266-1c1ef2d93688'),
      u('photo-1505691938895-1758d7feb511'),
      u('photo-1493809842364-78817add7ffb'),
      u('photo-1554995207-c18c203602cb'),
      u('photo-1560448204-e02f11c3d0e2'),
    ],
    host: {
      name: 'Marta Vidal',
      type: 'private',
      yearsOnPlatform: 4,
      avatar: u('photo-1494790108377-be9c29b29330', 200),
      phoneMasked: '+34 ··· ··· · 47',
    },
  },
  {
    id: 'lis-002',
    title: {
      en: 'Cosy studio in Mitte',
      es: 'Estudio acogedor en Mitte',
      ru: 'Уютная студия в Митте',
    },
    city: { en: 'Berlin', es: 'Berlín', ru: 'Берлин' },
    country: { en: 'Germany', es: 'Alemania', ru: 'Германия' },
    address: { en: 'Linienstraße 44', es: 'Linienstraße 44', ru: 'Linienstraße 44' },
    kind: 'studio',
    rooms: 1,
    area: 32,
    floor: 2,
    totalFloors: 5,
    builtYear: 1908,
    monthlyEur: 980,
    depositEur: 980,
    utilitiesEur: 75,
    minMonths: 3,
    amenities: ['wifi', 'heating', 'kitchen', 'furnished'],
    rules: { pets: false, smoking: false, children: true },
    description: {
      en: 'Cosy studio in the heart of Mitte, walking distance from U-Bahn Rosenthaler Platz. Early-20th-century Altbau, high ceilings, oak parquet, double-glazed windows.',
      es: 'Estudio acogedor en el corazón de Mitte, a pocos pasos del U-Bahn Rosenthaler Platz. Edificio Altbau de principios del siglo XX, techos altos, parqué de roble, ventanas de doble cristal.',
      ru: 'Уютная студия в самом центре Митте, в шаговой доступности от U-Bahn Rosenthaler Platz. Альтбау начала XX века, высокие потолки, дубовый паркет, двойные окна.',
    },
    transport: {
      en: 'U8 Rosenthaler Platz — 3 min',
      es: 'U8 Rosenthaler Platz — 3 min',
      ru: 'U8 Rosenthaler Platz — 3 мин',
    },
    rating: 4.81,
    reviews: 96,
    photo: u('photo-1505691938895-1758d7feb511'),
    photos: [
      u('photo-1505691938895-1758d7feb511'),
      u('photo-1493809842364-78817add7ffb'),
      u('photo-1502672260266-1c1ef2d93688'),
      u('photo-1484154218962-a197022b5858'),
    ],
    host: {
      name: 'Lukas Berger',
      type: 'agency',
      yearsOnPlatform: 3,
      avatar: u('photo-1547425260-76bcadfb4f2c', 200),
      phoneMasked: '+49 ··· ··· · 12',
    },
  },
  {
    id: 'lis-003',
    title: {
      en: 'Elegant room near the Seine',
      es: 'Habitación elegante junto al Sena',
      ru: 'Элегантная комната у Сены',
    },
    city: { en: 'Paris', es: 'París', ru: 'Париж' },
    country: { en: 'France', es: 'Francia', ru: 'Франция' },
    address: { en: 'Rue Saint-Antoine, 17', es: 'Rue Saint-Antoine, 17', ru: 'Rue Saint-Antoine, 17' },
    kind: 'room',
    rooms: 1,
    area: 18,
    floor: 3,
    totalFloors: 6,
    builtYear: 1885,
    monthlyEur: 720,
    depositEur: 720,
    utilitiesEur: 60,
    minMonths: 4,
    amenities: ['wifi', 'kitchen-shared', 'concierge', 'furnished'],
    rules: { pets: false, smoking: false, children: false },
    description: {
      en: 'An elegant room in a Haussmann-era building in the 4th arrondissement, with a window onto the inner courtyard, a shared lounge with kitchen, and a concierge. Ideal for a long stay for one person or a couple.',
      es: 'Habitación elegante en un edificio haussmaniano del distrito IV, con ventana al patio interior, salón compartido con cocina y conserjería. Ideal para una estancia larga para una persona o una pareja.',
      ru: 'Изящная комната в османовском доме в IV округе, окно во внутренний двор, общий салон с кухней и консьерж-сервис. Идеально для долгосрочного проживания одного человека или пары.',
    },
    transport: {
      en: 'Metro 1 Saint-Paul — 2 min',
      es: 'Metro 1 Saint-Paul — 2 min',
      ru: 'Metro 1 Saint-Paul — 2 мин',
    },
    rating: 4.75,
    reviews: 132,
    guestFavorite: true,
    photo: u('photo-1554995207-c18c203602cb'),
    photos: [
      u('photo-1554995207-c18c203602cb'),
      u('photo-1493809842364-78817add7ffb'),
      u('photo-1502672260266-1c1ef2d93688'),
      u('photo-1505691938895-1758d7feb511'),
    ],
    host: {
      name: 'Camille Laurent',
      type: 'private',
      yearsOnPlatform: 5,
      avatar: u('photo-1500648767791-00dcc994a43e', 200),
      phoneMasked: '+33 · ·· ·· ·· 04',
    },
  },
  {
    id: 'lis-004',
    title: {
      en: 'Modern flat near Vondelpark',
      es: 'Piso moderno junto al Vondelpark',
      ru: 'Современная квартира у Вондел-парка',
    },
    city: { en: 'Amsterdam', es: 'Ámsterdam', ru: 'Амстердам' },
    country: { en: 'Netherlands', es: 'Países Bajos', ru: 'Нидерланды' },
    address: { en: 'Overtoom 220', es: 'Overtoom 220', ru: 'Overtoom 220' },
    kind: 'apartment',
    rooms: 3,
    area: 78,
    floor: 2,
    totalFloors: 4,
    builtYear: 1998,
    monthlyEur: 1890,
    depositEur: 1890,
    utilitiesEur: 110,
    minMonths: 6,
    amenities: ['wifi', 'bike-storage', 'washer', 'dishwasher', 'furnished'],
    rules: { pets: true, smoking: false, children: true },
    description: {
      en: 'A modern three-room apartment five minutes from Vondelpark, fully renovated in 2023. Large kitchen-living room, two bedrooms, bicycle storage in the entryway.',
      es: 'Piso moderno de tres habitaciones a cinco minutos del Vondelpark, reformado en 2023. Amplia cocina-salón, dos dormitorios, cuarto para bicicletas en el portal.',
      ru: 'Современная трёхкомнатная квартира в пяти минутах от парка Вондел, после ремонта 2023 года. Большая гостиная-кухня, две спальни, кладовая для велосипедов в подъезде.',
    },
    transport: {
      en: 'Tram 1 Constantijn Huygensstraat — 1 min',
      es: 'Tranvía 1 Constantijn Huygensstraat — 1 min',
      ru: 'Tram 1 Constantijn Huygensstraat — 1 мин',
    },
    rating: 4.88,
    reviews: 211,
    photo: u('photo-1493809842364-78817add7ffb'),
    photos: [
      u('photo-1493809842364-78817add7ffb'),
      u('photo-1505691938895-1758d7feb511'),
      u('photo-1502672260266-1c1ef2d93688'),
      u('photo-1554995207-c18c203602cb'),
      u('photo-1560448204-e02f11c3d0e2'),
    ],
    host: {
      name: 'Eva van Dijk',
      type: 'agency',
      yearsOnPlatform: 6,
      avatar: u('photo-1438761681033-6461ffad8d80', 200),
      phoneMasked: '+31 · ···· ·· 88',
    },
  },
  {
    id: 'lis-005',
    title: {
      en: 'Sunny room in the Old Town',
      es: 'Habitación soleada en el Casco Antiguo',
      ru: 'Солнечная комната в Старом Городе',
    },
    city: { en: 'Prague', es: 'Praga', ru: 'Прага' },
    country: { en: 'Czechia', es: 'Chequia', ru: 'Чехия' },
    address: { en: 'Karlova 12', es: 'Karlova 12', ru: 'Karlova 12' },
    kind: 'room',
    rooms: 1,
    area: 16,
    floor: 1,
    totalFloors: 3,
    builtYear: 1780,
    monthlyEur: 540,
    depositEur: 540,
    utilitiesEur: 50,
    minMonths: 3,
    amenities: ['wifi', 'heating', 'lounge-shared', 'furnished'],
    rules: { pets: false, smoking: false, children: true },
    description: {
      en: 'A sunny room in the historic centre of Prague, in an 18th-century building with a baroque façade, shared lounge with a fireplace and kitchen. Five minutes on foot to the Charles Bridge.',
      es: 'Habitación soleada en el centro histórico de Praga, en un edificio del siglo XVIII con fachada barroca, salón compartido con chimenea y cocina. A cinco minutos a pie del Puente de Carlos.',
      ru: 'Солнечная комната в историческом центре Праги, дом XVIII века с барочным фасадом, общий лаундж с камином и кухней. До Карлова моста — пять минут пешком.',
    },
    transport: {
      en: 'Metro A Staroměstská — 3 min',
      es: 'Metro A Staroměstská — 3 min',
      ru: 'Metro A Staroměstská — 3 мин',
    },
    rating: 4.67,
    reviews: 74,
    photo: u('photo-1493809842364-78817add7ffb'),
    photos: [
      u('photo-1493809842364-78817add7ffb'),
      u('photo-1502672260266-1c1ef2d93688'),
      u('photo-1554995207-c18c203602cb'),
      u('photo-1505691938895-1758d7feb511'),
    ],
    host: {
      name: 'Tomáš Novák',
      type: 'private',
      yearsOnPlatform: 2,
      avatar: u('photo-1463453091185-61582044d556', 200),
      phoneMasked: '+420 ··· ··· 31',
    },
  },
  {
    id: 'lis-006',
    title: {
      en: 'Loft with a rooftop view',
      es: 'Loft con vistas a la azotea',
      ru: 'Лофт с видом с крыши',
    },
    city: { en: 'Lisbon', es: 'Lisboa', ru: 'Лиссабон' },
    country: { en: 'Portugal', es: 'Portugal', ru: 'Португалия' },
    address: {
      en: 'Rua da Bica de Duarte Belo, 5',
      es: 'Rua da Bica de Duarte Belo, 5',
      ru: 'Rua da Bica de Duarte Belo, 5',
    },
    kind: 'apartment',
    rooms: 2,
    area: 58,
    floor: 4,
    totalFloors: 4,
    builtYear: 1925,
    monthlyEur: 1290,
    depositEur: 1290,
    utilitiesEur: 70,
    minMonths: 4,
    amenities: ['wifi', 'rooftop', 'ac', 'washer', 'furnished'],
    rules: { pets: true, smoking: true, children: true },
    description: {
      en: 'Top-floor loft with its own rooftop terrace overlooking the Tagus river. Recent renovation, A/C, washer. Bairro Alto neighborhood — restaurants and bars all around.',
      es: 'Loft en la última planta con terraza propia y vistas al río Tajo. Reforma reciente, aire acondicionado, lavadora. Barrio del Bairro Alto, restaurantes y bares alrededor.',
      ru: 'Лофт на верхнем этаже с собственной террасой на крыше и видом на реку Тежу. Свежий ремонт, кондиционер, стиральная машина. Район Bairro Alto — рестораны и бары вокруг.',
    },
    transport: {
      en: 'Tram 28 Bica — 2 min',
      es: 'Tranvía 28 Bica — 2 min',
      ru: 'Tram 28 Bica — 2 мин',
    },
    rating: 4.94,
    reviews: 268,
    guestFavorite: true,
    photo: u('photo-1560448204-e02f11c3d0e2'),
    photos: [
      u('photo-1560448204-e02f11c3d0e2'),
      u('photo-1493809842364-78817add7ffb'),
      u('photo-1502672260266-1c1ef2d93688'),
      u('photo-1505691938895-1758d7feb511'),
      u('photo-1554995207-c18c203602cb'),
    ],
    host: {
      name: 'Inês Costa',
      type: 'private',
      yearsOnPlatform: 7,
      avatar: u('photo-1502685104226-ee32379fefbe', 200),
      phoneMasked: '+351 ··· ··· · 19',
    },
  },
  {
    id: 'lis-007',
    title: {
      en: 'Quiet room in Almagro',
      es: 'Habitación tranquila en Almagro',
      ru: 'Тихая комната в Альмагро',
    },
    city: { en: 'Madrid', es: 'Madrid', ru: 'Мадрид' },
    country: { en: 'Spain', es: 'España', ru: 'Испания' },
    address: {
      en: 'Calle de Fernández de la Hoz, 60',
      es: 'Calle de Fernández de la Hoz, 60',
      ru: 'Calle de Fernández de la Hoz, 60',
    },
    kind: 'room',
    rooms: 1,
    area: 14,
    floor: 5,
    totalFloors: 7,
    builtYear: 1970,
    monthlyEur: 620,
    depositEur: 620,
    utilitiesEur: 55,
    minMonths: 6,
    amenities: ['wifi', 'heating', 'kitchen-shared', 'furnished'],
    rules: { pets: false, smoking: false, children: false },
    description: {
      en: 'A quiet room in the well-to-do Almagro district, with a window onto the inner courtyard. Shared kitchen and living room; the other two tenants are international students.',
      es: 'Habitación tranquila en el acomodado barrio de Almagro, con ventana al patio interior. Cocina y salón compartidos; los otros dos inquilinos son estudiantes internacionales.',
      ru: 'Тихая комната в благополучном районе Альмагро, окно во двор. Общая кухня и гостиная, два других жильца — студенты-международники.',
    },
    transport: {
      en: 'Metro L4 Iglesia — 4 min',
      es: 'Metro L4 Iglesia — 4 min',
      ru: 'Metro L4 Iglesia — 4 мин',
    },
    rating: 4.71,
    reviews: 102,
    photo: u('photo-1484154218962-a197022b5858'),
    photos: [
      u('photo-1484154218962-a197022b5858'),
      u('photo-1505691938895-1758d7feb511'),
      u('photo-1493809842364-78817add7ffb'),
      u('photo-1502672260266-1c1ef2d93688'),
    ],
    host: {
      name: 'Pablo Ruiz',
      type: 'agency',
      yearsOnPlatform: 4,
      avatar: u('photo-1506794778202-cad84cf45f1d', 200),
      phoneMasked: '+34 ··· ··· · 02',
    },
  },
  {
    id: 'lis-008',
    title: {
      en: 'Designer studio near the canals',
      es: 'Estudio de diseño junto a los canales',
      ru: 'Дизайнерская студия у каналов',
    },
    city: { en: 'Copenhagen', es: 'Copenhague', ru: 'Копенгаген' },
    country: { en: 'Denmark', es: 'Dinamarca', ru: 'Дания' },
    address: { en: 'Nørrebrogade 88', es: 'Nørrebrogade 88', ru: 'Nørrebrogade 88' },
    kind: 'studio',
    rooms: 1,
    area: 36,
    floor: 3,
    totalFloors: 5,
    builtYear: 2014,
    monthlyEur: 1340,
    depositEur: 1340,
    utilitiesEur: 95,
    minMonths: 5,
    amenities: ['wifi', 'bike-storage', 'washer', 'smart-lock', 'furnished'],
    rules: { pets: true, smoking: false, children: true },
    description: {
      en: 'Designer studio in Nørrebro — Scandinavian minimalism, oak floors, smart lock and underground bike parking. Canals and cafés within walking distance.',
      es: 'Estudio de diseño en Nørrebro: minimalismo escandinavo, suelos de roble, cerradura inteligente y aparcamiento subterráneo para bicicletas. Canales y cafés a un paso.',
      ru: 'Дизайнерская студия в Норребро — скандинавский минимализм, дубовые полы, smart-замок и подземная парковка для велосипеда. Каналы и кафе в шаговой доступности.',
    },
    transport: {
      en: 'Metro M3 Nørrebros Runddel — 5 min',
      es: 'Metro M3 Nørrebros Runddel — 5 min',
      ru: 'Metro M3 Nørrebros Runddel — 5 мин',
    },
    rating: 4.86,
    reviews: 158,
    photo: u('photo-1507089947368-19c1da9775ae'),
    photos: [
      u('photo-1507089947368-19c1da9775ae'),
      u('photo-1502672260266-1c1ef2d93688'),
      u('photo-1505691938895-1758d7feb511'),
      u('photo-1493809842364-78817add7ffb'),
    ],
    host: {
      name: 'Sofie Andersen',
      type: 'private',
      yearsOnPlatform: 3,
      avatar: u('photo-1531123897727-8f129e1688ce', 200),
      phoneMasked: '+45 ·· ·· ·· 60',
    },
  },
];

export function getListingById(id: string): DemoListing | undefined {
  return DEMO_LISTINGS.find((l) => l.id === id);
}
