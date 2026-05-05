#!/bin/bash
# Принудительная переустановка Smart Rent внутри уже работающего контейнера.
# Не пересобирает образ — просто прогоняет тот же setup, что и при старте.
set -u

echo "=========================================="
echo "  Smart Rent — принудительная переустановка"
echo "=========================================="

# Если /durable принадлежит root (volume только что смонтирован) — chown.
if [ ! -w /durable ]; then
    echo "[reinstall] /durable не writable, пробую sudo chown..."
    sudo -n chown -R irisowner:irisowner /durable 2>/dev/null || \
        echo "[reinstall] sudo не сработал; попросите хост: docker exec -u root smartrent-iris chown -R irisowner:irisowner /durable"
fi

# Запускаем тот же init-скрипт.
bash /docker-entrypoint-initdb.d/01-smartrent-setup.sh

echo ""
echo "[reinstall] verifying /health (5 retries)..."
for i in 1 2 3 4 5; do
    sleep 2
    code=$(wget -SO- http://localhost:52773/api/smartrent/v1/health 2>&1 | grep -E "HTTP/.*[0-9]{3}" | tail -1 || true)
    echo "  attempt $i: $code"
done

echo ""
echo "=========================================="
echo "  Конец переустановки"
echo "=========================================="
