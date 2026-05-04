# Развёртывание

## Локально (Docker Desktop / Linux Engine)

```bash
docker compose up -d --build
docker compose logs -f iris   # ждём строку "Smart Rent: setup complete"
```

После старта будут доступны:
- Фронтенд: http://localhost:3000
- IRIS REST: http://localhost:52773/api/smartrent/v1/health
- IRIS Mgmt Portal: http://localhost:52773/csp/sys/UtilHome.csp
  (логин `_SYSTEM`, пароль `SYS1`, при первом входе сменить)

## Демо-учётки

После загрузки `SmartRent.Setup.Fixtures.Load`:

| Роль          | Email                     | Пароль       |
|---------------|---------------------------|--------------|
| Администратор | `admin@smartrent.local`   | `Admin12345!` |
| Арендодатель  | `landlord@smartrent.local`| `Land12345!`  |
| Арендатор     | `tenant@smartrent.local`  | `Tenant12345!`|

И один объект «3-комнатная квартира на Невском» с тремя сегментами; одно бронирование уже одобрено,
по нему создан договор + платежи (депозит и аренда первого месяца).

## Переустановка с нуля

```bash
docker compose down -v   # снести том iris-data
docker compose up -d --build
```

## Переход на платную лицензию IRIS

1. Получить у InterSystems образ `containers.intersystems.com/intersystems/iris:<version>` и лицензионный ключ `iris.key`.
2. В `iris/Dockerfile` заменить базовый образ:
   ```Dockerfile
   FROM containers.intersystems.com/intersystems/iris:2025.1
   ```
3. Положить ключ в репозиторий (или подмонтировать томом) и в Dockerfile добавить:
   ```Dockerfile
   COPY iris.key /usr/irissys/mgr/iris.key
   ```
4. Пересобрать: `docker compose build iris && docker compose up -d`.

Схема, классы и REST полностью совместимы — миграция кода не требуется.

## Production-чек-лист

- [ ] Сменить пароль `_SYSTEM` (Mgmt Portal → System → Security Management → Users).
- [ ] Перевести инстанс в режим `Locked Down` (Security Settings).
- [ ] Включить TLS на Web Server (Apache / Nginx перед IRIS) и переключить фронт на HTTPS.
- [ ] Сузить CORS в `SmartRent.REST.Dispatch.OnHandleCorsRequest` до своего домена.
- [ ] Запланировать задание `SmartRent.Service.Payment.ProcessOverdue` (Mgmt Portal → Task Manager, ежедневно).
- [ ] Настроить резервное копирование тома `iris-data` (IRIS Online Backup или volume snapshot).
- [ ] Подключить email/SMS шлюз для воркера уведомлений.
- [ ] Заменить заглушку `Payments.Pay` реальным webhook-обработчиком платёжного провайдера.
