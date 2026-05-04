/// Сессионный токен (упрощённая альтернатива JWT, проще для MVP).
Class SmartRent.Model.AuthToken Extends %Persistent
{

Parameter DEFAULTGLOBAL = "^SR.AuthToken";

Property Token  As %String(MAXLEN = 128) [ Required ];
Property User   As SmartRent.Model.User [ Required ];
Property IssuedAt  As %TimeStamp [ InitialExpression = {$ZDATETIME($HOROLOG, 3, 1)} ];
Property ExpiresAt As %TimeStamp;
Property Revoked   As %Boolean [ InitialExpression = 0 ];
Property UserAgent As %String(MAXLEN = 500);
Property RemoteIp  As %String(MAXLEN = 64);

Index TokenIdx On Token [ Unique ];
Index UserIdx  On User;

Storage Default
{
<Data name="AuthTokenDefaultData">
<Value name="1"><Value>%%CLASSNAME</Value></Value>
<Value name="2"><Value>Token</Value></Value>
<Value name="3"><Value>User</Value></Value>
<Value name="4"><Value>IssuedAt</Value></Value>
<Value name="5"><Value>ExpiresAt</Value></Value>
<Value name="6"><Value>Revoked</Value></Value>
<Value name="7"><Value>UserAgent</Value></Value>
<Value name="8"><Value>RemoteIp</Value></Value>
</Data>
<DataLocation>^SR.AuthTokenD</DataLocation>
<DefaultData>AuthTokenDefaultData</DefaultData>
<IdLocation>^SR.AuthTokenD</IdLocation>
<IndexLocation>^SR.AuthTokenI</IndexLocation>
<StreamLocation>^SR.AuthTokenS</StreamLocation>
<Type>%Storage.Persistent</Type>
}

}
