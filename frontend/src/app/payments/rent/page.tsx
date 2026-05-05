import { Suspense } from 'react';
import RentPaymentsView from './View';

export const dynamic = 'force-dynamic';

export default function RentPaymentsPage() {
  return (
    <Suspense fallback={null}>
      <RentPaymentsView />
    </Suspense>
  );
}
