/// REST-обработчики бронирований.
Class SmartRent.REST.Bookings Extends %CSP.REST
{

ClassMethod Request(pSid As %String) As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)

    set tBody = ##class(SmartRent.REST.Dispatch).%ReadBody()
    set tStatus = ##class(SmartRent.Service.Booking).Request(pSid, tUser, tBody, .tBooking)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error($system.Status.GetErrorText(tStatus), 400)
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON(tBooking.ToJSON(), 201)
}

ClassMethod Mine() As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)

    set tQuery = "SELECT B.ID FROM SmartRent_Model.Booking B"
    if tUser.Role = "tenant" {
        set tQuery = tQuery _ " WHERE B.Tenant = " _ tUser.%Id()
    } elseif tUser.Role = "landlord" {
        set tQuery = tQuery _ " JOIN SmartRent_Model.Segment  S ON S.ID = B.Segment"
        set tQuery = tQuery _ " JOIN SmartRent_Model.Property P ON P.ID = S.Property"
        set tQuery = tQuery _ " WHERE P.Owner = " _ tUser.%Id()
    }
    set tQuery = tQuery _ " ORDER BY B.CreatedAt DESC"

    set tArr = []
    set tRs = ##class(%SQL.Statement).%ExecDirect(, tQuery)
    while tRs.%Next() {
        set b = ##class(SmartRent.Model.Booking).%OpenId(tRs.%Get("ID"))
        if $isobject(b) do tArr.%Push(b.ToJSON())
    }
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({"items":(tArr)})
}

ClassMethod Approve(pId As %String) As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)

    set tStatus = ##class(SmartRent.Service.Booking).Approve(pId, tUser, .tLease)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error($system.Status.GetErrorText(tStatus), 400)
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({"lease":(tLease.ToJSON())})
}

ClassMethod Reject(pId As %String) As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)
    set tBody = ##class(SmartRent.REST.Dispatch).%ReadBody()
    set tStatus = ##class(SmartRent.Service.Booking).Reject(pId, tUser, $get(tBody.reason))
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error($system.Status.GetErrorText(tStatus), 400)
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({"ok":1})
}

}
