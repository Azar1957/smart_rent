/// Договор аренды (генерируется на основе подтверждённого Booking).
Class SmartRent.Model.Lease Extends (%Persistent, %JSON.Adaptor)
{

Parameter DEFAULTGLOBAL = "^SR.Lease";

Property Booking As SmartRent.Model.Booking [ Required ];
Property Segment As SmartRent.Model.Segment [ Required ];
Property Tenant  As SmartRent.Model.User    [ Required ];
Property Landlord As SmartRent.Model.User   [ Required ];

Property StartDate As %Date [ Required ];
Property EndDate   As %Date [ Required ];

Property MonthlyPrice  As %Numeric(SCALE = 2) [ Required ];
Property DepositAmount As %Numeric(SCALE = 2);
Property Currency      As %String(MAXLEN = 3) [ InitialExpression = "USD" ];

/// active | terminated | finished
Property Status As %String(VALUELIST = ",draft,active,terminated,finished") [ InitialExpression = "draft" ];

/// Сгенерированный текст договора (HTML/MD).
Property ContractText As %Stream.GlobalCharacter;

/// Подпись арендатора и арендодателя (timestamp / адрес / hash).
Property TenantSignedAt   As %TimeStamp;
Property LandlordSignedAt As %TimeStamp;
Property SignatureHash    As %String(MAXLEN = 256);

/// Описание состояния объекта при заселении и выезде (JSON).
Property MoveInReport  As %String(MAXLEN = 8000);
Property MoveOutReport As %String(MAXLEN = 8000);

Property TerminationReason As %String(MAXLEN = 1000);
Property CreatedAt As %TimeStamp [ InitialExpression = {$ZDATETIME($HOROLOG, 3, 1)} ];

Index BookingIdx  On Booking [ Unique ];
Index TenantIdx   On Tenant;
Index LandlordIdx On Landlord;
Index StatusIdx   On Status;

Method ToJSON() As %DynamicObject
{
    quit {
        "id":            (..%Id()),
        "bookingId":     (..Booking.%Id()),
        "segmentId":     (..Segment.%Id()),
        "tenantId":      (..Tenant.%Id()),
        "landlordId":    (..Landlord.%Id()),
        "startDate":     ($ZDATE(..StartDate, 3)),
        "endDate":       ($ZDATE(..EndDate, 3)),
        "monthlyPrice":  (..MonthlyPrice),
        "depositAmount": (..DepositAmount),
        "currency":      (..Currency),
        "status":        (..Status),
        "tenantSigned":  (..TenantSignedAt'=""),
        "landlordSigned":(..LandlordSignedAt'=""),
        "signatureHash": (..SignatureHash),
        "createdAt":     (..CreatedAt)
    }
}

Storage Default
{
<Data name="LeaseDefaultData">
<Value name="1"><Value>%%CLASSNAME</Value></Value>
<Value name="2"><Value>Booking</Value></Value>
<Value name="3"><Value>Segment</Value></Value>
<Value name="4"><Value>Tenant</Value></Value>
<Value name="5"><Value>Landlord</Value></Value>
<Value name="6"><Value>StartDate</Value></Value>
<Value name="7"><Value>EndDate</Value></Value>
<Value name="8"><Value>MonthlyPrice</Value></Value>
<Value name="9"><Value>DepositAmount</Value></Value>
<Value name="10"><Value>Currency</Value></Value>
<Value name="11"><Value>Status</Value></Value>
<Value name="12"><Value>ContractText</Value></Value>
<Value name="13"><Value>TenantSignedAt</Value></Value>
<Value name="14"><Value>LandlordSignedAt</Value></Value>
<Value name="15"><Value>SignatureHash</Value></Value>
<Value name="16"><Value>MoveInReport</Value></Value>
<Value name="17"><Value>MoveOutReport</Value></Value>
<Value name="18"><Value>TerminationReason</Value></Value>
<Value name="19"><Value>CreatedAt</Value></Value>
</Data>
<DataLocation>^SR.LeaseD</DataLocation>
<DefaultData>LeaseDefaultData</DefaultData>
<IdLocation>^SR.LeaseD</IdLocation>
<IndexLocation>^SR.LeaseI</IndexLocation>
<StreamLocation>^SR.LeaseS</StreamLocation>
<Type>%Storage.Persistent</Type>
}

}
