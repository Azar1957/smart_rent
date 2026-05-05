#!/bin/bash
# Init-скрипт Smart Rent.
# Базовый /docker-entrypoint.sh сам выполняет всё из /docker-entrypoint-initdb.d/*.sh
# ПОСЛЕ старта IRIS-инстанса.
#
# Порядок (всё в ОДНОЙ iris session — иначе SMARTRENT не видим из второго
# процесса до полного применения namespace map):
#   0) Гарантировать, что /durable/db принадлежит irisowner (volume может быть
#      смонтирован с правами root, тогда CreateDatabase падает с <DIRECTORY>).
#   1) Создать namespace SMARTRENT (inline на чистом ObjectScript).
#   2) В SMARTRENT загрузить и скомпилировать классы пакета SmartRent.
#   3) В %SYS зарегистрировать REST web-приложение /api/smartrent/v1.
#   4) В SMARTRENT загрузить демо-данные.
set -u
LOG="[smartrent-init]"

echo "$LOG === Smart Rent setup starting ==="

# ===== Шаг 0: права на /durable =====
# init-скрипты выполняются под irisowner. Если /durable - root, мы /durable/db
# создать не сможем. Тогда пробуем sudo (в базовом образе обычно есть).
if [ ! -w /durable ]; then
    echo "$LOG /durable не доступен на запись, пробуем sudo chown..."
    sudo -n chown -R irisowner:irisowner /durable 2>/dev/null || \
        echo "$LOG sudo не сработало; контейнер должен был сделать chown ещё на этапе build"
fi
mkdir -p /durable/db /durable/journal 2>/dev/null || true
ls -la /durable/db 2>&1 | head -5

# ===== Шаги 1–4 в одной iris session =====
iris session iris -U%SYS <<'OS'
zn "%SYS"

set ns="SMARTRENT"
set dataDir="/durable/db/"_ns_"/"
set codeDir="/durable/db/"_ns_"CODE/"

do ##class(%File).CreateDirectoryChain(dataDir)
do ##class(%File).CreateDirectoryChain(codeDir)
write !,"[ns] data dir created: ",##class(%File).DirectoryExists(dataDir),!
write "[ns] code dir created: ",##class(%File).DirectoryExists(codeDir),!

write "[ns] data db exists before: ",##class(SYS.Database).%ExistsId(dataDir),!
do:'##class(SYS.Database).%ExistsId(dataDir) ##class(SYS.Database).CreateDatabase(dataDir)
do:'##class(SYS.Database).%ExistsId(codeDir) ##class(SYS.Database).CreateDatabase(codeDir)
write "[ns] data db exists after: ",##class(SYS.Database).%ExistsId(dataDir),!

kill p set p("Directory")=dataDir
do:'##class(Config.Databases).Exists(ns) ##class(Config.Databases).Create(ns,.p)
kill p set p("Directory")=codeDir
do:'##class(Config.Databases).Exists(ns_"CODE") ##class(Config.Databases).Create(ns_"CODE",.p)

kill q
set q("Globals")=ns,q("Routines")=ns_"CODE"
set q("SysGlobals")="IRISSYS",q("SysRoutines")="IRISSYS",q("TempGlobals")="IRISTEMP"
do:'##class(Config.Namespaces).Exists(ns) ##class(Config.Namespaces).Create(ns,.q)
write "[ns] namespace exists after: ",##class(Config.Namespaces).Exists(ns),!

hang 1
zn "SMARTRENT"
write !,"[load] now in namespace: ",$namespace,!
write "[load] starting LoadDir /opt/smartrent/src ...",!
set sc=$system.OBJ.LoadDir("/opt/smartrent/src","ck",.errors,1)
write "[load] LoadDir status: ",$system.Status.GetErrorText(sc),!
set ek="" for { set ek=$order(errors(ek))  quit:ek=""  write "[load][err] ",errors(ek),! }
do $system.OBJ.CompilePackage("SmartRent","ck")
write "[load] dispatch compiled: ",##class(%Dictionary.CompiledClass).%ExistsId("SmartRent.REST.Dispatch"),!
write "[load] user compiled    : ",##class(%Dictionary.CompiledClass).%ExistsId("SmartRent.Model.User"),!

zn "%SYS"
set app="/api/smartrent/v1"
do:##class(Security.Applications).Exists(app) ##class(Security.Applications).Delete(app)
kill props
set props("NameSpace")="SMARTRENT"
set props("Description")="Smart Rent REST API"
set props("DispatchClass")="SmartRent.REST.Dispatch"
set props("AutheEnabled")=64
set props("MatchRoles")=":%All"
set props("Enabled")=1
set props("CSPZENEnabled")=1
set props("DeepSeeEnabled")=0
set sc=##class(Security.Applications).Create(app,.props)
write !,"[web] create status: ",$system.Status.GetErrorText(sc),!
write "[web] now exists: ",##class(Security.Applications).Exists(app),!

zn "SMARTRENT"
write !,"[fixtures] now in namespace: ",$namespace,!
write "[fixtures] loading...",!
do ##class(SmartRent.Setup.Fixtures).Load()
write "[fixtures] done",!

halt
OS

echo "$LOG === Smart Rent setup finished ==="
