'use client';

import * as React from 'react';
import { Copy, Download, Loader2, Power, PowerOff } from 'lucide-react';
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
    toast.success('Short URL copied');
  }, [shortUrl]);

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
        Download PNG
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

  const sections: DescriptionSection[] = [
    {
      title: 'Link Details',
      columns: 1,
      items: [
        {
          label: 'Slug',
          value: <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">/{link.slug}</code>,
        },
        {
          label: 'Base URL',
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
          label: 'Final destination',
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
        {
          label: 'Product',
          value: link.product?.name ?? undefined,
        },
        {
          label: 'QR brand',
          value: link.brand ? (
            <div className="flex items-center gap-2">
              <BrandLogo name={link.brand.name} logoUrl={link.brand.logoUrl} className="size-7 rounded-lg" />
              <span>{link.brand.name}</span>
            </div>
          ) : 'Standard AffProf QR',
        },
        {
          label: 'UTM tracking',
          value: (link.utmSource || link.utmMedium || link.utmCampaign || link.utmContent || link.utmTerm) ? (
            <div className="flex flex-wrap gap-1">
              {link.utmSource ? <Badge variant="outline">source: {link.utmSource}</Badge> : null}
              {link.utmMedium ? <Badge variant="outline">medium: {link.utmMedium}</Badge> : null}
              {link.utmCampaign ? <Badge variant="outline">campaign: {link.utmCampaign}</Badge> : null}
              {link.utmContent ? <Badge variant="outline">content: {link.utmContent}</Badge> : null}
              {link.utmTerm ? <Badge variant="outline">term: {link.utmTerm}</Badge> : null}
            </div>
          ) : 'Not configured',
        },
        {
          label: 'Fallback URL',
          value: link.fallbackUrl ? (
            <a
              href={link.fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm text-primary underline underline-offset-2"
            >
              {link.fallbackUrl}
            </a>
          ) : 'Not configured',
        },
        {
          label: 'Platform',
          value: (
            <Badge variant="outline" className="capitalize">
              {link.platform}
            </Badge>
          ),
        },
        {
          label: 'Notes',
          value: link.notes || undefined,
        },
      ],
    },
    {
      title: 'Status & Monitoring',
      columns: 2,
      items: [
        {
          label: 'Status',
          value: <LinkStatusBadge status={link.status} isEnabled={isEnabled} />,
        },
        {
          label: 'Enabled',
          value: isEnabled ? 'Yes' : 'No',
        },
        {
          label: 'Consecutive Failures',
          value: (
            <span className={link.consecutiveFailures > 0 ? 'font-medium text-destructive' : ''}>
              {link.consecutiveFailures}
            </span>
          ),
        },
        {
          label: 'Last Checked',
          value: link.lastCheckedAt
            ? new Date(link.lastCheckedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Never',
        },
        {
          label: 'Last Status Code',
          value: link.lastStatusCode ? (
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{link.lastStatusCode}</code>
          ) : undefined,
        },
        {
          label: 'Last Response',
          value: link.lastResponseMs ? `${link.lastResponseMs}ms` : undefined,
        },
      ],
    },
    {
      title: 'Performance',
      columns: 2,
      items: [
        {
          label: 'Total Clicks',
          value: <span className="text-lg font-semibold tabular-nums">{link.totalClicks.toLocaleString()}</span>,
        },
        {
          label: 'Tags',
          value:
            tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <TagBadge key={tag!.id} name={tag!.name} color={tag!.color} />
                ))}
              </div>
            ) : (
              'No tags'
            ),
        },
      ],
    },
    {
      title: 'Activity',
      columns: 2,
      items: [
        {
          label: 'Created',
          value: new Date(link.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        {
          label: 'Updated',
          value: link.updatedAt
            ? new Date(link.updatedAt).toLocaleDateString('en-US', {
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
          <SheetDescription>Link details, monitoring status, and performance.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-6 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Link availability</span>
              <span className="text-sm text-muted-foreground">
                {isEnabled
                  ? 'This short link is active and can redirect visitors.'
                  : 'This short link is disabled and currently returns not found.'}
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
              {isEnabled ? 'Disable link' : 'Enable link'}
            </Button>
          </div>
          <DescriptionList sections={sections} />
          {shortUrl && <QrPreview shortUrl={shortUrl} slug={link.slug} brand={link.brand} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
