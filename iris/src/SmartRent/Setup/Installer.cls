/// Установщик: создаёт namespace SMARTRENT, его базы данных и REST web-приложение.
/// Все методы идемпотентны — могут вызываться при каждом старте контейнера.
Class SmartRent.Setup.Installer Extends %RegisteredObject
{

/// Полный setup. Возвращает $$$OK всегда (ошибки логирует),
/// чтобы init-скрипт не зацикливал перезапуск контейнера.
ClassMethod RunAll() As %Status
{
    new $namespace
    set $namespace = "%SYS"

    write !, "[smartrent] === Smart Rent setup ===", !

    set sc = ..CreateNamespace("SMARTRENT")
    if $$$ISERR(sc) {
        write "[smartrent] CreateNamespace error: ", $system.Status.GetErrorText(sc), !
        ; не выходим — пытаемся загрузить классы, namespace может быть уже создан
    }

    ; Переключаемся в SMARTRENT и грузим классы.
    set $namespace = "SMARTRENT"
    write "[smartrent] loading classes from /opt/smartrent/src ...", !
    set sc = $system.OBJ.LoadDir("/opt/smartrent/src", "ck", , 1)
    if $$$ISERR(sc) {
        write "[smartrent] LoadDir error: ", $system.Status.GetErrorText(sc), !
    } else {
        write "[smartrent] classes loaded OK", !
    }

    ; Регистрируем web-приложение в %SYS.
    set $namespace = "%SYS"
    set sc = ..CreateWebApp()
    if $$$ISERR(sc) {
        write "[smartrent] CreateWebApp error: ", $system.Status.GetErrorText(sc), !
    }

    ; Загружаем фикстуры в SMARTRENT.
    set $namespace = "SMARTRENT"
    if ##class(%Dictionary.ClassDefinition).%ExistsId("SmartRent.Setup.Fixtures") {
        set sc = ##class(SmartRent.Setup.Fixtures).Load()
        if $$$ISERR(sc) {
            write "[smartrent] Fixtures.Load error: ", $system.Status.GetErrorText(sc), !
        }
    }

    write "[smartrent] === setup complete ===", !
    quit $$$OK
}

/// Создать namespace и физические базы (data + code), активно подключить
/// их к текущему процессу (без рестарта IRIS).
ClassMethod CreateNamespace(pNs As %String) As %Status
{
    new $namespace
    set $namespace = "%SYS"

    set tDataDir = "/durable/db/" _ pNs _ "/"
    set tCodeDir = "/durable/db/" _ pNs _ "CODE/"

    do ##class(%File).CreateDirectoryChain(tDataDir)
    do ##class(%File).CreateDirectoryChain(tCodeDir)

    ; 1. Создаём IRIS.DAT файлы, если их нет.
    if '##class(SYS.Database).%ExistsId(tDataDir) {
        write "[smartrent] creating database file ", tDataDir, "IRIS.DAT", !
        set sc = ##class(SYS.Database).CreateDatabase(tDataDir)
        if $$$ISERR(sc) quit sc
    }
    if '##class(SYS.Database).%ExistsId(tCodeDir) {
        write "[smartrent] creating database file ", tCodeDir, "IRIS.DAT", !
        set sc = ##class(SYS.Database).CreateDatabase(tCodeDir)
        if $$$ISERR(sc) quit sc
    }

    ; 2. Регистрируем БД в Config.Databases.
    if '##class(Config.Databases).Exists(pNs) {
        kill props  set props("Directory") = tDataDir
        set sc = ##class(Config.Databases).Create(pNs, .props)
        if $$$ISERR(sc) quit sc
    }
    if '##class(Config.Databases).Exists(pNs _ "CODE") {
        kill props  set props("Directory") = tCodeDir
        set sc = ##class(Config.Databases).Create(pNs _ "CODE", .props)
        if $$$ISERR(sc) quit sc
    }

    ; 3. Создаём namespace c маппингами.
    if '##class(Config.Namespaces).Exists(pNs) {
        kill nsp
        set nsp("Globals")     = pNs
        set nsp("Routines")    = pNs _ "CODE"
        set nsp("SysGlobals")  = "IRISSYS"
        set nsp("SysRoutines") = "IRISSYS"
        set nsp("TempGlobals") = "IRISTEMP"
        set sc = ##class(Config.Namespaces).Create(pNs, .nsp)
        if $$$ISERR(sc) quit sc
        write "[smartrent] namespace ", pNs, " registered", !
    } else {
        write "[smartrent] namespace ", pNs, " already exists", !
    }

    ; 4. Активируем конфигурацию (без перезапуска IRIS).
    do ##class(Config.CPF).Reload()

    ; 5. Принудительно монтируем БД, если не смонтирована.
    if '##class(SYS.Database).IsMounted(tDataDir) {
        do ##class(SYS.Database).MountDatabase(tDataDir)
    }
    if '##class(SYS.Database).IsMounted(tCodeDir) {
        do ##class(SYS.Database).MountDatabase(tCodeDir)
    }

    quit $$$OK
}

/// Зарегистрировать REST web-приложение, обслуживающее SmartRent.REST.Dispatch.
/// AutheEnabled = 64 (Unauthenticated) числовой константой, без $$$-макросов.
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
    set props("AutheEnabled")  = 64
    set props("MatchRoles")    = ":%All"
    set props("Enabled")       = 1
    set props("CSPZENEnabled") = 1
    set props("DeepSeeEnabled")= 0
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
