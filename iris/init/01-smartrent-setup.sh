#!/bin/bash
# Stage init script для intersystemsdc/iris-community.
# Файлы из /docker-entrypoint-initdb.d/ автоматически вызываются базовым
# entrypoint-ом ПОСЛЕ старта инстанса IRIS, поэтому здесь IRIS уже отвечает
# на iris session.
#
# Идемпотентный setup: создание namespace SMARTRENT, импорт классов,
# регистрация REST web-приложения, загрузка fixture-данных.

set -u
LOG="[smartrent-init]"

echo "$LOG === Smart Rent setup starting ==="
echo "$LOG IRIS version: $(iris list 2>/dev/null | head -3 || true)"

iris session IRIS -U%SYS "##class(SmartRent.Setup.Installer).RunAll() halt" \
    && echo "$LOG === Smart Rent setup finished ===" \
    || echo "$LOG !!! setup returned non-zero (see logs above)"
