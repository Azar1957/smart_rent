# Модель данных

Все классы лежат в пакете `SmartRent.Model.*`, namespace `SMARTRENT`.
Хранилище — стандартное `%Storage.Persistent` (globals).

## Сущности

| Класс                       | Назначение                                              | Ключевые связи |
|-----------------------------|----------------------------------------------------------|----------------|
| `SmartRent.Model.User`      | Учётка (admin / landlord / tenant), пароль+соль, 2FA    | —              |
| `SmartRent.Model.Property`  | Объект (квартира) — принадлежит арендодателю            | Owner → User   |
| `SmartRent.Model.Segment`   | Комната-сегмент объекта, имеет цену и статус            | Property       |
| `SmartRent.Model.Booking`   | Запрос на бронирование сегмента арендатором             | Segment, Tenant|
| `SmartRent.Model.Lease`     | Договор (создаётся при approve бронирования)            | Booking, Segment, Tenant, Landlord |
| `SmartRent.Model.Payment`   | Платежи: rent / deposit / utility / penalty / refund    | Lease, Payer   |
| `SmartRent.Model.UtilityBill` | Коммунальный счёт по объекту (делится между Lease)    | Property       |
| `SmartRent.Model.Notification` | In-app уведомление пользователю                      | Recipient → User |
| `SmartRent.Model.AuthToken` | Токен сессии, привязанный к User                        | User           |

## Жизненный цикл бронирования

```
Tenant ──POST /segments/:id/bookings──▶ Booking(pending)
                                         │
                       Landlord ──POST /bookings/:id/approve──▶
                                         │
                      Booking(approved) + Segment.status=reserved
                                         │
                      Lease(draft) + Payment(deposit) + Payment(rent)
                                         │
                  оба подписали ─POST /leases/:id/sign─▶ Lease(active)
                                         │
                                   ежемесячные Payment(rent)
                                         │
              просрочка → ProcessOverdue() → status=overdue + Payment(penalty)
                                         │
                                  Move-out → Lease(finished)
```

## Расчёты

- **Стоимость бронирования** — `Service.Booking.Request`:
  `months × MonthlyPrice × seasonalFactor(monthOfStart)`.
- **Сезонные коэффициенты** — JSON в `Segment.SeasonalFactors`, ключ — две цифры месяца, например `{"06":1.2,"07":1.3}`.
- **Деление коммуналки** — `Service.Payment.SplitUtility` по активным договорам объекта.
  Веса: либо `Segment.Area` (split=`byArea`), либо равные доли (`equal`).
- **Пеня за просрочку** — `Service.Payment.ProcessOverdue`:
  `amount × penaltyRate%/день × днейПросрочки`. Ставка задаётся глобалом `^SR.Cfg("penaltyRate")`.

## Индексы

Каждая сущность имеет индексы под наиболее частые запросы (см. `Index ... On ...` в .cls):

- `User.EmailIdx` — уникальный.
- `Property.CityIdx`, `Property.OwnerIdx`.
- `Segment.PropertyIdx`, `Segment.PropCodeIdx` (уникальный per property).
- `Booking.DateRange (Segment, StartDate, EndDate)` — для поиска пересечений.
- `Payment.DueIdx` — для регулярного джоба `ProcessOverdue`.
- `AuthToken.TokenIdx` (уникальный) — для resolve по Bearer-токену.
