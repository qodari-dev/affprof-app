'use client';

import * as React from 'react';
import { Copy, Download, Loader2, Power, PowerOff } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { BrandLogo } from '@/components/brand-logo';
import type { Links } from '@/server/db';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LinkStatusBadge } from './link-status-badge';
import { TagBadge } from '@/components/tag-badge';
import {
  DescriptionList,
  type DescriptionSection,
} from '@/components/description-list';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LinkAnalytics } from './link-analytics';
import { useProfile } from '@/hooks/queries/use-profile-queries';
import {
  getPrimaryVerifiedCustomDomainHostname,
  useCustomDomains,
} from '@/hooks/queries/use-custom-domain-queries';
import { useUpdateLink } from '@/hooks/queries/use-link-queries';
import { buildShortLinkUrl } from '@/utils/short-link';
import { renderBrandedQrToCanvas } from '@/utils/branded-qr';

function QrPreview({
  shortUrl,
  slug,
  brand,
}: {
  shortUrl: string;
  slug: string;
  brand?: Links['brand'];
}) {
  const tc = useTranslations('common');
  const tToasts = useTranslations('toasts');
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const qrUrl = `${shortUrl}?qr=1`;

  React.useEffect(() => {
    if (!canvasRef.current) return;
    void renderBrandedQrToCanvas(canvasRef.current, {
      qrUrl,
      size: 160,
      margin: 2,
      foreground: brand?.qrForeground ?? '#111111',
      background: brand?.qrBackground ?? '#FFFFFF',
      logoUrl: brand?.logoUrl,
    });
  }, [brand, qrUrl]);

  const handleDownload = React.useCallback(() => {
    const downloadCanvas = document.createElement('canvas');
    void renderBrandedQrToCanvas(downloadCanvas, {
      qrUrl,
      size: 1024,
      margin: 3,
      foreground: brand?.qrForeground ?? '#111111',
      background: brand?.qrBackground ?? '#FFFFFF',
      logoUrl: brand?.logoUrl,
    }).then(() => {
      const a = document.createElement('a');
      a.download = `qr-${slug}.png`;
      a.href = downloadCanvas.toDataURL('image/png');
      a.click();
    });
  }, [brand, qrUrl, slug]);

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(shortUrl);
    toast.success(tToasts('urlCopied'));
  }, [shortUrl, tToasts]);

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
      {brand ? (
        <div className="mb-1 flex w-full items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
          <BrandLogo name={brand.name} logoUrl={brand.logoUrl} className="size-8 rounded-lg" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{brand.name}</div>
            <div className="truncate text-xs text-muted-foreground">
              {brand.qrForeground} / {brand.qrBackground}
            </div>
          </div>
        </div>
      ) : null}
      <div className="rounded-md bg-white p-2">
        <canvas ref={canvasRef} />
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Copy className="h-3 w-3" />
        {shortUrl}
      </button>
      <Button size="sm" variant="outline" onClick={handleDownload}>
        <Download className="mr-1.5 h-3 w-3" />
        {tc('downloadPng')}
      </Button>
    </div>
  );
}

export function LinkInfo({
  link,
  opened,
  onOpened,
}: {
  link: Links | undefined;
  opened: boolean;
  onOpened: (opened: boolean) => void;
}) {
  const t = useTranslations('links.info');
  const tToasts = useTranslations('toasts');
  const locale = useLocale();
  const { data: profileData } = useProfile();
  const { data: customDomainsData } = useCustomDomains();
  const { mutateAsync: updateLink, isPending: isUpdating } = useUpdateLink();
  const userSlug = profileData?.status === 200 ? profileData.body.slug : '';
  const primaryCustomDomain = customDomainsData?.status === 200
    ? getPrimaryVerifiedCustomDomainHostname(customDomainsData.body)
    : null;
  const [isEnabled, setIsEnabled] = React.useState(link?.isEnabled ?? true);

  React.useEffect(() => {
    if (opened && link) {
      setIsEnabled(link.isEnabled);
    }
  }, [opened, link]);

  const handleToggleEnabled = React.useCallback(async () => {
    if (!link) return;
    try {
      const nextValue = !isEnabled;
      await updateLink({
        params: { id: link.id },
        body: { isEnabled: nextValue },
      });
      setIsEnabled(nextValue);
    } catch {
      // Error handled by mutation onError
    }
  }, [isEnabled, link, updateLink]);

  if (!link) return null;

  const tags = link.linkTags?.map((lt) => lt.tag).filter(Boolean) ?? [];
  const shortUrl = userSlug
    ? buildShortLinkUrl(userSlug, link.slug, primaryCustomDomain)
    : '';

  const hasUtm = Boolean(link.utmSource || link.utmMedium || link.utmCampaign || link.utmContent || link.utmTerm);

  const sections: DescriptionSection[] = [
    // ── Link ──────────────────────────────────────────────────────────
    {
      title: t('sectionLink'),
      columns: 1,
      items: [
        {
          label: t('shortUrl'),
          value: shortUrl ? (
            <div className="flex items-center gap-2">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-sm text-primary underline underline-offset-2"
              >
                {shortUrl}
              </a>
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(shortUrl); toast.success(tToasts('urlCopied')); }}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : undefined,
        },
        {
          label: t('baseUrl'),
          value: (
            <a
              href={link.baseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm text-primary underline underline-offset-2"
            >
              {link.baseUrl}
            </a>
          ),
        },
        {
          label: t('finalDestination'),
          hidden: link.originalUrl === link.baseUrl,
          value: (
            <a
              href={link.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm text-primary underline underline-offset-2"
            >
              {link.originalUrl}
            </a>
          ),
        },
      ],
    },

    // ── Details ───────────────────────────────────────────────────────
    {
      title: t('sectionDetails'),
      columns: 2,
      items: [
        {
          label: t('product'),
          value: link.product?.name ?? undefined,
        },
        {
          label: t('platform'),
          value: (
            <Badge variant="outline" className="capitalize">
              {link.platform}
            </Badge>
          ),
        },
      ],
    },

    // ── UTM Tracking ──────────────────────────────────────────────────
    {
      title: t('sectionUtm'),
      columns: 2,
      items: [
        {
          label: t('utmSource'),
          hidden: !link.utmSource,
          value: link.utmSource ? (
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{link.utmSource}</code>
          ) : undefined,
        },
        {
          label: t('utmMedium'),
          hidden: !link.utmMedium,
          value: link.utmMedium ? (
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{link.utmMedium}</code>
          ) : undefined,
        },
        {
          label: t('utmCampaign'),
          hidden: !link.utmCampaign,
          value: link.utmCampaign ? (
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{link.utmCampaign}</code>
          ) : undefined,
        },
        {
          label: t('utmContent'),
          hidden: !link.utmContent,
          value: link.utmContent ? (
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{link.utmContent}</code>
          ) : undefined,
        },
        {
          label: t('utmTerm'),
          hidden: !link.utmTerm,
          value: link.utmTerm ? (
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{link.utmTerm}</code>
          ) : undefined,
        },
        // Placeholder item shown only when no UTM is set (keeps section visible with a message)
        {
          label: t('utmTracking'),
          hidden: hasUtm,
          value: <span className="text-muted-foreground">{t('notConfigured')}</span>,
        },
      ],
    },

    // ── Options ───────────────────────────────────────────────────────
    {
      title: t('sectionOptions'),
      columns: 2,
      items: [
        {
          label: t('qrBrand'),
          value: link.brand ? (
            <div className="flex items-center gap-2">
              <BrandLogo name={link.brand.name} logoUrl={link.brand.logoUrl} className="size-7 rounded-lg" />
              <span>{link.brand.name}</span>
            </div>
          ) : t('standardQr'),
        },
        {
          label: t('fallbackUrl'),
          hidden: !link.fallbackUrl,
          value: link.fallbackUrl ? (
            <a
              href={link.fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm text-primary underline underline-offset-2"
            >
              {link.fallbackUrl}
            </a>
          ) : undefined,
        },
      ],
    },

    // ── Organization ──────────────────────────────────────────────────
    {
      title: t('sectionOrganization'),
      columns: 1,
      items: [
        {
          label: t('tags'),
          value:
            tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <TagBadge key={tag!.id} name={tag!.name} color={tag!.color} />
                ))}
              </div>
            ) : (
              t('noTags')
            ),
        },
        {
          label: t('notes'),
          hidden: !link.notes,
          value: link.notes || undefined,
        },
      ],
    },

    // ── Monitoring ────────────────────────────────────────────────────
    {
      title: t('sectionMonitoring'),
      columns: 2,
      items: [
        {
          label: t('status'),
          value: <LinkStatusBadge status={link.status} isEnabled={isEnabled} />,
        },
        {
          label: t('consecutiveFailures'),
          value: (
            <span className={link.consecutiveFailures > 0 ? 'font-medium text-destructive' : ''}>
              {link.consecutiveFailures}
            </span>
          ),
        },
        {
          label: t('lastChecked'),
          value: link.lastCheckedAt
            ? new Date(link.lastCheckedAt).toLocaleDateString(locale, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : t('never'),
        },
        {
          label: t('lastStatusCode'),
          value: link.lastStatusCode ? (
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{link.lastStatusCode}</code>
          ) : undefined,
        },
        {
          label: t('lastResponse'),
          value: link.lastResponseMs ? `${link.lastResponseMs}ms` : undefined,
        },
      ],
    },

    // ── Activity ──────────────────────────────────────────────────────
    {
      title: t('sectionActivity'),
      columns: 2,
      items: [
        {
          label: t('totalClicks'),
          value: <span className="text-lg font-semibold tabular-nums">{link.totalClicks.toLocaleString()}</span>,
        },
        {
          label: t('created'),
          value: new Date(link.createdAt).toLocaleDateString(locale, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        {
          label: t('updated'),
          value: link.updatedAt
            ? new Date(link.updatedAt).toLocaleDateString(locale, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : undefined,
        },
      ],
    },
  ];

  return (
    <Sheet open={opened} onOpenChange={onOpened}>
      <SheetContent className="overflow-y-auto sm:max-w-xl lg:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-mono">
            /{link.slug}
          </SheetTitle>
          <SheetDescription>{t('sheetDescription')}</SheetDescription>
        </SheetHeader>
        <Tabs defaultValue="overview" className="px-6 pb-2">
          <TabsList variant="line" className="mb-4">
            <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
            <TabsTrigger value="analytics">{t('analyticsTab')}</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{t('linkAvailability')}</span>
                  <span className="text-sm text-muted-foreground">
                    {isEnabled ? t('enabledDescription') : t('disabledDescription')}
                  </span>
                </div>
                <Button
                  type="button"
                  variant={isEnabled ? 'outline' : 'default'}
                  onClick={() => void handleToggleEnabled()}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="animate-spin" />
                  ) : isEnabled ? (
                    <PowerOff />
                  ) : (
                    <Power />
                  )}
                  {isEnabled ? t('disableLink') : t('enableLink')}
                </Button>
              </div>
              <DescriptionList sections={sections} />
              {shortUrl && <QrPreview shortUrl={shortUrl} slug={link.slug} brand={link.brand} />}
            </div>
          </TabsContent>
          <TabsContent value="analytics">
            <LinkAnalytics linkId={link.id} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
