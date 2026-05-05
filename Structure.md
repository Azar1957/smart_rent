# Smart Rent — Архитектура базы данных и доменной модели

> **Living document / Живой документ.** Обновляется каждый раз, когда меняются
> persistent-классы, индексы или демо-фикстуры.
>
> Каждый раздел документа сопровождается **русскоязычным комментарием**,
> где простым языком описано, что эта сущность делает в продукте.
>
> **Стек.** InterSystems IRIS 2026.1, namespace `SMARTRENT`, постоянные
> данные в глобалах `^SR.*`. Backend-код — `iris/src/SmartRent/`, фронтенд —
> `frontend/`. Базовый URL REST — `/api/smartrent/v1`.

---

## 1. Доменная модель в одну схему

> **Что это.** Главная картинка проекта: какие сущности живут в системе и
> кто кого «знает».
>
> Логика бизнеса:
> 1. **Пользователь (User)** регистрируется и получает одну из ролей:
>    `admin`, `landlord` (арендодатель) или `tenant` (арендатор).
> 2. **Арендодатель** заводит **Property (объект)** — физическую квартиру.
> 3. Объект делится на **Segment**ы. Сегмент = «единица сдачи»:
>    - либо вся квартира целиком (один сегмент с кодом `FULL`),
>    - либо отдельные комнаты (несколько сегментов на один Property).
> 4. **Tenant** оставляет **Booking (заявку)** на сегмент и даты.
> 5. После подтверждения заявка превращается в **Lease (договор)**, в
>    нём фиксируются месячная плата, депозит и валюта на момент подписания.
> 6. По договору рождаются **Payment**'ы (`rent`, `deposit`, `utility`,
>    `penalty`, `refund`).
> 7. **UtilityBill** — это коммунальный счёт на объект целиком; сервис
>    `Service.Payment.SplitUtility` делит его на отдельные `Payment`'ы по
>    каждому активному арендатору.
> 8. **Notification** — уведомление пользователю в личный кабинет.
> 9. **AuthToken** — токен сессии (вместо JWT, чтобы было проще).

```
User ─┬─< Property ──< Segment ──< Booking ──< Lease ──< Payment
      │                                            │
      └─< AuthToken                                └─< UtilityBill (per Property)
                                                  └─< Notification (per User)
```

Краткий глоссарий ролей и сущностей:

- **User.** Пользователь платформы. Ровно одна роль одновременно.
- **Property.** Физический объект недвижимости (квартира/дом), принадлежит
  одному `landlord`.
- **Segment.** Единица сдачи внутри объекта. Универсальная: и «вся квартира»
  это сегмент, и «комната №2» это тоже сегмент.
- **Booking.** Заявка арендатора на даты. Жизненный цикл:
  `pending → approved | rejected | cancelled | completed`.
- **Lease.** Договор аренды; содержит подписанный текст и снимок цены.
- **Payment.** Конкретный платёж по договору; это и аренда, и коммуналка,
  и депозит, и пеня, и возврат.
- **UtilityBill.** Один счёт за коммуналку на объект; делится между
  активными арендаторами.
- **Notification.** Сообщение пользователю в инбоксе личного кабинета.
- **AuthToken.** Прозрачный bearer-токен, выдаётся на 24 часа.

---

## 2. Persistent-классы (таблицы)

> **Соглашение.** Все модели лежат в пакете `SmartRent.Model`, наследуются
> от `%Persistent` + `%JSON.Adaptor`. Каждый класс умеет в `ToJSON()` /
> `ToPublicJSON()` — это контракт для REST.

### 2.1 `SmartRent.Model.User` · global `^SR.User*`

> **Что хранит.** Аккаунт пользователя — email, пароль (хэш + соль),
> роль, имя/фамилия/телефон, язык интерфейса, флаг 2FA, статус
> верификации арендодателя (`Verified`), флаг активности.

| Свойство | Тип | Заметки |
|---------------------|-----------------------------------------------|-------|
| `Email`             | `%String(255)`                                | required, unique (`EmailIdx`) |
| `PasswordHash`      | `%String(256)` `[Internal]`                   | hex-строка SHA-512(password+salt) |
| `PasswordSalt`      | `%String(64)`  `[Internal]`                   | hex-строка 16-байтовой случайной соли |
| `Role`              | `%String VALUELIST=,admin,landlord,tenant`    | required, default `tenant` |
| `FirstName`/`LastName`/`Phone` | `%String`                          | профиль |
| `Language`          | `%String VALUELIST=,ru,en,es`                 | язык интерфейса по умолчанию |
| `TwoFactorSecret`/`TwoFactorEnabled` | TOTP, опционально           | |
| `Verified` / `VerifiedAt` | `%Boolean` / `%TimeStamp`               | KYC арендодателя |
| `Active`            | `%Boolean`                                    | мягкая деактивация |
| `CreatedAt` / `UpdatedAt` | проставляются автоматически             | trigger обновляет `UpdatedAt` |

Индексы: `EmailIdx (Email) UNIQUE`, `RoleIdx (Role)`.

> **Безопасность паролей.** Хэширование и проверка реализованы в
> `Model.User.SetPassword` / `CheckPassword` через
> `$system.Encryption.SHAHash(512, ...)`, соль и хэш кодируются в hex,
> чтобы безопасно лежать в `%String` при Unicode-инстансе IRIS.
> До PR #6 использовался метод `SHA512Hash(...)`, которого в IRIS 2026.1
> просто нет — это и было причиной HTTP 500 на `/auth/login`.

### 2.2 `SmartRent.Model.AuthToken` · global `^SR.AuthToken*`

> **Что хранит.** Bearer-токен сессии. Один пользователь может иметь
> много активных токенов (несколько устройств), TTL 24 часа.

| Свойство | Тип | Заметки |
|---|---|---|
| `Token` | `%String(128)` | required, unique (`TokenIdx`), hex |
| `User` | → `User` | required, индекс `UserIdx` |
| `IssuedAt` | auto | |
| `ExpiresAt` | `%TimeStamp` | TTL = 24 ч (см. `Service.Auth.TOKENTTL`) |
| `Revoked` | `%Boolean` | logout / админ-kill |
| `UserAgent` / `RemoteIp` | `%String` | аудит |

### 2.3 `SmartRent.Model.Property` · global `^SR.Property*`

> **Что хранит.** Физический объект, принадлежит одному арендодателю.
> Адрес и координаты — для карточки объявления и карты.

| Свойство | Тип | Заметки |
|---|---|---|
| `Owner` | → `User` | required, индексирован |
| `Title` / `Description` | `%String` | текст для витрины |
| `Country` / `City` / `Address` | `%String` | индекс `CityIdx (City)` |
| `Lat` / `Lng` | `%Double` | для карты |
| `PropertyType` | `apartment | house | studio` | |
| `TotalRooms` / `TotalArea` / `Floor` / `HasElevator` | факты | |
| `OwnershipDocument` | `%Stream.GlobalBinary` | KYC-скан |
| `Active` | `%Boolean` | скрыть из каталога |

### 2.4 `SmartRent.Model.Segment` · global `^SR.Segment*`

> **Что хранит.** Единица сдачи. **Один Property** может иметь либо один
> сегмент `FULL` (вся квартира целиком), либо несколько комнатных
> сегментов с уникальными кодами в рамках объекта (`R1`, `R2`, …).
> Один и тот же класс описывает оба режима — отдельного «RoomMode»-флага нет.

| Свойство | Тип | Заметки |
|---|---|---|
| `Property` | → `Property` | required, индексирован |
| `Code` | `%String(32)` | уникален в рамках объекта (`PropCodeIdx`) |
| `Title` / `Description` / `Area` / `Beds` / `Furnished` | факты | |
| `MonthlyPrice` / `Currency` / `DepositAmount` | деньги | |
| `Status` | `available | reserved | occupied | maintenance | rented` | |
| `SeasonalFactors` | JSON `{"01":1.0,"06":1.2}` | учитывается при бронировании |
| `Amenities` / `Rules` | JSON-массивы | |

### 2.5 `SmartRent.Model.Booking` · global `^SR.Booking*`

> **Что хранит.** Заявку на аренду конкретного сегмента в конкретные
> даты. Используется для проверки пересечений: на один сегмент в
> заданный промежуток разрешён только один pending/approved Booking.

| Свойство | Тип | Заметки |
|---|---|---|
| `Segment` | → `Segment` | required, индексирован |
| `Tenant`  | → `User`    | required, индексирован |
| `StartDate` / `EndDate` | `%Date` | required |
| `Status`  | `pending | approved | rejected | cancelled | completed` | |
| `TotalPrice` / `Currency` | деньги | |
| `Note` / `RejectReason` | текст | |
| `CreatedAt` / `DecidedAt` | таймстампы | |

Композитный индекс `DateRange (Segment, StartDate, EndDate)` используется
для проверки пересечений в `Service.Booking.HasOverlap`.

### 2.6 `SmartRent.Model.Lease` · global `^SR.Lease*`

> **Что хранит.** Договор. Один Booking → ровно один Lease (`BookingIdx`
> уникален). Здесь живут подписи обеих сторон, текст договора (поток),
> и копия цены/депозита/валюты на момент подписания (важно: даже если
> сегмент потом подорожает, в действующем договоре цена остаётся прежней).

| Свойство | Тип | Заметки |
|---|---|---|
| `Booking` | → `Booking` | required, **unique** (`BookingIdx`) |
| `Segment` / `Tenant` / `Landlord` | refs | индексированы |
| `StartDate` / `EndDate` | даты | |
| `MonthlyPrice` / `DepositAmount` / `Currency` | снимок на момент подписания | |
| `Status` | `draft | active | terminated | finished` | |
| `ContractText` | `%Stream.GlobalCharacter` | рендерит `Service.Contract.Render` |
| `TenantSignedAt` / `LandlordSignedAt` / `SignatureHash` | электронная подпись | |
| `MoveInReport` / `MoveOutReport` | JSON | |
| `TerminationReason` | текст | |

### 2.7 `SmartRent.Model.Payment` · global `^SR.Payment*`

> **Что хранит.** Один платёж — это и аренда, и депозит, и коммуналка,
> и пеня, и возврат. Два главных индекса: `LeaseIdx` (для истории по
> договору) и `DueIdx` (для cron-обработки просрочек).

| Свойство | Тип | Заметки |
|---|---|---|
| `Lease` | → `Lease` | required, индексирован |
| `Payer` | → `User`  | required, индексирован |
| `Kind`  | `rent | deposit | utility | penalty | refund` | required, default `rent` |
| `Amount` / `Currency` | деньги | required |
| `DueDate` | `%Date` | индекс `DueIdx` для overdue-сканера |
| `PaidAt`  | `%TimeStamp` | когда фактически оплачено |
| `Status`  | `pending | paid | overdue | cancelled | refunded` | индексирован |
| `GatewayProvider` / `GatewayPaymentId` | внешний id | |
| `Description` | текст | |

> **Соглашения по `Description`.** Используются фикстурами для
> идемпотентности (повторный запуск seed'а не создаёт дубликаты):
> - аренда: `"Rent for YYYY-MM"`
> - депозит: `"Deposit for lease #N"`
> - коммуналка: `"Utilities (kind) for YYYY-MM"`
> - пеня: `"Late fee for payment #N (D day(s) overdue)"`

### 2.8 `SmartRent.Model.UtilityBill` · global `^SR.UtilityBill*`

> **Что хранит.** Один коммунальный счёт от поставщика на объект целиком.
> На этом этапе у нас только сводный счёт. Чтобы превратить его в
> платежи арендаторов, есть сервис `Service.Payment.SplitUtility(billId)`,
> который читает все **активные** leases на объекте и создаёт по одному
> `Payment(kind=utility)` на каждого активного арендатора, взвешивая по
> площади сегмента (`byArea`) или поровну (`equal`).

| Свойство | Тип | Заметки |
|---|---|---|
| `Property` | → `Property` | required |
| `Period`   | `%String(7)` | `YYYY-MM`, индекс `PropPeriodIdx` |
| `Kind`     | `electricity | water | gas | internet | other` | |
| `TotalAmount` / `Currency` | деньги | |
| `Split`    | `equal | byArea | byUsage` | передаётся в `SplitUtility` |
| `ScanFile` | `%Stream.GlobalBinary` | загрузка оригинала счёта |
| `DueDate`  | `%Date` | |

### 2.9 `SmartRent.Model.Notification` · global `^SR.Notification*`

> **Что хранит.** In-app уведомление пользователю. На MVP — просто
> запись в БД, которую UI читает в инбоксе. В проде сюда же будут
> отправляться email/push.

| Свойство | Тип | Заметки |
|---|---|---|
| `Recipient` | → `User` | required, индекс `(Recipient, Read)` |
| `Topic` | `booking | payment | utility | lease | system` | required |
| `Title` / `Message` | текст | |
| `Read` / `ReadAt` | состояние инбокса | |
| `RelatedKind` / `RelatedId` | мягкая ссылка на источник | |

---

## 3. Сервисный слой (`SmartRent.Service.*`)

> **Зачем.** Бизнес-логика, которой не место ни в моделях (там только
> данные), ни в REST-контроллерах (там только маршалинг JSON).

| Класс | Ответственность |
|---|---|
| `Service.Auth` | регистрация, логин (выпуск токена), резолв токена, logout. SHA-512 + соль, hex-encoding для безопасного хранения в Unicode-`%String`. TTL токена 24 ч. |
| `Service.Booking` | создание заявки, проверка `HasOverlap`, подтверждение (создаёт `Lease` + начальные `deposit` и `rent` в `tstart/tcommit`), отказ, расчёт сезонного коэффициента. |
| `Service.Contract` | рендер текста договора по `Lease`. Англоязычный шаблон. |
| `Service.Payment` | `CreateDeposit`, `CreateMonthlyRent`, `MarkPaid` (gateway callback), `ProcessOverdue` (cron), `SplitUtility` (по активным арендаторам). |
| `Service.Notification` | in-app `Send(recipient, topic, title, msg, kind, id)`. |
| `Util.Json` | безопасные `Get/GetBool/GetNumber/GetJSON` поверх `%DynamicObject` (заменяют падучий `$get(obj.prop)` на IRIS 2026). |

---

## 4. REST-эндпоинты (`SmartRent.REST.Dispatch`)

> **Где.** Все контроллеры лежат под `/api/smartrent/v1`. На фронте они
> доступны через rewrite `/api/iris/*` (см. `frontend/next.config.js`).
> Авторизация — заголовок `Authorization: Bearer <token>`.

```
GET  /health
POST /auth/register
POST /auth/login
POST /auth/logout
GET  /auth/me

GET    /properties                 POST   /properties
GET    /properties/:id             PUT    /properties/:id    DELETE /properties/:id

GET    /properties/:pid/segments   POST   /properties/:pid/segments
GET    /segments/:id               PUT    /segments/:id      DELETE /segments/:id

POST   /segments/:sid/bookings
GET    /bookings
POST   /bookings/:id/approve       POST   /bookings/:id/reject

GET    /leases                     GET    /leases/:id        POST   /leases/:id/sign

GET    /payments                   POST   /payments/:id/pay

POST   /properties/:pid/utilities  POST   /utilities/:id/split

GET    /notifications              POST   /notifications/:id/read

GET    /dashboard/landlord         GET    /dashboard/tenant
```

CORS обрабатывается в `OnHandleCorsRequest` (на dev — `*`, в проде должен
быть сужен до своего домена).

---

## 5. Демо-данные (загружает `SmartRent.Setup.Fixtures`)

> **Идемпотентность.** `Fixtures.Load()` можно безопасно вызывать
> повторно: если базовые юзеры уже на месте, он вызовет
> `RepairPasswords()` (восстановление сломанных паролей старого формата)
> и `EnsureExtendedDemo()` (досев расширенного демо-набора).

> **Никаких российских адресов.** Все объекты — за пределами РФ. Валюта
> хранения — EUR; UI пересчитывает на лету в выбранную пользователем.

### 5.1 Демо-аккаунты

| Роль | Email | Пароль | Что внутри |
|---|---|---|---|
| admin    | `admin@smartrent.local`           | `Admin12345!`  | админ платформы |
| landlord | `landlord@smartrent.local`        | `Land12345!`   | legacy alias на Marta Vidal |
| landlord | `marta.vidal@smartrent.demo`      | `Marta12345!`  | Барселона, режим «вся квартира» |
| landlord | `lukas.berger@smartrent.demo`     | `Lukas12345!`  | Берлин, режим «по комнатам» |
| tenant   | `tenant@smartrent.local`          | `Tenant12345!` | legacy alias арендатора |
| tenant   | `anna.kowalski@smartrent.demo`    | `Anna12345!`   | арендует Barcelona FULL |
| tenant   | `noah.fischer@smartrent.demo`     | `Noah12345!`   | Berlin R1 (master, 22 m²) |
| tenant   | `isabella.romano@smartrent.demo`  | `Isa12345!`    | Berlin R2 (sunny, 16 m²) |
| tenant   | `liam.oconnor@smartrent.demo`     | `Liam12345!`   | Berlin R3 (quiet, 12 m²) |

### 5.2 Объекты

1. **Barcelona, Carrer de Mallorca 401** — владелец Marta Vidal.
   Один сегмент `FULL` (целая квартира 64 m², €1450/мес, депозит €1450).
2. **Berlin, Linienstraße 44** — владелец Lukas Berger.
   Три комнатных сегмента:
   - `R1` "Master room with balcony" — 22 m², €720/мес
   - `R2` "Sunny double room"        — 16 m², €580/мес
   - `R3` "Quiet single room"        — 12 m², €460/мес

### 5.3 Активные договоры и история платежей

> **У каждого demo-арендатора:**
> - 1 платёж `deposit` в статусе `paid`,
> - N прошлых rent-платежей (`paid`, по одному в месяц с правильным
>   `due/paidAt`),
> - 1 предстоящий rent-платёж (`pending`) с дедлайном через 7 дней,
> - 4 месяца коммуналки × 3 вида (`electricity €62.50`, `water €18.40`,
>   `internet €35.00`) — все `paid`.
>
> Идемпотентность достигается уникальным `Description`.

| Tenant | Segment | Monthly | Месяцев истории |
|---|---|---|---|
| Anna Kowalski    | Barcelona FULL | €1450 | 4 |
| Noah Fischer     | Berlin R1      | €720  | 6 |
| Isabella Romano  | Berlin R2      | €580  | 3 |
| Liam O'Connor    | Berlin R3      | €460  | 2 |
| (legacy tenant)  | Barcelona FULL | €1450 | 1 |

`Property.Currency` везде **EUR**. На фронте пересчёт делает
`frontend/src/lib/currency.ts` (доступны: `EUR | USD | GBP | CHF | KZT |
AED`; RUB намеренно не поддерживается).

---

## 6. Установка и деплой

> **Контур.** Контейнер IRIS поднимается из образа
> `intersystemsdc/iris-community:latest`. На томе `/durable` лежат
> физические базы и журнал. Init-скрипт настраивает namespace,
> загружает классы и регистрирует REST-приложение.

- Namespace `SMARTRENT` создаётся скриптом
  `iris/init/01-smartrent-setup.sh` (запускается при старте контейнера),
  с физическими БД на томе `/durable`.
- Классы загружаются через
  `$system.OBJ.LoadDir("/opt/smartrent/src", "ck")` и
  `$system.OBJ.CompilePackage("SmartRent","ck")`.
- REST-приложение `/api/smartrent/v1` регистрируется через
  `Security.Applications.Create` с `DispatchClass=SmartRent.REST.Dispatch`.
- `SmartRent.Setup.Fixtures.Load` идемпотентен и безопасен к повторному
  вызову. Он состоит из двух этапов: `LoadCore` (admin + Marta Vidal +
  Anna) и `EnsureExtendedDemo` (Lukas + Berlin rooms + Noah/Isa/Liam +
  история платежей). Каждый этап можно перезапускать независимо.

---

## 7. Известные инварианты и подводные камни

> **Зачем.** Чтобы новый разработчик не наступил на грабли, на которые
> уже наступали мы.

- `Booking.Status='pending'|'approved'` блокирует пересекающиеся даты на
  одном `Segment`. Реализовано курсором SQL в
  `Service.Booking.HasOverlap`.
- `Lease.BookingIdx` — **уникальный**: на одну заявку не больше одного
  договора.
- `User.Email` — уникальный, перед поиском приводится к нижнему регистру
  (`Service.Auth.Login`).
- Деньги всегда хранятся как `%Numeric(SCALE=2)` + `Currency` (3 буквы).
  Мульти-валютных кошельков нет — валюту платежа диктует сегмент.
- Валюта фикстур — **EUR**. Старые `RUB`-дефолты убраны, реинтродукция
  запрещена правилами проекта.
- Пароли хэшируются `$system.Encryption.SHAHash(512, plain || salt)` и
  хранятся hex-encoded. Метод `SHA512Hash(...)` **не существует** в IRIS
  2026.1 — не пытайтесь его звать.

---

# Smart Rent — Database & Domain Architecture (English summary)

> Living document. Updated whenever models, indexes or fixtures change.
>
> Stack: **InterSystems IRIS 2026.1**, namespace `SMARTRENT`, persistent
> globals under `^SR.*`. Backend code at `iris/src/SmartRent/`, frontend at
> `frontend/`. REST base: `/api/smartrent/v1`.

This English block is a one-page summary for non-Russian-speaking
contributors. The authoritative description is the Russian one above.

- **Domain.** `User → Property → Segment → Booking → Lease → Payment +
  UtilityBill / Notification / AuthToken`. A property is rented either
  whole (`FULL` segment) or by rooms (multiple segments).
- **Money.** Stored as `%Numeric(SCALE=2)` plus a 3-letter currency.
  All fixtures are in **EUR**; the frontend converts on the fly into
  one of `EUR | USD | GBP | CHF | KZT | AED`. RUB is intentionally not
  supported.
- **Auth.** Bearer tokens (`AuthToken`) with 24-hour TTL. Passwords
  hashed with `SHAHash(512, plain || salt)` and stored hex-encoded.
- **Fixtures.** `Setup.Fixtures.Load` is idempotent. It seeds two
  landlords (Marta Vidal — Barcelona, "entire apartment" mode; Lukas
  Berger — Berlin, "by rooms" mode) and four tenants with active leases
  + payment history (rent + utilities) for several months.
- **REST.** All endpoints live under `/api/smartrent/v1` and are
  proxied to the frontend via `/api/iris/*`. CORS is wide-open in dev,
  must be tightened in prod.
- **Pitfalls to remember.**
  - `Booking.HasOverlap` uses SQL cursor on `(Segment, StartDate,
    EndDate)`; do not bypass it.
  - `Lease.BookingIdx` is unique — one booking, one lease.
  - Do not call `$system.Encryption.SHA512Hash`; it does not exist in
    IRIS 2026.1. Use `SHAHash(512, ...)` instead.
  - Never reintroduce RUB or RU-locale fixtures.
