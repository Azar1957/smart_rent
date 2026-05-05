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
  amenities: Record<string, string>;
  bookingModal: {
    title: string;
    doneTitle: string;
    doneSub: string;
    doneNote: string;
    startDate: string;
    endDate: string;
    name: string;
    email: string;
    note: string;
    notePh: string;
    confirm: string;
    close: string;
    disclaimer: string;
  };
  listing: {
    guestFavorite: string;
    perMonth: string;
    deposit: string;
    utilities: string;
    minTerm: string;
    minTermLong: string;
    monthsShort: string;
    roomsShort: string;
    yearsShort: string;
    rooms: string;
    area: string;
    floor: string;
    builtYear: string;
    transport: string;
    kindLabel: string;
    reviews: string;
    save: string;
    share: string;
    about: string;
    params: string;
    amenities: string;
    rules: string;
    petsAllowed: string;
    petsNotAllowed: string;
    smokingAllowed: string;
    smokingNotAllowed: string;
    childrenAllowed: string;
    childrenNotAllowed: string;
    location: string;
    mapPlaceholder: string;
    requestBooking: string;
    writeMessage: string;
    priceDisclaimer: string;
    hostedBy: string;
    hostedByAgency: string;
    yearsHosting: string;
    verifiedHost: string;
    agency: string;
    privatePerson: string;
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
    heroEyebrow: string;
    heroTitle: string;
    heroSub: string;
    heroCtaPrimary: string;
    heroCtaSecondary: string;
    featuredEyebrow: string;
    featuredTitle: string;
    featuredSub: string;
    popularCities: string;
    whySmartRent: string;
    whyEyebrow: string;
    whyTitle: string;
    whySub: string;
    ctaStart: string;
    ctaDemo: string;
    f1Title: string;
    f1Body: string;
    f2Title: string;
    f2Body: string;
    f3Title: string;
    f3Body: string;
    f4Title: string;
    f4Body: string;
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
    amenities: {
      wifi: 'Wi-Fi',
      ac: 'Air conditioning',
      heating: 'Heating',
      washer: 'Washer',
      dishwasher: 'Dishwasher',
      kitchen: 'Kitchen',
      'kitchen-shared': 'Shared kitchen',
      'lounge-shared': 'Shared lounge',
      furnished: 'Fully furnished',
      balcony: 'Balcony',
      rooftop: 'Rooftop',
      lift: 'Lift',
      'bike-storage': 'Bike storage',
      'smart-lock': 'Smart lock',
      concierge: 'Concierge',
    },
    bookingModal: {
      title: 'Request to book',
      doneTitle: 'Request sent',
      doneSub: 'Your booking request has been sent for',
      doneNote:
        'The host will reply to you by email within 24 hours. You can track the request in your dashboard.',
      startDate: 'Move-in',
      endDate: 'Move-out',
      name: 'Full name',
      email: 'Email',
      note: 'Message to host (optional)',
      notePh: 'Tell the host a few words about yourself.',
      confirm: 'Send request',
      close: 'Close',
      disclaimer:
        'Sending a request does not charge you. Payment is collected only after the host accepts.',
    },
    listing: {
      guestFavorite: 'Guest favourite',
      perMonth: '/ month',
      deposit: 'Deposit',
      utilities: 'Utilities (approx.)',
      minTerm: 'min.',
      minTermLong: 'Minimum term',
      monthsShort: 'mo.',
      roomsShort: 'rooms',
      yearsShort: 'yrs',
      rooms: 'Rooms',
      area: 'Area',
      floor: 'Floor',
      builtYear: 'Built',
      transport: 'Transport',
      kindLabel: 'Type',
      reviews: 'reviews',
      save: 'Save',
      share: 'Share',
      about: 'About this place',
      params: 'Parameters',
      amenities: 'What this place offers',
      rules: 'House rules',
      petsAllowed: 'Pets allowed',
      petsNotAllowed: 'No pets',
      smokingAllowed: 'Smoking allowed',
      smokingNotAllowed: 'No smoking',
      childrenAllowed: 'Suitable for children',
      childrenNotAllowed: 'Not suitable for children',
      location: 'Where you’ll live',
      mapPlaceholder: 'Map preview',
      requestBooking: 'Request to book',
      writeMessage: 'Message host',
      priceDisclaimer:
        'Prices are shown in your selected currency, converted from EUR at indicative rates.',
      hostedBy: 'Hosted by',
      hostedByAgency: 'Listed by',
      yearsHosting: 'years on the platform',
      verifiedHost: 'Verified',
      agency: 'Agency',
      privatePerson: 'Private host',
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
      heroEyebrow: 'Long-term rentals',
      heroTitle: 'Live in the world’s best cities — by the month.',
      heroSub:
        'Verified apartments, transparent pricing in your currency and a single dashboard for the entire lease.',
      heroCtaPrimary: 'Browse stays',
      heroCtaSecondary: 'Become a host',
      featuredEyebrow: 'Featured',
      featuredTitle: 'Curated long-term homes',
      featuredSub: 'Hand-picked apartments and rooms across Europe. Click any card to open the listing.',
      popularCities: 'Popular cities',
      whySmartRent: 'Why smart rent',
      whyEyebrow: 'Why smart rent',
      whyTitle: 'A long-term rental platform that respects your time and money.',
      whySub:
        'Built for residents who stay for months — and for the hosts who serve them.',
      ctaStart: 'Get started',
      ctaDemo: 'Open demo',
      f1Title: 'Verified hosts',
      f1Body:
        'Each landlord is identity-verified before publishing. Agencies are clearly marked.',
      f2Title: 'Properties & segments',
      f2Body:
        'Rent each apartment whole or by individual rooms with their own prices and rules.',
      f3Title: 'Multi-currency, no surprises',
      f3Body:
        'Prices stored in EUR, displayed in your currency. Utilities and deposits shown upfront.',
      f4Title: 'Contracts in 3 languages',
      f4Body:
        'Auto-generated lease contracts and digital signatures, in English, Spanish or Russian.',
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
    amenities: {
      wifi: 'Wi-Fi',
      ac: 'Aire acondicionado',
      heating: 'Calefacción',
      washer: 'Lavadora',
      dishwasher: 'Lavavajillas',
      kitchen: 'Cocina',
      'kitchen-shared': 'Cocina compartida',
      'lounge-shared': 'Salón compartido',
      furnished: 'Totalmente amueblado',
      balcony: 'Balcón',
      rooftop: 'Azotea',
      lift: 'Ascensor',
      'bike-storage': 'Trastero para bicis',
      'smart-lock': 'Cerradura inteligente',
      concierge: 'Conserjería',
    },
    bookingModal: {
      title: 'Solicitar reserva',
      doneTitle: 'Solicitud enviada',
      doneSub: 'Tu solicitud se ha enviado para',
      doneNote:
        'El anfitrión te responderá por email en las próximas 24 horas. Puedes seguir la solicitud en tu panel.',
      startDate: 'Entrada',
      endDate: 'Salida',
      name: 'Nombre completo',
      email: 'Correo',
      note: 'Mensaje al anfitrión (opcional)',
      notePh: 'Cuéntale al anfitrión un poco sobre ti.',
      confirm: 'Enviar solicitud',
      close: 'Cerrar',
      disclaimer:
        'Enviar la solicitud no genera ningún cargo. El pago se realiza solo cuando el anfitrión acepta.',
    },
    listing: {
      guestFavorite: 'Favorito de huéspedes',
      perMonth: '/ mes',
      deposit: 'Depósito',
      utilities: 'Servicios (aprox.)',
      minTerm: 'mín.',
      minTermLong: 'Plazo mínimo',
      monthsShort: 'mes',
      roomsShort: 'hab.',
      yearsShort: 'años',
      rooms: 'Habitaciones',
      area: 'Superficie',
      floor: 'Planta',
      builtYear: 'Construido',
      transport: 'Transporte',
      kindLabel: 'Tipo',
      reviews: 'opiniones',
      save: 'Guardar',
      share: 'Compartir',
      about: 'Sobre este alojamiento',
      params: 'Parámetros',
      amenities: 'Lo que ofrece este alojamiento',
      rules: 'Normas',
      petsAllowed: 'Mascotas permitidas',
      petsNotAllowed: 'No se admiten mascotas',
      smokingAllowed: 'Se permite fumar',
      smokingNotAllowed: 'No se permite fumar',
      childrenAllowed: 'Apto para niños',
      childrenNotAllowed: 'No apto para niños',
      location: 'Dónde vivirás',
      mapPlaceholder: 'Vista previa del mapa',
      requestBooking: 'Solicitar reserva',
      writeMessage: 'Mensaje al anfitrión',
      priceDisclaimer:
        'Precios mostrados en la moneda seleccionada, convertidos desde EUR a tipos indicativos.',
      hostedBy: 'Anfitrión',
      hostedByAgency: 'Publicado por',
      yearsHosting: 'años en la plataforma',
      verifiedHost: 'Verificado',
      agency: 'Agencia',
      privatePerson: 'Particular',
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
      heroEyebrow: 'Alquileres a largo plazo',
      heroTitle: 'Vive en las mejores ciudades del mundo, mes a mes.',
      heroSub:
        'Pisos verificados, precios transparentes en tu moneda y un solo panel para todo el contrato.',
      heroCtaPrimary: 'Ver alojamientos',
      heroCtaSecondary: 'Anuncia tu alojamiento',
      featuredEyebrow: 'Destacados',
      featuredTitle: 'Hogares de larga estancia seleccionados',
      featuredSub:
        'Apartamentos y habitaciones por toda Europa. Pulsa cualquier tarjeta para ver el anuncio.',
      popularCities: 'Ciudades populares',
      whySmartRent: 'Por qué smart rent',
      whyEyebrow: 'Por qué smart rent',
      whyTitle: 'Una plataforma de alquiler que respeta tu tiempo y tu dinero.',
      whySub: 'Pensada para quienes se quedan meses — y para los anfitriones que los alojan.',
      ctaStart: 'Empezar',
      ctaDemo: 'Ver demo',
      f1Title: 'Anfitriones verificados',
      f1Body:
        'Cada propietario se verifica antes de publicar. Las agencias se marcan claramente.',
      f2Title: 'Propiedades y segmentos',
      f2Body:
        'Alquila el piso entero o por habitaciones, con precios y reglas propios.',
      f3Title: 'Multimoneda, sin sorpresas',
      f3Body:
        'Precios en EUR, mostrados en tu moneda. Servicios y depósitos siempre por adelantado.',
      f4Title: 'Contratos en 3 idiomas',
      f4Body:
        'Contratos generados automáticamente y firmas digitales en inglés, español o ruso.',
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
    amenities: {
      wifi: 'Wi-Fi',
      ac: 'Кондиционер',
      heating: 'Отопление',
      washer: 'Стиральная машина',
      dishwasher: 'Посудомоечная машина',
      kitchen: 'Кухня',
      'kitchen-shared': 'Общая кухня',
      'lounge-shared': 'Общая гостиная',
      furnished: 'Полностью меблирована',
      balcony: 'Балкон',
      rooftop: 'Терраса на крыше',
      lift: 'Лифт',
      'bike-storage': 'Велокомната',
      'smart-lock': 'Умный замок',
      concierge: 'Консьерж',
    },
    bookingModal: {
      title: 'Заявка на бронирование',
      doneTitle: 'Заявка отправлена',
      doneSub: 'Ваша заявка отправлена по объявлению',
      doneNote:
        'Арендодатель ответит вам по email в течение 24 часов. Статус заявки можно отслеживать в личном кабинете.',
      startDate: 'Заезд',
      endDate: 'Выезд',
      name: 'Имя и фамилия',
      email: 'Email',
      note: 'Сообщение арендодателю (по желанию)',
      notePh: 'Расскажите о себе в нескольких словах.',
      confirm: 'Отправить заявку',
      close: 'Закрыть',
      disclaimer:
        'Отправка заявки бесплатна. Оплата происходит только после того, как арендодатель её одобрит.',
    },
    listing: {
      guestFavorite: 'Выбор гостей',
      perMonth: '/ мес',
      deposit: 'Депозит',
      utilities: 'Коммуналка (≈)',
      minTerm: 'мин.',
      minTermLong: 'Минимальный срок',
      monthsShort: 'мес.',
      roomsShort: 'комн.',
      yearsShort: 'лет',
      rooms: 'Комнат',
      area: 'Площадь',
      floor: 'Этаж',
      builtYear: 'Год постройки',
      transport: 'Транспорт',
      kindLabel: 'Тип',
      reviews: 'отзывов',
      save: 'Сохранить',
      share: 'Поделиться',
      about: 'Об объявлении',
      params: 'Параметры',
      amenities: 'Что включено',
      rules: 'Правила',
      petsAllowed: 'Можно с животными',
      petsNotAllowed: 'Без животных',
      smokingAllowed: 'Можно курить',
      smokingNotAllowed: 'Не курить',
      childrenAllowed: 'Можно с детьми',
      childrenNotAllowed: 'Не подходит для детей',
      location: 'Где вы будете жить',
      mapPlaceholder: 'Карта (превью)',
      requestBooking: 'Забронировать',
      writeMessage: 'Написать арендодателю',
      priceDisclaimer:
        'Цены показаны в выбранной вами валюте, пересчёт из EUR по индикативному курсу.',
      hostedBy: 'Сдаёт',
      hostedByAgency: 'Сдаёт агентство',
      yearsHosting: 'лет на платформе',
      verifiedHost: 'Верифицирован',
      agency: 'Агентство',
      privatePerson: 'Частное лицо',
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
      heroEyebrow: 'Долгосрочная аренда',
      heroTitle: 'Жить в лучших городах мира — помесячно.',
      heroSub:
        'Проверенные квартиры, прозрачные цены в вашей валюте и единый кабинет для всего срока аренды.',
      heroCtaPrimary: 'Смотреть жильё',
      heroCtaSecondary: 'Сдать жильё',
      featuredEyebrow: 'Подборка',
      featuredTitle: 'Жильё для долгой жизни',
      featuredSub:
        'Отобранные квартиры и комнаты по всей Европе. Нажмите на карточку, чтобы открыть объявление.',
      popularCities: 'Популярные города',
      whySmartRent: 'Почему smart rent',
      whyEyebrow: 'Почему smart rent',
      whyTitle: 'Платформа долгосрочной аренды, которая уважает ваше время и деньги.',
      whySub:
        'Сделано для тех, кто живёт месяцами — и для арендодателей, которые их принимают.',
      ctaStart: 'Начать бесплатно',
      ctaDemo: 'Войти в демо',
      f1Title: 'Проверенные арендодатели',
      f1Body:
        'Каждый собственник проходит верификацию до публикации. Агентства помечены отдельно.',
      f2Title: 'Объекты и сегменты',
      f2Body:
        'Сдавайте квартиру целиком или по комнатам — со своими ценами и правилами.',
      f3Title: 'Мультивалютность без сюрпризов',
      f3Body:
        'Цены хранятся в EUR, показываются в вашей валюте. Депозит и коммуналка — заранее.',
      f4Title: 'Договоры на 3 языках',
      f4Body:
        'Автогенерация договоров и электронные подписи на английском, испанском или русском.',
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
