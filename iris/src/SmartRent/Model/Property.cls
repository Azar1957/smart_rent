/// Объект аренды (квартира). Делится на сегменты — комнаты SmartRent.Model.Segment.
Class SmartRent.Model.Property Extends (%Persistent, %JSON.Adaptor)
{

Parameter DEFAULTGLOBAL = "^SR.Property";

Property Owner       As SmartRent.Model.User [ Required ];
Property Title       As %String(MAXLEN = 200) [ Required ];
Property Description As %String(MAXLEN = 4000);

Property Country As %String(MAXLEN = 100);
Property City    As %String(MAXLEN = 100);
Property Address As %String(MAXLEN = 300);
Property Lat     As %Double;
Property Lng     As %Double;

/// Тип жилья.
Property PropertyType As %String(VALUELIST = ",apartment,house,studio") [ InitialExpression = "apartment" ];

Property TotalRooms  As %Integer;
Property TotalArea   As %Double;
Property Floor       As %Integer;
Property HasElevator As %Boolean [ InitialExpression = 0 ];

/// Документ о праве собственности (PDF/JPEG, base64-link на файл-стрим).
Property OwnershipDocument As %Stream.GlobalBinary;

/// Активный объект (виден в каталоге).
Property Active As %Boolean [ InitialExpression = 1 ];

Property CreatedAt As %TimeStamp [ InitialExpression = {$ZDATETIME($HOROLOG, 3, 1)} ];

Index OwnerIdx On Owner;
Index CityIdx  On City;

Method ToJSON() As %DynamicObject
{
    set photos = []
    quit {
        "id":          (..%Id()),
        "ownerId":     (..Owner.%Id()),
        "title":       (..Title),
        "description": (..Description),
        "country":     (..Country),
        "city":        (..City),
        "address":     (..Address),
        "lat":         (..Lat),
        "lng":         (..Lng),
        "type":        (..PropertyType),
        "totalRooms":  (..TotalRooms),
        "totalArea":   (..TotalArea),
        "floor":       (..Floor),
        "hasElevator": (..HasElevator),
        "active":      (..Active),
        "createdAt":   (..CreatedAt)
    }
}

Storage Default
{
<Data name="PropertyDefaultData">
<Value name="1"><Value>%%CLASSNAME</Value></Value>
<Value name="2"><Value>Owner</Value></Value>
<Value name="3"><Value>Title</Value></Value>
<Value name="4"><Value>Description</Value></Value>
<Value name="5"><Value>Country</Value></Value>
<Value name="6"><Value>City</Value></Value>
<Value name="7"><Value>Address</Value></Value>
<Value name="8"><Value>Lat</Value></Value>
<Value name="9"><Value>Lng</Value></Value>
<Value name="10"><Value>PropertyType</Value></Value>
<Value name="11"><Value>TotalRooms</Value></Value>
<Value name="12"><Value>TotalArea</Value></Value>
<Value name="13"><Value>Floor</Value></Value>
<Value name="14"><Value>HasElevator</Value></Value>
<Value name="15"><Value>OwnershipDocument</Value></Value>
<Value name="16"><Value>Active</Value></Value>
<Value name="17"><Value>CreatedAt</Value></Value>
</Data>
<DataLocation>^SR.PropertyD</DataLocation>
<DefaultData>PropertyDefaultData</DefaultData>
<IdLocation>^SR.PropertyD</IdLocation>
<IndexLocation>^SR.PropertyI</IndexLocation>
<StreamLocation>^SR.PropertyS</StreamLocation>
<Type>%Storage.Persistent</Type>
}

}
