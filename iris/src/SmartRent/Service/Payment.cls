/// Финансовый сервис: создание платежей, фиксация оплаты, расчёт штрафов.
Class SmartRent.Service.Payment Extends %RegisteredObject
{

/// Процент пени за день просрочки (настраивается глобалом ^SR.Cfg("penaltyRate")).
ClassMethod PenaltyRate() As %Numeric
{
    set v = $get(^SR.Cfg("penaltyRate"), 0.1)
    quit v
}

ClassMethod CreateDeposit(pLease As SmartRent.Model.Lease) As %Status
{
    set p = ##class(SmartRent.Model.Payment).%New()
    set p.Lease    = pLease
    set p.Payer    = pLease.Tenant
    set p.Kind     = "deposit"
    set p.Amount   = pLease.DepositAmount
    set p.Currency = pLease.Currency
    set p.DueDate  = pLease.StartDate
    set p.Description = "Залог по договору #" _ pLease.%Id()
    quit p.%Save()
}

ClassMethod CreateMonthlyRent(pLease As SmartRent.Model.Lease, pDueDate As %Date) As %Status
{
    set p = ##class(SmartRent.Model.Payment).%New()
    set p.Lease    = pLease
    set p.Payer    = pLease.Tenant
    set p.Kind     = "rent"
    set p.Amount   = pLease.MonthlyPrice
    set p.Currency = pLease.Currency
    set p.DueDate  = pDueDate
    set p.Description = "Аренда за " _ $extract($ZDATE(pDueDate, 3), 1, 7)
    quit p.%Save()
}

/// Зафиксировать оплату из платёжного шлюза.
ClassMethod MarkPaid(pPaymentId As %String, pProvider As %String, pProviderId As %String) As %Status
{
    set p = ##class(SmartRent.Model.Payment).%OpenId(pPaymentId)
    if '$isobject(p) quit $$$ERROR($$$GeneralError, "payment not found")
    set p.Status = "paid"
    set p.PaidAt = $ZDATETIME($HOROLOG, 3, 1)
    set p.GatewayProvider = pProvider
    set p.GatewayPaymentId = pProviderId
    set tStatus = p.%Save()
    if $$$ISOK(tStatus) {
        do ##class(SmartRent.Service.Notification).Send(
            p.Payer, "payment", "Платёж принят",
            "Платёж #" _ p.%Id() _ " на сумму " _ p.Amount _ " " _ p.Currency _ " зачислен.",
            "payment", p.%Id())
    }
    quit tStatus
}

/// Перевести просроченные платежи в overdue и начислить штрафы (запускается планировщиком).
ClassMethod ProcessOverdue() As %Integer
{
    set tToday = +$HOROLOG
    set tCount = 0
    &sql(
        DECLARE OvCur CURSOR FOR
        SELECT ID, Lease, Payer, Amount, Currency, DueDate
          INTO :id, :lease, :payer, :amount, :ccy, :due
          FROM SmartRent_Model.Payment
         WHERE Status = 'pending' AND DueDate < :tToday
    )
    &sql(OPEN OvCur)
    for {
        &sql(FETCH OvCur)
        quit:SQLCODE'=0
        set p = ##class(SmartRent.Model.Payment).%OpenId(id)
        continue:'$isobject(p)
        set p.Status = "overdue"
        do p.%Save()

        set tDays = tToday - due
        set tPenalty = $fnumber(amount * ..PenaltyRate() / 100 * tDays, "", 2)
        if tPenalty > 0 {
            set pen = ##class(SmartRent.Model.Payment).%New()
            set pen.Lease    = ##class(SmartRent.Model.Lease).%OpenId(lease)
            set pen.Payer    = ##class(SmartRent.Model.User).%OpenId(payer)
            set pen.Kind     = "penalty"
            set pen.Amount   = tPenalty
            set pen.Currency = ccy
            set pen.DueDate  = tToday
            set pen.Description = "Пеня за просрочку платежа #" _ id _ " (" _ tDays _ " д.)"
            do pen.%Save()
        }
        set tCount = tCount + 1
    }
    &sql(CLOSE OvCur)
    quit tCount
}

/// Распределить коммунальный счёт между активными арендаторами объекта.
ClassMethod SplitUtility(pBillId As %String) As %Status
{
    set tBill = ##class(SmartRent.Model.UtilityBill).%OpenId(pBillId)
    if '$isobject(tBill) quit $$$ERROR($$$GeneralError, "bill not found")

    set tShares = ..ActiveTenantsByProperty(tBill.Property)
    set tTotalWeight = 0
    set k = ""
    for {
        set k = $order(tShares(k), 1, w)
        quit:k=""
        set tTotalWeight = tTotalWeight + w
    }
    if tTotalWeight = 0 quit $$$ERROR($$$GeneralError, "no active tenants for this property")

    set k = ""
    for {
        set k = $order(tShares(k), 1, w)
        quit:k=""
        set tLeaseId  = $piece(k, "|", 1)
        set tTenantId = $piece(k, "|", 2)
        set tAmount   = $fnumber(tBill.TotalAmount * w / tTotalWeight, "", 2)

        set p = ##class(SmartRent.Model.Payment).%New()
        set p.Lease    = ##class(SmartRent.Model.Lease).%OpenId(tLeaseId)
        set p.Payer    = ##class(SmartRent.Model.User).%OpenId(tTenantId)
        set p.Kind     = "utility"
        set p.Amount   = tAmount
        set p.Currency = tBill.Currency
        set p.DueDate  = $select(tBill.DueDate'="":tBill.DueDate, 1:+$HOROLOG+14)
        set p.Description = "Коммунальные (" _ tBill.Kind _ ") за " _ tBill.Period
        do p.%Save()
    }
    quit $$$OK
}

/// Карта tShares("leaseId|tenantId") = вес (площадь сегмента или 1).
ClassMethod ActiveTenantsByProperty(pProperty As SmartRent.Model.Property, ByRef pShares) As %Status
{
    kill pShares
    set tToday = +$HOROLOG
    &sql(
        DECLARE LeaseCur CURSOR FOR
        SELECT L.ID, L.Tenant, S.Area
          INTO :lid, :tid, :area
          FROM SmartRent_Model.Lease L
          JOIN SmartRent_Model.Segment S ON S.ID = L.Segment
         WHERE S.Property = :pProperty
           AND L.Status = 'active'
           AND L.StartDate <= :tToday
           AND L.EndDate   >= :tToday
    )
    &sql(OPEN LeaseCur)
    for {
        &sql(FETCH LeaseCur)
        quit:SQLCODE'=0
        set pShares(lid _ "|" _ tid) = $select(area>0:area, 1:1)
    }
    &sql(CLOSE LeaseCur)
    quit $$$OK
}

}
