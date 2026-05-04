#!/bin/bash
# Принудительная переустановка Smart Rent внутри уже работающего контейнера.
# Не пересобирает образ — нужно только если предыдущий setup частично упал.
set -u

echo "=========================================="
echo "  Smart Rent — принудительная переустановка"
echo "=========================================="

iris session iris -U%SYS <<'OS'
write !,"[reinstall] removing old web app if exists...",!
do ##class(Security.Applications).Delete("/api/smartrent/v1")
write !,"[reinstall] running Installer.RunAll()...",!
do ##class(SmartRent.Setup.Installer).RunAll()
halt
OS

echo ""
echo "[reinstall] forcing class compile in SMARTRENT..."
iris session iris -U"SMARTRENT" <<'OS'
do $system.OBJ.LoadDir("/opt/smartrent/src","ck",,1)
do $system.OBJ.CompilePackage("SmartRent","ck")
write !,"[reinstall] compile finished",!
halt
OS

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
