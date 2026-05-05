# Smart Rent — Database & Domain Architecture

> Living document. Updated whenever models, indexes or fixtures change.
>
> Stack: **InterSystems IRIS 2026.1**, namespace `SMARTRENT`, persistent
> globals under `^SR.*`. Backend code at `iris/src/SmartRent/`, frontend at
> `frontend/`. REST base: `/api/smartrent/v1`.

---

## 1. Domain at a glance

```
User ─┬─< Property ──< Segment ──< Booking ──< Lease ──< Payment
      │                                            │
      └─< AuthToken                                └─< UtilityBill (per Property)
                                                  └─< Notification (per User)
```

- **User** — three roles: `admin`, `landlord`, `tenant`. One person can act
  in only one role at a time (no cross-role privileges).
- **Property** — a physical apartment/house owned by a `landlord`.
- **Segment** — a rentable unit inside a property: either the **whole
  apartment** (one `FULL` segment) or **individual rooms** (multiple
  segments per property).
- **Booking** — a tenant's request for a date range on a segment;
  `pending → approved | rejected | cancelled | completed`.
- **Lease** — created when a booking is approved, holds the contract,
  signatures and price/deposit at the moment of signing.
- **Payment** — `rent | deposit | utility | penalty | refund`,
  `pending → paid | overdue | cancelled | refunded`.
- **UtilityBill** — landlord's monthly utility invoice for the whole
  property; `Service.Payment.SplitUtility` produces one `Payment(kind=utility)`
  per active tenant.
- **Notification** — in-app message to a recipient.
- **AuthToken** — opaque session token (replaces JWT for MVP).

---

## 2. Persistent classes (tables)

All models live in package `SmartRent.Model` and extend `%Persistent` +
`%JSON.Adaptor`. Each model exposes a `ToJSON()` / `ToPublicJSON()`
method used by REST controllers.

### 2.1 `SmartRent.Model.User`  ·  global `^SR.User*`

| Property            | Type                                          | Notes |
|---------------------|-----------------------------------------------|-------|
| `Email`             | `%String(255)`                                | required, unique (`EmailIdx`) |
| `PasswordHash`      | `%String(256)` `[Internal]`                   | hex of SHA-512(password+salt) |
| `PasswordSalt`      | `%String(64)`  `[Internal]`                   | hex of 16-byte random salt |
| `Role`              | `%String VALUELIST=,admin,landlord,tenant`    | required, default `tenant` |
| `FirstName`/`LastName`/`Phone` | `%String`                          | profile |
| `Language`          | `%String VALUELIST=,ru,en,es`                 | UI default for the user |
| `TwoFactorSecret`/`TwoFactorEnabled` | TOTP, optional              | |
| `Verified` / `VerifiedAt` | `%Boolean` / `%TimeStamp`               | host KYC |
| `Active`            | `%Boolean`                                    | soft-deactivate |
| `CreatedAt` / `UpdatedAt` | auto-stamped                            | trigger keeps UpdatedAt fresh |

Indexes: `EmailIdx (Email) UNIQUE`, `RoleIdx (Role)`.

> **Security**: hashing is done in `Model.User.SetPassword` /
> `CheckPassword` via `$system.Encryption.SHAHash(512, ...)` with hex-encoded
> salt and hash. The earlier `SHA512Hash(...)` call did not exist in IRIS
> 2026.1 and caused `<METHOD DOES NOT EXIST>` — see fix in PR #6.

### 2.2 `SmartRent.Model.AuthToken`  ·  global `^SR.AuthToken*`

| Property | Type | Notes |
|---|---|---|
| `Token` | `%String(128)` | required, unique (`TokenIdx`), hex |
| `User` | → `User` | required, indexed (`UserIdx`) |
| `IssuedAt` | auto | |
| `ExpiresAt` | `%TimeStamp` | TTL = 24 h (see `Service.Auth.TOKENTTL`) |
| `Revoked` | `%Boolean` | logout / admin kill |
| `UserAgent` / `RemoteIp` | `%String` | audit |

### 2.3 `SmartRent.Model.Property`  ·  global `^SR.Property*`

| Property | Type | Notes |
|---|---|---|
| `Owner` | → `User` | required, indexed |
| `Title` / `Description` | `%String` | listing copy |
| `Country` / `City` / `Address` | `%String` | indexed `CityIdx (City)` |
| `Lat` / `Lng` | `%Double` | for map view |
| `PropertyType` | `apartment | house | studio` | |
| `TotalRooms` / `TotalArea` / `Floor` / `HasElevator` | facts | |
| `OwnershipDocument` | `%Stream.GlobalBinary` | KYC |
| `Active` | `%Boolean` | hide from catalog |

### 2.4 `SmartRent.Model.Segment`  ·  global `^SR.Segment*`

A property can be rented either **as a whole** (one segment with
`Code='FULL'`) or **by rooms** (multiple segments). The same model covers
both modes — there is no separate "RoomMode" flag.

| Property | Type | Notes |
|---|---|---|
| `Property` | → `Property` | required, indexed |
| `Code` | `%String(32)` | unique within property (`PropCodeIdx`) |
| `Title` / `Description` / `Area` / `Beds` / `Furnished` | facts | |
| `MonthlyPrice` / `Currency` / `DepositAmount` | money | |
| `Status` | `available | reserved | occupied | maintenance | rented` | |
| `SeasonalFactors` | JSON `{"01":1.0,"06":1.2}` | priced at booking |
| `Amenities` / `Rules` | JSON arrays | |

### 2.5 `SmartRent.Model.Booking`  ·  global `^SR.Booking*`

| Property | Type | Notes |
|---|---|---|
| `Segment` | → `Segment` | required, indexed |
| `Tenant`  | → `User`    | required, indexed |
| `StartDate` / `EndDate` | `%Date` | required |
| `Status`  | `pending | approved | rejected | cancelled | completed` | |
| `TotalPrice` / `Currency` | money | |
| `Note` / `RejectReason` | text | |
| `CreatedAt` / `DecidedAt` | timestamps | |

Composite index `DateRange (Segment, StartDate, EndDate)` for overlap
checks (`Service.Booking.HasOverlap`).

### 2.6 `SmartRent.Model.Lease`  ·  global `^SR.Lease*`

| Property | Type | Notes |
|---|---|---|
| `Booking` | → `Booking` | required, **unique** (`BookingIdx`) |
| `Segment` / `Tenant` / `Landlord` | refs | indexed |
| `StartDate` / `EndDate` | dates | |
| `MonthlyPrice` / `DepositAmount` / `Currency` | snapshot at signing | |
| `Status` | `draft | active | terminated | finished` | |
| `ContractText` | `%Stream.GlobalCharacter` | rendered by `Service.Contract.Render` |
| `TenantSignedAt` / `LandlordSignedAt` / `SignatureHash` | e-sign | |
| `MoveInReport` / `MoveOutReport` | JSON | |
| `TerminationReason` | text | |

### 2.7 `SmartRent.Model.Payment`  ·  global `^SR.Payment*`

| Property | Type | Notes |
|---|---|---|
| `Lease` | → `Lease` | required, indexed |
| `Payer` | → `User`  | required, indexed |
| `Kind`  | `rent | deposit | utility | penalty | refund` | required, default `rent` |
| `Amount` / `Currency` | money | required |
| `DueDate` | `%Date` | indexed (`DueIdx`) — used by overdue scanner |
| `PaidAt`  | `%TimeStamp` | when actually paid |
| `Status`  | `pending | paid | overdue | cancelled | refunded` | indexed |
| `GatewayProvider` / `GatewayPaymentId` | external id | |
| `Description` | text | |

Conventions used by fixtures and idempotent re-runs:

- Rent description: `"Rent for YYYY-MM"`
- Deposit description: `"Deposit for lease #N"`
- Utility description: `"Utilities (kind) for YYYY-MM"`
- Penalty description: `"Late fee for payment #N (D day(s) overdue)"`

### 2.8 `SmartRent.Model.UtilityBill`  ·  global `^SR.UtilityBill*`

| Property | Type | Notes |
|---|---|---|
| `Property` | → `Property` | required |
| `Period`   | `%String(7)` | `YYYY-MM`, indexed (`PropPeriodIdx`) |
| `Kind`     | `electricity | water | gas | internet | other` | |
| `TotalAmount` / `Currency` | money | |
| `Split`    | `equal | byArea | byUsage` | passed to `Payment.SplitUtility` |
| `ScanFile` | `%Stream.GlobalBinary` | upload of the original bill |
| `DueDate`  | `%Date` | |

`Service.Payment.SplitUtility(billId)` reads all **active** leases on the
property and creates one `Payment(kind=utility)` per active tenant,
weighted by segment area (`byArea`) or equally (`equal`).

### 2.9 `SmartRent.Model.Notification`  ·  global `^SR.Notification*`

| Property | Type | Notes |
|---|---|---|
| `Recipient` | → `User` | required, indexed `(Recipient, Read)` |
| `Topic` | `booking | payment | utility | lease | system` | required |
| `Title` / `Message` | text | |
| `Read` / `ReadAt` | inbox state | |
| `RelatedKind` / `RelatedId` | loose pointer to source object | |

---

## 3. Service layer (`SmartRent.Service.*`)

| Class | Responsibility |
|---|---|
| `Service.Auth` | register, login (token issue), token resolve, logout. SHA-512+salt password storage with hex encoding for safe `%String` storage on Unicode IRIS. Token TTL 24 h. |
| `Service.Booking` | create booking, check `HasOverlap`, approve (creates `Lease` + initial `deposit` and `rent` Payments inside `tstart/tcommit`), reject, seasonal factor lookup. |
| `Service.Contract` | render lease contract text from `Lease`. English template (was Russian — switched in this PR). |
| `Service.Payment` | `CreateDeposit`, `CreateMonthlyRent`, `MarkPaid` (gateway callback), `ProcessOverdue` (cron-style), `SplitUtility` (per active tenant). |
| `Service.Notification` | in-app `Send(recipient, topic, title, msg, kind, id)`. |
| `Util.Json` | safe `Get/GetBool/GetNumber/GetJSON` wrappers around `%DynamicObject` (replaces buggy `$get(obj.prop)` on IRIS 2026). |

---

## 4. REST surface (`SmartRent.REST.Dispatch`)

Mounted under `/api/smartrent/v1`. Auth via `Authorization: Bearer <token>`.

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

CORS handled in `OnHandleCorsRequest` (`*` for dev; tighten in prod).

---

## 5. Demo data (loaded by `SmartRent.Setup.Fixtures`)

> No Russian addresses or RU-locale data anywhere. Fixtures are **idempotent**:
> safe to re-run on an existing `/durable` volume.

### 5.1 Demo accounts

| Role | Email | Password | Notes |
|---|---|---|---|
| admin    | `admin@smartrent.local`           | `Admin12345!`  | platform admin |
| landlord | `landlord@smartrent.local`        | `Land12345!`   | legacy alias for Marta Vidal |
| landlord | `marta.vidal@smartrent.demo`      | `Marta12345!`  | Barcelona, "entire apartment" mode |
| landlord | `lukas.berger@smartrent.demo`     | `Lukas12345!`  | Berlin, "by rooms" mode |
| tenant   | `tenant@smartrent.local`          | `Tenant12345!` | legacy alias |
| tenant   | `anna.kowalski@smartrent.demo`    | `Anna12345!`   | rents Marta's full apartment |
| tenant   | `noah.fischer@smartrent.demo`     | `Noah12345!`   | Berlin room R1 (master, 22 m²) |
| tenant   | `isabella.romano@smartrent.demo`  | `Isa12345!`    | Berlin room R2 (sunny, 16 m²) |
| tenant   | `liam.oconnor@smartrent.demo`     | `Liam12345!`   | Berlin room R3 (quiet, 12 m²) |

### 5.2 Properties

1. **Barcelona, Carrer de Mallorca 401** — owner Marta Vidal.
   One segment `FULL` (entire apartment, 64 m², €1450/mo, deposit €1450).
2. **Berlin, Linienstraße 44** — owner Lukas Berger.
   Three room-segments:
   - `R1` "Master room with balcony" — 22 m², €720/mo
   - `R2` "Sunny double room"        — 16 m², €580/mo
   - `R3` "Quiet single room"        — 12 m², €460/mo

### 5.3 Active leases & payment history

Each demo lease has:

- one `deposit` payment (`paid`),
- N past `rent` payments (`paid`, one per month),
- one upcoming `rent` payment (`pending`, due in 7 days),
- 4 months of `utility` payments × 3 kinds (`electricity`, `water`,
  `internet`) — all `paid`.

| Tenant | Segment | Monthly | Months of history |
|---|---|---|---|
| Anna Kowalski    | Barcelona FULL | €1450 | 4 |
| Noah Fischer     | Berlin R1      | €720  | 6 |
| Isabella Romano  | Berlin R2      | €580  | 3 |
| Liam O'Connor    | Berlin R3      | €460  | 2 |
| (legacy tenant)  | Barcelona FULL | €1450 | 1 |

`Property.Currency` is **EUR everywhere**. Frontend converts to the user's
chosen currency on the fly via `frontend/src/lib/currency.ts`
(`EUR | USD | GBP | CHF | KZT | AED`; RUB intentionally not supported).

---

## 6. Setup & deployment

- IRIS namespace `SMARTRENT` is created from
  `iris/init/01-smartrent-setup.sh` (runs on container start), pointing
  to physical databases on the `/durable` volume.
- Classes are loaded via `$system.OBJ.LoadDir("/opt/smartrent/src", "ck")`
  and `$system.OBJ.CompilePackage("SmartRent","ck")`.
- The REST web-app `/api/smartrent/v1` is registered through
  `Security.Applications.Create` with `DispatchClass=SmartRent.REST.Dispatch`.
- `SmartRent.Setup.Fixtures.Load` is idempotent — safe to re-invoke.
  It first calls `LoadCore` (admin + Marta Vidal + Anna), then
  `EnsureExtendedDemo` (Lukas + Berlin rooms + Noah/Isa/Liam + payment
  history). Both halves can be re-run independently.

## 7. Known invariants & gotchas

- `Booking.Status='pending'|'approved'` blocks overlapping date ranges on
  the same `Segment` via `HasOverlap` SQL cursor.
- `Lease.BookingIdx` is **unique**: at most one lease per booking.
- `User.Email` is **unique** and case-folded to lowercase before lookup
  (see `Service.Auth.Login`).
- Money is always stored as `%Numeric(SCALE=2)` plus `Currency` (3 letters).
  No multi-currency wallets — the segment dictates the currency for its
  payments.
- Currency for fixtures is **EUR**. Old `RUB` defaults in `Booking`
  fixtures were removed; do not reintroduce.
- Passwords are hashed with `$system.Encryption.SHAHash(512, plain || salt)`
  and stored hex-encoded. The legacy `SHA512Hash(...)` call **does not
  exist** in IRIS 2026.1.
