/// REST-обработчики объектов недвижимости.
Class SmartRent.REST.Properties Extends %CSP.REST
{

ClassMethod List() As %Status
{
    set tCity = $get(%request.Data("city", 1))
    set tArr = []
    set tQuery = "SELECT ID FROM SmartRent_Model.Property WHERE Active = 1"
    if tCity '= "" set tQuery = tQuery _ " AND City = '" _ $replace(tCity, "'", "''") _ "'"
    set tQuery = tQuery _ " ORDER BY CreatedAt DESC"

    set tRs = ##class(%SQL.Statement).%ExecDirect(, tQuery)
    while tRs.%Next() {
        set tP = ##class(SmartRent.Model.Property).%OpenId(tRs.%Get("ID"))
        if $isobject(tP) do tArr.%Push(tP.ToJSON())
    }
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({"items":(tArr)})
}

ClassMethod Get(pId As %String) As %Status
{
    set tP = ##class(SmartRent.Model.Property).%OpenId(pId)
    if '$isobject(tP) quit ##class(SmartRent.REST.Dispatch).%Error("not found", 404)
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON(tP.ToJSON())
}

ClassMethod Create() As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)
    if (tUser.Role '= "landlord") && (tUser.Role '= "admin") {
        quit ##class(SmartRent.REST.Dispatch).%Error("forbidden", 403)
    }

    set tBody = ##class(SmartRent.REST.Dispatch).%ReadBody()
    set tP = ##class(SmartRent.Model.Property).%New()
    set tP.Owner       = tUser
    set tP.Title       = ##class(SmartRent.Util.Json).Get(tBody, "title")
    set tP.Description = ##class(SmartRent.Util.Json).Get(tBody, "description")
    set tP.Country     = ##class(SmartRent.Util.Json).Get(tBody, "country")
    set tP.City        = ##class(SmartRent.Util.Json).Get(tBody, "city")
    set tP.Address     = ##class(SmartRent.Util.Json).Get(tBody, "address")
    set tP.Lat         = ##class(SmartRent.Util.Json).GetNumber(tBody, "lat")
    set tP.Lng         = ##class(SmartRent.Util.Json).GetNumber(tBody, "lng")
    set tP.PropertyType= ##class(SmartRent.Util.Json).Get(tBody, "type", "apartment")
    set tP.TotalRooms  = ##class(SmartRent.Util.Json).GetNumber(tBody, "totalRooms")
    set tP.TotalArea   = ##class(SmartRent.Util.Json).GetNumber(tBody, "totalArea")
    set tP.Floor       = ##class(SmartRent.Util.Json).GetNumber(tBody, "floor")
    set tP.HasElevator = ##class(SmartRent.Util.Json).GetBool(tBody, "hasElevator")
    set tStatus = tP.%Save()
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error($system.Status.GetErrorText(tStatus), 400)
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON(tP.ToJSON(), 201)
}

ClassMethod Update(pId As %String) As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)

    set tP = ##class(SmartRent.Model.Property).%OpenId(pId)
    if '$isobject(tP) quit ##class(SmartRent.REST.Dispatch).%Error("not found", 404)
    if (tP.Owner.%Id() '= tUser.%Id()) && (tUser.Role '= "admin") {
        quit ##class(SmartRent.REST.Dispatch).%Error("forbidden", 403)
    }

    set tBody = ##class(SmartRent.REST.Dispatch).%ReadBody()
    set v = ##class(SmartRent.Util.Json).Get(tBody, "title")        if v'="" set tP.Title       = v
    set v = ##class(SmartRent.Util.Json).Get(tBody, "description")  if v'="" set tP.Description = v
    set v = ##class(SmartRent.Util.Json).Get(tBody, "city")         if v'="" set tP.City        = v
    set v = ##class(SmartRent.Util.Json).Get(tBody, "address")      if v'="" set tP.Address     = v
    if $isobject(tBody) && tBody.%IsDefined("active") {
        set tP.Active = ##class(SmartRent.Util.Json).GetBool(tBody, "active")
    }
    set tStatus = tP.%Save()
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error($system.Status.GetErrorText(tStatus), 400)
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON(tP.ToJSON())
}

ClassMethod Delete(pId As %String) As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)

    set tP = ##class(SmartRent.Model.Property).%OpenId(pId)
    if '$isobject(tP) quit ##class(SmartRent.REST.Dispatch).%Error("not found", 404)
    if (tP.Owner.%Id() '= tUser.%Id()) && (tUser.Role '= "admin") {
        quit ##class(SmartRent.REST.Dispatch).%Error("forbidden", 403)
    }
    set tP.Active = 0
    do tP.%Save()
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({"ok":1})
}

}
