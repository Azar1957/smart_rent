/// Уведомление пользователю (in-app + email-рассылка обработчиком очереди).
Class SmartRent.Model.Notification Extends (%Persistent, %JSON.Adaptor)
{

Parameter DEFAULTGLOBAL = "^SR.Notification";

Property Recipient As SmartRent.Model.User [ Required ];

/// booking | payment | utility | lease | system
Property Topic As %String(VALUELIST = ",booking,payment,utility,lease,system") [ Required ];

Property Title   As %String(MAXLEN = 200);
Property Message As %String(MAXLEN = 4000);

Property Read     As %Boolean [ InitialExpression = 0 ];
Property ReadAt   As %TimeStamp;

Property RelatedKind As %String(MAXLEN = 50);
Property RelatedId   As %String(MAXLEN = 50);

Property CreatedAt As %TimeStamp [ InitialExpression = {$ZDATETIME($HOROLOG, 3, 1)} ];

Index RecipientIdx On (Recipient, Read);
Index TopicIdx     On Topic;

Method ToJSON() As %DynamicObject
{
    quit {
        "id":         (..%Id()),
        "topic":      (..Topic),
        "title":      (..Title),
        "message":    (..Message),
        "read":       (..Read),
        "createdAt":  (..CreatedAt),
        "relatedKind":(..RelatedKind),
        "relatedId":  (..RelatedId)
    }
}

Storage Default
{
<Data name="NotificationDefaultData">
<Value name="1"><Value>%%CLASSNAME</Value></Value>
<Value name="2"><Value>Recipient</Value></Value>
<Value name="3"><Value>Topic</Value></Value>
<Value name="4"><Value>Title</Value></Value>
<Value name="5"><Value>Message</Value></Value>
<Value name="6"><Value>Read</Value></Value>
<Value name="7"><Value>ReadAt</Value></Value>
<Value name="8"><Value>RelatedKind</Value></Value>
<Value name="9"><Value>RelatedId</Value></Value>
<Value name="10"><Value>CreatedAt</Value></Value>
</Data>
<DataLocation>^SR.NotificationD</DataLocation>
<DefaultData>NotificationDefaultData</DefaultData>
<IdLocation>^SR.NotificationD</IdLocation>
<IndexLocation>^SR.NotificationI</IndexLocation>
<StreamLocation>^SR.NotificationS</StreamLocation>
<Type>%Storage.Persistent</Type>
}

}
