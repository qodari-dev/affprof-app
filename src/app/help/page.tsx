import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CreditCard,
  Database,
  FileSpreadsheet,
  Globe2,
  LifeBuoy,
  QrCode,
  RotateCcw,
  Settings,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { PageLayout } from '@/components/sidebar/page-layout';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('help');
  return { title: t('metadataTitle') };
}

export default async function HelpPage() {
  const t = await getTranslations('help');
  const tCommon = await getTranslations('common');
  const tNav = await getTranslations('nav');

  const topics = [
    {
      id: 'getting-started',
      icon: BookOpen,
      title: t('gettingStarted.title'),
      description: t('gettingStarted.description'),
    },
    {
      id: 'products-links-tags',
      icon: Database,
      title: t('topics.products.title'),
      description: t('topics.products.description'),
    },
    {
      id: 'brands-qr',
      icon: QrCode,
      title: t('topics.brandsQr.title'),
      description: t('topics.brandsQr.description'),
    },
    {
      id: 'custom-domains',
      icon: Globe2,
      title: t('topics.customDomains.title'),
      description: t('topics.customDomains.description'),
    },
    {
      id: 'import-export',
      icon: FileSpreadsheet,
      title: t('topics.importExport.title'),
      description: t('topics.importExport.description'),
    },
    {
      id: 'fallbacks',
      icon: RotateCcw,
      title: t('topics.fallbacks.title'),
      description: t('topics.fallbacks.description'),
    },
    {
      id: 'dashboard-analytics',
      icon: BarChart3,
      title: t('topics.analytics.title'),
      description: t('topics.analytics.description'),
    },
    {
      id: 'billing-subscription',
      icon: CreditCard,
      title: t('topics.billing.title'),
      description: t('topics.billing.description'),
    },
    {
      id: 'account-settings',
      icon: Settings,
      title: t('topics.accountSettings.title'),
      description: t('topics.accountSettings.description'),
    },
  ];

  return (
    <PageLayout breadcrumbs={[{ label: tCommon('home'), href: '/' }, { label: tNav('help') }]}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-4">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border bg-card p-6">
            <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
              <BookOpen className="size-6 text-primary" />
            </div>
            <div className="max-w-2xl">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t('title')}</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{t('description')}</p>
            </div>
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>{t('contactCard.title')}</CardTitle>
              <CardDescription>{t('contactCard.description')}</CardDescription>
              <CardAction>
                <LifeBuoy className="size-5 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                {t('contactCard.cta')}
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {topics.map(({ id, icon: Icon, title, description }) => (
            <Link key={id} href={`/help/${id}`} className="group block">
              <Card className="h-full rounded-2xl transition-colors hover:bg-muted/30">
                <CardHeader>
                  <div className="mb-3 flex size-10 items-center justify-center rounded-xl border bg-background">
                    <Icon className="size-5 text-muted-foreground" />
                  </div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                  <CardAction>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </CardAction>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </section>
      </div>
    </PageLayout>
  );
}
