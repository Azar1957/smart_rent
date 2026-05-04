#!/usr/bin/env bash
# Первичный выпуск Let's Encrypt-сертификата для APP_DOMAIN.
# Запускается на сервере один раз после того, как DNS A-запись указала на сервер.
#
# Параметры (через env):
#   APP_DOMAIN
#   APP_LETSENCRYPT_EMAIL
#
# Алгоритм:
#   1) Поднимаем nginx во временном HTTP-only режиме (только /.well-known).
#   2) Запускаем certbot --webroot.
#   3) Перезагружаем nginx с финальной HTTPS-конфигурацией.

set -euo pipefail

if [[ -z "${APP_DOMAIN:-}" || -z "${APP_LETSENCRYPT_EMAIL:-}" ]]; then
    echo "Установите APP_DOMAIN и APP_LETSENCRYPT_EMAIL" >&2
    exit 1
fi

cd "$(dirname "$0")/.."

echo "[issue-cert] подготовка nginx во временном HTTP-режиме…"
APP_DOMAIN="IP" bash deploy/render-nginx.sh

# Поднимаем только nginx (frontend/iris не обязательны, но не мешают).
docker compose -f docker-compose.yml -f deploy/docker-compose.prod.yml up -d nginx

echo "[issue-cert] запрашиваю сертификат для $APP_DOMAIN…"
docker compose -f docker-compose.yml -f deploy/docker-compose.prod.yml run --rm certbot \
    certbot certonly --webroot -w /var/www/certbot \
        -d "$APP_DOMAIN" \
        --email "$APP_LETSENCRYPT_EMAIL" \
        --agree-tos --no-eff-email --non-interactive

echo "[issue-cert] переключаю nginx на финальную HTTPS-конфигурацию…"
APP_DOMAIN="$APP_DOMAIN" bash deploy/render-nginx.sh
docker compose -f docker-compose.yml -f deploy/docker-compose.prod.yml exec nginx nginx -s reload

echo "[issue-cert] готово. Проверьте: https://$APP_DOMAIN"
