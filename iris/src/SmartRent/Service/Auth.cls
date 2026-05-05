/// Сервис аутентификации: регистрация, логин, выпуск/проверка токенов.
Class SmartRent.Service.Auth Extends %RegisteredObject
{

Parameter TOKENTTL As %Integer = 86400; // 24 ч

/// Зарегистрировать нового пользователя.
ClassMethod Register(pPayload As %DynamicObject, Output pUser As SmartRent.Model.User) As %Status
{
    set pUser = ""
    set tEmail = $zconvert($get(pPayload.email),"L")
    if tEmail = "" quit $$$ERROR($$$GeneralError, "email is required")

    if ##class(SmartRent.Model.User).EmailIdxExists(tEmail) {
        quit $$$ERROR($$$GeneralError, "user already exists")
    }

    set tUser = ##class(SmartRent.Model.User).%New()
    set tUser.Email     = tEmail
    set tUser.Role      = $select($get(pPayload.role)'="":pPayload.role, 1:"tenant")
    set tUser.FirstName = $get(pPayload.firstName)
    set tUser.LastName  = $get(pPayload.lastName)
    set tUser.Phone     = $get(pPayload.phone)
    set tUser.Language  = $select($get(pPayload.language)'="":pPayload.language, 1:"ru")
    do tUser.SetPassword($get(pPayload.password))

    set tStatus = tUser.%Save()
    if $$$ISERR(tStatus) quit tStatus

    set pUser = tUser
    quit $$$OK
}

/// Логин по email/паролю. Возвращает токен в pToken.
ClassMethod Login(pEmail As %String, pPassword As %String, Output pToken As %String, Output pUser As SmartRent.Model.User) As %Status
{
    set pToken = "", pUser = ""
    set tEmail = $zconvert(pEmail,"L")

    set tId = ##class(SmartRent.Model.User).EmailIdxOpen(tEmail, , .tStatus)
    if '$isobject(tId) quit $$$ERROR($$$GeneralError, "invalid credentials")
    if 'tId.Active     quit $$$ERROR($$$GeneralError, "user disabled")
    if 'tId.CheckPassword(pPassword) quit $$$ERROR($$$GeneralError, "invalid credentials")

    set tToken = ..GenerateToken()
    set t = ##class(SmartRent.Model.AuthToken).%New()
    set t.Token = tToken
    set t.User  = tId
    set t.ExpiresAt = $ZDATETIME($HOROLOG + (..#TOKENTTL \ 86400), 3, 1)
    set tStatus = t.%Save()
    if $$$ISERR(tStatus) quit tStatus

    set pToken = tToken
    set pUser  = tId
    quit $$$OK
}

/// Найти пользователя по токену из заголовка.
ClassMethod ResolveToken(pToken As %String, Output pUser As SmartRent.Model.User) As %Status
{
    set pUser = ""
    if pToken = "" quit $$$ERROR($$$GeneralError, "no token")

    set t = ##class(SmartRent.Model.AuthToken).TokenIdxOpen(pToken)
    if '$isobject(t) quit $$$ERROR($$$GeneralError, "invalid token")
    if t.Revoked    quit $$$ERROR($$$GeneralError, "token revoked")

    set pUser = t.User
    quit $$$OK
}

/// Завершить сессию.
ClassMethod Logout(pToken As %String) As %Status
{
    set t = ##class(SmartRent.Model.AuthToken).TokenIdxOpen(pToken)
    if '$isobject(t) quit $$$OK
    set t.Revoked = 1
    quit t.%Save()
}

/// Криптостойкий случайный токен (HEX 64 символа).
ClassMethod GenerateToken() As %String
{
    set tBin = $system.Encryption.GenCryptRand(32, 1)
    set tHex = ""
    set tDigits = "0123456789abcdef"
    for i = 1:1:$length(tBin) {
        set b = $ascii(tBin, i)
        set tHex = tHex _ $extract(tDigits, (b \ 16) + 1) _ $extract(tDigits, (b # 16) + 1)
    }
    quit tHex
}

}
