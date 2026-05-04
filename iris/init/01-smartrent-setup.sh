#!/bin/bash
# Init-скрипт Smart Rent.
# Базовый /docker-entrypoint.sh сам выполняет всё из /docker-entrypoint-initdb.d/*.sh
# ПОСЛЕ старта IRIS-инстанса.
#
# КЛЮЧЕВОЙ МОМЕНТ: всё делается в ОДНОЙ iris session.
# Если делать в нескольких — между ними IRIS не успевает активировать
# конфигурацию нового namespace, и второй iris session ловит Access Denied.
# Внутри одной сессии zn "SMARTRENT" работает сразу после Config.Namespaces.Create,
# потому что текущий процесс читает свой же обновлённый namespace-map.
set -u
LOG="[smartrent-init]"

echo "$LOG === Smart Rent setup starting ==="

iris session iris -U%SYS <<'OS'
zn "%SYS"

; ===== Шаг 1: создаём БД и namespace SMARTRENT =====
set ns="SMARTRENT"
set dataDir="/durable/db/"_ns_"/"
set codeDir="/durable/db/"_ns_"CODE/"
do ##class(%File).CreateDirectoryChain(dataDir)
do ##class(%File).CreateDirectoryChain(codeDir)

write !,"[ns] data db exists before: ",##class(SYS.Database).%ExistsId(dataDir),!
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

; Дать процессу момент перечитать namespace-map.
hang 1

; ===== Шаг 2: переходим в SMARTRENT и грузим классы =====
zn "SMARTRENT"
write !,"[load] now in namespace: ",$namespace,!
write "[load] starting LoadDir /opt/smartrent/src ...",!
set sc=$system.OBJ.LoadDir("/opt/smartrent/src","ck",,1)
write "[load] LoadDir status: ",$system.Status.GetErrorText(sc),!
do $system.OBJ.CompilePackage("SmartRent","ck")
write "[load] dispatch defined : ",##class(%Dictionary.ClassDefinition).%ExistsId("SmartRent.REST.Dispatch"),!
write "[load] dispatch compiled: ",##class(%Dictionary.CompiledClass).%ExistsId("SmartRent.REST.Dispatch"),!

; ===== Шаг 3: web-app /api/smartrent/v1 =====
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

; ===== Шаг 4: фикстуры =====
zn "SMARTRENT"
write !,"[fixtures] loading...",!
do ##class(SmartRent.Setup.Fixtures).Load()
write "[fixtures] done",!

halt
OS

echo "$LOG === Smart Rent setup finished ==="
