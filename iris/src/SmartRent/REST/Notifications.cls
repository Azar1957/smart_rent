/// REST-обработчики уведомлений.
Class SmartRent.REST.Notifications Extends %CSP.REST
{

ClassMethod Mine() As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)
    set tArr = []
    set tRs = ##class(%SQL.Statement).%ExecDirect(, "SELECT ID FROM SmartRent_Model.Notification WHERE Recipient = ? ORDER BY CreatedAt DESC", tUser.%Id())
    while tRs.%Next() {
        set n = ##class(SmartRent.Model.Notification).%OpenId(tRs.%Get("ID"))
        if $isobject(n) do tArr.%Push(n.ToJSON())
    }
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({"items":(tArr)})
}

ClassMethod Read(pId As %String) As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)
    do ##class(SmartRent.Service.Notification).MarkRead(pId)
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({"ok":1})
}

}
