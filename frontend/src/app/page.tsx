'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n';
import { Building2, FileSignature, Wallet } from 'lucide-react';

export default function Home() {
  const { t } = useT();
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-brand-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-50 max-w-3xl">
            {t.home.heroTitle}
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
            {t.home.heroSub}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary">{t.home.ctaStart}</Link>
            <Link href="/login" className="btn-ghost">{t.home.ctaDemo}</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Feature icon={<Building2 className="h-6 w-6" />} title={t.home.f1Title} body={t.home.f1Body} />
        <Feature icon={<FileSignature className="h-6 w-6" />} title={t.home.f2Title} body={t.home.f2Body} />
        <Feature icon={<Wallet className="h-6 w-6" />} title={t.home.f3Title} body={t.home.f3Body} />
      </section>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="card hover:shadow-md transition">
      <div className="h-10 w-10 rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-100 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{body}</p>
    </div>
  );
}
