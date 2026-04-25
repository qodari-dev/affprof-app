import type { Metadata } from 'next';
import { Bug, LifeBuoy, Lightbulb, Mail, MessageCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { PageLayout } from '@/components/sidebar/page-layout';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contact');
  return { title: t('metadataTitle') };
}

const SUPPORT_EMAIL = 'hello@affprof.com';

export default async function ContactPage() {
  const t = await getTranslations('contact');
  const tCommon = await getTranslations('common');
  const tNav = await getTranslations('nav');

  const topics = [
    { icon: MessageCircle, label: t('topic1') },
    { icon: Lightbulb, label: t('topic2') },
    { icon: Bug, label: t('topic3') },
  ];

  return (
    <PageLayout breadcrumbs={[{ label: tCommon('home'), href: '/' }, { label: tNav('contact') }]}>
      <div className="mx-auto max-w-lg py-6">
        <div className="rounded-2xl border bg-card p-8">
          <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <LifeBuoy className="size-7 text-primary" />
          </div>

          <h2 className="mb-2 text-xl font-semibold">{t('cardTitle')}</h2>
          <p className="mb-8 text-sm text-muted-foreground">{t('cardDesc')}</p>

          <ul className="mb-8 space-y-3">
            {topics.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-3.5" />
                </div>
                {label}
              </li>
            ))}
          </ul>

          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('emailLabel')}
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Mail className="size-4 shrink-0" />
              {SUPPORT_EMAIL}
            </a>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {t('responseTime')}
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
