/// Дашборд: агрегаты по доходам, занятости, задолженностям.
Class SmartRent.REST.Dashboard Extends %CSP.REST
{

ClassMethod Landlord() As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)

    // Сумма доходов по месяцам.
    set tIncomeArr = []
    set tRs = ##class(%SQL.Statement).%ExecDirect(,
        "SELECT TO_CHAR(P.PaidAt,'YYYY-MM') AS m, SUM(P.Amount) AS total " _
        "FROM SmartRent_Model.Payment P JOIN SmartRent_Model.Lease L ON L.ID=P.Lease " _
        "WHERE L.Landlord = ? AND P.Status='paid' " _
        "GROUP BY TO_CHAR(P.PaidAt,'YYYY-MM') ORDER BY m", tUser.%Id())
    while tRs.%Next() {
        do tIncomeArr.%Push({"month":(tRs.%Get("m")),"amount":(tRs.%Get("total"))})
    }

    // Активные / свободные сегменты.
    set tStats = {}
    set tRs2 = ##class(%SQL.Statement).%ExecDirect(,
        "SELECT S.Status AS st, COUNT(*) AS c FROM SmartRent_Model.Segment S " _
        "JOIN SmartRent_Model.Property P ON P.ID = S.Property " _
        "WHERE P.Owner = ? GROUP BY S.Status", tUser.%Id())
    set tBy = {}
    while tRs2.%Next() {
        do tBy.%Set(tRs2.%Get("st"), tRs2.%Get("c"))
    }

    // Задолженности.
    set tOverdue = 0
    set tRs3 = ##class(%SQL.Statement).%ExecDirect(,
        "SELECT NVL(SUM(P.Amount),0) AS o FROM SmartRent_Model.Payment P " _
        "JOIN SmartRent_Model.Lease L ON L.ID = P.Lease " _
        "WHERE L.Landlord = ? AND P.Status IN ('overdue','pending') AND P.DueDate < CURRENT_DATE", tUser.%Id())
    if tRs3.%Next() set tOverdue = tRs3.%Get("o")

    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({
        "income":  (tIncomeArr),
        "segmentsByStatus": (tBy),
        "overdueAmount": (tOverdue)
    })
}

ClassMethod Tenant() As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)

    set tNext = ""
    set tRs = ##class(%SQL.Statement).%ExecDirect(,
        "SELECT TOP 1 ID, Amount, Currency, DueDate, Kind FROM SmartRent_Model.Payment " _
        "WHERE Payer = ? AND Status='pending' ORDER BY DueDate", tUser.%Id())
    if tRs.%Next() {
        set tNext = {
            "id":     (tRs.%Get("ID")),
            "amount": (tRs.%Get("Amount")),
            "currency":(tRs.%Get("Currency")),
            "dueDate":(tRs.%Get("DueDate")),
            "kind":   (tRs.%Get("Kind"))
        }
    }

    set tActive = 0
    set tRs2 = ##class(%SQL.Statement).%ExecDirect(,
        "SELECT COUNT(*) AS c FROM SmartRent_Model.Lease WHERE Tenant = ? AND Status='active'", tUser.%Id())
    if tRs2.%Next() set tActive = tRs2.%Get("c")

    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({
        "activeLeases": (tActive),
        "nextPayment":  (tNext)
    })
}

}
