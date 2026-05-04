# REST API

База: `http://localhost:52773/api/smartrent/v1`
Аутентификация: `Authorization: Bearer <token>` для всех защищённых эндпоинтов.

## Auth

| Метод | URL                | Тело                                                            | Описание |
|-------|--------------------|-----------------------------------------------------------------|----------|
| POST  | `/auth/register`   | `{email,password,role,firstName,lastName,phone,language}`       | Регистрация |
| POST  | `/auth/login`      | `{email,password}`                                              | Возвращает `{token,user}` |
| POST  | `/auth/logout`     | —                                                               | Отзыв токена |
| GET   | `/auth/me`         | —                                                               | Текущий пользователь |

## Properties

| Метод | URL                | Доступ                | Описание |
|-------|--------------------|-----------------------|----------|
| GET   | `/properties`      | публично, фильтр `?city=` | Список активных объектов |
| GET   | `/properties/:id`  | любой                 | Карточка объекта |
| POST  | `/properties`      | landlord/admin        | Создать объект |
| PUT   | `/properties/:id`  | владелец/admin        | Обновить |
| DELETE| `/properties/:id`  | владелец/admin        | Деактивировать (soft-delete) |

## Segments

| Метод | URL                                  | Доступ        | Описание |
|-------|--------------------------------------|---------------|----------|
| GET   | `/properties/:pid/segments`          | любой         | Сегменты объекта |
| POST  | `/properties/:pid/segments`          | владелец/admin| Создать |
| GET   | `/segments/:id`                      | любой         | Карточка |
| PUT   | `/segments/:id`                      | владелец/admin| Обновить |
| DELETE| `/segments/:id`                      | владелец/admin| Удалить |

## Bookings

| Метод | URL                              | Доступ        | Описание |
|-------|----------------------------------|---------------|----------|
| POST  | `/segments/:sid/bookings`        | tenant        | `{startDate,endDate,note}` |
| GET   | `/bookings`                      | любой         | Свои бронирования (по роли) |
| POST  | `/bookings/:id/approve`          | landlord      | Одобрить → создаёт Lease + платежи |
| POST  | `/bookings/:id/reject`           | landlord      | `{reason}` |

## Leases

| Метод | URL                  | Доступ        | Описание |
|-------|----------------------|---------------|----------|
| GET   | `/leases`            | любой         | Свои договоры |
| GET   | `/leases/:id`        | любой         | Карточка с текстом договора |
| POST  | `/leases/:id/sign`   | сторона       | Подпись; при двух подписях статус → active |

## Payments

| Метод | URL                    | Доступ        | Описание |
|-------|------------------------|---------------|----------|
| GET   | `/payments`            | любой         | Свои платежи |
| POST  | `/payments/:id/pay`    | tenant        | `{provider,providerId}` — заглушка/webhook |

## Utilities

| Метод | URL                              | Доступ        | Описание |
|-------|----------------------------------|---------------|----------|
| POST  | `/properties/:pid/utilities`     | landlord      | Создать счёт `{period,kind,totalAmount,split,dueDate}` |
| POST  | `/utilities/:id/split`           | landlord      | Распределить сумму между активными арендаторами |

## Notifications

| Метод | URL                              | Описание |
|-------|----------------------------------|----------|
| GET   | `/notifications`                 | Свои уведомления |
| POST  | `/notifications/:id/read`        | Отметить прочитанным |

## Dashboard

| Метод | URL                       | Описание |
|-------|---------------------------|----------|
| GET   | `/dashboard/landlord`     | Доход по месяцам, сегменты по статусу, задолженность |
| GET   | `/dashboard/tenant`       | Активные договоры, ближайший платёж |

## Health

| Метод | URL          | Описание |
|-------|--------------|----------|
| GET   | `/health`    | `{status:"ok",service:"smartrent-iris",time:"..."}` |

## Пример: вход и список объектов

```bash
curl -X POST http://localhost:52773/api/smartrent/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"tenant@smartrent.local","password":"Tenant12345!"}'
# → {"token":"...","user":{...}}

curl http://localhost:52773/api/smartrent/v1/properties \
  -H "Authorization: Bearer <token>"
```
