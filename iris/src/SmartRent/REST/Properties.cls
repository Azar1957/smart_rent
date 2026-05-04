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
    set tP.Title       = $get(tBody.title)
    set tP.Description = $get(tBody.description)
    set tP.Country     = $get(tBody.country)
    set tP.City        = $get(tBody.city)
    set tP.Address     = $get(tBody.address)
    set tP.Lat         = $get(tBody.lat)
    set tP.Lng         = $get(tBody.lng)
    set tP.PropertyType= $select($get(tBody.type)'="":tBody.type, 1:"apartment")
    set tP.TotalRooms  = $get(tBody.totalRooms)
    set tP.TotalArea   = $get(tBody.totalArea)
    set tP.Floor       = $get(tBody.floor)
    set tP.HasElevator = ''$get(tBody.hasElevator)
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
    if $get(tBody.title)       '= "" set tP.Title       = tBody.title
    if $get(tBody.description) '= "" set tP.Description = tBody.description
    if $get(tBody.city)        '= "" set tP.City        = tBody.city
    if $get(tBody.address)     '= "" set tP.Address     = tBody.address
    if $data(tBody.active)           set tP.Active      = ''tBody.active
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
