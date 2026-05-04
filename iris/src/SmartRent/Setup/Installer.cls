/// Установщик: создаёт namespace SMARTRENT, его базы данных и REST web-приложение.
/// Все методы идемпотентны — могут вызываться при каждом старте контейнера.
Class SmartRent.Setup.Installer Extends %RegisteredObject
{

/// Полный setup: namespace + загрузка классов + web-app + фикстуры.
/// Возвращает $$$OK всегда (логирует ошибки, но не падает),
/// чтобы entrypoint не зацикливался на одном плохом шаге.
ClassMethod RunAll() As %Status
{
    new $namespace
    set $namespace = "%SYS"

    write !, "[smartrent] === Smart Rent setup ===", !

    set sc = ..CreateNamespace("SMARTRENT")
    if $$$ISERR(sc) {
        write "[smartrent] CreateNamespace error: ", $system.Status.GetErrorText(sc), !
    }

    set $namespace = "SMARTRENT"
    set sc = $system.OBJ.LoadDir("/opt/smartrent/src", "ck", , 1)
    if $$$ISERR(sc) {
        write "[smartrent] LoadDir error: ", $system.Status.GetErrorText(sc), !
    }

    set $namespace = "%SYS"
    set sc = ..CreateWebApp()
    if $$$ISERR(sc) {
        write "[smartrent] CreateWebApp error: ", $system.Status.GetErrorText(sc), !
    }

    set $namespace = "SMARTRENT"
    set sc = ##class(SmartRent.Setup.Fixtures).Load()
    if $$$ISERR(sc) {
        write "[smartrent] Fixtures.Load error: ", $system.Status.GetErrorText(sc), !
    }

    write "[smartrent] === setup complete ===", !
    quit $$$OK
}

/// Создать namespace и физические базы (data + code).
ClassMethod CreateNamespace(pNs As %String) As %Status
{
    new $namespace
    set $namespace = "%SYS"

    if ##class(Config.Namespaces).Exists(pNs) {
        write "[smartrent] namespace ", pNs, " already exists", !
        quit $$$OK
    }

    set tDataDir = "/durable/db/" _ pNs _ "/"
    set tCodeDir = "/durable/db/" _ pNs _ "CODE/"

    do ##class(%File).CreateDirectoryChain(tDataDir)
    do ##class(%File).CreateDirectoryChain(tCodeDir)

    if '##class(SYS.Database).%ExistsId(tDataDir) {
        set sc = ##class(SYS.Database).CreateDatabase(tDataDir)
        if $$$ISERR(sc) quit sc
    }
    if '##class(SYS.Database).%ExistsId(tCodeDir) {
        set sc = ##class(SYS.Database).CreateDatabase(tCodeDir)
        if $$$ISERR(sc) quit sc
    }

    if '##class(Config.Databases).Exists(pNs) {
        kill dbProps  set dbProps("Directory") = tDataDir
        set sc = ##class(Config.Databases).Create(pNs, .dbProps)
        if $$$ISERR(sc) quit sc
    }
    if '##class(Config.Databases).Exists(pNs _ "CODE") {
        kill dbProps  set dbProps("Directory") = tCodeDir
        set sc = ##class(Config.Databases).Create(pNs _ "CODE", .dbProps)
        if $$$ISERR(sc) quit sc
    }

    kill nsProps
    set nsProps("Globals")     = pNs
    set nsProps("Routines")    = pNs _ "CODE"
    set nsProps("SysGlobals")  = "IRISSYS"
    set nsProps("SysRoutines") = "IRISSYS"
    set nsProps("TempGlobals") = "IRISTEMP"
    set sc = ##class(Config.Namespaces).Create(pNs, .nsProps)
    if $$$ISERR(sc) quit sc

    write "[smartrent] namespace ", pNs, " created at ", tDataDir, !
    quit $$$OK
}

/// Зарегистрировать REST web-приложение, обслуживающее SmartRent.REST.Dispatch.
/// Используем числовое значение AutheUnauthenticated=64 (без $$$-макросов).
ClassMethod CreateWebApp() As %Status
{
    new $namespace
    set $namespace = "%SYS"

    set tApp = "/api/smartrent/v1"

    if ##class(Security.Applications).Exists(tApp) {
        write "[smartrent] web app ", tApp, " already exists", !
        quit $$$OK
    }

    kill props
    set props("NameSpace")     = "SMARTRENT"
    set props("Description")   = "Smart Rent REST API"
    set props("DispatchClass") = "SmartRent.REST.Dispatch"
    set props("AutheEnabled")  = 64    ; AutheUnauthenticated
    set props("MatchRoles")    = ":%All"
    set props("Enabled")       = 1
    set props("CSPZENEnabled") = 1
    set props("DeepSeeEnabled")= 0
    set props("CookiePath")    = tApp _ "/"
    set props("AutoCompile")   = 1

    set sc = ##class(Security.Applications).Create(tApp, .props)
    if $$$ISERR(sc) {
        write "[smartrent] failed to create web app: ", $system.Status.GetErrorText(sc), !
        quit sc
    }

    write "[smartrent] web app ", tApp, " created (DispatchClass=SmartRent.REST.Dispatch)", !
    quit $$$OK
}

}
