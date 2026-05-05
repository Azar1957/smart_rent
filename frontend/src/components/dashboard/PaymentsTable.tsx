'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { formatPrice } from '@/lib/currency';
import { readLocalized, type DemoPayment, type DemoRental } from '@/data/demoRentals';

export type PaymentRow = DemoPayment & { rentalId: string; rentalLabel: string };

export function PaymentsTable({
  rentals,
  filterKind,
  role,
}: {
  rentals: DemoRental[];
  filterKind: 'rent' | 'utility';
  role: 'tenant' | 'landlord' | 'admin';
}) {
  const { t, locale } = useT();
  const currency = useAuth((s) => s.currency);

  const rows: PaymentRow[] = useMemo(() => {
    const out: PaymentRow[] = [];
    for (const r of rentals) {
      const list =
        filterKind === 'rent'
          ? r.rentPayments
          : r.utilityPayments;
      for (const p of list) {
        out.push({
          ...p,
          rentalId: r.id,
          rentalLabel: `${readLocalized(r.title, locale)} · ${r.segmentLabel ?? readLocalized(r.address, locale)}`,
        });
      }
    }
    out.sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1));
    return out;
  }, [rentals, filterKind, locale]);

  const [payingId, setPayingId] = useState<string | null>(null);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());

  function isPaid(p: PaymentRow) {
    return p.status === 'paid' || paidIds.has(p.id);
  }

  function statusOf(p: PaymentRow): DemoPayment['status'] {
    if (paidIds.has(p.id)) return 'paid';
    return p.status;
  }

  const totalPaid = rows
    .filter((p) => isPaid(p))
    .reduce((acc, p) => acc + p.amountEur, 0);
  const totalDue = rows
    .filter((p) => !isPaid(p))
    .reduce((acc, p) => acc + p.amountEur, 0);

  return (
    <div className="space-y-6">
      {/* Сводные карточки */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Summary label={t.dashboard.totalPaid} value={formatPrice(totalPaid, currency)} />
        <Summary
          label={t.dashboard.totalDue}
          value={formatPrice(totalDue, currency)}
          accent={totalDue > 0}
        />
      </div>

      {/* Таблица */}
      <div className="rounded-card border border-mist overflow-hidden bg-canvas">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-body-sm">
            <thead className="bg-fog text-mistx text-[12px] uppercase tracking-[0.14em]">
              <tr>
                <th className="text-left px-5 py-3">{t.payments.month}</th>
                <th className="text-left px-5 py-3">{t.payments.description}</th>
                <th className="text-left px-5 py-3">{t.payments.rental}</th>
                <th className="text-right px-5 py-3">{t.payments.amount}</th>
                <th className="text-left px-5 py-3">{t.payments.due}</th>
                <th className="text-left px-5 py-3">{t.payments.status}</th>
                {role === 'tenant' ? <th className="text-right px-5 py-3">{t.common.actions}</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={role === 'tenant' ? 7 : 6} className="text-center text-mistx py-8">
                    {t.common.empty}
                  </td>
                </tr>
              ) : null}
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-mist">
                  <td className="px-5 py-3 font-bold text-obsidian">{p.month}</td>
                  <td className="px-5 py-3">
                    <div className="text-obsidian">{readLocalized(p.description, locale)}</div>
                    <div className="text-[12px] text-mistx capitalize">
                      {p.utilityKind ? t.utilityKind[p.utilityKind] : t.paymentKind[p.kind]}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-mistx truncate max-w-[260px]">{p.rentalLabel}</td>
                  <td className="px-5 py-3 text-right font-bold text-obsidian">
                    {formatPrice(p.amountEur, currency)}
                  </td>
                  <td className="px-5 py-3 text-mistx">{p.dueDate}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={statusOf(p)} />
                    {p.paidAt ? (
                      <div className="text-[11px] text-mistx mt-0.5">
                        {t.payments.paidAt}: {p.paidAt}
                      </div>
                    ) : null}
                  </td>
                  {role === 'tenant' ? (
                    <td className="px-5 py-3 text-right">
                      {!isPaid(p) ? (
                        <button
                          type="button"
                          onClick={() => setPayingId(p.id)}
                          className="btn-primary !py-2 !text-[13px]"
                        >
                          {t.payments.pay}
                        </button>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className="md:hidden divide-y divide-mist">
          {rows.length === 0 ? (
            <li className="text-center text-mistx py-8">{t.common.empty}</li>
          ) : null}
          {rows.map((p) => (
            <li key={p.id} className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="text-body-sm font-bold text-obsidian">{p.month}</div>
                <StatusBadge status={statusOf(p)} />
              </div>
              <div className="text-body-sm text-obsidian">
                {readLocalized(p.description, locale)}
              </div>
              <div className="text-[12px] text-mistx">{p.rentalLabel}</div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-[12px] text-mistx">
                  {t.payments.due}: {p.dueDate}
                </div>
                <div className="text-body-sm font-bold text-obsidian">
                  {formatPrice(p.amountEur, currency)}
                </div>
              </div>
              {role === 'tenant' && !isPaid(p) ? (
                <button
                  type="button"
                  onClick={() => setPayingId(p.id)}
                  className="btn-primary mt-2"
                >
                  {t.payments.pay}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      {payingId ? (
        <PayModal
          row={rows.find((p) => p.id === payingId)!}
          onClose={() => setPayingId(null)}
          onConfirm={() => {
            setPaidIds((s) => new Set(s).add(payingId));
            setPayingId(null);
          }}
        />
      ) : null}
    </div>
  );
}

function Summary({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-card border border-mist p-5 bg-canvas">
      <div className="text-mistx text-[12px] uppercase tracking-[0.18em]">{label}</div>
      <div
        className={
          'mt-3 text-heading-sm font-bold ' + (accent ? 'text-rausch' : 'text-obsidian')
        }
      >
        {value}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: DemoPayment['status'] }) {
  const { t } = useT();
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 text-body-sm text-emerald-700">
        <CheckCircle2 className="h-4 w-4" /> {t.paymentStatus.paid}
      </span>
    );
  }
  if (status === 'overdue') {
    return (
      <span className="inline-flex items-center gap-1 text-body-sm text-rausch">
        <AlertTriangle className="h-4 w-4" /> {t.paymentStatus.overdue}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-body-sm text-obsidian">
      <Clock className="h-4 w-4" /> {t.paymentStatus.pending}
    </span>
  );
}

function PayModal({
  row,
  onClose,
  onConfirm,
}: {
  row: PaymentRow;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t, locale } = useT();
  const currency = useAuth((s) => s.currency);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      setTimeout(onConfirm, 800);
    }, 600);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-obsidian/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-canvas w-full max-w-md rounded-card overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-mist">
          <div className="text-subheading font-bold text-obsidian">
            {done ? t.payments.payDoneTitle : t.payments.payTitle}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-fog flex items-center justify-center"
            aria-label="close"
          >
            <X className="h-5 w-5 text-obsidian" />
          </button>
        </div>

        {done ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
            <p className="mt-3 text-body-sm text-obsidian">
              {t.payments.payDoneSub} <strong>{formatPrice(row.amountEur, currency)}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-4">
            <div className="rounded-card bg-fog p-4 text-body-sm text-obsidian space-y-1">
              <div>{readLocalized(row.description, locale)}</div>
              <div className="text-[12px] text-mistx">
                {t.payments.due}: {row.dueDate}
              </div>
              <div className="flex items-center justify-between mt-2 text-subheading font-bold">
                <span>{t.payments.total}</span>
                <span>{formatPrice(row.amountEur, currency)}</span>
              </div>
            </div>

            <div>
              <label className="label">{t.payments.cardNumber}</label>
              <input
                className="input"
                placeholder="4242 4242 4242 4242"
                inputMode="numeric"
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t.payments.cardExpiry}</label>
                <input className="input" placeholder="12/28" maxLength={5} />
              </div>
              <div>
                <label className="label">{t.payments.cardCvc}</label>
                <input className="input" placeholder="123" maxLength={4} />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              <Receipt className="h-4 w-4 mr-2" />
              {submitting ? t.common.loading : t.payments.payNow}
            </button>
            <p className="text-[11px] text-mistx text-center">{t.payments.payDisclaimer}</p>
          </form>
        )}
      </div>
    </div>
  );
}
