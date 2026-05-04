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
    set s.Code          = $get(tBody.code)
    set s.Title         = $get(tBody.title)
    set s.Description   = $get(tBody.description)
    set s.Area          = $get(tBody.area)
    set s.Beds          = $select($get(tBody.beds)>0:tBody.beds, 1:1)
    set s.Furnished     = ''$get(tBody.furnished)
    set s.MonthlyPrice  = $get(tBody.monthlyPrice)
    set s.Currency      = $select($get(tBody.currency)'="":tBody.currency, 1:"USD")
    set s.DepositAmount = $get(tBody.depositAmount)
    set s.SeasonalFactors = ##class(SmartRent.Util.Json).Stringify($get(tBody.seasonal))
    set s.Amenities     = ##class(SmartRent.Util.Json).Stringify($get(tBody.amenities))
    set s.Rules         = ##class(SmartRent.Util.Json).Stringify($get(tBody.rules))
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
    if $get(tBody.title)         '= "" set s.Title        = tBody.title
    if $get(tBody.description)   '= "" set s.Description  = tBody.description
    if $data(tBody.area)             set s.Area           = tBody.area
    if $data(tBody.monthlyPrice)     set s.MonthlyPrice   = tBody.monthlyPrice
    if $data(tBody.depositAmount)    set s.DepositAmount  = tBody.depositAmount
    if $data(tBody.status)           set s.Status         = tBody.status
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
