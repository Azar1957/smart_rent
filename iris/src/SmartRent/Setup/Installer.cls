/// Резервный установщик. Основной setup делается inline в
/// /docker-entrypoint-initdb.d/01-smartrent-setup.sh — этот класс оставлен
/// как удобный entry-point из IRIS Studio / VSCode для ручного перезапуска.
///
/// Использование:
///   zn "%SYS"
///   do ##class(SmartRent.Setup.Installer).CreateWebApp()
Class SmartRent.Setup.Installer Extends %RegisteredObject
{

/// Зарегистрировать REST web-приложение, обслуживающее SmartRent.REST.Dispatch.
/// AutheEnabled = 64 (Unauthenticated) числовой константой, без $$$-макросов.
ClassMethod CreateWebApp() As %Status
{
    new $namespace
    set $namespace = "%SYS"

    set tApp = "/api/smartrent/v1"

    if ##class(Security.Applications).Exists(tApp) {
        do ##class(Security.Applications).Delete(tApp)
    }

    kill props
    set props("NameSpace")     = "SMARTRENT"
    set props("Description")   = "Smart Rent REST API"
    set props("DispatchClass") = "SmartRent.REST.Dispatch"
    set props("AutheEnabled")  = 64
    set props("MatchRoles")    = ":%All"
    set props("Enabled")       = 1
    set props("CSPZENEnabled") = 1
    set props("DeepSeeEnabled")= 0

    set sc = ##class(Security.Applications).Create(tApp, .props)
    if $$$ISERR(sc) {
        write "[smartrent] failed to create web app: ", $system.Status.GetErrorText(sc), !
        quit sc
    }

    write "[smartrent] web app ", tApp, " created (DispatchClass=SmartRent.REST.Dispatch)", !
    quit $$$OK
}

/// Принудительная перекомпиляция всех классов SmartRent.
ClassMethod RecompileAll() As %Status
{
    new $namespace
    set $namespace = "SMARTRENT"
    set sc = $system.OBJ.LoadDir("/opt/smartrent/src", "ck", , 1)
    do $system.OBJ.CompilePackage("SmartRent", "ck")
    quit sc
}

}
