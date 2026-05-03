/// Установщик: создаёт namespace SMARTRENT, его базы данных и REST web-приложение.
Class SmartRent.Setup.Installer Extends %RegisteredObject
{

/// Создать namespace и физические базы (для данных и кода) с предсказуемыми путями.
ClassMethod CreateNamespace(pNs As %String) As %Status
{
    new $namespace
    set $namespace = "%SYS"

    if ##class(%SYS.Namespace).Exists(pNs) {
        write !, "Namespace ", pNs, " already exists, skipping create.", !
        quit $$$OK
    }

    set tDataDir = "/durable/db/" _ pNs _ "/"
    set tCodeDir = "/durable/db/" _ pNs _ "CODE/"

    do ##class(%File).CreateDirectoryChain(tDataDir)
    do ##class(%File).CreateDirectoryChain(tCodeDir)

    // Базы данных
    set tDbProps("Directory") = tDataDir
    set tStatus = ##class(SYS.Database).CreateDatabase(tDataDir, , , , .tDbProps)
    if $$$ISERR(tStatus) quit tStatus

    set tCodeProps("Directory") = tCodeDir
    set tStatus = ##class(SYS.Database).CreateDatabase(tCodeDir, , , , .tCodeProps)
    if $$$ISERR(tStatus) quit tStatus

    // Маппинги БД → namespace.
    set tNsProps("Globals")    = pNs
    set tNsProps("Routines")   = pNs _ "CODE"
    set tNsProps("SysGlobals") = "IRISSYS"
    set tNsProps("SysRoutines")= "IRISSYS"
    set tStatus = ##class(Config.Namespaces).Create(pNs, .tNsProps)
    if $$$ISERR(tStatus) quit tStatus

    // Регистрируем БД в Config.Databases (нужно для CreateDatabase, выполненного выше).
    set tStatus = ##class(Config.Databases).Create(pNs, .tDbProps)
    do ##class(Config.Databases).Create(pNs _ "CODE", .tCodeProps)

    write !, "Namespace ", pNs, " created at ", tDataDir, !
    quit $$$OK
}

/// Зарегистрировать REST web-приложение, обслуживающее SmartRent.REST.Dispatch.
ClassMethod CreateWebApp() As %Status
{
    new $namespace
    set $namespace = "%SYS"

    set tApp = "/api/smartrent/v1"

    if ##class(Security.Applications).Exists(tApp) {
        write !, "Web app ", tApp, " already exists.", !
        quit $$$OK
    }

    set tProps("NameSpace")        = "SMARTRENT"
    set tProps("Description")      = "Smart Rent REST API"
    set tProps("DispatchClass")    = "SmartRent.REST.Dispatch"
    set tProps("AutheEnabled")     = $$$AutheUnauthenticated + $$$AutheCache
    set tProps("MatchRoles")       = ":%All"
    set tProps("Enabled")          = 1
    set tProps("CSPZENEnabled")    = 1
    set tProps("CookiePath")       = tApp
    set tProps("DeepSeeEnabled")   = 0

    set tStatus = ##class(Security.Applications).Create(tApp, .tProps)
    if $$$ISERR(tStatus) {
        write !, "Failed to create web app: ", $system.Status.GetErrorText(tStatus), !
        quit tStatus
    }

    write !, "Web app ", tApp, " created (DispatchClass=SmartRent.REST.Dispatch).", !
    quit $$$OK
}

}
