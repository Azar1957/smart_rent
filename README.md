# Smart Rent

Платформа долгосрочной аренды комнат в квартирах.

- **Ядро / СУБД:** [InterSystems IRIS Community Edition](https://www.intersystems.com/iris/) — модель данных, бизнес-логика и REST API на ObjectScript.
- **Фронтенд:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + i18n (русский, английский, испанский).
- **Деплой:** `docker compose up -d` поднимает IRIS, фронтенд и (опционально) обратный прокси.

## Быстрый старт

Требования: Docker Desktop / Docker Engine 20+.

```bash
# 1. Поднять стек
docker compose up -d --build

# 2. Дождаться, пока IRIS закончит инициализацию (~60–90 сек)
docker compose logs -f iris   # ждём строку "Smart Rent: setup complete"

# 3. Открыть приложение и порталы
# Фронтенд:           http://localhost:3000
# IRIS REST API:      http://localhost:52773/api/smartrent/v1
# IRIS Mgmt Portal:   http://localhost:52773/csp/sys/UtilHome.csp
#   Логин _SYSTEM / пароль SYS1 (поменяйте при первом входе)
```

Демо-учётки фронтенда (создаются скриптом инициализации):

| Роль          | Email                  | Пароль       |
|---------------|------------------------|--------------|
| Администратор | admin@smartrent.local  | Admin12345!  |
| Арендодатель  | landlord@smartrent.local | Land12345! |
| Арендатор     | tenant@smartrent.local | Tenant12345! |

## Структура репозитория

```
smart_rent/
├─ docker-compose.yml        — оркестрация IRIS + фронтенд
├─ iris/                     — ядро системы (ObjectScript)
│  ├─ Dockerfile
│  ├─ iris.script            — конфигурация namespace и web-приложения
│  └─ src/SmartRent/         — пакеты Model / Service / REST / Setup
├─ frontend/                 — Next.js 14 / TypeScript / Tailwind
│  ├─ Dockerfile
│  └─ src/                   — app, components, lib, i18n
└─ docs/                     — архитектура, модель данных, API, развёртывание
```

Подробности — в каталоге [`docs/`](./docs/).

## Деплой на VPS

Пошаговая инструкция от нуля до работающего сайта — [`DEPLOY_QUICKSTART.md`](./DEPLOY_QUICKSTART.md).
Расширенный вариант со всеми нюансами — [`docs/06-production-deploy.md`](./docs/06-production-deploy.md).

## Лицензия БД

Сейчас используется бесплатная **IRIS Community Edition** (ограничение: до 5 одновременных
пользовательских соединений и 10 ГБ данных). При переходе на коммерческую лицензию достаточно
заменить базовый образ в [`iris/Dockerfile`](./iris/Dockerfile) на `containers.intersystems.com/intersystems/iris:<версия>` —
схема данных и весь код полностью совместимы.
