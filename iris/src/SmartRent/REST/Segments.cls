/// REST-обработчики сегментов (комнат) объекта.
Class SmartRent.REST.Segments Extends %CSP.REST
{

ClassMethod List(pPid As %String) As %Status
{
    set tArr = []
    set tRs = ##class(%SQL.Statement).%ExecDirect(, "SELECT ID FROM SmartRent_Model.Segment WHERE Property = ? ORDER BY Code", pPid)
    while tRs.%Next() {
        set s = ##class(SmartRent.Model.Segment).%OpenId(tRs.%Get("ID"))
        if $isobject(s) do tArr.%Push(s.ToJSON())
    }
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({"items":(tArr)})
}

ClassMethod Get(pId As %String) As %Status
{
    set s = ##class(SmartRent.Model.Segment).%OpenId(pId)
    if '$isobject(s) quit ##class(SmartRent.REST.Dispatch).%Error("not found", 404)
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON(s.ToJSON())
}

ClassMethod Create(pPid As %String) As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)

    set tProp = ##class(SmartRent.Model.Property).%OpenId(pPid)
    if '$isobject(tProp) quit ##class(SmartRent.REST.Dispatch).%Error("property not found", 404)
    if (tProp.Owner.%Id() '= tUser.%Id()) && (tUser.Role '= "admin") {
        quit ##class(SmartRent.REST.Dispatch).%Error("forbidden", 403)
    }

    set tBody = ##class(SmartRent.REST.Dispatch).%ReadBody()
    set s = ##class(SmartRent.Model.Segment).%New()
    set s.Property      = tProp
    set s.Code          = ##class(SmartRent.Util.Json).Get(tBody, "code")
    set s.Title         = ##class(SmartRent.Util.Json).Get(tBody, "title")
    set s.Description   = ##class(SmartRent.Util.Json).Get(tBody, "description")
    set s.Area          = ##class(SmartRent.Util.Json).GetNumber(tBody, "area")
    set s.Beds          = $select(##class(SmartRent.Util.Json).GetNumber(tBody, "beds")>0:##class(SmartRent.Util.Json).GetNumber(tBody, "beds"), 1:1)
    set s.Furnished     = ##class(SmartRent.Util.Json).GetBool(tBody, "furnished", 1)
    set s.MonthlyPrice  = ##class(SmartRent.Util.Json).GetNumber(tBody, "monthlyPrice")
    set s.Currency      = ##class(SmartRent.Util.Json).Get(tBody, "currency", "USD")
    set s.DepositAmount = ##class(SmartRent.Util.Json).GetNumber(tBody, "depositAmount")
    set s.SeasonalFactors = ##class(SmartRent.Util.Json).GetJSON(tBody, "seasonal", "")
    set s.Amenities     = ##class(SmartRent.Util.Json).GetJSON(tBody, "amenities", "[]")
    set s.Rules         = ##class(SmartRent.Util.Json).GetJSON(tBody, "rules", "[]")
    set tStatus = s.%Save()
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error($system.Status.GetErrorText(tStatus), 400)
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON(s.ToJSON(), 201)
}

ClassMethod Update(pId As %String) As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)
    set s = ##class(SmartRent.Model.Segment).%OpenId(pId)
    if '$isobject(s) quit ##class(SmartRent.REST.Dispatch).%Error("not found", 404)
    if (s.Property.Owner.%Id() '= tUser.%Id()) && (tUser.Role '= "admin") {
        quit ##class(SmartRent.REST.Dispatch).%Error("forbidden", 403)
    }
    set tBody = ##class(SmartRent.REST.Dispatch).%ReadBody()
    set v = ##class(SmartRent.Util.Json).Get(tBody, "title")        if v'="" set s.Title       = v
    set v = ##class(SmartRent.Util.Json).Get(tBody, "description")  if v'="" set s.Description = v
    if $isobject(tBody) && tBody.%IsDefined("area")           set s.Area          = ##class(SmartRent.Util.Json).GetNumber(tBody, "area")
    if $isobject(tBody) && tBody.%IsDefined("monthlyPrice")   set s.MonthlyPrice  = ##class(SmartRent.Util.Json).GetNumber(tBody, "monthlyPrice")
    if $isobject(tBody) && tBody.%IsDefined("depositAmount")  set s.DepositAmount = ##class(SmartRent.Util.Json).GetNumber(tBody, "depositAmount")
    set v = ##class(SmartRent.Util.Json).Get(tBody, "status")       if v'="" set s.Status      = v
    set tStatus = s.%Save()
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error($system.Status.GetErrorText(tStatus), 400)
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON(s.ToJSON())
}

ClassMethod Delete(pId As %String) As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)
    set s = ##class(SmartRent.Model.Segment).%OpenId(pId)
    if '$isobject(s) quit ##class(SmartRent.REST.Dispatch).%Error("not found", 404)
    if (s.Property.Owner.%Id() '= tUser.%Id()) && (tUser.Role '= "admin") {
        quit ##class(SmartRent.REST.Dispatch).%Error("forbidden", 403)
    }
    do ##class(SmartRent.Model.Segment).%DeleteId(pId)
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({"ok":1})
}

}
