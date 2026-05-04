/// Утилиты для работы с JSON и общими преобразованиями.
Class SmartRent.Util.Json Extends %RegisteredObject
{

/// Вернёт строку, если она не пустая; иначе — значение по умолчанию.
ClassMethod Default(pValue As %String, pDefault As %String) As %String [ CodeMode = expression ]
{
$select(pValue'="":pValue, 1:pDefault)
}

/// Преобразовать %DynamicObject → ResultSet-friendly строка.
ClassMethod Stringify(pObj As %DynamicAbstractObject) As %String
{
    if '$isobject(pObj) quit ""
    quit pObj.%ToJSON()
}

/// Распарсить JSON, вернуть %DynamicObject (или пустой объект на ошибку).
ClassMethod ParseSafe(pJson As %String) As %DynamicAbstractObject
{
    set tObj = ""
    try {
        set tObj = ##class(%DynamicAbstractObject).%FromJSON(pJson)
    } catch ex {
        set tObj = {}
    }
    quit tObj
}

}
