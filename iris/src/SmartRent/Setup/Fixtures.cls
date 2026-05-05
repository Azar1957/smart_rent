/// Загрузка демо-данных Smart Rent: пользователи, объекты, сегменты, активные
/// договоры, платежи аренды и коммунальные счета.
///
/// Все объекты находятся за пределами России (по требованию):
///   • Барселона, Carrer de Mallorca, 401 — landlord1: "вся квартира" (apartment)
///   • Берлин, Linienstraße 44             — landlord2: квартира со сдачей по
///     комнатам (room mode), 3 сегмента
///
/// Демо-аккаунты (см. также docs/STRUCTURE.md):
///   admin@smartrent.local            / Admin12345!     (admin)
///   landlord@smartrent.local         / Land12345!      (landlord, legacy alias)
///   marta.vidal@smartrent.demo       / Marta12345!     (landlord, Barcelona)
///   lukas.berger@smartrent.demo      / Lukas12345!     (landlord, Berlin)
///   tenant@smartrent.local           / Tenant12345!    (tenant, legacy alias)
///   anna.kowalski@smartrent.demo     / Anna12345!      (tenant, Barcelona)
///   noah.fischer@smartrent.demo      / Noah12345!      (tenant, Berlin R1)
///   isabella.romano@smartrent.demo   / Isa12345!       (tenant, Berlin R2)
///   liam.oconnor@smartrent.demo      / Liam12345!      (tenant, Berlin R3)
Class SmartRent.Setup.Fixtures Extends %RegisteredObject
{

ClassMethod Load() As %Status
{
    // Одноразовая чистка: убираем артефакты старых фикстур с русскими
    // адресами (Невский / Санкт-Петербург / Россия / RUB и т.п.).
    // Идемпотентна — после первого прогона ничего не делает.
    do ..PurgeLegacyRussianProperties()

    if ##class(SmartRent.Model.User).EmailIdxExists("admin@smartrent.local") {
        write "[smartrent] fixtures already loaded", !
        do ..RepairPasswords()
        do ..EnsureExtendedDemo()
        quit $$$OK
    }
    write "[smartrent] loading fixtures…", !

    do ..LoadCore()
    do ..EnsureExtendedDemo()

    write !, "Fixtures loaded.", !
    quit $$$OK
}

/// Зачистить устаревшие RU-объекты вместе со связанными сегментами /
/// бронированиями / договорами / платежами / коммунальными счетами.
/// Безопасно вызывать многократно: если ничего подходящего нет — выходит молча.
ClassMethod PurgeLegacyRussianProperties() As %Status
{
    set tCount = 0
    set tQuery = "SELECT ID FROM SmartRent_Model.Property " _
                 "WHERE Country = 'Россия' " _
                 "   OR City = 'Санкт-Петербург' " _
                 "   OR City = 'Москва' " _
                 "   OR Address LIKE '%Невский%' " _
                 "   OR Title LIKE '%Невск%' " _
                 "   OR Title LIKE '%комнатная квартира на Невск%'"
    set tRs = ##class(%SQL.Statement).%ExecDirect(, tQuery)
    while tRs.%Next() {
        set tPid = tRs.%Get("ID")
        do ..deletePropertyCascade(tPid)
        set tCount = tCount + 1
    }
    if tCount > 0 {
        write "[smartrent] purged ", tCount, " legacy RU property(ies).", !
    }
    quit $$$OK
}

/// Удалить Property вместе со всеми зависимыми записями.
/// Порядок важен: сначала Payment → Lease → Booking → UtilityBill → Segment → Property.
ClassMethod deletePropertyCascade(pPropId As %String) As %Status
{
    // Сегменты и связанные booking/lease/payment.
    set tRs = ##class(%SQL.Statement).%ExecDirect(,
        "SELECT ID FROM SmartRent_Model.Segment WHERE Property = ?", pPropId)
    while tRs.%Next() {
        do ..deleteSegmentCascade(tRs.%Get("ID"))
    }
    // Коммунальные счета и сгенерированные по ним платежи (по lease они и так
    // удалены, но иногда счёт может болтаться отдельно).
    set tRs2 = ##class(%SQL.Statement).%ExecDirect(,
        "SELECT ID FROM SmartRent_Model.UtilityBill WHERE Property = ?", pPropId)
    while tRs2.%Next() {
        do ##class(SmartRent.Model.UtilityBill).%DeleteId(tRs2.%Get("ID"))
    }
    do ##class(SmartRent.Model.Property).%DeleteId(pPropId)
    quit $$$OK
}

ClassMethod deleteSegmentCascade(pSegId As %String) As %Status
{
    set tRs = ##class(%SQL.Statement).%ExecDirect(,
        "SELECT ID FROM SmartRent_Model.Booking WHERE Segment = ?", pSegId)
    while tRs.%Next() {
        do ..deleteBookingCascade(tRs.%Get("ID"))
    }
    do ##class(SmartRent.Model.Segment).%DeleteId(pSegId)
    quit $$$OK
}

ClassMethod deleteBookingCascade(pBookId As %String) As %Status
{
    set tRs = ##class(%SQL.Statement).%ExecDirect(,
        "SELECT ID FROM SmartRent_Model.Lease WHERE Booking = ?", pBookId)
    while tRs.%Next() {
        do ..deleteLeaseCascade(tRs.%Get("ID"))
    }
    do ##class(SmartRent.Model.Booking).%DeleteId(pBookId)
    quit $$$OK
}

ClassMethod deleteLeaseCascade(pLeaseId As %String) As %Status
{
    set tRs = ##class(%SQL.Statement).%ExecDirect(,
        "SELECT ID FROM SmartRent_Model.Payment WHERE Lease = ?", pLeaseId)
    while tRs.%Next() {
        do ##class(SmartRent.Model.Payment).%DeleteId(tRs.%Get("ID"))
    }
    do ##class(SmartRent.Model.Lease).%DeleteId(pLeaseId)
    quit $$$OK
}

/// Базовые админ + один landlord + один tenant + один объект для совместимости
/// с предыдущими версиями (legacy алиасы `landlord@smartrent.local` и
/// `tenant@smartrent.local`). Адрес — Барселона.
ClassMethod LoadCore() As %Status
{
    set admin    = ..mkUser("admin@smartrent.local",    "Admin12345!",  "admin",    "Admin", "Smart",  "en")
    set landlord = ..mkUser("landlord@smartrent.local", "Land12345!",   "landlord", "Marta", "Vidal",  "en")
    set landlord.Verified = 1
    set landlord.VerifiedAt = $ZDATETIME($HOROLOG, 3, 1)
    do landlord.%Save()
    set tenant   = ..mkUser("tenant@smartrent.local",   "Tenant12345!", "tenant",   "Anna",  "Kowalski","en")

    set p = ##class(SmartRent.Model.Property).%New()
    set p.Owner       = landlord
    set p.Title       = "Bright apartment near Sagrada Família"
    set p.Description = "A bright two-room apartment in Eixample, three minutes from Sagrada Família. Fully furnished and equipped."
    set p.Country     = "Spain"
    set p.City        = "Barcelona"
    set p.Address     = "Carrer de Mallorca, 401"
    set p.Lat         = 41.4035
    set p.Lng         = 2.1744
    set p.PropertyType= "apartment"
    set p.TotalRooms  = 2
    set p.TotalArea   = 64
    set p.Floor       = 4
    set p.HasElevator = 1
    do p.%Save()

    // Один сегмент = вся квартира целиком (mode=apartment).
    set s = ..mkSegment(p, "FULL", "Entire apartment", 64, 1450, 1450, "EUR")
    set s.Status = "available"
    do s.%Save()

    quit $$$OK
}

/// Расширенный демо-набор: второй landlord c квартирой "по комнатам", несколько
/// арендаторов с активными договорами, история платежей за 4 предыдущих месяца
/// и коммунальные счета. Идемпотентно: если уже создано — выходит молча.
ClassMethod EnsureExtendedDemo() As %Status
{
    if ##class(SmartRent.Model.User).EmailIdxExists("lukas.berger@smartrent.demo") {
        // Второй landlord уже создан — расширенные демо-данные на месте.
        quit $$$OK
    }
    write "[smartrent] seeding extended demo (Berlin landlord + tenants + payment history)…", !

    set today = +$HOROLOG

    // ===== Landlord #1: Barcelona (используем существующий Marta Vidal) =====
    set martaSrc = ##class(SmartRent.Model.User).EmailIdxOpen("landlord@smartrent.local")
    if '$isobject(martaSrc) {
        set martaSrc = ..mkUser("landlord@smartrent.local","Land12345!","landlord","Marta","Vidal","en")
    }
    // Дублируем под "красивым" доменным email, как заявлено в шапке файла.
    set marta = ..mkUserIfMissing("marta.vidal@smartrent.demo","Marta12345!","landlord","Marta","Vidal","en")
    set marta.Verified = 1
    set marta.VerifiedAt = $ZDATETIME($HOROLOG, 3, 1)
    do marta.%Save()

    // Объект Marta уже создан в LoadCore — берём первый.
    set martaProperty = ..firstPropertyOfOwner(martaSrc)
    if '$isobject(martaProperty) quit $$$ERROR($$$GeneralError, "Barcelona property missing")
    set martaSegFull = ..firstSegmentOfProperty(martaProperty)
    if '$isobject(martaSegFull) quit $$$ERROR($$$GeneralError, "Barcelona segment missing")

    // ===== Tenant Anna в квартире Marta — активный договор =====
    set anna = ..mkUserIfMissing("anna.kowalski@smartrent.demo","Anna12345!","tenant","Anna","Kowalski","en")

    set leaseAnna = ..ensureActiveLease(martaSegFull, anna, marta, today - 120, today + 245, 1450, 1450, "EUR")
    do ..ensurePaymentHistory(leaseAnna, anna, today, 1450, "EUR", 4)
    do ..ensureUtilityHistory(martaProperty, leaseAnna, anna, today, "EUR", 4)

    // ===== Landlord #2: Berlin (Lukas Berger) с квартирой по комнатам =====
    set lukas = ..mkUserIfMissing("lukas.berger@smartrent.demo","Lukas12345!","landlord","Lukas","Berger","en")
    set lukas.Verified = 1
    set lukas.VerifiedAt = $ZDATETIME($HOROLOG, 3, 1)
    do lukas.%Save()

    set bp = ##class(SmartRent.Model.Property).%New()
    set bp.Owner       = lukas
    set bp.Title       = "Shared apartment in Mitte"
    set bp.Description = "Three private rooms with shared kitchen and bathroom in Berlin Mitte, walking distance from U-Bahn Rosenthaler Platz."
    set bp.Country     = "Germany"
    set bp.City        = "Berlin"
    set bp.Address     = "Linienstraße 44"
    set bp.Lat         = 52.5275
    set bp.Lng         = 13.4030
    set bp.PropertyType= "apartment"
    set bp.TotalRooms  = 3
    set bp.TotalArea   = 92
    set bp.Floor       = 2
    set bp.HasElevator = 0
    do bp.%Save()

    set bR1 = ..mkSegment(bp, "R1", "Master room with balcony", 22, 720, 720, "EUR")
    set bR2 = ..mkSegment(bp, "R2", "Sunny double room", 16, 580, 580, "EUR")
    set bR3 = ..mkSegment(bp, "R3", "Quiet single room", 12, 460, 460, "EUR")
    set bR1.Status = "rented"  do bR1.%Save()
    set bR2.Status = "rented"  do bR2.%Save()
    set bR3.Status = "rented"  do bR3.%Save()

    // ===== Tenants Berlin: Noah, Isabella, Liam =====
    set noah = ..mkUserIfMissing("noah.fischer@smartrent.demo","Noah12345!","tenant","Noah","Fischer","en")
    set isa  = ..mkUserIfMissing("isabella.romano@smartrent.demo","Isa12345!","tenant","Isabella","Romano","en")
    set liam = ..mkUserIfMissing("liam.oconnor@smartrent.demo","Liam12345!","tenant","Liam","O’Connor","en")

    set leaseNoah = ..ensureActiveLease(bR1, noah, lukas, today - 180, today + 185, 720, 720, "EUR")
    set leaseIsa  = ..ensureActiveLease(bR2, isa,  lukas, today -  90, today + 275, 580, 580, "EUR")
    set leaseLiam = ..ensureActiveLease(bR3, liam, lukas, today -  60, today + 305, 460, 460, "EUR")

    do ..ensurePaymentHistory(leaseNoah, noah, today, 720, "EUR", 6)
    do ..ensurePaymentHistory(leaseIsa,  isa,  today, 580, "EUR", 3)
    do ..ensurePaymentHistory(leaseLiam, liam, today, 460, "EUR", 2)

    do ..ensureUtilityHistory(bp, leaseNoah, noah, today, "EUR", 4)
    do ..ensureUtilityHistory(bp, leaseIsa,  isa,  today, "EUR", 4)
    do ..ensureUtilityHistory(bp, leaseLiam, liam, today, "EUR", 4)

    // Прямой alias на старого tenant — переводим Anna и легаси-tenant в одну логику.
    set legacyTenant = ##class(SmartRent.Model.User).EmailIdxOpen("tenant@smartrent.local")
    if $isobject(legacyTenant) {
        set legacyLease = ..ensureActiveLease(martaSegFull, legacyTenant, marta, today - 30, today + 335, 1450, 1450, "EUR")
        do ..ensurePaymentHistory(legacyLease, legacyTenant, today, 1450, "EUR", 1)
    }

    write "[smartrent] extended demo seeded.", !
    quit $$$OK
}

/// Создаёт активный договор с уже подписанной обеими сторонами формой.
/// Идемпотентно: если для (segment, tenant, status=active) уже есть запись —
/// возвращает её.
ClassMethod ensureActiveLease(pSegment As SmartRent.Model.Segment, pTenant As SmartRent.Model.User, pLandlord As SmartRent.Model.User, pStartDate As %Date, pEndDate As %Date, pMonthly As %Numeric, pDeposit As %Numeric, pCcy As %String) As SmartRent.Model.Lease
{
    set tSegId    = pSegment.%Id()
    set tTenantId = pTenant.%Id()
    &sql(
        SELECT TOP 1 ID INTO :existingId
          FROM SmartRent_Model.Lease
         WHERE Segment = :tSegId
           AND Tenant  = :tTenantId
           AND Status  = 'active'
    )
    if SQLCODE = 0 {
        quit ##class(SmartRent.Model.Lease).%OpenId(existingId)
    }

    // Booking как «approved» (нужен по модели для FK).
    set b = ##class(SmartRent.Model.Booking).%New()
    set b.Segment    = pSegment
    set b.Tenant     = pTenant
    set b.StartDate  = pStartDate
    set b.EndDate    = pEndDate
    set b.Status     = "approved"
    set b.TotalPrice = pMonthly * 12
    set b.Currency   = pCcy
    set b.DecidedAt  = $ZDATETIME($HOROLOG, 3, 1)
    do b.%Save()

    set l = ##class(SmartRent.Model.Lease).%New()
    set l.Booking          = b
    set l.Segment          = pSegment
    set l.Tenant           = pTenant
    set l.Landlord         = pLandlord
    set l.StartDate        = pStartDate
    set l.EndDate          = pEndDate
    set l.MonthlyPrice     = pMonthly
    set l.DepositAmount    = pDeposit
    set l.Currency         = pCcy
    set l.Status           = "active"
    set l.TenantSignedAt   = $ZDATETIME($HOROLOG, 3, 1)
    set l.LandlordSignedAt = $ZDATETIME($HOROLOG, 3, 1)
    do l.%Save()
    quit l
}

/// Проставить N оплаченных rent-платежей за последние N месяцев + один pending
/// на ближайший due. Идемпотентно по описанию платежа (rent for YYYY-MM).
ClassMethod ensurePaymentHistory(pLease As SmartRent.Model.Lease, pTenant As SmartRent.Model.User, pToday As %Date, pMonthly As %Numeric, pCcy As %String, pMonths As %Integer) As %Status
{
    // Депозит — однократно.
    set tDepDesc = "Deposit for lease #" _ pLease.%Id()
    if '..paymentExistsByDesc(pLease, tDepDesc) {
        set d = ##class(SmartRent.Model.Payment).%New()
        set d.Lease = pLease
        set d.Payer = pTenant
        set d.Kind  = "deposit"
        set d.Amount   = pLease.DepositAmount
        set d.Currency = pCcy
        set d.DueDate  = pLease.StartDate
        set d.PaidAt   = $ZDATETIME($HOROLOG, 3, 1)
        set d.Status   = "paid"
        set d.GatewayProvider  = "stripe"
        set d.GatewayPaymentId = "pi_demo_dep_" _ pLease.%Id()
        set d.Description      = tDepDesc
        do d.%Save()
    }

    // Прошедшие месячные платежи: paid.
    for i = pMonths:-1:1 {
        set tDue   = pToday - (i * 30)
        set tMonth = $extract($ZDATE(tDue, 3), 1, 7)
        set tDesc  = "Rent for " _ tMonth
        continue:..paymentExistsByDesc(pLease, tDesc)
        set p = ##class(SmartRent.Model.Payment).%New()
        set p.Lease    = pLease
        set p.Payer    = pTenant
        set p.Kind     = "rent"
        set p.Amount   = pMonthly
        set p.Currency = pCcy
        set p.DueDate  = tDue
        set p.PaidAt   = $ZDATETIME(tDue _ "," _ ($random(28800)+32400), 3, 1)
        set p.Status   = "paid"
        set p.GatewayProvider  = "stripe"
        set p.GatewayPaymentId = "pi_demo_" _ pLease.%Id() _ "_" _ tMonth
        set p.Description      = tDesc
        do p.%Save()
    }

    // Текущий месяц: pending.
    set tDueNow   = pToday + 7
    set tMonthNow = $extract($ZDATE(tDueNow, 3), 1, 7)
    set tDescNow  = "Rent for " _ tMonthNow
    if '..paymentExistsByDesc(pLease, tDescNow) {
        set p = ##class(SmartRent.Model.Payment).%New()
        set p.Lease    = pLease
        set p.Payer    = pTenant
        set p.Kind     = "rent"
        set p.Amount   = pMonthly
        set p.Currency = pCcy
        set p.DueDate  = tDueNow
        set p.Status   = "pending"
        set p.Description = tDescNow
        do p.%Save()
    }

    quit $$$OK
}

/// Создаёт коммунальные счета и оплаченные коммунальные платежи за N последних
/// месяцев (electricity / water / internet). Идемпотентно.
ClassMethod ensureUtilityHistory(pProperty As SmartRent.Model.Property, pLease As SmartRent.Model.Lease, pTenant As SmartRent.Model.User, pToday As %Date, pCcy As %String, pMonths As %Integer) As %Status
{
    set tKinds = $listbuild("electricity", "water", "internet")
    for i = pMonths:-1:1 {
        set tDue   = pToday - (i * 30) + 14
        set tMonth = $extract($ZDATE(tDue, 3), 1, 7)
        set tListIdx = 0
        set tPtr = 0
        while $listnext(tKinds, tPtr, tKind) {
            set tListIdx = tListIdx + 1
            set tAmount = $select(tKind = "electricity":62.50,
                                  tKind = "water":18.40,
                                  1:35.00)
            set tDesc = "Utilities (" _ tKind _ ") for " _ tMonth
            continue:..paymentExistsByDesc(pLease, tDesc)
            set p = ##class(SmartRent.Model.Payment).%New()
            set p.Lease    = pLease
            set p.Payer    = pTenant
            set p.Kind     = "utility"
            set p.Amount   = tAmount
            set p.Currency = pCcy
            set p.DueDate  = tDue
            set p.PaidAt   = $ZDATETIME(tDue _ ",43200", 3, 1)
            set p.Status   = "paid"
            set p.GatewayProvider  = "stripe"
            set p.GatewayPaymentId = "pi_util_" _ pLease.%Id() _ "_" _ tMonth _ "_" _ tKind
            set p.Description      = tDesc
            do p.%Save()
        }
    }
    quit $$$OK
}

ClassMethod paymentExistsByDesc(pLease As SmartRent.Model.Lease, pDesc As %String) As %Boolean
{
    set tLeaseId = pLease.%Id()
    &sql(
        SELECT TOP 1 1 INTO :flag
          FROM SmartRent_Model.Payment
         WHERE Lease = :tLeaseId AND Description = :pDesc
    )
    quit (SQLCODE = 0)
}

ClassMethod firstPropertyOfOwner(pOwner As SmartRent.Model.User) As SmartRent.Model.Property
{
    set tOwnerId = pOwner.%Id()
    &sql(
        SELECT TOP 1 ID INTO :id
          FROM SmartRent_Model.Property
         WHERE Owner = :tOwnerId
         ORDER BY ID
    )
    if SQLCODE '= 0 quit ""
    quit ##class(SmartRent.Model.Property).%OpenId(id)
}

ClassMethod firstSegmentOfProperty(pProperty As SmartRent.Model.Property) As SmartRent.Model.Segment
{
    set tPropId = pProperty.%Id()
    &sql(
        SELECT TOP 1 ID INTO :id
          FROM SmartRent_Model.Segment
         WHERE Property = :tPropId
         ORDER BY ID
    )
    if SQLCODE '= 0 quit ""
    quit ##class(SmartRent.Model.Segment).%OpenId(id)
}

/// Чинит / создаёт демо-пользователей. Срабатывает, если фикстуры уже были
/// загружены, но SetPassword падал из-за бага с $system.Encryption.SHA512Hash:
/// admin создавался с пустым PasswordHash, а landlord/tenant — не создавались
/// вовсе (mkUser падал на втором юзере). Без этого /auth/login всегда 401.
ClassMethod RepairPasswords() As %Status
{
    set tFixed = 0, tCreated = 0
    set tCreds("admin@smartrent.local")    = $listbuild("Admin12345!", "admin",    "Admin", "Smart")
    set tCreds("landlord@smartrent.local") = $listbuild("Land12345!",  "landlord", "Marta", "Vidal")
    set tCreds("tenant@smartrent.local")   = $listbuild("Tenant12345!","tenant",   "Anna",  "Kowalski")
    set k = "" for { set k = $order(tCreds(k))  quit:k=""
        set tList = tCreds(k)
        set tPw = $listget(tList, 1), tRole = $listget(tList, 2)
        set tFn = $listget(tList, 3), tLn   = $listget(tList, 4)
        set tId = ##class(SmartRent.Model.User).EmailIdxOpen(k)
        if '$isobject(tId) {
            set tId = ..mkUser(k, tPw, tRole, tFn, tLn, "en")
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

ClassMethod mkUser(email As %String, pw As %String, role As %String, fn As %String, ln As %String, lang As %String = "en") As SmartRent.Model.User
{
    set u = ##class(SmartRent.Model.User).%New()
    set u.Email    = email
    set u.Role     = role
    set u.FirstName= fn
    set u.LastName = ln
    set u.Language = lang
    do u.SetPassword(pw)
    do u.%Save()
    quit u
}

/// Идемпотентный вариант mkUser: если юзер с таким email уже есть — возвращает
/// его (с обновлёнными атрибутами имени), не пересоздавая.
ClassMethod mkUserIfMissing(email As %String, pw As %String, role As %String, fn As %String, ln As %String, lang As %String = "en") As SmartRent.Model.User
{
    set u = ##class(SmartRent.Model.User).EmailIdxOpen(email)
    if $isobject(u) quit u
    quit ..mkUser(email, pw, role, fn, ln, lang)
}

ClassMethod mkSegment(p As SmartRent.Model.Property, code As %String, title As %String, area As %Double, price As %Numeric, deposit As %Numeric, ccy As %String = "EUR") As SmartRent.Model.Segment
{
    set s = ##class(SmartRent.Model.Segment).%New()
    set s.Property      = p
    set s.Code          = code
    set s.Title         = title
    set s.Description   = title _ ", fully furnished."
    set s.Area          = area
    set s.Beds          = 1
    set s.Furnished     = 1
    set s.MonthlyPrice  = price
    set s.Currency      = ccy
    set s.DepositAmount = deposit
    set s.Status        = "available"
    set s.Amenities     = "[""Wi-Fi"",""Heating"",""Washer""]"
    set s.Rules         = "[""No smoking"",""No pets""]"
    do s.%Save()
    quit s
}

}
