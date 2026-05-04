#!/bin/bash
# Диагностика Smart Rent. Всё в одной iris session.
set -u

echo "=========================================="
echo "  Smart Rent — диагностика IRIS"
echo "=========================================="

iris session iris -U%SYS <<'OS'
zn "%SYS"
write !,"--- Web app /api/smartrent/v1 ---",!
write "Exists: ",##class(Security.Applications).Exists("/api/smartrent/v1"),!
do ##class(Security.Applications).Get("/api/smartrent/v1",.p)
zw p
write !,"--- Namespace SMARTRENT ---",!
write "Exists: ",##class(Config.Namespaces).Exists("SMARTRENT"),!
zn "SMARTRENT"
write "Switched to: ",$namespace,!
write !,"--- Class compilation ---",!
write "Dispatch defined : ",##class(%Dictionary.ClassDefinition).%ExistsId("SmartRent.REST.Dispatch"),!
write "Dispatch compiled: ",##class(%Dictionary.CompiledClass).%ExistsId("SmartRent.REST.Dispatch"),!
write "User compiled    : ",##class(%Dictionary.CompiledClass).%ExistsId("SmartRent.Model.User"),!
write !,"--- Demo users ---",!
&sql(SELECT COUNT(*) INTO :n FROM SmartRent_Model.User)
write "User rows: ",n," (SQLCODE=",SQLCODE,")",!
halt
OS

echo ""
echo "--- HTTP /api/smartrent/v1/health внутри контейнера (wget) ---"
wget -SO- http://localhost:52773/api/smartrent/v1/health 2>&1 | tail -25 || true

echo ""
echo "=========================================="
