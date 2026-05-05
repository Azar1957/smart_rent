/// Lease contract text generator (simple template).
/// English-only by default; UI/PDF rendering layer may translate sections later.
Class SmartRent.Service.Contract Extends %RegisteredObject
{

ClassMethod Render(pLease As SmartRent.Model.Lease) As %String
{
    set tT = pLease.Tenant, tL = pLease.Landlord, tS = pLease.Segment, tP = tS.Property
    set tTxt = ""
    set tTxt = tTxt _ "ROOM LEASE AGREEMENT No. " _ pLease.%Id() _ $char(13,10)
    set tTxt = tTxt _ "Date issued: " _ $ZDATE(+$HOROLOG, 4) _ $char(13,10,13,10)
    set tTxt = tTxt _ "Landlord: " _ tL.LastName _ " " _ tL.FirstName _ " (email: " _ tL.Email _ ")" _ $char(13,10)
    set tTxt = tTxt _ "Tenant:   " _ tT.LastName _ " " _ tT.FirstName _ " (email: " _ tT.Email _ ")" _ $char(13,10,13,10)
    set tTxt = tTxt _ "Property: " _ tP.Title _ ", " _ tP.City _ ", " _ tP.Address _ $char(13,10)
    set tTxt = tTxt _ "Segment:  " _ tS.Code _ " — " _ tS.Title _ ", " _ tS.Area _ " m²" _ $char(13,10,13,10)
    set tTxt = tTxt _ "Term: from " _ $ZDATE(pLease.StartDate, 4) _ " to " _ $ZDATE(pLease.EndDate, 4) _ $char(13,10)
    set tTxt = tTxt _ "Monthly rent: " _ pLease.MonthlyPrice _ " " _ pLease.Currency _ $char(13,10)
    set tTxt = tTxt _ "Deposit:      " _ pLease.DepositAmount _ " " _ pLease.Currency _ $char(13,10,13,10)
    set tTxt = tTxt _ "1. The Tenant agrees to pay the monthly rent on or before the 5th of each month." _ $char(13,10)
    set tTxt = tTxt _ "2. The deposit is returned within 7 days after signing the move-out report," _ $char(13,10)
    set tTxt = tTxt _ "   net of any deductions for damages to the property." _ $char(13,10)
    set tTxt = tTxt _ "3. Utility bills are split between tenants per platform rules." _ $char(13,10)
    set tTxt = tTxt _ "4. Late payments accrue interest at the platform's published rate." _ $char(13,10,13,10)
    set tTxt = tTxt _ "Signatures: ____________________   ____________________" _ $char(13,10)
    quit tTxt
}

}
