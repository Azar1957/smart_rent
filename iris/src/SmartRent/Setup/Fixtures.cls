/// Загрузка демо-данных: пользователи, объекты, сегменты, бронирование, договор, платежи.
Class SmartRent.Setup.Fixtures Extends %RegisteredObject
{

ClassMethod Load() As %Status
{
    if ##class(SmartRent.Model.User).EmailIdxExists("admin@smartrent.local") {
        write "[smartrent] fixtures already loaded", !
        do ..RepairPasswords()
        quit $$$OK
    }
    write "[smartrent] loading fixtures…", !

    set admin = ..mkUser("admin@smartrent.local", "Admin12345!", "admin", "Admin", "Smart")
    set landlord = ..mkUser("landlord@smartrent.local", "Land12345!", "landlord", "Иван", "Петров")
    set landlord.Verified = 1
    set landlord.VerifiedAt = $ZDATETIME($HOROLOG, 3, 1)
    do landlord.%Save()
    set tenant = ..mkUser("tenant@smartrent.local", "Tenant12345!", "tenant", "Анна", "Иванова")

    set p = ##class(SmartRent.Model.Property).%New()
    set p.Owner       = landlord
    set p.Title       = "3-комнатная квартира на Невском"
    set p.Description = "Светлая квартира в центре Санкт-Петербурга, рядом с метро."
    set p.Country     = "Россия"
    set p.City        = "Санкт-Петербург"
    set p.Address     = "Невский проспект, 100"
    set p.Lat         = 59.9311
    set p.Lng         = 30.3609
    set p.PropertyType= "apartment"
    set p.TotalRooms  = 3
    set p.TotalArea   = 78
    set p.Floor       = 4
    set p.HasElevator = 1
    do p.%Save()

    set s1 = ..mkSegment(p, "R1", "Большая комната с балконом", 18, 28000, 28000)
    set s2 = ..mkSegment(p, "R2", "Уютная комната с окном во двор", 14, 22000, 22000)
    set s3 = ..mkSegment(p, "R3", "Кабинет-спальня", 10, 18000, 18000)

    // Демо-бронирование арендатором + одобрение арендодателем.
    set bk = ##class(SmartRent.Model.Booking).%New()
    set bk.Segment    = s1
    set bk.Tenant     = tenant
    set bk.StartDate  = +$HOROLOG
    set bk.EndDate    = +$HOROLOG + 180
    set bk.TotalPrice = 28000 * 6
    set bk.Currency   = "RUB"
    set bk.Status     = "pending"
    do bk.%Save()
    do ##class(SmartRent.Service.Booking).Approve(bk.%Id(), landlord, .lease)

    // Один коммунальный счёт.
    set u = ##class(SmartRent.Model.UtilityBill).%New()
    set u.Property    = p
    set u.Period      = $extract($ZDATE(+$HOROLOG, 3), 1, 7)
    set u.Kind        = "electricity"
    set u.TotalAmount = 4500
    set u.Currency    = "RUB"
    set u.Split       = "byArea"
    set u.DueDate     = +$HOROLOG + 14
    do u.%Save()

    write !, "Fixtures loaded: admin/landlord/tenant + 1 property, 3 segments, 1 booking, 1 utility bill", !
    quit $$$OK
}

/// Чинит / создаёт демо-пользователей. Срабатывает, если фикстуры уже были
/// загружены, но SetPassword падал из-за бага с $system.Encryption.SHA512Hash:
/// admin создавался с пустым PasswordHash, а landlord/tenant — не создавались
/// вовсе (mkUser падал на втором юзере). Без этого /auth/login всегда 401.
ClassMethod RepairPasswords() As %Status
{
    set tFixed = 0, tCreated = 0
    set tCreds("admin@smartrent.local")    = $listbuild("Admin12345!", "admin",    "Admin", "Smart")
    set tCreds("landlord@smartrent.local") = $listbuild("Land12345!",  "landlord", "Иван",  "Петров")
    set tCreds("tenant@smartrent.local")   = $listbuild("Tenant12345!","tenant",   "Анна",  "Иванова")
    set k = "" for { set k = $order(tCreds(k))  quit:k=""
        set tList = tCreds(k)
        set tPw = $listget(tList, 1), tRole = $listget(tList, 2)
        set tFn = $listget(tList, 3), tLn   = $listget(tList, 4)
        set tId = ##class(SmartRent.Model.User).EmailIdxOpen(k)
        if '$isobject(tId) {
            set tId = ..mkUser(k, tPw, tRole, tFn, tLn)
            set tCreated = tCreated + 1
            write "[smartrent] created missing user ", k, !
        } elseif tId.PasswordHash = "" {
            do tId.SetPassword(tPw)
            do tId.%Save()
            set tFixed = tFixed + 1
            write "[smartrent] repaired password for ", k, !
        }
    }
    if (tFixed + tCreated) > 0 {
        write "[smartrent] repair: created=", tCreated, " fixed=", tFixed, !
    }
    quit $$$OK
}

ClassMethod mkUser(email As %String, pw As %String, role As %String, fn As %String, ln As %String) As SmartRent.Model.User
{
    set u = ##class(SmartRent.Model.User).%New()
    set u.Email    = email
    set u.Role     = role
    set u.FirstName= fn
    set u.LastName = ln
    set u.Language = "ru"
    do u.SetPassword(pw)
    do u.%Save()
    quit u
}

ClassMethod mkSegment(p As SmartRent.Model.Property, code As %String, title As %String, area As %Double, price As %Numeric, deposit As %Numeric) As SmartRent.Model.Segment
{
    set s = ##class(SmartRent.Model.Segment).%New()
    set s.Property      = p
    set s.Code          = code
    set s.Title         = title
    set s.Description   = title _ ", полностью меблирована."
    set s.Area          = area
    set s.Beds          = 1
    set s.Furnished     = 1
    set s.MonthlyPrice  = price
    set s.Currency      = "RUB"
    set s.DepositAmount = deposit
    set s.Status        = "available"
    set s.Amenities     = "[""Wi-Fi"",""Кондиционер"",""Стиральная машина""]"
    set s.Rules         = "[""Без курения"",""Без животных""]"
    do s.%Save()
    quit s
}

}
