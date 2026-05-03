export type Locale = 'ru' | 'en' | 'es';

export const LOCALES: Locale[] = ['ru', 'en', 'es'];

export const dictionaries = {
  ru: {
    appName: 'Smart Rent',
    tagline: 'Долгосрочная аренда комнат — просто, безопасно, прозрачно',
    nav: { dashboard: 'Дашборд', properties: 'Объекты', bookings: 'Бронирования', payments: 'Платежи', login: 'Войти', logout: 'Выйти', register: 'Регистрация' },
    auth: { email: 'Email', password: 'Пароль', firstName: 'Имя', lastName: 'Фамилия', role: 'Роль', tenant: 'Арендатор', landlord: 'Арендодатель', signIn: 'Войти', signUp: 'Создать аккаунт', noAccount: 'Нет аккаунта?', haveAccount: 'Уже есть аккаунт?' },
    common: { create: 'Создать', save: 'Сохранить', delete: 'Удалить', edit: 'Редактировать', cancel: 'Отмена', loading: 'Загрузка...', empty: 'Пока ничего нет', actions: 'Действия' },
    home: {
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
    dash: { incomeByMonth: 'Доход по месяцам', segmentsByStatus: 'Сегменты по статусу', overdue: 'Задолженность', activeLeases: 'Активные договоры', nextPayment: 'Ближайший платёж', noPayments: 'Платежей нет' },
  },
  en: {
    appName: 'Smart Rent',
    tagline: 'Long-term room rental — simple, secure, transparent',
    nav: { dashboard: 'Dashboard', properties: 'Properties', bookings: 'Bookings', payments: 'Payments', login: 'Sign in', logout: 'Sign out', register: 'Sign up' },
    auth: { email: 'Email', password: 'Password', firstName: 'First name', lastName: 'Last name', role: 'Role', tenant: 'Tenant', landlord: 'Landlord', signIn: 'Sign in', signUp: 'Create account', noAccount: 'No account?', haveAccount: 'Already have an account?' },
    common: { create: 'Create', save: 'Save', delete: 'Delete', edit: 'Edit', cancel: 'Cancel', loading: 'Loading...', empty: 'Nothing here yet', actions: 'Actions' },
    home: {
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
    dash: { incomeByMonth: 'Income by month', segmentsByStatus: 'Segments by status', overdue: 'Overdue', activeLeases: 'Active leases', nextPayment: 'Next payment', noPayments: 'No payments' },
  },
  es: {
    appName: 'Smart Rent',
    tagline: 'Alquiler de habitaciones a largo plazo — simple, seguro, transparente',
    nav: { dashboard: 'Panel', properties: 'Propiedades', bookings: 'Reservas', payments: 'Pagos', login: 'Entrar', logout: 'Salir', register: 'Registrarse' },
    auth: { email: 'Correo', password: 'Contraseña', firstName: 'Nombre', lastName: 'Apellido', role: 'Rol', tenant: 'Inquilino', landlord: 'Propietario', signIn: 'Entrar', signUp: 'Crear cuenta', noAccount: '¿Sin cuenta?', haveAccount: '¿Ya tienes cuenta?' },
    common: { create: 'Crear', save: 'Guardar', delete: 'Eliminar', edit: 'Editar', cancel: 'Cancelar', loading: 'Cargando...', empty: 'Aún no hay nada', actions: 'Acciones' },
    home: {
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
    dash: { incomeByMonth: 'Ingresos por mes', segmentsByStatus: 'Segmentos por estado', overdue: 'Vencidos', activeLeases: 'Contratos activos', nextPayment: 'Próximo pago', noPayments: 'Sin pagos' },
  },
} as const;

export type Dictionary = (typeof dictionaries)['ru'];
