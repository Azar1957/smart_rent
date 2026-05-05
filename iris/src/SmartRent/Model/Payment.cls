/// Платёж по договору: аренда / депозит / коммуналка / штраф.
Class SmartRent.Model.Payment Extends (%Persistent, %JSON.Adaptor)
{

Parameter DEFAULTGLOBAL = "^SR.Payment";

Property Lease   As SmartRent.Model.Lease [ Required ];
Property Payer   As SmartRent.Model.User  [ Required ];

/// rent | deposit | utility | penalty | refund
Property Kind As %String(VALUELIST = ",rent,deposit,utility,penalty,refund") [ Required, InitialExpression = "rent" ];

Property Amount   As %Numeric(SCALE = 2) [ Required ];
Property Currency As %String(MAXLEN = 3) [ InitialExpression = "USD" ];

Property DueDate As %Date;
Property PaidAt  As %TimeStamp;

/// pending | paid | overdue | cancelled | refunded
Property Status As %String(VALUELIST = ",pending,paid,overdue,cancelled,refunded") [ InitialExpression = "pending" ];

/// Внешний ID платёжной системы (Stripe/PayPal).
Property GatewayProvider As %String(MAXLEN = 50);
Property GatewayPaymentId As %String(MAXLEN = 200);

Property Description As %String(MAXLEN = 1000);

Property CreatedAt As %TimeStamp [ InitialExpression = {$ZDATETIME($HOROLOG, 3, 1)} ];

Index LeaseIdx  On Lease;
Index PayerIdx  On Payer;
Index StatusIdx On Status;
Index DueIdx    On DueDate;

Method ToJSON() As %DynamicObject
{
    quit {
        "id":         (..%Id()),
        "leaseId":    (..Lease.%Id()),
        "payerId":    (..Payer.%Id()),
        "kind":       (..Kind),
        "amount":     (..Amount),
        "currency":   (..Currency),
        "dueDate":    (..DueDate, $select(..DueDate'="":$ZDATE(..DueDate, 3), 1:"")),
        "paidAt":     (..PaidAt),
        "status":     (..Status),
        "provider":   (..GatewayProvider),
        "providerId": (..GatewayPaymentId),
        "description":(..Description),
        "createdAt":  (..CreatedAt)
    }
}

Storage Default
{
<Data name="PaymentDefaultData">
<Value name="1"><Value>%%CLASSNAME</Value></Value>
<Value name="2"><Value>Lease</Value></Value>
<Value name="3"><Value>Payer</Value></Value>
<Value name="4"><Value>Kind</Value></Value>
<Value name="5"><Value>Amount</Value></Value>
<Value name="6"><Value>Currency</Value></Value>
<Value name="7"><Value>DueDate</Value></Value>
<Value name="8"><Value>PaidAt</Value></Value>
<Value name="9"><Value>Status</Value></Value>
<Value name="10"><Value>GatewayProvider</Value></Value>
<Value name="11"><Value>GatewayPaymentId</Value></Value>
<Value name="12"><Value>Description</Value></Value>
<Value name="13"><Value>CreatedAt</Value></Value>
</Data>
<DataLocation>^SR.PaymentD</DataLocation>
<DefaultData>PaymentDefaultData</DefaultData>
<IdLocation>^SR.PaymentD</IdLocation>
<IndexLocation>^SR.PaymentI</IndexLocation>
<StreamLocation>^SR.PaymentS</StreamLocation>
<Type>%Storage.Persistent</Type>
}

}
