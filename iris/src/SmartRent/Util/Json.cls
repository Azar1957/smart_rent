/// Утилиты для работы с JSON и общими преобразованиями.
Class SmartRent.Util.Json Extends %RegisteredObject
{

/// Безопасно прочитать свойство %DynamicObject.
/// В IRIS 2026 $get() со свойствами объекта вызывает <INVALID CLASS>
/// (DynamicObject не поддерживает многомерные операции). Заменяет $get(obj.prop).
ClassMethod Get(pObj As %DynamicAbstractObject, pKey As %String, pDefault As %String = "") As %String [ CodeMode = expression ]
{
$select($isobject(pObj)&&pObj.%IsDefined(pKey):pObj.%Get(pKey), 1:pDefault)
}

/// Прочитать свойство как boolean (1/0).
ClassMethod GetBool(pObj As %DynamicAbstractObject, pKey As %String, pDefault As %Boolean = 0) As %Boolean [ CodeMode = expression ]
{
$select($isobject(pObj)&&pObj.%IsDefined(pKey):''pObj.%Get(pKey), 1:pDefault)
}

/// Прочитать свойство как число.
ClassMethod GetNumber(pObj As %DynamicAbstractObject, pKey As %String, pDefault As %Numeric = 0) As %Numeric [ CodeMode = expression ]
{
$select($isobject(pObj)&&pObj.%IsDefined(pKey):+pObj.%Get(pKey), 1:pDefault)
}

/// Прочитать вложенный объект/массив как JSON-строку (для сохранения в %String).
ClassMethod GetJSON(pObj As %DynamicAbstractObject, pKey As %String, pDefault As %String = "") As %String
{
    if '$isobject(pObj) || 'pObj.%IsDefined(pKey) quit pDefault
    set tVal = pObj.%Get(pKey)
    if '$isobject(tVal) quit pDefault
    quit tVal.%ToJSON()
}

/// Вернуть строку, если она не пустая; иначе — значение по умолчанию.
ClassMethod Default(pValue As %String, pDefault As %String) As %String [ CodeMode = expression ]
{
$select(pValue'="":pValue, 1:pDefault)
}

/// Преобразовать %DynamicObject → JSON-строка.
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
