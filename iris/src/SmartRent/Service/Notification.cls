/// Простой шлюз уведомлений: складирует записи в БД, фронт читает по REST.
/// Отдельный воркер (не входит в MVP) забирает их и шлёт email/SMS/push.
Class SmartRent.Service.Notification Extends %RegisteredObject
{

ClassMethod Send(pUser As SmartRent.Model.User, pTopic As %String, pTitle As %String, pMessage As %String, pRelatedKind As %String = "", pRelatedId As %String = "") As %Status
{
    set n = ##class(SmartRent.Model.Notification).%New()
    set n.Recipient   = pUser
    set n.Topic       = pTopic
    set n.Title       = pTitle
    set n.Message     = pMessage
    set n.RelatedKind = pRelatedKind
    set n.RelatedId   = pRelatedId
    quit n.%Save()
}

ClassMethod MarkRead(pId As %String) As %Status
{
    set n = ##class(SmartRent.Model.Notification).%OpenId(pId)
    if '$isobject(n) quit $$$ERROR($$$GeneralError, "notification not found")
    set n.Read   = 1
    set n.ReadAt = $ZDATETIME($HOROLOG, 3, 1)
    quit n.%Save()
}

}
