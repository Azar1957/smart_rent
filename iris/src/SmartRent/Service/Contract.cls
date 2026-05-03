/// Генератор текста договора аренды (упрощённый шаблон).
Class SmartRent.Service.Contract Extends %RegisteredObject
{

ClassMethod Render(pLease As SmartRent.Model.Lease) As %String
{
    set tT = pLease.Tenant, tL = pLease.Landlord, tS = pLease.Segment, tP = tS.Property
    set tTxt = ""
    set tTxt = tTxt _ "ДОГОВОР АРЕНДЫ КОМНАТЫ № " _ pLease.%Id() _ $char(13,10)
    set tTxt = tTxt _ "Дата составления: " _ $ZDATE(+$HOROLOG, 4) _ $char(13,10,13,10)
    set tTxt = tTxt _ "Арендодатель: " _ tL.LastName _ " " _ tL.FirstName _ " (email: " _ tL.Email _ ")" _ $char(13,10)
    set tTxt = tTxt _ "Арендатор:    " _ tT.LastName _ " " _ tT.FirstName _ " (email: " _ tT.Email _ ")" _ $char(13,10,13,10)
    set tTxt = tTxt _ "Объект: " _ tP.Title _ ", " _ tP.City _ ", " _ tP.Address _ $char(13,10)
    set tTxt = tTxt _ "Сегмент: " _ tS.Code _ " — " _ tS.Title _ ", " _ tS.Area _ " м²" _ $char(13,10,13,10)
    set tTxt = tTxt _ "Срок аренды: с " _ $ZDATE(pLease.StartDate, 4) _ " по " _ $ZDATE(pLease.EndDate, 4) _ $char(13,10)
    set tTxt = tTxt _ "Месячная плата: " _ pLease.MonthlyPrice _ " " _ pLease.Currency _ $char(13,10)
    set tTxt = tTxt _ "Залог: " _ pLease.DepositAmount _ " " _ pLease.Currency _ $char(13,10,13,10)
    set tTxt = tTxt _ "1. Арендатор обязуется вносить ежемесячную плату до 5 числа каждого месяца." _ $char(13,10)
    set tTxt = tTxt _ "2. Залог возвращается в течение 7 дней после подписания акта приёма-сдачи" _ $char(13,10)
    set tTxt = tTxt _ "   с учётом возможных удержаний за повреждения имущества." _ $char(13,10)
    set tTxt = tTxt _ "3. Коммунальные платежи распределяются между арендаторами согласно правилам портала." _ $char(13,10)
    set tTxt = tTxt _ "4. Просрочка платежа ведёт к начислению пени по ставке портала." _ $char(13,10,13,10)
    set tTxt = tTxt _ "Подписи сторон: ____________________   ____________________" _ $char(13,10)
    quit tTxt
}

}
