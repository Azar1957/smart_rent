# Production-деплой Smart Rent

Схема: GitHub Actions → SSH → ваш сервер → `docker compose up -d`.

```
[git push в main] ──► GitHub Actions ──SSH──► VPS ──► Docker Compose
                                                       │
                                  ┌────────────────────┼────────────────────┐
                                  ▼                    ▼                    ▼
                            nginx (80/443)      frontend (Next)       IRIS (REST)
                            Let's Encrypt       127.0.0.1:3000        127.0.0.1:52773
                                                                       127.0.0.1:1972
```

## 1. Что нужно от вас перед первым деплоем

| Элемент | Где взять / создать |
|---|---|
| VPS Ubuntu 22.04 / 24.04 LTS, ≥ 4 GB RAM, ≥ 30 GB SSD | Хостер (Hetzner, Aeza, RuVDS и т. п.) |
| IP-адрес сервера | Письмо от хостера / панель |
| (опционально) Доменное имя | Любой регистратор. A-запись `@` или поддомен → IP сервера |
| Email для Let's Encrypt | Любой ваш почтовый ящик |
| GitHub-репозиторий проекта | Уже есть: `Azar1957/smart_rent` |

## 2. Создаём SSH-ключ для деплоя (на вашем ПК)

В PowerShell на вашем Windows:

```powershell
ssh-keygen -t ed25519 -f $env:USERPROFILE\.ssh\smartrent_deploy -N '""' -C "smartrent-deploy"
```

Появятся два файла:

- `~/.ssh/smartrent_deploy` — приватный (нигде не публикуем, кладём в GitHub Secrets);
- `~/.ssh/smartrent_deploy.pub` — публичный (кладём на сервер).

Покажите содержимое публичного ключа, понадобится в шаге 3:

```powershell
type $env:USERPROFILE\.ssh\smartrent_deploy.pub
```

## 3. Первичная настройка сервера

Зайдите на сервер по тем кредам, которые дал хостер:

```powershell
ssh root@<IP сервера>
```

Скачайте и запустите наш `setup-server.sh`. Он установит Docker, создаст пользователя `deploy`, swap, ufw, fail2ban и подложит ваш публичный ключ:

```bash
export DEPLOY_PUBLIC_KEY="ssh-ed25519 AAAA... smartrent-deploy"   # из шага 2
curl -fsSL https://raw.githubusercontent.com/Azar1957/smart_rent/main/deploy/setup-server.sh \
    -o /tmp/setup.sh
bash /tmp/setup.sh
```

В конце скрипт выведет сводку (Docker version, free RAM, swap, deploy user, путь
к сгенерированному `/srv/smartrent/.env`). Проверьте, что нет ошибок, и
сохраните `IRIS_PASSWORD` в своём менеджере паролей:

```bash
sudo grep IRIS_PASSWORD /srv/smartrent/.env
```

Закройте root-сессию, попробуйте зайти под `deploy`:

```powershell
ssh -i $env:USERPROFILE\.ssh\smartrent_deploy deploy@<IP>
```

Должны увидеть приглашение `deploy@hostname:~$`. Внутри:

```bash
docker --version
docker compose version
```

Должны напечататься версии. Выйдите — сервер готов.

## 4. GitHub Secrets

В репозитории `Azar1957/smart_rent`:

1. Откройте **Settings** (вверху).
2. В левом меню: **Secrets and variables → Actions**.
3. Нажмите **New repository secret** и создайте по одному:

| Имя | Значение | Пример |
|---|---|---|
| `SSH_HOST` | IP сервера | `95.217.123.45` |
| `SSH_USER` | пользователь | `deploy` |
| `SSH_PORT` | порт SSH | `22` |
| `SSH_PRIVATE_KEY` | **всё** содержимое файла `smartrent_deploy` (приватный ключ, с `-----BEGIN OPENSSH PRIVATE KEY-----` до `-----END OPENSSH PRIVATE KEY-----` включительно) | многострочный |
| `APP_DOMAIN` | ваш домен **или** строка `IP` для режима без HTTPS | `smartrent.example.com` |
| `APP_LETSENCRYPT_EMAIL` | email для Let's Encrypt (нужен только если есть домен) | `you@example.com` |

> Если домена ещё нет — поставьте `APP_DOMAIN = IP`. Сайт будет открываться по `http://<IP>/`. Когда домен появится — поменяете секрет `APP_DOMAIN` и перезапустите workflow вручную.

## 5. (Только если есть домен) Выпуск SSL-сертификата

Сделайте это **один раз** перед первым полноценным деплоем. На сервере под пользователем `deploy`:

```bash
cd /srv/smartrent
git clone https://github.com/Azar1957/smart_rent.git .   # если ещё не клонирован
export APP_DOMAIN=smartrent.example.com
export APP_LETSENCRYPT_EMAIL=you@example.com
bash deploy/issue-cert.sh
```

Сертификат сохранится в томе `letsencrypt`. Контейнер `certbot` (профиль `certbot`) будет автоматически продлевать его раз в 12 часов, если запустить compose с этим профилем. Чтобы он работал постоянно — добавьте в production overlay строку `profiles: ["certbot"]` или запустите вручную:

```bash
docker compose -f docker-compose.yml -f deploy/docker-compose.prod.yml \
    --profile certbot up -d certbot
```

## 6. Первый деплой

Сделайте push в `main` — GitHub Actions сам запустит деплой:

```bash
git checkout main
git push origin main
```

В GitHub: **Actions → Deploy to production → последний run** — увидите шаги:

- `Sanity check secrets`
- `Configure SSH`
- `Verify connection`
- `Deploy` (это самое долгое — клон репо, build образов, старт)
- `Smoke test`

Первый деплой займёт 5–15 минут (скачивается образ IRIS ~2 GB, собирается Next.js).

## 7. Проверка

После успешного workflow откройте:

- **Без домена:** http://`<IP>`/
- **С доменом:** https://`<домен>`/

Должен открыться лендинг Smart Rent. Логин под `tenant@smartrent.local` / `Tenant12345!` — должна работать вся цепочка.

## 8. Каждый следующий деплой

Любой `git push origin main` → автоматический деплой. Без вашего участия.

Если нужно принудительно пересобрать образы без кеша:

1. На GitHub: **Actions → Deploy to production → Run workflow**.
2. В появившемся окне поставьте `force_rebuild = true`.
3. Run.

## 9. Что делать, если деплой упал

В GitHub Actions клик по красному шагу — там будет лог. Самые частые случаи:

| Ошибка | Причина | Что делать |
|---|---|---|
| `Permission denied (publickey)` | приватный ключ в `SSH_PRIVATE_KEY` не подходит | Перепроверьте: ключ в `authorized_keys` сервера должен соответствовать `SSH_PRIVATE_KEY` |
| `connect to host ... port 22: Connection refused` | ufw блокирует или хостер закрыл порт | Откройте порт 22 в панели хостера (Cloud Firewall) |
| `Cannot connect to the Docker daemon` | пользователь `deploy` не в группе `docker` | На сервере: `sudo usermod -aG docker deploy && newgrp docker` |
| `IRIS healthy` так и не появилось | смотрите `docker compose logs iris` (последние 30 строк есть в логах workflow) | По логу станет ясно: чаще всего init-скрипт ругается на конкретный класс или на отсутствие БД |
| Smoke test возвращает 502 | nginx запустился раньше IRIS | Подождите 1–2 минуты и проверьте вручную; если стабильно — проверьте `docker compose ps` на сервере |

Получить shell на сервере, чтобы посмотреть всё своими глазами:

```bash
ssh -i ~/.ssh/smartrent_deploy deploy@<IP>
cd /srv/smartrent
docker compose -f docker-compose.yml -f deploy/docker-compose.prod.yml ps
docker compose -f docker-compose.yml -f deploy/docker-compose.prod.yml logs --tail 100 iris
docker compose -f docker-compose.yml -f deploy/docker-compose.prod.yml logs --tail 100 frontend
```

Дёрнуть диагностику IRIS:

```bash
docker exec smartrent-iris bash /opt/smartrent/diag.sh
```

## 10. Ротация ключей и отзыв доступа

Когда захотите отозвать доступ GitHub Actions к серверу:

1. На сервере: `nano ~/.ssh/authorized_keys` — удалите строку с комментарием `smartrent-deploy`.
2. В репозитории удалите секреты `SSH_*` (или замените на новые).

Это всё — следующий push не пройдёт деплой.

## 11. Бэкапы

После того как стек заработает в проде, добавьте cron на бэкапы IRIS Online Backup. Минимальный пример:

```bash
sudo tee /etc/cron.daily/smartrent-backup >/dev/null <<'EOF'
#!/bin/bash
set -e
BACKUP_DIR=/srv/smartrent-backups
mkdir -p "$BACKUP_DIR"
TS=$(date -u +%Y%m%d-%H%M)
docker exec smartrent-iris iris session iris -U%SYS \
    "do ##class(Backup.General).ExternalFreeze() halt"
tar -czf "$BACKUP_DIR/iris-data-$TS.tar.gz" -C /var/lib/docker/volumes smart_rent_iris-data
docker exec smartrent-iris iris session iris -U%SYS \
    "do ##class(Backup.General).ExternalThaw() halt"
find "$BACKUP_DIR" -name 'iris-data-*.tar.gz' -mtime +14 -delete
EOF
sudo chmod +x /etc/cron.daily/smartrent-backup
```

Это создаст ежедневный архив с ротацией 14 дней. Для production рекомендуется настроить отправку в S3/Backblaze.
