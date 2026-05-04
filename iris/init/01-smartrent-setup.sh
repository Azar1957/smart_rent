#!/bin/bash
# Init-скрипт для intersystemsdc/iris-community.
# Базовый /docker-entrypoint.sh выполняет всё из /docker-entrypoint-initdb.d/*.sh
# ПОСЛЕ старта IRIS-инстанса.
#
# Порядок:
#   1) Создаём namespace SMARTRENT inline (классы ещё не скомпилированы).
#   2) В SMARTRENT грузим и компилируем все классы пакета SmartRent.
#   3) В %SYS регистрируем REST web-приложение /api/smartrent/v1.
#   4) В SMARTRENT грузим демо-данные.
#
# НИКАКИХ многострочных if{}else{} — только одноместные write/do, чтобы
# IRIS-терминал не выдавал <SYNTAX> при первом не-bracketed if.
set -u
LOG="[smartrent-init]"

echo "$LOG === Smart Rent setup starting ==="

# Шаг 1: namespace SMARTRENT inline (без обращений к нашим классам).
iris session iris -U%SYS <<'OS'
set ns="SMARTRENT"
set dataDir="/durable/db/"_ns_"/"
set codeDir="/durable/db/"_ns_"CODE/"
do ##class(%File).CreateDirectoryChain(dataDir)
do ##class(%File).CreateDirectoryChain(codeDir)
write !,"[ns] data dir: ",dataDir,!
write "[ns] code dir: ",codeDir,!
write "[ns] data db exists: ",##class(SYS.Database).%ExistsId(dataDir),!
write "[ns] code db exists: ",##class(SYS.Database).%ExistsId(codeDir),!
do:'##class(SYS.Database).%ExistsId(dataDir) ##class(SYS.Database).CreateDatabase(dataDir)
do:'##class(SYS.Database).%ExistsId(codeDir) ##class(SYS.Database).CreateDatabase(codeDir)
write "[ns] config db exists: ",##class(Config.Databases).Exists(ns),!
kill p set p("Directory")=dataDir
do:'##class(Config.Databases).Exists(ns) ##class(Config.Databases).Create(ns,.p)
kill p set p("Directory")=codeDir
do:'##class(Config.Databases).Exists(ns_"CODE") ##class(Config.Databases).Create(ns_"CODE",.p)
write "[ns] namespace exists: ",##class(Config.Namespaces).Exists(ns),!
kill q set q("Globals")=ns,q("Routines")=ns_"CODE",q("SysGlobals")="IRISSYS",q("SysRoutines")="IRISSYS",q("TempGlobals")="IRISTEMP"
do:'##class(Config.Namespaces).Exists(ns) ##class(Config.Namespaces).Create(ns,.q)
do ##class(Config.CPF).Reload()
write "[ns] mounted data: ",##class(SYS.Database).IsMounted(dataDir),!
do:'##class(SYS.Database).IsMounted(dataDir) ##class(SYS.Database).MountDatabase(dataDir)
do:'##class(SYS.Database).IsMounted(codeDir) ##class(SYS.Database).MountDatabase(codeDir)
write "[ns] OK",!
halt
OS
echo "$LOG step 1 (namespace) done"

# Шаг 2: компиляция классов уже в SMARTRENT.
iris session iris -U"SMARTRENT" <<'OS'
write "[load] starting LoadDir /opt/smartrent/src",!
do $system.OBJ.LoadDir("/opt/smartrent/src","ck",,1)
do $system.OBJ.CompilePackage("SmartRent","ck")
write "[load] dispatch compiled: ",##class(%Dictionary.CompiledClass).%ExistsId("SmartRent.REST.Dispatch"),!
halt
OS
echo "$LOG step 2 (compile classes) done"

# Шаг 3: web-app /api/smartrent/v1 inline.
iris session iris -U%SYS <<'OS'
set app="/api/smartrent/v1"
write "[web] exists: ",##class(Security.Applications).Exists(app),!
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
write "[web] create status: ",$system.Status.GetErrorText(sc),!
write "[web] now exists: ",##class(Security.Applications).Exists(app),!
halt
OS
echo "$LOG step 3 (web app) done"

# Шаг 4: фикстуры.
iris session iris -U"SMARTRENT" <<'OS'
do ##class(SmartRent.Setup.Fixtures).Load()
halt
OS
echo "$LOG step 4 (fixtures) done"

echo "$LOG === Smart Rent setup finished ==="
