# Changelog

## 0.2.0 — Деплой-pipeline (план A: GitHub Actions)

### Что добавлено

- `deploy/setup-server.sh` — однократный скрипт первичной настройки Ubuntu
  22.04 / 24.04: Docker Engine + Compose plugin (официальный репозиторий),
  пользователь `deploy` с группой `docker`, swap-файл 4 ГБ, ufw (22/80/443),
  fail2ban, unattended-upgrades, каталоги `/srv/smartrent` и `/var/log/smartrent`.
- `deploy/docker-compose.prod.yml` — production-overlay: ограничение памяти
  на контейнеры, json-file ротация логов, nginx как reverse-proxy на 80/443,
  certbot-сервис для авто-продления Let's Encrypt.
- `deploy/nginx/conf.d/{ip-only,domain}.conf.disabled` — два режима nginx:
  без HTTPS (по голому IP) и с HTTPS (Let's Encrypt). Активируются скриптом
  `deploy/render-nginx.sh` в зависимости от `APP_DOMAIN`.
- `deploy/nginx/snippets/ssl-hardening.conf` — TLS-настройки уровня Mozilla
  intermediate + HSTS, X-Frame-Options, Referrer-Policy.
- `deploy/issue-cert.sh` — однократный выпуск SSL-сертификата.
- `.github/workflows/deploy.yml` — деплой по push в `main`: проверка секретов,
  настройка SSH, `git pull` на сервере, `docker compose up -d --build`,
  ожидание `/health`, smoke-test.
- `docker-compose.yml` — добавлена переменная `BIND` для биндинга портов
  (`0.0.0.0` в dev, `127.0.0.1` в prod).
- `docs/06-production-deploy.md` — пошаговый гайд: секреты GitHub, выпуск
  сертификата, первый деплой, диагностика, отзыв доступа, бэкапы.

### Безопасность

- Сервер выходит наружу только портами 80/443 (nginx). IRIS и Next.js
  слушают только 127.0.0.1.
- Отдельный SSH-ключ под деплой, отдельный пользователь `deploy` без root,
  fail2ban на SSH.
- Современные TLS-настройки (TLS 1.2/1.3, Mozilla intermediate, HSTS).

## 0.1.0 — Этап 1. Ядро + первичный интерфейс

### Что сделано

**Ядро (InterSystems IRIS Community Edition)**

- Структура репозитория и Docker-стек: `docker-compose.yml`, `iris/Dockerfile`, `frontend/Dockerfile`.
- Установщик `SmartRent.Setup.Installer`:
  - создаёт namespace `SMARTRENT` с физическими БД на томе `/durable`,
  - регистрирует REST web-приложение `/api/smartrent/v1` (DispatchClass = `SmartRent.REST.Dispatch`).
- Модель данных (пакет `SmartRent.Model.*`):
  - `User` (роли admin/landlord/tenant, SHA-512+соль, заготовка под 2FA, верификация),
  - `Property` (объект, владелец, адрес, гео-координаты, документ собственности),
  - `Segment` (комната — цена, депозит, статус, сезонные коэффициенты, удобства, правила),
  - `Booking` (запрос с проверкой пересечений и расчётом стоимости),
  - `Lease` (договор с текстом, подписями обеих сторон, hash-подписью),
  - `Payment` (rent / deposit / utility / penalty / refund),
  - `UtilityBill` (коммунальные счета с правилами деления),
  - `Notification` (in-app уведомления),
  - `AuthToken` (Bearer-токены сессий).
- Сервисный слой (`SmartRent.Service.*`):
  - `Auth` — register / login / logout / resolveToken,
  - `Booking` — request / approve (создаёт Lease + платежи) / reject / overlap-check / сезонные коэффициенты,
  - `Payment` — создание платежей, фиксация оплаты, расчёт пени `ProcessOverdue`, деление коммуналки `SplitUtility`,
  - `Notification` — простой шлюз для in-app сообщений,
  - `Contract` — генерация шаблонного текста договора.
- REST-диспетчер `SmartRent.REST.Dispatch` + контроллеры `SmartRent.REST.{Auth,Properties,Segments,Bookings,Leases,Payments,Utilities,Notifications,Dashboard}`.
- Демо-данные `SmartRent.Setup.Fixtures.Load` (admin/landlord/tenant + квартира с тремя сегментами + одобренное бронирование).
- Healthcheck `/api/smartrent/v1/health`.

**Фронтенд (Next.js 14 + TypeScript + Tailwind)**

- Адаптивный современный UI (мобильный и десктопный), тёмная тема через CSS-переменные.
- i18n RU / EN / ES, переключатель в шапке, привязка к языку пользователя.
- Стейт-менеджер `zustand` с persist (токен и пользователь в localStorage).
- Прокси `/api/iris/*` → IRIS REST через rewrite (нет проблем с CORS из браузера).
- Страницы:
  - `/` — лендинг с тремя ключевыми фичами,
  - `/login`, `/register` — формы аутентификации,
  - `/dashboard` — дашборд для арендатора (ближайший платёж, активные договоры) и для арендодателя (доход по месяцам гистограммой, статусы сегментов, задолженность),
  - `/properties` — список и форма создания объекта,
  - `/properties/[id]` — детальная карточка с сегментами, формой добавления сегмента и встроенной формой бронирования,
  - `/bookings` — таблица с действиями approve/reject для арендодателя,
  - `/payments` — таблица платежей с кнопкой «Оплатить» (заглушка платёжного шлюза).

**Документация (`docs/`)**

- `01-architecture.md` — обзор архитектуры, контейнеры, безопасность, дальнейшее развитие.
- `02-data-model.md` — сущности, жизненный цикл бронирования, формулы, индексы.
- `03-rest-api.md` — справочник эндпоинтов с примерами.
- `04-deployment.md` — локальный запуск, демо-учётки, переход на платную лицензию IRIS, production-чек-лист.
- Этот `05-changelog.md`.

### Соответствие ТЗ

| Раздел ТЗ                                  | Статус | Где |
|--------------------------------------------|--------|-----|
| 2.1 Регистрация / роли / профили           | ✅ | `Service.Auth`, `REST.Auth` |
| 2.1 Двухфакторная аутентификация           | 🟡 заготовка в модели | `Model.User.TwoFactorSecret/Enabled` |
| 2.1 Верификация документов арендодателя    | 🟡 поле + флаг готовы; UI-загрузка скана — следующий этап | `Model.User.Verified*`, `Model.Property.OwnershipDocument` |
| 2.1 Мультиязычность RU/EN/ES               | ✅ | `frontend/src/i18n` |
| 2.1 Уведомления                            | ✅ in-app, ⏳ email/SMS-воркер на 2-й этап | `Model.Notification`, `REST.Notifications` |
| 2.2 Деление объекта на сегменты            | ✅ | `Model.Segment` |
| 2.2 Загрузка фото (5+) и документа         | 🟡 поле под документ есть; multi-upload фото — следующий этап |  |
| 2.2 Акт приёма-сдачи / дефектная ведомость | 🟡 поля `MoveInReport / MoveOutReport` готовы | `Model.Lease` |
| 2.3 Календарь бронирования + расчёт цены   | ✅ доступность через overlap-check, сезонные коэффициенты | `Service.Booking` |
| 2.3 Подтверждение/отказ + уведомления      | ✅ | `Service.Booking`, `REST.Bookings` |
| 2.4 Генерация договора + подпись           | ✅ шаблон + двойная подпись с hash; интеграция DocuSign — следующий этап | `Service.Contract`, `REST.Leases.Sign` |
| 2.4 Депозит и удержания                    | ✅ платёж типа `deposit` создаётся при approve | `Service.Payment` |
| 2.5 Онлайн-оплата                          | ✅ заглушка с полями `provider/providerId`; интеграция Stripe/PayPal — следующий этап | `REST.Payments.Pay` |
| 2.5 Деление коммунальных счетов            | ✅ `equal` / `byArea` | `Service.Payment.SplitUtility` |
| 2.5 Штрафы за просрочку                    | ✅ `ProcessOverdue` (запускать ежедневно как Task) | `Service.Payment` |
| 2.6 Дашборд арендодателя                   | ✅ доход по месяцам, статусы, задолженность | `REST.Dashboard.Landlord` + `/dashboard` |
| 2.6 Уведомления (новые брони, оплаты, …)   | ✅ in-app | `Service.Notification` |
| 3 Безопасность (SHA-512 + соль, токены)    | ✅ MVP-уровень | `Service.Auth`, `Model.User` |
| 3 GDPR / SSL / бэкапы                      | 📋 production-чек-лист | `docs/04-deployment.md` |
| 3 Производительность ≤ 2с / 10k конкурент. | 🟡 для бесплатной редакции IRIS — лимит 5 одновр. соединений; платная снимает |  |

Условные обозначения: ✅ готово • 🟡 заготовка / частично • ⏳ в плане следующего этапа • 📋 описано в чек-листе.
