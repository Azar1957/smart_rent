'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Receipt, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/store';
import { useT } from '@/lib/i18n';

export default function PaymentsHubPage() {
  const { t } = useT();
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) router.replace('/login');
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-page px-6 py-10">
        <div className="text-body-sm text-mistx mb-2">{t.payments.eyebrow}</div>
        <h1 className="text-heading-sm md:text-heading font-bold text-obsidian tracking-heading">
          {t.payments.title}
        </h1>
        <p className="text-body-sm text-mistx mt-2 max-w-xl">{t.payments.sub}</p>

        <div className="grid gap-4 sm:grid-cols-2 mt-8">
          <HubCard
            href="/payments/rent"
            icon={<Receipt className="h-5 w-5" />}
            title={t.payments.rentTabTitle}
            sub={t.payments.rentTabSub}
          />
          <HubCard
            href="/payments/utilities"
            icon={<Zap className="h-5 w-5" />}
            title={t.payments.utilTabTitle}
            sub={t.payments.utilTabSub}
          />
        </div>

        <div className="mt-8">
          <Link href="/dashboard" className="nav-link">
            ← {t.nav.dashboard}
          </Link>
        </div>
      </div>
    </div>
  );
}

function HubCard({
  href,
  icon,
  title,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-card border border-mist p-6 bg-canvas hover:bg-fog transition flex items-start gap-4"
    >
      <span className="inline-flex h-10 w-10 rounded-full bg-fog text-obsidian items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="flex-1">
        <div className="text-subheading font-bold text-obsidian">{title}</div>
        <div className="text-body-sm text-mistx mt-1">{sub}</div>
        <div className="mt-3 inline-flex items-center gap-1 text-body-sm font-bold text-obsidian">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
