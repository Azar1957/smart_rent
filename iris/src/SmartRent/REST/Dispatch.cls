/// Корневой диспетчер REST API портала Smart Rent.
/// Подключается через Security.Applications: /api/smartrent/v1 → DispatchClass=SmartRent.REST.Dispatch.
Class SmartRent.REST.Dispatch Extends %CSP.REST
{

Parameter HandleCorsRequest = 1;
Parameter UseSession As Integer = 0;

XData UrlMap [ XMLNamespace = "http://www.intersystems.com/urlmap" ]
{
<Routes>
  <Route Url="/health"      Method="GET"  Call="Health"  Cors="true" />

  <!-- auth -->
  <Route Url="/auth/register" Method="POST" Call="SmartRent.REST.Auth:Register"   Cors="true" />
  <Route Url="/auth/login"    Method="POST" Call="SmartRent.REST.Auth:Login"      Cors="true" />
  <Route Url="/auth/logout"   Method="POST" Call="SmartRent.REST.Auth:Logout"     Cors="true" />
  <Route Url="/auth/me"       Method="GET"  Call="SmartRent.REST.Auth:Me"         Cors="true" />

  <!-- properties -->
  <Route Url="/properties"            Method="GET"    Call="SmartRent.REST.Properties:List"      Cors="true" />
  <Route Url="/properties"            Method="POST"   Call="SmartRent.REST.Properties:Create"    Cors="true" />
  <Route Url="/properties/:id"        Method="GET"    Call="SmartRent.REST.Properties:Get"       Cors="true" />
  <Route Url="/properties/:id"        Method="PUT"    Call="SmartRent.REST.Properties:Update"    Cors="true" />
  <Route Url="/properties/:id"        Method="DELETE" Call="SmartRent.REST.Properties:Delete"    Cors="true" />

  <!-- segments -->
  <Route Url="/properties/:pid/segments" Method="GET"  Call="SmartRent.REST.Segments:List"   Cors="true" />
  <Route Url="/properties/:pid/segments" Method="POST" Call="SmartRent.REST.Segments:Create" Cors="true" />
  <Route Url="/segments/:id"             Method="GET"  Call="SmartRent.REST.Segments:Get"    Cors="true" />
  <Route Url="/segments/:id"             Method="PUT"  Call="SmartRent.REST.Segments:Update" Cors="true" />
  <Route Url="/segments/:id"             Method="DELETE" Call="SmartRent.REST.Segments:Delete" Cors="true" />

  <!-- bookings -->
  <Route Url="/segments/:sid/bookings"   Method="POST" Call="SmartRent.REST.Bookings:Request"   Cors="true" />
  <Route Url="/bookings"                 Method="GET"  Call="SmartRent.REST.Bookings:Mine"      Cors="true" />
  <Route Url="/bookings/:id/approve"     Method="POST" Call="SmartRent.REST.Bookings:Approve"   Cors="true" />
  <Route Url="/bookings/:id/reject"      Method="POST" Call="SmartRent.REST.Bookings:Reject"    Cors="true" />

  <!-- leases -->
  <Route Url="/leases"           Method="GET"  Call="SmartRent.REST.Leases:Mine"   Cors="true" />
  <Route Url="/leases/:id"       Method="GET"  Call="SmartRent.REST.Leases:Get"    Cors="true" />
  <Route Url="/leases/:id/sign"  Method="POST" Call="SmartRent.REST.Leases:Sign"   Cors="true" />

  <!-- payments -->
  <Route Url="/payments"           Method="GET"  Call="SmartRent.REST.Payments:Mine" Cors="true" />
  <Route Url="/payments/:id/pay"   Method="POST" Call="SmartRent.REST.Payments:Pay"  Cors="true" />

  <!-- utilities -->
  <Route Url="/properties/:pid/utilities" Method="POST" Call="SmartRent.REST.Utilities:Create" Cors="true" />
  <Route Url="/utilities/:id/split"       Method="POST" Call="SmartRent.REST.Utilities:Split"  Cors="true" />

  <!-- notifications -->
  <Route Url="/notifications"           Method="GET" Call="SmartRent.REST.Notifications:Mine" Cors="true" />
  <Route Url="/notifications/:id/read"  Method="POST" Call="SmartRent.REST.Notifications:Read" Cors="true" />

  <!-- dashboard summaries -->
  <Route Url="/dashboard/landlord" Method="GET" Call="SmartRent.REST.Dashboard:Landlord" Cors="true" />
  <Route Url="/dashboard/tenant"   Method="GET" Call="SmartRent.REST.Dashboard:Tenant"   Cors="true" />
</Routes>
}

ClassMethod Health() As %Status
{
    do ..%WriteJSON({"status":"ok","service":"smartrent-iris","time":($ZDATETIME($HOROLOG,3,1))})
    quit $$$OK
}

/// Принудительные CORS-заголовки для фронта (Next.js dev:3000, prod:любой origin).
ClassMethod OnHandleCorsRequest(pUrl As %String) As %Status
{
    set tOrigin = $get(%request.CgiEnvs("HTTP_ORIGIN"), "*")
    do %response.SetHeader("Access-Control-Allow-Origin",  tOrigin)
    do %response.SetHeader("Access-Control-Allow-Credentials", "true")
    do %response.SetHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
    do %response.SetHeader("Access-Control-Allow-Headers", "Origin,Content-Type,Accept,Authorization")
    quit $$$OK
}

/// Унифицированный JSON-ответ.
ClassMethod %WriteJSON(pPayload As %DynamicAbstractObject, pStatusCode As %Integer = 200) As %Status
{
    set %response.ContentType = "application/json"
    set %response.Status = pStatusCode
    if $isobject(pPayload) {
        write pPayload.%ToJSON()
    } else {
        write "null"
    }
    quit $$$OK
}

ClassMethod %Error(pMessage As %String, pStatusCode As %Integer = 400) As %Status
{
    quit ..%WriteJSON({"error":(pMessage)}, pStatusCode)
}

/// Извлечь текущего пользователя по Bearer-токену.
ClassMethod %CurrentUser(Output pUser As SmartRent.Model.User) As %Status
{
    set pUser = ""
    set tHeader = $get(%request.CgiEnvs("HTTP_AUTHORIZATION"))
    if tHeader = "" quit $$$ERROR($$$GeneralError, "missing Authorization header")
    set tToken = $piece(tHeader, " ", 2)
    quit ##class(SmartRent.Service.Auth).ResolveToken(tToken, .pUser)
}

/// Прочитать тело запроса как %DynamicObject.
ClassMethod %ReadBody() As %DynamicObject
{
    set tStream = %request.Content
    if '$isobject(tStream) quit {}
    do tStream.Rewind()
    set tJson = tStream.Read(tStream.Size)
    quit ##class(SmartRent.Util.Json).ParseSafe(tJson)
}

}
