// Демо-витрина для главной страницы. Цены в EUR, отображение пересчитывается
// на лету через lib/currency.ts. Фотографии — публичные изображения Unsplash.

export interface DemoListing {
  id: string;
  title: string;
  city: string;
  country: string;
  address: string;
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
  /** Включенные удобства / условия. */
  amenities: string[];
  /** Чем разрешено / запрещено. */
  rules: { pets: boolean; smoking: boolean; children: boolean };
  /** Расширенное описание. */
  description: string;
  /** Метро / транспорт ближайший. */
  transport?: string;
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

export const DEMO_LISTINGS: DemoListing[] = [
  {
    id: 'lis-001',
    title: 'Bright apartment near Sagrada Família',
    city: 'Barcelona',
    country: 'Spain',
    address: 'Carrer de Mallorca, 401',
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
    amenities: ['Wi-Fi', 'A/C', 'Washer', 'Balcony', 'Furnished', 'Lift'],
    rules: { pets: true, smoking: false, children: true },
    description:
      'Светлая двухкомнатная квартира в районе Эшампле, в трёх минутах от Саграда Фамилия. Полностью меблирована и оборудована техникой, есть балкон с видом во двор-колодец. Дом 1962 года, кирпич, тихая лестничная клетка, лифт.',
    transport: 'Metro L2 / L5 Sagrada Família — 4 min',
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
      name: 'Marta',
      type: 'private',
      yearsOnPlatform: 4,
      avatar: u('photo-1494790108377-be9c29b29330', 200),
      phoneMasked: '+34 ··· ··· · 47',
    },
  },
  {
    id: 'lis-002',
    title: 'Cosy studio in Mitte',
    city: 'Berlin',
    country: 'Germany',
    address: 'Linienstraße 44',
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
    amenities: ['Wi-Fi', 'Heating', 'Kitchen', 'Furnished'],
    rules: { pets: false, smoking: false, children: true },
    description:
      'Уютная студия в самом центре Митте, в шаговой доступности от U-Bahn Rosenthaler Platz. Альтбау начала XX века, высокие потолки, дубовый паркет, двойные окна.',
    transport: 'U8 Rosenthaler Platz — 3 min',
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
      name: 'Lukas',
      type: 'agency',
      yearsOnPlatform: 3,
      avatar: u('photo-1547425260-76bcadfb4f2c', 200),
      phoneMasked: '+49 ··· ··· · 12',
    },
  },
  {
    id: 'lis-003',
    title: 'Elegant room near the Seine',
    city: 'Paris',
    country: 'France',
    address: 'Rue Saint-Antoine, 17',
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
    amenities: ['Wi-Fi', 'Shared kitchen', 'Concierge', 'Furnished'],
    rules: { pets: false, smoking: false, children: false },
    description:
      'Изящная комната в османовском доме в IV округе, окно во внутренний двор, общий салон с кухней и консьерж-сервис. Идеально для долгосрочного проживания одного человека или пары.',
    transport: 'Metro 1 Saint-Paul — 2 min',
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
      name: 'Camille',
      type: 'private',
      yearsOnPlatform: 5,
      avatar: u('photo-1500648767791-00dcc994a43e', 200),
      phoneMasked: '+33 · ·· ·· ·· 04',
    },
  },
  {
    id: 'lis-004',
    title: 'Modern flat near Vondelpark',
    city: 'Amsterdam',
    country: 'Netherlands',
    address: 'Overtoom 220',
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
    amenities: ['Wi-Fi', 'Bike storage', 'Washer', 'Dishwasher', 'Furnished'],
    rules: { pets: true, smoking: false, children: true },
    description:
      'Современная трёхкомнатная квартира в пяти минутах от парка Вондел, после ремонта 2023 года. Большая гостиная-кухня, две спальни, кладовая для велосипедов в подъезде.',
    transport: 'Tram 1 Constantijn Huygensstraat — 1 min',
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
      name: 'Eva',
      type: 'agency',
      yearsOnPlatform: 6,
      avatar: u('photo-1438761681033-6461ffad8d80', 200),
      phoneMasked: '+31 · ···· ·· 88',
    },
  },
  {
    id: 'lis-005',
    title: 'Sunny room in the Old Town',
    city: 'Prague',
    country: 'Czechia',
    address: 'Karlova 12',
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
    amenities: ['Wi-Fi', 'Heating', 'Shared lounge', 'Furnished'],
    rules: { pets: false, smoking: false, children: true },
    description:
      'Солнечная комната в историческом центре Праги, дом XVIII века с барочным фасадом, общий лаундж с камином и кухней. До Карлова моста — пять минут пешком.',
    transport: 'Metro A Staroměstská — 3 min',
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
      name: 'Tomáš',
      type: 'private',
      yearsOnPlatform: 2,
      avatar: u('photo-1463453091185-61582044d556', 200),
      phoneMasked: '+420 ··· ··· 31',
    },
  },
  {
    id: 'lis-006',
    title: 'Loft with rooftop view',
    city: 'Lisbon',
    country: 'Portugal',
    address: 'Rua da Bica de Duarte Belo, 5',
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
    amenities: ['Wi-Fi', 'Rooftop', 'A/C', 'Washer', 'Furnished'],
    rules: { pets: true, smoking: true, children: true },
    description:
      'Лофт на верхнем этаже с собственной террасой на крыше и видом на реку Тежу. Свежий ремонт, кондиционер, стиральная машина. Район Bairro Alto — рестораны и бары вокруг.',
    transport: 'Tram 28 Bica — 2 min',
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
      name: 'Inês',
      type: 'private',
      yearsOnPlatform: 7,
      avatar: u('photo-1502685104226-ee32379fefbe', 200),
      phoneMasked: '+351 ··· ··· · 19',
    },
  },
  {
    id: 'lis-007',
    title: 'Quiet room in Almagro',
    city: 'Madrid',
    country: 'Spain',
    address: 'Calle de Fernández de la Hoz, 60',
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
    amenities: ['Wi-Fi', 'Heating', 'Shared kitchen', 'Furnished'],
    rules: { pets: false, smoking: false, children: false },
    description:
      'Тихая комната в благополучном районе Альмагро, окно во двор. Общая кухня и гостиная, два других жильца — студенты-международники.',
    transport: 'Metro L4 Iglesia — 4 min',
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
      name: 'Pablo',
      type: 'agency',
      yearsOnPlatform: 4,
      avatar: u('photo-1506794778202-cad84cf45f1d', 200),
      phoneMasked: '+34 ··· ··· · 02',
    },
  },
  {
    id: 'lis-008',
    title: 'Designer studio near canals',
    city: 'Copenhagen',
    country: 'Denmark',
    address: 'Nørrebrogade 88',
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
    amenities: ['Wi-Fi', 'Bike storage', 'Washer', 'Smart lock', 'Furnished'],
    rules: { pets: true, smoking: false, children: true },
    description:
      'Дизайнерская студия в Норребро — скандинавский минимализм, дубовые полы, smart-замок и подземная парковка для велосипеда. Каналы и кафе в шаговой доступности.',
    transport: 'Metro M3 Nørrebros Runddel — 5 min',
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
      name: 'Sofie',
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
