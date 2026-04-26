import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Database,
  FileSpreadsheet,
  Globe2,
  QrCode,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { PageLayout } from '@/components/sidebar/page-layout';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type TopicId =
  | 'getting-started'
  | 'products-links-tags'
  | 'brands-qr'
  | 'custom-domains'
  | 'import-export'
  | 'fallbacks'
  | 'dashboard-analytics';

type TopicConfig = {
  icon: LucideIcon;
  translationKey: string;
  points: string[];
};

const TOPICS: Record<TopicId, TopicConfig> = {
  'getting-started': {
    icon: BookOpen,
    translationKey: 'gettingStarted',
    points: ['step1', 'step2', 'step3', 'step4', 'step5'],
  },
  'products-links-tags': {
    icon: Database,
    translationKey: 'topics.products',
    points: ['point1', 'point2', 'point3'],
  },
  'brands-qr': {
    icon: QrCode,
    translationKey: 'topics.brandsQr',
    points: ['point1', 'point2', 'point3'],
  },
  'custom-domains': {
    icon: Globe2,
    translationKey: 'topics.customDomains',
    points: ['point1', 'point2', 'point3'],
  },
  'import-export': {
    icon: FileSpreadsheet,
    translationKey: 'topics.importExport',
    points: ['point1', 'point2', 'point3'],
  },
  fallbacks: {
    icon: RotateCcw,
    translationKey: 'topics.fallbacks',
    points: ['point1', 'point2', 'point3'],
  },
  'dashboard-analytics': {
    icon: BarChart3,
    translationKey: 'topics.analytics',
    points: ['point1', 'point2', 'point3'],
  },
};

function getTopic(topic: string): TopicConfig | undefined {
  return TOPICS[topic as TopicId];
}

type Props = {
  params: Promise<{ topic: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  const config = getTopic(topic);
  if (!config) return {};

  const t = await getTranslations('help');
  const translate = (key: string) => t(key as never);
  return { title: translate(`${config.translationKey}.title`) };
}

export default async function HelpTopicPage({ params }: Props) {
  const { topic } = await params;
  const config = getTopic(topic);
  if (!config) notFound();

  const t = await getTranslations('help');
  const tCommon = await getTranslations('common');
  const tNav = await getTranslations('nav');
  const translate = (key: string) => t(key as never);
  const Icon = config.icon;

  return (
    <PageLayout
      breadcrumbs={[
        { label: tCommon('home'), href: '/' },
        { label: tNav('help'), href: '/help' },
        { label: translate(`${config.translationKey}.title`) },
      ]}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-4">
        <Link
          href="/help"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t('backToHelp')}
        </Link>

        <section className="rounded-2xl border bg-card p-6">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <Icon className="size-6 text-primary" />
          </div>
          <Badge variant="secondary" className="mb-3">{t('badge')}</Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {translate(`${config.translationKey}.title`)}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {translate(`${config.translationKey}.description`)}
          </p>
        </section>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>{t('outlineTitle')}</CardTitle>
            <CardDescription>{t('outlineDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {config.points.map((pointKey) => (
                <div key={pointKey} className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
                  {translate(`${config.translationKey}.${pointKey}`)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
