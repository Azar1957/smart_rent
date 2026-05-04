#!/usr/bin/env bash
# Первичная настройка сервера Ubuntu 22.04/24.04 для деплоя Smart Rent.
# Запускать ОДИН РАЗ под root после создания VPS:
#
#   curl -fsSL https://raw.githubusercontent.com/Azar1957/smart_rent/main/deploy/setup-server.sh | bash
#
# или вручную:
#   wget https://raw.githubusercontent.com/Azar1957/smart_rent/main/deploy/setup-server.sh
#   chmod +x setup-server.sh
#   ./setup-server.sh
#
# Что делает:
#   1) обновляет систему;
#   2) ставит Docker Engine + Compose plugin (официальный репозиторий Docker);
#   3) создаёт пользователя `deploy` для SSH-деплоя без root-прав;
#   4) настраивает swap-файл 4 ГБ (на случай пика памяти при сборке);
#   5) включает ufw (firewall) с открытыми 22/80/443;
#   6) создаёт каталоги /srv/smartrent для приложения и /var/log/smartrent;
#   7) включает unattended-upgrades для security-патчей.
#
# Идемпотентен: безопасно запускать повторно.

set -euo pipefail

LOG()  { printf "\n\033[1;36m[setup]\033[0m %s\n" "$*"; }
WARN() { printf "\n\033[1;33m[setup-warn]\033[0m %s\n" "$*"; }

if [[ $EUID -ne 0 ]]; then
    echo "Запускайте от root: sudo bash $0" >&2
    exit 1
fi

DEPLOY_USER="${DEPLOY_USER:-deploy}"
APP_DIR="/srv/smartrent"
SWAP_FILE="/swapfile"
SWAP_SIZE_GB=4

# --- 1. Обновление пакетов ---------------------------------------------------
LOG "Обновляю систему (apt update && upgrade)…"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y \
    ca-certificates curl gnupg lsb-release ufw git unattended-upgrades htop nano \
    fail2ban

# --- 2. Docker Engine + Compose plugin --------------------------------------
if ! command -v docker >/dev/null 2>&1; then
    LOG "Устанавливаю Docker Engine…"
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
        | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    UBU_CODE="$(. /etc/os-release && echo "$VERSION_CODENAME")"
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $UBU_CODE stable" \
        > /etc/apt/sources.list.d/docker.list
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable --now docker
else
    LOG "Docker уже установлен: $(docker --version)"
fi

# --- 3. Пользователь deploy --------------------------------------------------
if id "$DEPLOY_USER" >/dev/null 2>&1; then
    LOG "Пользователь '$DEPLOY_USER' уже есть"
else
    LOG "Создаю пользователя '$DEPLOY_USER'…"
    adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi
usermod -aG docker "$DEPLOY_USER"

# Каталог приложения
mkdir -p "$APP_DIR"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"

# SSH каталог
DEPLOY_HOME="$(getent passwd "$DEPLOY_USER" | cut -d: -f6)"
mkdir -p "$DEPLOY_HOME/.ssh"
chmod 700 "$DEPLOY_HOME/.ssh"
touch "$DEPLOY_HOME/.ssh/authorized_keys"
chmod 600 "$DEPLOY_HOME/.ssh/authorized_keys"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_HOME/.ssh"

# Если переменная DEPLOY_PUBLIC_KEY задана — добавляем ключ.
if [[ -n "${DEPLOY_PUBLIC_KEY:-}" ]]; then
    if ! grep -qF "$DEPLOY_PUBLIC_KEY" "$DEPLOY_HOME/.ssh/authorized_keys"; then
        echo "$DEPLOY_PUBLIC_KEY" >> "$DEPLOY_HOME/.ssh/authorized_keys"
        LOG "SSH-ключ добавлен в authorized_keys для $DEPLOY_USER"
    else
        LOG "SSH-ключ уже есть в authorized_keys"
    fi
else
    WARN "DEPLOY_PUBLIC_KEY не задан. Добавьте публичный ключ вручную в:"
    WARN "  $DEPLOY_HOME/.ssh/authorized_keys"
fi

# --- 4. Swap 4 ГБ ------------------------------------------------------------
if swapon --show | grep -q "$SWAP_FILE"; then
    LOG "Swap уже включён"
else
    if [[ ! -f "$SWAP_FILE" ]]; then
        LOG "Создаю swap-файл $SWAP_FILE (${SWAP_SIZE_GB} GB)…"
        fallocate -l "${SWAP_SIZE_GB}G" "$SWAP_FILE" || dd if=/dev/zero of="$SWAP_FILE" bs=1M count=$((SWAP_SIZE_GB * 1024))
        chmod 600 "$SWAP_FILE"
        mkswap "$SWAP_FILE"
    fi
    swapon "$SWAP_FILE"
    if ! grep -q "$SWAP_FILE" /etc/fstab; then
        echo "$SWAP_FILE none swap sw 0 0" >> /etc/fstab
    fi
    sysctl -w vm.swappiness=10 >/dev/null
    if ! grep -q "vm.swappiness" /etc/sysctl.conf; then
        echo "vm.swappiness=10" >> /etc/sysctl.conf
    fi
    LOG "Swap включён, swappiness=10"
fi

# --- 5. UFW ------------------------------------------------------------------
LOG "Настраиваю ufw (22, 80, 443)…"
ufw allow OpenSSH || true
ufw allow 80/tcp  || true
ufw allow 443/tcp || true
yes | ufw enable || true
ufw status verbose | sed 's/^/    /'

# --- 6. fail2ban -------------------------------------------------------------
LOG "Включаю fail2ban для защиты SSH…"
systemctl enable --now fail2ban

# --- 7. Unattended upgrades --------------------------------------------------
LOG "Включаю автоматические security-обновления…"
dpkg-reconfigure -f noninteractive unattended-upgrades || true

# --- 8. Каталоги логов и данных ---------------------------------------------
mkdir -p /var/log/smartrent
chown -R "$DEPLOY_USER:$DEPLOY_USER" /var/log/smartrent

# --- 9. Финальные проверки ---------------------------------------------------
LOG "Готово. Сводка:"
echo "    Docker:      $(docker --version)"
echo "    Compose:     $(docker compose version)"
echo "    Free RAM:    $(free -h | awk '/^Mem:/ {print $2}')"
echo "    Swap:        $(free -h | awk '/^Swap:/ {print $2}')"
echo "    Disk free:   $(df -h / | awk 'NR==2 {print $4}')"
echo "    Deploy user: $DEPLOY_USER (uid=$(id -u "$DEPLOY_USER"))"
echo "    App dir:     $APP_DIR"
echo
LOG "Дальнейшие шаги:"
echo "  1) Если SSH-ключ ещё не добавлен — положите публичный ключ в:"
echo "       $DEPLOY_HOME/.ssh/authorized_keys"
echo "  2) Создайте GitHub Secrets в репозитории (Settings → Secrets → Actions):"
echo "       SSH_HOST       = <IP сервера>"
echo "       SSH_USER       = $DEPLOY_USER"
echo "       SSH_PORT       = 22"
echo "       SSH_PRIVATE_KEY= <содержимое приватного ключа>"
echo "       APP_DOMAIN     = <ваш домен или 'IP'>"
echo "       APP_LETSENCRYPT_EMAIL = <ваш email для Let's Encrypt>"
echo "  3) Запушьте в ветку main — GitHub Actions сам выкатит приложение."
