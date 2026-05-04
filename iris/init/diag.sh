#!/bin/bash
# Диагностика Smart Rent внутри контейнера. Использует только одноместные
# ObjectScript-выражения (write ...) — IRIS-терминал в интерактивном режиме
# не понимает многострочные if{ ... }else{ ... } блоки.
set -u

echo "=========================================="
echo "  Smart Rent — диагностика IRIS"
echo "=========================================="

iris session iris -U%SYS <<'OS'
write !,"--- Web app /api/smartrent/v1 ---",!
write "Exists: ",##class(Security.Applications).Exists("/api/smartrent/v1"),!
write !,"--- Namespace SMARTRENT ---",!
write "Exists: ",##class(Config.Namespaces).Exists("SMARTRENT"),!
write !,"--- Database files on /durable ---",!
zn "%SYS"
do $system.OBJ.GetClassList(.list,"^[Cc]onfig.Database*")
zn "SMARTRENT"
write !,"(Switched to SMARTRENT) status=",$test,!
halt
OS

echo ""
echo "--- Class compilation in SMARTRENT (если доступен) ---"
iris session iris -U"SMARTRENT" <<'OS'
write "Dispatch defined : ",##class(%Dictionary.ClassDefinition).%ExistsId("SmartRent.REST.Dispatch"),!
write "Dispatch compiled: ",##class(%Dictionary.CompiledClass).%ExistsId("SmartRent.REST.Dispatch"),!
write "Auth     compiled: ",##class(%Dictionary.CompiledClass).%ExistsId("SmartRent.Service.Auth"),!
write "User     compiled: ",##class(%Dictionary.CompiledClass).%ExistsId("SmartRent.Model.User"),!
halt
OS

echo ""
echo "--- HTTP /api/smartrent/v1/health изнутри контейнера (через wget) ---"
wget -SO- http://localhost:52773/api/smartrent/v1/health 2>&1 | tail -25 || true

echo ""
echo "=========================================="
echo "  Конец диагностики"
echo "=========================================="
