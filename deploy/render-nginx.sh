#!/usr/bin/env bash
# Подставляет APP_DOMAIN в nginx-конфиги и активирует нужный режим.
# Запускается:
#   - GitHub Actions перед docker compose up;
#   - вручную при смене домена.
#
# Параметры:
#   APP_DOMAIN — реальный домен (например, smartrent.example.com)
#                ИЛИ "IP" / пусто — для режима по голому IP без HTTPS.

set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
CONF_DIR="$DEPLOY_DIR/nginx/conf.d"
DOMAIN="${APP_DOMAIN:-IP}"

# Сносим всё активное (.conf), оставляем только .disabled и .template.
find "$CONF_DIR" -maxdepth 1 -type f -name '*.conf' -delete

if [[ "$DOMAIN" == "IP" || -z "$DOMAIN" ]]; then
    echo "[render-nginx] mode: ip-only (без HTTPS)"
    cp "$CONF_DIR/ip-only.conf.disabled" "$CONF_DIR/ip-only.conf"
else
    echo "[render-nginx] mode: domain ($DOMAIN, HTTPS)"
    sed "s/__DOMAIN__/$DOMAIN/g" \
        "$CONF_DIR/domain.conf.disabled" \
        > "$CONF_DIR/domain.conf"
fi

ls -la "$CONF_DIR"
