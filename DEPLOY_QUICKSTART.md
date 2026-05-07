# Smart Rent — быстрый деплой на VPS

Минимально необходимые шаги «от нуля до работающего сайта». Подробный вариант
со всеми нюансами — [`docs/06-production-deploy.md`](./docs/06-production-deploy.md).

**Целевая конфигурация (проверено):** Ubuntu 24.04, 4 vCPU, 8 GB RAM, 120 GB SSD
(например, Aeza HEL-3, Hetzner CX32, Timeweb Cloud аналогичный).

---

## Шаг 1 — SSH-ключ на вашем компьютере

SSH-ключ это пара файлов, он не привязан к ОС — сгенерируйте его на той
машине, с которой вам удобнее работать. Файлы можно переносить между
macOS/Linux/Windows, они идентичны.

### macOS / Linux (Terminal, iTerm2)

```bash
ssh-keygen -t ed25519 -f ~/.ssh/smartrent_deploy -N "" -C "smartrent-deploy"
```

Посмотреть публичную часть (нужна в шаге 2):

```bash
cat ~/.ssh/smartrent_deploy.pub
```

Посмотреть приватную часть (нужна в шаге 3, копировать целиком включая
`-----BEGIN...-----` и `-----END...-----`):

```bash
cat ~/.ssh/smartrent_deploy
```

### Windows (PowerShell)

```powershell
ssh-keygen -t ed25519 -f $env:USERPROFILE\.ssh\smartrent_deploy -N '""' -C "smartrent-deploy"
type $env:USERPROFILE\.ssh\smartrent_deploy.pub     # публичная часть
type $env:USERPROFILE\.ssh\smartrent_deploy         # приватная часть
```

## Шаг 2 — Первичная настройка сервера (один раз)

Откройте PowerShell/терминал и зайдите на сервер по root (пароль даёт хостер):

```bash
ssh root@<IP_СЕРВЕРА>
```

Внутри сервера — одной командой:

```bash
export DEPLOY_PUBLIC_KEY="ssh-ed25519 AAAA... smartrent-deploy"   # из шага 1
curl -fsSL https://raw.githubusercontent.com/Azar1957/smart_rent/main/deploy/setup-server.sh | bash
```

Скрипт сам: обновит систему, поставит Docker, создаст пользователя `deploy`,
swap 4 GB, ufw (22/80/443), fail2ban и добавит ваш публичный ключ в
`~deploy/.ssh/authorized_keys`.

В конце он напечатает сводку (Docker version, RAM, swap, deploy user).
Проверьте, что нет ошибок.

Пароль `_SYSTEM` для входа в IRIS Management Portal — `SYS1` (смените его
при первом входе в Mgmt Portal: **System → Security Management → Users**).

Отключитесь и проверьте доступ по SSH-ключу:

**macOS / Linux:**

```bash
ssh -i ~/.ssh/smartrent_deploy deploy@<IP_СЕРВЕРА>
docker --version
exit
```

**Windows:**

```powershell
ssh -i $env:USERPROFILE\.ssh\smartrent_deploy deploy@<IP_СЕРВЕРА>
docker --version
exit
```

## Шаг 3 — Секреты в GitHub

Откройте репозиторий → **Settings → Secrets and variables → Actions → New repository secret**
и создайте 6 секретов:

| Имя | Значение |
|---|---|
| `SSH_HOST` | IP сервера |
| `SSH_USER` | `deploy` |
| `SSH_PORT` | `22` |
| `SSH_PRIVATE_KEY` | всё содержимое файла `smartrent_deploy` (приватный ключ целиком) |
| `APP_DOMAIN` | домен (например `smartrent.example.com`) **или** строка `IP`, если домена нет |
| `APP_LETSENCRYPT_EMAIL` | ваш email (только при наличии домена, иначе можно оставить пустым) |

## Шаг 4 — (Только если есть домен) Выпуск SSL

На сервере под пользователем `deploy`:

```bash
ssh -i ~/.ssh/smartrent_deploy deploy@<IP>
cd /srv/smartrent
git clone https://github.com/Azar1957/smart_rent.git . 2>/dev/null || git pull
export APP_DOMAIN=smartrent.example.com
export APP_LETSENCRYPT_EMAIL=you@example.com
bash deploy/issue-cert.sh
```

DNS A-запись домена должна указывать на IP **до** этого шага (проверить:
`dig +short smartrent.example.com`).

## Шаг 5 — Первый деплой

```bash
git push origin main
```

(или любой коммит в `main`, или во вкладке **Actions → Deploy to production → Run workflow**).

В GitHub: **Actions → Deploy to production** — следите за прогрессом. Первый
деплой идёт 5–15 минут (качается образ IRIS ~2 GB, собирается Next.js).

После зелёного значка workflow откройте:

- **без домена:** `http://<IP_СЕРВЕРА>/`
- **с доменом:** `https://<домен>/`

Войдите под одной из демо-учёток:

| Роль | Email | Пароль |
|---|---|---|
| Администратор | `admin@smartrent.local` | `Admin12345!` |
| Арендодатель | `landlord@smartrent.local` | `Land12345!` |
| Арендатор | `tenant@smartrent.local` | `Tenant12345!` |

## Дальше

Каждый `git push origin main` запускает деплой автоматически. Никаких ручных
действий на сервере больше не требуется.

Если что-то пошло не так — [`docs/06-production-deploy.md`](./docs/06-production-deploy.md)
§9 содержит таблицу типовых ошибок и команд для диагностики.
