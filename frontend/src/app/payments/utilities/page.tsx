import { Suspense } from 'react';
import UtilitiesPaymentsView from './View';

export const dynamic = 'force-dynamic';

export default function UtilitiesPaymentsPage() {
  return (
    <Suspense fallback={null}>
      <UtilitiesPaymentsView />
    </Suspense>
  );
}
