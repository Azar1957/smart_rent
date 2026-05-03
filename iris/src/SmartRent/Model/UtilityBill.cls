/// Коммунальный счёт по объекту. Делится между активными арендаторами сегментов.
Class SmartRent.Model.UtilityBill Extends (%Persistent, %JSON.Adaptor)
{

Parameter DEFAULTGLOBAL = "^SR.UtilityBill";

Property Property As SmartRent.Model.Property [ Required ];
Property Period   As %String(MAXLEN = 7) [ Required ]; // YYYY-MM

/// electricity | water | gas | internet | other
Property Kind As %String(VALUELIST = ",electricity,water,gas,internet,other") [ Required ];

Property TotalAmount As %Numeric(SCALE = 2) [ Required ];
Property Currency    As %String(MAXLEN = 3, DEFAULT = "USD");

/// Способ деления: equal (поровну) | byArea (по площади) | byUsage (произвольно).
Property Split As %String(VALUELIST = ",equal,byArea,byUsage", DEFAULT = "equal");

Property ScanFile As %Stream.GlobalBinary;
Property Note     As %String(MAXLEN = 1000);

Property CreatedAt As %TimeStamp [ InitialExpression = {$ZDATETIME($HOROLOG, 3, 1)} ];
Property DueDate   As %Date;

Index PropPeriodIdx On (Property, Period);

Method ToJSON() As %DynamicObject
{
    quit {
        "id":          (..%Id()),
        "propertyId":  (..Property.%Id()),
        "period":      (..Period),
        "kind":        (..Kind),
        "totalAmount": (..TotalAmount),
        "currency":    (..Currency),
        "split":       (..Split),
        "note":        (..Note),
        "dueDate":     ($select(..DueDate'="":$ZDATE(..DueDate, 3), 1:"")),
        "createdAt":   (..CreatedAt)
    }
}

Storage Default
{
<Data name="UtilityBillDefaultData">
<Value name="1"><Value>%%CLASSNAME</Value></Value>
<Value name="2"><Value>Property</Value></Value>
<Value name="3"><Value>Period</Value></Value>
<Value name="4"><Value>Kind</Value></Value>
<Value name="5"><Value>TotalAmount</Value></Value>
<Value name="6"><Value>Currency</Value></Value>
<Value name="7"><Value>Split</Value></Value>
<Value name="8"><Value>ScanFile</Value></Value>
<Value name="9"><Value>Note</Value></Value>
<Value name="10"><Value>CreatedAt</Value></Value>
<Value name="11"><Value>DueDate</Value></Value>
</Data>
<DataLocation>^SR.UtilityBillD</DataLocation>
<DefaultData>UtilityBillDefaultData</DefaultData>
<IdLocation>^SR.UtilityBillD</IdLocation>
<IndexLocation>^SR.UtilityBillI</IndexLocation>
<StreamLocation>^SR.UtilityBillS</StreamLocation>
<Type>%Storage.Persistent</Type>
}

}
