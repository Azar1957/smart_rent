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
  /** Месячная плата в EUR. */
  monthlyEur: number;
  /** Депозит в EUR. */
  depositEur: number;
  /** Минимальный срок в месяцах. */
  minMonths: number;
  /** Включенные удобства / условия. */
  amenities: string[];
  /** Рейтинг 0..5 и кол-во отзывов — чисто визуальный сигнал доверия. */
  rating: number;
  reviews: number;
  guestFavorite?: boolean;
  /** Полноразмерное изображение для карточки. */
  photo: string;
}

const u = (id: string, w = 1200) =>
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
    monthlyEur: 1450,
    depositEur: 1450,
    minMonths: 6,
    amenities: ['Wi-Fi', 'A/C', 'Washer', 'Balcony'],
    rating: 4.92,
    reviews: 184,
    guestFavorite: true,
    photo: u('photo-1502672260266-1c1ef2d93688'),
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
    monthlyEur: 980,
    depositEur: 980,
    minMonths: 3,
    amenities: ['Wi-Fi', 'Heating', 'Kitchen'],
    rating: 4.81,
    reviews: 96,
    photo: u('photo-1505691938895-1758d7feb511'),
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
    monthlyEur: 720,
    depositEur: 720,
    minMonths: 4,
    amenities: ['Wi-Fi', 'Shared kitchen', 'Concierge'],
    rating: 4.75,
    reviews: 132,
    guestFavorite: true,
    photo: u('photo-1554995207-c18c203602cb'),
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
    monthlyEur: 1890,
    depositEur: 1890,
    minMonths: 6,
    amenities: ['Wi-Fi', 'Bike storage', 'Washer', 'Dishwasher'],
    rating: 4.88,
    reviews: 211,
    photo: u('photo-1493809842364-78817add7ffb'),
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
    monthlyEur: 540,
    depositEur: 540,
    minMonths: 3,
    amenities: ['Wi-Fi', 'Heating', 'Shared lounge'],
    rating: 4.67,
    reviews: 74,
    photo: u('photo-1493809842364-78817add7ffb'),
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
    monthlyEur: 1290,
    depositEur: 1290,
    minMonths: 4,
    amenities: ['Wi-Fi', 'Rooftop', 'A/C', 'Washer'],
    rating: 4.94,
    reviews: 268,
    guestFavorite: true,
    photo: u('photo-1560448204-e02f11c3d0e2'),
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
    monthlyEur: 620,
    depositEur: 620,
    minMonths: 6,
    amenities: ['Wi-Fi', 'Heating', 'Shared kitchen'],
    rating: 4.71,
    reviews: 102,
    photo: u('photo-1484154218962-a197022b5858'),
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
    monthlyEur: 1340,
    depositEur: 1340,
    minMonths: 5,
    amenities: ['Wi-Fi', 'Bike storage', 'Washer', 'Smart lock'],
    rating: 4.86,
    reviews: 158,
    photo: u('photo-1507089947368-19c1da9775ae'),
  },
];
