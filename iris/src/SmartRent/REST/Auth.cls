/// REST-обработчики аутентификации.
Class SmartRent.REST.Auth Extends %CSP.REST
{

ClassMethod Register() As %Status
{
    set tBody = ##class(SmartRent.REST.Dispatch).%ReadBody()
    set tStatus = ##class(SmartRent.Service.Auth).Register(tBody, .tUser)
    if $$$ISERR(tStatus) {
        quit ##class(SmartRent.REST.Dispatch).%Error($system.Status.GetErrorText(tStatus), 400)
    }
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({"user":(tUser.ToPublicJSON())}, 201)
}

ClassMethod Login() As %Status
{
    set tBody = ##class(SmartRent.REST.Dispatch).%ReadBody()
    set tStatus = ##class(SmartRent.Service.Auth).Login(
        $get(tBody.email), $get(tBody.password), .tToken, .tUser)
    if $$$ISERR(tStatus) {
        quit ##class(SmartRent.REST.Dispatch).%Error($system.Status.GetErrorText(tStatus), 401)
    }
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({
        "token": (tToken),
        "user":  (tUser.ToPublicJSON())
    })
}

ClassMethod Logout() As %Status
{
    set tHeader = $get(%request.CgiEnvs("HTTP_AUTHORIZATION"))
    set tToken  = $piece(tHeader, " ", 2)
    do ##class(SmartRent.Service.Auth).Logout(tToken)
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({"ok":1})
}

ClassMethod Me() As %Status
{
    set tStatus = ##class(SmartRent.REST.Dispatch).%CurrentUser(.tUser)
    if $$$ISERR(tStatus) {
        quit ##class(SmartRent.REST.Dispatch).%Error("unauthorized", 401)
    }
    quit ##class(SmartRent.REST.Dispatch).%WriteJSON({"user":(tUser.ToPublicJSON())})
}

}
