/// Запрос на бронирование сегмента.
Class SmartRent.Model.Booking Extends (%Persistent, %JSON.Adaptor)
{

Parameter DEFAULTGLOBAL = "^SR.Booking";

Property Segment As SmartRent.Model.Segment [ Required ];
Property Tenant  As SmartRent.Model.User    [ Required ];

Property StartDate As %Date [ Required ];
Property EndDate   As %Date [ Required ];

/// pending | approved | rejected | cancelled | completed
Property Status As %String(VALUELIST = ",pending,approved,rejected,cancelled,completed") [ InitialExpression = "pending" ];

Property TotalPrice As %Numeric(SCALE = 2);
Property Currency   As %String(MAXLEN = 3) [ InitialExpression = "USD" ];

Property Note       As %String(MAXLEN = 2000);
Property RejectReason As %String(MAXLEN = 1000);

Property CreatedAt As %TimeStamp [ InitialExpression = {$ZDATETIME($HOROLOG, 3, 1)} ];
Property DecidedAt As %TimeStamp;

Index SegmentIdx  On Segment;
Index TenantIdx   On Tenant;
Index StatusIdx   On Status;
Index DateRange   On (Segment, StartDate, EndDate);

Method ToJSON() As %DynamicObject
{
    quit {
        "id":           (..%Id()),
        "segmentId":    (..Segment.%Id()),
        "tenantId":     (..Tenant.%Id()),
        "startDate":    ($ZDATE(..StartDate, 3)),
        "endDate":      ($ZDATE(..EndDate, 3)),
        "status":       (..Status),
        "totalPrice":   (..TotalPrice),
        "currency":     (..Currency),
        "note":         (..Note),
        "rejectReason": (..RejectReason),
        "createdAt":    (..CreatedAt),
        "decidedAt":    (..DecidedAt)
    }
}

Storage Default
{
<Data name="BookingDefaultData">
<Value name="1"><Value>%%CLASSNAME</Value></Value>
<Value name="2"><Value>Segment</Value></Value>
<Value name="3"><Value>Tenant</Value></Value>
<Value name="4"><Value>StartDate</Value></Value>
<Value name="5"><Value>EndDate</Value></Value>
<Value name="6"><Value>Status</Value></Value>
<Value name="7"><Value>TotalPrice</Value></Value>
<Value name="8"><Value>Currency</Value></Value>
<Value name="9"><Value>Note</Value></Value>
<Value name="10"><Value>RejectReason</Value></Value>
<Value name="11"><Value>CreatedAt</Value></Value>
<Value name="12"><Value>DecidedAt</Value></Value>
</Data>
<DataLocation>^SR.BookingD</DataLocation>
<DefaultData>BookingDefaultData</DefaultData>
<IdLocation>^SR.BookingD</IdLocation>
<IndexLocation>^SR.BookingI</IndexLocation>
<StreamLocation>^SR.BookingS</StreamLocation>
<Type>%Storage.Persistent</Type>
}

}
