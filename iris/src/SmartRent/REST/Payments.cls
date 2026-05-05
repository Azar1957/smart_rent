/// REST-обработчики платежей.
Class SmartRent.REST.Payments Extends %CSP.REST
{

ClassMethod Mine() As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)

    set tQuery = "SELECT P.ID FROM SmartRent_Model.Payment P"
    if tUser.Role = "tenant" {
        set tQuery = tQuery _ " WHERE P.Payer = " _ tUser.%Id()
    } elseif tUser.Role = "landlord" {
        set tQuery = tQuery _ " JOIN SmartRent_Model.Lease L ON L.ID = P.Lease"
        set tQuery = tQuery _ " WHERE L.Landlord = " _ tUser.%Id()
    }
    set tQuery = tQuery _ " ORDER BY P.DueDate DESC"

    set tArr = []
    set tRs = ##class(%SQL.Statement).%ExecDirect(, tQuery)
    while tRs.%Next() {
        set p = ##class(SmartRent.Model.Payment).%OpenId(tRs.%Get("ID"))
        if $isobject(p) do tArr.%Push(p.ToJSON())
    }
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({"items":(tArr)})
}

/// Заглушка платёжного шлюза. В проде сюда придёт webhook от Stripe/PayPal.
ClassMethod Pay(pId As %String) As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)
    set tBody = ##class(SmartRent.REST.Dispatch).%ReadBody()
    set tStatus = ##class(SmartRent.Service.Payment).MarkPaid(
        pId,
        ##class(SmartRent.Util.Json).Get(tBody, "provider", "manual"),
        ##class(SmartRent.Util.Json).Get(tBody, "providerId", "local-" _ pId))
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error($system.Status.GetErrorText(tStatus), 400)
    set p = ##class(SmartRent.Model.Payment).%OpenId(pId)
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON(p.ToJSON())
}

}
