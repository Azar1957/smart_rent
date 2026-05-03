/// REST-обработчики договоров.
Class SmartRent.REST.Leases Extends %CSP.REST
{

ClassMethod Mine() As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)

    set tQuery = "SELECT ID FROM SmartRent_Model.Lease WHERE "
    set tQuery = tQuery _ $select(tUser.Role="landlord":"Landlord = ", 1:"Tenant = ") _ tUser.%Id()
    set tQuery = tQuery _ " ORDER BY CreatedAt DESC"

    set tArr = []
    set tRs = ##class(%SQL.Statement).%ExecDirect(, tQuery)
    while tRs.%Next() {
        set l = ##class(SmartRent.Model.Lease).%OpenId(tRs.%Get("ID"))
        if $isobject(l) do tArr.%Push(l.ToJSON())
    }
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({"items":(tArr)})
}

ClassMethod Get(pId As %String) As %Status
{
    set l = ##class(SmartRent.Model.Lease).%OpenId(pId)
    if '$isobject(l) quit ##class(SmartRent.REST.Dispatch).%Error("not found", 404)
    set tObj = l.ToJSON()
    do l.ContractText.Rewind()
    set tObj.contractText = l.ContractText.Read(l.ContractText.Size)
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON(tObj)
}

ClassMethod Sign(pId As %String) As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)
    set l = ##class(SmartRent.Model.Lease).%OpenId(pId)
    if '$isobject(l) quit ##class(SmartRent.REST.Dispatch).%Error("not found", 404)

    set tNow = $ZDATETIME($HOROLOG, 3, 1)
    if l.Tenant.%Id() = tUser.%Id() {
        set l.TenantSignedAt = tNow
    } elseif l.Landlord.%Id() = tUser.%Id() {
        set l.LandlordSignedAt = tNow
    } else {
        quit ##class(SmartRent.REST.Dispatch).%Error("forbidden", 403)
    }

    if (l.TenantSignedAt '= "") && (l.LandlordSignedAt '= "") {
        set l.Status = "active"
        set l.SignatureHash = $system.Encryption.SHA1Hash(l.%Id() _ l.TenantSignedAt _ l.LandlordSignedAt)
    }
    do l.%Save()
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON(l.ToJSON())
}

}
