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
    set b.Period      = ##class(SmartRent.Util.Json).Get(tBody, "period")
    set b.Kind        = ##class(SmartRent.Util.Json).Get(tBody, "kind")
    set b.TotalAmount = ##class(SmartRent.Util.Json).GetNumber(tBody, "totalAmount")
    set b.Currency    = ##class(SmartRent.Util.Json).Get(tBody, "currency", "USD")
    set b.Split       = ##class(SmartRent.Util.Json).Get(tBody, "split", "equal")
    set b.Note        = ##class(SmartRent.Util.Json).Get(tBody, "note")
    set tDue = ##class(SmartRent.Util.Json).Get(tBody, "dueDate")
    if tDue '= "" set b.DueDate = $ZDATEH(tDue, 3, , , , , , , "")
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
