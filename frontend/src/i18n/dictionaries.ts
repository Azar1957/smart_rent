export type Locale = 'ru' | 'en' | 'es';

export const LOCALES: Locale[] = ['en', 'es', 'ru'];

export interface Dictionary {
  appName: string;
  tagline: string;
  nav: {
    stays: string;
    dashboard: string;
    properties: string;
    bookings: string;
    payments: string;
    becomeHost: string;
    login: string;
    logout: string;
    register: string;
  };
  search: {
    where: string;
    wherePh: string;
    from: string;
    to: string;
    datePh: string;
    who: string;
    whoPh: string;
    button: string;
  };
  categories: {
    all: string;
    apartment: string;
    studio: string;
    room: string;
  };
  kind: {
    apartment: string;
    studio: string;
    room: string;
  };
  listing: {
    guestFavorite: string;
    perMonth: string;
    deposit: string;
    minTerm: string;
    monthsShort: string;
    roomsShort: string;
  };
  auth: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    tenant: string;
    landlord: string;
    signIn: string;
    signUp: string;
    noAccount: string;
    haveAccount: string;
  };
  common: {
    create: string;
    save: string;
    delete: string;
    edit: string;
    cancel: string;
    loading: string;
    empty: string;
    actions: string;
  };
  home: {
    featuredTitle: string;
    featuredSub: string;
    popularCities: string;
    whySmartRent: string;
    heroTitle: string;
    heroSub: string;
    ctaStart: string;
    ctaDemo: string;
    f1Title: string;
    f1Body: string;
    f2Title: string;
    f2Body: string;
    f3Title: string;
    f3Body: string;
  };
  dash: {
    incomeByMonth: string;
    segmentsByStatus: string;
    overdue: string;
    activeLeases: string;
    nextPayment: string;
    noPayments: string;
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    appName: 'smart rent',
    tagline: 'Long-term room rental — simple, secure, transparent',
    nav: {
      stays: 'Stays',
      dashboard: 'Dashboard',
      properties: 'Properties',
      bookings: 'Bookings',
      payments: 'Payments',
      becomeHost: 'Become a host',
      login: 'Sign in',
      logout: 'Sign out',
      register: 'Sign up',
    },
    search: {
      where: 'Where',
      wherePh: 'Search destinations',
      from: 'Move-in',
      to: 'Move-out',
      datePh: 'Add dates',
      who: 'Who',
      whoPh: 'Add tenants',
      button: 'Search',
    },
    categories: { all: 'All stays', apartment: 'Apartments', studio: 'Studios', room: 'Rooms' },
    kind: { apartment: 'Entire apartment', studio: 'Studio', room: 'Private room' },
    listing: {
      guestFavorite: 'Guest favourite',
      perMonth: '/ month',
      deposit: 'Deposit',
      minTerm: 'min.',
      monthsShort: 'mo.',
      roomsShort: 'rooms',
    },
    auth: {
      email: 'Email',
      password: 'Password',
      firstName: 'First name',
      lastName: 'Last name',
      role: 'Role',
      tenant: 'Tenant',
      landlord: 'Landlord',
      signIn: 'Sign in',
      signUp: 'Create account',
      noAccount: 'No account?',
      haveAccount: 'Already have an account?',
    },
    common: {
      create: 'Create',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      cancel: 'Cancel',
      loading: 'Loading...',
      empty: 'Nothing here yet',
      actions: 'Actions',
    },
    home: {
      featuredTitle: 'Featured stays',
      featuredSub: 'Long-term rentals across Europe — verified hosts, transparent pricing.',
      popularCities: 'Popular cities',
      whySmartRent: 'Why smart rent',
      heroTitle: 'Long-term room rental platform',
      heroSub: 'Manage properties, leases, utilities and finances from one dashboard.',
      ctaStart: 'Get started',
      ctaDemo: 'Open demo',
      f1Title: 'Properties & segments',
      f1Body: 'Rent each apartment by individual rooms with their own prices and rules.',
      f2Title: 'Contracts & e-signatures',
      f2Body: 'Auto-generate lease contracts and capture digital signatures of both parties.',
      f3Title: 'Finance & utilities',
      f3Body: 'Online payments, deposits, automatic utility splitting and late penalties.',
    },
    dash: {
      incomeByMonth: 'Income by month',
      segmentsByStatus: 'Segments by status',
      overdue: 'Overdue',
      activeLeases: 'Active leases',
      nextPayment: 'Next payment',
      noPayments: 'No payments',
    },
  },
  es: {
    appName: 'smart rent',
    tagline: 'Alquiler de habitaciones a largo plazo — simple, seguro, transparente',
    nav: {
      stays: 'Alojamientos',
      dashboard: 'Panel',
      properties: 'Propiedades',
      bookings: 'Reservas',
      payments: 'Pagos',
      becomeHost: 'Anuncia tu alojamiento',
      login: 'Entrar',
      logout: 'Salir',
      register: 'Registrarse',
    },
    search: {
      where: 'Dónde',
      wherePh: 'Buscar destinos',
      from: 'Entrada',
      to: 'Salida',
      datePh: 'Añadir fechas',
      who: 'Quién',
      whoPh: 'Añadir inquilinos',
      button: 'Buscar',
    },
    categories: { all: 'Todos', apartment: 'Apartamentos', studio: 'Estudios', room: 'Habitaciones' },
    kind: { apartment: 'Apartamento entero', studio: 'Estudio', room: 'Habitación privada' },
    listing: {
      guestFavorite: 'Favorito de huéspedes',
      perMonth: '/ mes',
      deposit: 'Depósito',
      minTerm: 'mín.',
      monthsShort: 'mes',
      roomsShort: 'hab.',
    },
    auth: {
      email: 'Correo',
      password: 'Contraseña',
      firstName: 'Nombre',
      lastName: 'Apellido',
      role: 'Rol',
      tenant: 'Inquilino',
      landlord: 'Propietario',
      signIn: 'Entrar',
      signUp: 'Crear cuenta',
      noAccount: '¿Sin cuenta?',
      haveAccount: '¿Ya tienes cuenta?',
    },
    common: {
      create: 'Crear',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      cancel: 'Cancelar',
      loading: 'Cargando...',
      empty: 'Aún no hay nada',
      actions: 'Acciones',
    },
    home: {
      featuredTitle: 'Alojamientos destacados',
      featuredSub: 'Alquileres a largo plazo en Europa — anfitriones verificados, precios transparentes.',
      popularCities: 'Ciudades populares',
      whySmartRent: 'Por qué smart rent',
      heroTitle: 'Plataforma de alquiler de habitaciones a largo plazo',
      heroSub: 'Gestiona propiedades, contratos, servicios y finanzas en un solo panel.',
      ctaStart: 'Empezar',
      ctaDemo: 'Ver demo',
      f1Title: 'Propiedades y segmentos',
      f1Body: 'Alquila cada apartamento por habitaciones con precios y reglas propias.',
      f2Title: 'Contratos y firmas',
      f2Body: 'Genera contratos automáticamente y captura firmas electrónicas de ambas partes.',
      f3Title: 'Finanzas y servicios',
      f3Body: 'Pagos en línea, depósitos, división automática de servicios y penalizaciones por atraso.',
    },
    dash: {
      incomeByMonth: 'Ingresos por mes',
      segmentsByStatus: 'Segmentos por estado',
      overdue: 'Vencidos',
      activeLeases: 'Contratos activos',
      nextPayment: 'Próximo pago',
      noPayments: 'Sin pagos',
    },
  },
  ru: {
    appName: 'smart rent',
    tagline: 'Долгосрочная аренда комнат — просто, безопасно, прозрачно',
    nav: {
      stays: 'Жильё',
      dashboard: 'Дашборд',
      properties: 'Объекты',
      bookings: 'Бронирования',
      payments: 'Платежи',
      becomeHost: 'Сдать жильё',
      login: 'Войти',
      logout: 'Выйти',
      register: 'Регистрация',
    },
    search: {
      where: 'Куда',
      wherePh: 'Поиск направлений',
      from: 'Заезд',
      to: 'Выезд',
      datePh: 'Выбрать даты',
      who: 'Кто',
      whoPh: 'Добавить жильцов',
      button: 'Поиск',
    },
    categories: { all: 'Всё жильё', apartment: 'Квартиры', studio: 'Студии', room: 'Комнаты' },
    kind: { apartment: 'Целая квартира', studio: 'Студия', room: 'Отдельная комната' },
    listing: {
      guestFavorite: 'Выбор гостей',
      perMonth: '/ мес',
      deposit: 'Депозит',
      minTerm: 'мин.',
      monthsShort: 'мес.',
      roomsShort: 'комн.',
    },
    auth: {
      email: 'Email',
      password: 'Пароль',
      firstName: 'Имя',
      lastName: 'Фамилия',
      role: 'Роль',
      tenant: 'Арендатор',
      landlord: 'Арендодатель',
      signIn: 'Войти',
      signUp: 'Создать аккаунт',
      noAccount: 'Нет аккаунта?',
      haveAccount: 'Уже есть аккаунт?',
    },
    common: {
      create: 'Создать',
      save: 'Сохранить',
      delete: 'Удалить',
      edit: 'Редактировать',
      cancel: 'Отмена',
      loading: 'Загрузка...',
      empty: 'Пока ничего нет',
      actions: 'Действия',
    },
    home: {
      featuredTitle: 'Подборка жилья',
      featuredSub: 'Долгосрочная аренда по Европе — проверенные арендодатели, прозрачные цены.',
      popularCities: 'Популярные города',
      whySmartRent: 'Почему smart rent',
      heroTitle: 'Платформа долгосрочной аренды комнат',
      heroSub: 'Управляйте объектами, договорами, коммунальными платежами и финансами в одном окне.',
      ctaStart: 'Начать бесплатно',
      ctaDemo: 'Войти в демо',
      f1Title: 'Объекты и сегменты',
      f1Body: 'Сдавайте квартиру по комнатам с уникальными ценами и правилами для каждой.',
      f2Title: 'Договоры и подписи',
      f2Body: 'Автогенерация шаблонных договоров и электронные подписи арендатора и арендодателя.',
      f3Title: 'Финансы и коммуналка',
      f3Body: 'Онлайн-оплата, депозиты, автоматическое деление коммунальных счетов и пени за просрочку.',
    },
    dash: {
      incomeByMonth: 'Доход по месяцам',
      segmentsByStatus: 'Сегменты по статусу',
      overdue: 'Задолженность',
      activeLeases: 'Активные договоры',
      nextPayment: 'Ближайший платёж',
      noPayments: 'Платежей нет',
    },
  },
};
