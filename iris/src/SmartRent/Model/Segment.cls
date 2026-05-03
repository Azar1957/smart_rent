/// Сегмент объекта — отдельная комната, сдаваемая в аренду.
Class SmartRent.Model.Segment Extends (%Persistent, %JSON.Adaptor)
{

Parameter DEFAULTGLOBAL = "^SR.Segment";

Property Property As SmartRent.Model.Property [ Required ];

/// Идентификатор сегмента в рамках объекта (например, "R1", "Комната 2").
Property Code As %String(MAXLEN = 32) [ Required ];

Property Title       As %String(MAXLEN = 200);
Property Description As %String(MAXLEN = 4000);

Property Area      As %Double;
Property Beds      As %Integer [ InitialExpression = 1 ];
Property Furnished As %Boolean [ InitialExpression = 1 ];

/// Базовая месячная цена.
Property MonthlyPrice As %Numeric(SCALE = 2) [ Required ];
Property Currency     As %String(MAXLEN = 3, DEFAULT = "USD");
Property DepositAmount As %Numeric(SCALE = 2);

/// Текущий статус.
Property Status As %String(VALUELIST = ",available,reserved,occupied,maintenance", DEFAULT = "available");

/// Сезонные коэффициенты (JSON: {"01":1.0,"06":1.2,...}).
Property SeasonalFactors As %String(MAXLEN = 1000);

/// Правила проживания и удобства (JSON массивы).
Property Amenities As %String(MAXLEN = 1000);
Property Rules     As %String(MAXLEN = 1000);

Index PropertyIdx On Property;
Index PropCodeIdx On (Property, Code) [ Unique ];

Method ToJSON() As %DynamicObject
{
    quit {
        "id":            (..%Id()),
        "propertyId":    (..Property.%Id()),
        "code":          (..Code),
        "title":         (..Title),
        "description":   (..Description),
        "area":          (..Area),
        "beds":          (..Beds),
        "furnished":     (..Furnished),
        "monthlyPrice":  (..MonthlyPrice),
        "currency":      (..Currency),
        "depositAmount": (..DepositAmount),
        "status":        (..Status),
        "amenities":     (##class(%DynamicAbstractObject).%FromJSON(##class(SmartRent.Util.Json).Default(..Amenities, "[]"))),
        "rules":         (##class(%DynamicAbstractObject).%FromJSON(##class(SmartRent.Util.Json).Default(..Rules,     "[]")))
    }
}

Storage Default
{
<Data name="SegmentDefaultData">
<Value name="1"><Value>%%CLASSNAME</Value></Value>
<Value name="2"><Value>Property</Value></Value>
<Value name="3"><Value>Code</Value></Value>
<Value name="4"><Value>Title</Value></Value>
<Value name="5"><Value>Description</Value></Value>
<Value name="6"><Value>Area</Value></Value>
<Value name="7"><Value>Beds</Value></Value>
<Value name="8"><Value>Furnished</Value></Value>
<Value name="9"><Value>MonthlyPrice</Value></Value>
<Value name="10"><Value>Currency</Value></Value>
<Value name="11"><Value>DepositAmount</Value></Value>
<Value name="12"><Value>Status</Value></Value>
<Value name="13"><Value>SeasonalFactors</Value></Value>
<Value name="14"><Value>Amenities</Value></Value>
<Value name="15"><Value>Rules</Value></Value>
</Data>
<DataLocation>^SR.SegmentD</DataLocation>
<DefaultData>SegmentDefaultData</DefaultData>
<IdLocation>^SR.SegmentD</IdLocation>
<IndexLocation>^SR.SegmentI</IndexLocation>
<StreamLocation>^SR.SegmentS</StreamLocation>
<Type>%Storage.Persistent</Type>
}

}
