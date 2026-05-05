/// Бизнес-логика бронирования: проверка доступности, расчёт стоимости, подтверждение/отказ.
Class SmartRent.Service.Booking Extends %RegisteredObject
{

/// Создать запрос на бронирование. Проверяет пересечения с существующими approved/pending.
ClassMethod Request(pSegmentId As %String, pTenant As SmartRent.Model.User, pPayload As %DynamicObject, Output pBooking As SmartRent.Model.Booking) As %Status
{
    set pBooking = ""
    set tSegment = ##class(SmartRent.Model.Segment).%OpenId(pSegmentId)
    if '$isobject(tSegment) quit $$$ERROR($$$GeneralError, "segment not found")
    if tSegment.Status = "maintenance" quit $$$ERROR($$$GeneralError, "segment in maintenance")

    set tStart = $ZDATEH(##class(SmartRent.Util.Json).Get(pPayload, "startDate"), 3, , , , , , , "")
    set tEnd   = $ZDATEH(##class(SmartRent.Util.Json).Get(pPayload, "endDate"),   3, , , , , , , "")
    if (tStart = "") || (tEnd = "") || (tEnd <= tStart) {
        quit $$$ERROR($$$GeneralError, "invalid date range")
    }

    if ..HasOverlap(tSegment, tStart, tEnd, "") {
        quit $$$ERROR($$$GeneralError, "segment is not available for these dates")
    }

    set tMonths = ..MonthsBetween(tStart, tEnd)
    set tPrice  = $fnumber(tMonths * tSegment.MonthlyPrice * ..SeasonalFactor(tSegment, tStart), "", 2)

    set tB = ##class(SmartRent.Model.Booking).%New()
    set tB.Segment    = tSegment
    set tB.Tenant     = pTenant
    set tB.StartDate  = tStart
    set tB.EndDate    = tEnd
    set tB.TotalPrice = tPrice
    set tB.Currency   = tSegment.Currency
    set tB.Note       = ##class(SmartRent.Util.Json).Get(pPayload, "note")
    set tStatus = tB.%Save()
    if $$$ISERR(tStatus) quit tStatus

    do ##class(SmartRent.Service.Notification).Send(
        tSegment.Property.Owner,
        "booking",
        "Новый запрос на бронирование",
        "Получен запрос на сегмент " _ tSegment.Code,
        "booking",
        tB.%Id())

    set pBooking = tB
    quit $$$OK
}

/// Подтверждение бронирования арендодателем. Создаёт черновик договора и платёж за первый месяц.
ClassMethod Approve(pBookingId As %String, pLandlord As SmartRent.Model.User, Output pLease As SmartRent.Model.Lease) As %Status
{
    set pLease = ""
    set tB = ##class(SmartRent.Model.Booking).%OpenId(pBookingId)
    if '$isobject(tB) quit $$$ERROR($$$GeneralError, "booking not found")
    if tB.Status '= "pending" quit $$$ERROR($$$GeneralError, "booking is not pending")
    if tB.Segment.Property.Owner.%Id() '= pLandlord.%Id() {
        quit $$$ERROR($$$GeneralError, "forbidden: not the property owner")
    }
    if ..HasOverlap(tB.Segment, tB.StartDate, tB.EndDate, tB.%Id()) {
        quit $$$ERROR($$$GeneralError, "overlap with another approved booking")
    }

    tstart
    set tB.Status    = "approved"
    set tB.DecidedAt = $ZDATETIME($HOROLOG, 3, 1)
    set tStatus = tB.%Save()
    if $$$ISERR(tStatus) trollback  quit tStatus

    set tB.Segment.Status = "reserved"
    set tStatus = tB.Segment.%Save()
    if $$$ISERR(tStatus) trollback  quit tStatus

    set tL = ##class(SmartRent.Model.Lease).%New()
    set tL.Booking       = tB
    set tL.Segment       = tB.Segment
    set tL.Tenant        = tB.Tenant
    set tL.Landlord      = pLandlord
    set tL.StartDate     = tB.StartDate
    set tL.EndDate       = tB.EndDate
    set tL.MonthlyPrice  = tB.Segment.MonthlyPrice
    set tL.DepositAmount = tB.Segment.DepositAmount
    set tL.Currency      = tB.Segment.Currency
    set tL.Status        = "draft"
    do tL.ContractText.Write(##class(SmartRent.Service.Contract).Render(tL))
    set tStatus = tL.%Save()
    if $$$ISERR(tStatus) trollback  quit tStatus

    if tL.DepositAmount > 0 {
        do ##class(SmartRent.Service.Payment).CreateDeposit(tL)
    }
    do ##class(SmartRent.Service.Payment).CreateMonthlyRent(tL, tB.StartDate)

    tcommit

    do ##class(SmartRent.Service.Notification).Send(
        tB.Tenant, "booking",
        "Бронирование подтверждено",
        "Подготовлен договор. Перейдите к оплате депозита и аренды.",
        "lease", tL.%Id())

    set pLease = tL
    quit $$$OK
}

/// Отклонение бронирования.
ClassMethod Reject(pBookingId As %String, pLandlord As SmartRent.Model.User, pReason As %String) As %Status
{
    set tB = ##class(SmartRent.Model.Booking).%OpenId(pBookingId)
    if '$isobject(tB) quit $$$ERROR($$$GeneralError, "booking not found")
    if tB.Segment.Property.Owner.%Id() '= pLandlord.%Id() quit $$$ERROR($$$GeneralError, "forbidden")
    set tB.Status       = "rejected"
    set tB.RejectReason = pReason
    set tB.DecidedAt    = $ZDATETIME($HOROLOG, 3, 1)
    set tStatus = tB.%Save()
    if $$$ISOK(tStatus) {
        do ##class(SmartRent.Service.Notification).Send(
            tB.Tenant, "booking", "Бронирование отклонено", pReason, "booking", tB.%Id())
    }
    quit tStatus
}

/// Проверка пересечений по сегменту: возвращает 1, если есть конфликт.
ClassMethod HasOverlap(pSegment As SmartRent.Model.Segment, pStart As %Date, pEnd As %Date, pExcludeId As %String) As %Boolean
{
    &sql(
        DECLARE BookingCur CURSOR FOR
        SELECT ID, StartDate, EndDate, Status
          INTO :id, :s, :e, :st
          FROM SmartRent_Model.Booking
         WHERE Segment = :pSegment
           AND Status IN ('pending','approved')
    )
    &sql(OPEN BookingCur)
    set tHas = 0
    for {
        &sql(FETCH BookingCur)
        quit:SQLCODE'=0
        continue:(pExcludeId'="")&&(id=pExcludeId)
        if (s < pEnd) && (e > pStart) {
            set tHas = 1
            quit
        }
    }
    &sql(CLOSE BookingCur)
    quit tHas
}

/// Грубая оценка количества месяцев между двумя датами (вкл.).
ClassMethod MonthsBetween(pStart As %Date, pEnd As %Date) As %Decimal
{
    set tDays = pEnd - pStart
    if tDays <= 0 quit 0
    quit $fnumber(tDays / 30.4375, "", 2)
}

/// Сезонный коэффициент по дате старта (если задан в сегменте JSON-картой по месяцам).
ClassMethod SeasonalFactor(pSegment As SmartRent.Model.Segment, pStart As %Date) As %Double
{
    if pSegment.SeasonalFactors = "" quit 1
    set tObj = ##class(SmartRent.Util.Json).ParseSafe(pSegment.SeasonalFactors)
    set tMonth = $extract($ZDATE(pStart, 3), 6, 7)
    set tVal = tObj.%Get(tMonth)
    quit $select(tVal'="" && (tVal>0):tVal, 1:1)
}

}
