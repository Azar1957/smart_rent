#!/bin/bash
# Диагностика состояния Smart Rent внутри контейнера.
# Запуск:
#   docker exec smartrent-iris bash /opt/smartrent/diag.sh
set -u

echo "=========================================="
echo "  Smart Rent — диагностика IRIS"
echo "=========================================="

iris session iris -U%SYS <<'OS'
zn "%SYS"
write !,"--- Web app /api/smartrent/v1 ---",!
if ##class(Security.Applications).Exists("/api/smartrent/v1") {
    write "Exists=YES",!
    set sc=##class(Security.Applications).Get("/api/smartrent/v1",.p)
    if $$$ISERR(sc) {
        write "Get error: ",$system.Status.GetErrorText(sc),!
    } else {
        zw p
    }
} else {
    write "Exists=NO !!!",!
}

write !,"--- Namespace SMARTRENT ---",!
if ##class(Config.Namespaces).Exists("SMARTRENT") {
    write "Exists=YES",!
} else {
    write "Exists=NO !!!",!
}

zn "SMARTRENT"
write !,"--- Class compilation ---",!
write "SmartRent.REST.Dispatch defined=",##class(%Dictionary.ClassDefinition).%ExistsId("SmartRent.REST.Dispatch"),!
write "SmartRent.REST.Dispatch compiled=",##class(%Dictionary.CompiledClass).%ExistsId("SmartRent.REST.Dispatch"),!
write "SmartRent.Service.Auth compiled=",##class(%Dictionary.CompiledClass).%ExistsId("SmartRent.Service.Auth"),!
write "SmartRent.Model.User compiled=",##class(%Dictionary.CompiledClass).%ExistsId("SmartRent.Model.User"),!

write !,"--- Demo users ---",!
&sql(SELECT COUNT(*) INTO :n FROM SmartRent_Model.User)
if SQLCODE'=0 { write "SQL error: ",SQLCODE," ",%msg,! } else { write "User rows=",n,! }

halt
OS

echo ""
echo "--- HTTP запрос внутри контейнера ---"
curl -sv -o /dev/null -w "HTTP %{http_code}\n" http://localhost:52773/api/smartrent/v1/health 2>&1 | tail -15

echo ""
echo "=========================================="
echo "  Конец диагностики"
echo "=========================================="
