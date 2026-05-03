/// REST-обработчики коммунальных счетов.
Class SmartRent.REST.Utilities Extends %CSP.REST
{

ClassMethod Create(pPid As %String) As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)
    set tProp = ##class(SmartRent.Model.Property).%OpenId(pPid)
    if '$isobject(tProp) quit ##class(SmartRent.REST.Dispatch).%Error("not found", 404)
    if (tProp.Owner.%Id() '= tUser.%Id()) && (tUser.Role '= "admin") {
        quit ##class(SmartRent.REST.Dispatch).%Error("forbidden", 403)
    }

    set tBody = ##class(SmartRent.REST.Dispatch).%ReadBody()
    set b = ##class(SmartRent.Model.UtilityBill).%New()
    set b.Property    = tProp
    set b.Period      = $get(tBody.period)
    set b.Kind        = $get(tBody.kind)
    set b.TotalAmount = $get(tBody.totalAmount)
    set b.Currency    = $select($get(tBody.currency)'="":tBody.currency, 1:"USD")
    set b.Split       = $select($get(tBody.split)'="":tBody.split, 1:"equal")
    set b.Note        = $get(tBody.note)
    if $get(tBody.dueDate)'="" set b.DueDate = $ZDATEH(tBody.dueDate, 3)
    set tStatus = b.%Save()
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error($system.Status.GetErrorText(tStatus), 400)
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON(b.ToJSON(), 201)
}

ClassMethod Split(pId As %String) As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)
    set tStatus = ##class(SmartRent.Service.Payment).SplitUtility(pId)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error($system.Status.GetErrorText(tStatus), 400)
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({"ok":1})
}

}
