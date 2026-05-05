/// Пользователь платформы (арендодатель / арендатор / администратор).
/// Хранение пароля — соль (hex) + SHA-512(пароль || соль) (hex).
/// Для production рекомендуется заменить на полноценный bcrypt/argon2.
Class SmartRent.Model.User Extends (%Persistent, %JSON.Adaptor)
{

Parameter %JSONIGNOREINVALIDFIELD = 1;
Parameter DEFAULTGLOBAL = "^SR.User";

/// Уникальный email — основной идентификатор для входа.
Property Email As %String(MAXLEN = 255) [ Required ];

/// SHA-512(password+salt), сохраняется как hex-строка (128 символов).
Property PasswordHash As %String(MAXLEN = 256) [ Internal ];
/// Случайная соль, сохраняется как hex-строка (32 символа = 16 байт).
Property PasswordSalt As %String(MAXLEN = 64)  [ Internal ];

/// Роль: admin | landlord | tenant.
Property Role As %String(VALUELIST = ",admin,landlord,tenant") [ Required, InitialExpression = "tenant" ];

Property FirstName  As %String(MAXLEN = 100);
Property LastName   As %String(MAXLEN = 100);
Property Phone      As %String(MAXLEN = 32);
Property Language   As %String(VALUELIST = ",ru,en,es") [ InitialExpression = "ru" ];

/// Двухфакторная аутентификация (TOTP secret в base32). Опционально.
Property TwoFactorSecret As %String(MAXLEN = 64);
Property TwoFactorEnabled As %Boolean [ InitialExpression = 0 ];

/// Верификация документов арендодателя.
Property Verified         As %Boolean [ InitialExpression = 0 ];
Property VerifiedAt       As %TimeStamp;

/// Активна ли учётная запись.
Property Active As %Boolean [ InitialExpression = 1 ];

Property CreatedAt As %TimeStamp [ InitialExpression = {$ZDATETIME($HOROLOG, 3, 1)} ];
Property UpdatedAt As %TimeStamp [ InitialExpression = {$ZDATETIME($HOROLOG, 3, 1)} ];

Index EmailIdx On Email [ Unique ];
Index RoleIdx  On Role;

/// Установить пароль (генерирует соль и хэш SHA-512). Соль и хэш хранятся в hex —
/// %String может быть Unicode-широким, и сырые бинарные байты из GenCryptRand /
/// SHAHash при сохранении ломаются (<WIDE CHAR> / искажение байтов). Hex-форма
/// безопасна для всех настроек локали/кодировки IRIS.
Method SetPassword(pPlain As %String) As %Status
{
    set tSaltBin = $system.Encryption.GenCryptRand(16, 1)
    set ..PasswordSalt = $system.Encryption.ToHex(tSaltBin)
    set ..PasswordHash = $system.Encryption.ToHex($system.Encryption.SHAHash(512, pPlain _ tSaltBin))
    quit $$$OK
}

/// Проверить пароль.
Method CheckPassword(pPlain As %String) As %Boolean
{
    if ..PasswordSalt = "" quit 0
    set tSaltBin = $system.Encryption.FromHex(..PasswordSalt)
    set tHash    = $system.Encryption.ToHex($system.Encryption.SHAHash(512, pPlain _ tSaltBin))
    quit (..PasswordHash = tHash)
}

/// Выгрузить пользователя без чувствительных полей.
Method ToPublicJSON() As %DynamicObject
{
    quit {
        "id":         (..%Id()),
        "email":      (..Email),
        "role":       (..Role),
        "firstName":  (..FirstName),
        "lastName":   (..LastName),
        "phone":      (..Phone),
        "language":   (..Language),
        "verified":   (..Verified),
        "twoFactor":  (..TwoFactorEnabled),
        "active":     (..Active),
        "createdAt":  (..CreatedAt)
    }
}

Trigger OnUpdate [ Event = INSERT/UPDATE ]
{
    set {UpdatedAt} = $ZDATETIME($HOROLOG, 3, 1)
}

Storage Default
{
<Data name="UserDefaultData">
<Value name="1"><Value>%%CLASSNAME</Value></Value>
<Value name="2"><Value>Email</Value></Value>
<Value name="3"><Value>PasswordHash</Value></Value>
<Value name="4"><Value>PasswordSalt</Value></Value>
<Value name="5"><Value>Role</Value></Value>
<Value name="6"><Value>FirstName</Value></Value>
<Value name="7"><Value>LastName</Value></Value>
<Value name="8"><Value>Phone</Value></Value>
<Value name="9"><Value>Language</Value></Value>
<Value name="10"><Value>TwoFactorSecret</Value></Value>
<Value name="11"><Value>TwoFactorEnabled</Value></Value>
<Value name="12"><Value>Verified</Value></Value>
<Value name="13"><Value>VerifiedAt</Value></Value>
<Value name="14"><Value>Active</Value></Value>
<Value name="15"><Value>CreatedAt</Value></Value>
<Value name="16"><Value>UpdatedAt</Value></Value>
</Data>
<DataLocation>^SR.UserD</DataLocation>
<DefaultData>UserDefaultData</DefaultData>
<IdLocation>^SR.UserD</IdLocation>
<IndexLocation>^SR.UserI</IndexLocation>
<StreamLocation>^SR.UserS</StreamLocation>
<Type>%Storage.Persistent</Type>
}

}
