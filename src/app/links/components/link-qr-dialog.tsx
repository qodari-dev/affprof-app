'use client';

import * as React from 'react';
import { Copy, Download, Palette } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { useBrands, getDefaultBrandId } from '@/hooks/queries/use-brand-queries';
import { renderBrandedQrToCanvas } from '@/utils/branded-qr';

interface LinkQrDialogProps {
  shortUrl: string;
  slug: string;
  initialBrandId?: string | null;
  opened: boolean;
  onOpened: (opened: boolean) => void;
}

export function LinkQrDialog({
  shortUrl,
  slug,
  initialBrandId,
  opened,
  onOpened,
}: LinkQrDialogProps) {
  const t = useTranslations('links.qrDialog');
  const tc = useTranslations('common');
  const tToasts = useTranslations('toasts');
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const qrUrl = shortUrl ? `${shortUrl}?qr=1` : '';
  const { data: brandsData } = useBrands({ enabled: opened });
  const brands = React.useMemo(
    () => (brandsData?.status === 200 ? brandsData.body : []),
    [brandsData],
  );
  const [selectedBrandId, setSelectedBrandId] = React.useState<string>('standard');
  const selectedBrand = React.useMemo(
    () => brands.find((brand) => brand.id === selectedBrandId) ?? null,
    [brands, selectedBrandId],
  );

  React.useEffect(() => {
    if (!opened) return;

    const defaultBrandId = initialBrandId ?? getDefaultBrandId(brands);
    setSelectedBrandId(defaultBrandId ?? 'standard');
  }, [brands, initialBrandId, opened]);

  const renderQrCode = React.useCallback(async (canvas: HTMLCanvasElement) => {
    if (!qrUrl) {
      const context = canvas.getContext('2d');
      context?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    try {
      await renderBrandedQrToCanvas(canvas, {
        qrUrl,
        size: 280,
        margin: 2,
        foreground: selectedBrand?.qrForeground ?? '#111111',
        background: selectedBrand?.qrBackground ?? '#FFFFFF',
        logoUrl: selectedBrand?.logoUrl,
      });
    } catch {
      toast.error(tToasts('qrGenerateError'));
    }
  }, [qrUrl, selectedBrand, tToasts]);

  const handleCanvasRef = React.useCallback((node: HTMLCanvasElement | null) => {
    canvasRef.current = node;

    if (node && opened) {
      void renderQrCode(node);
    }
  }, [opened, renderQrCode]);

  React.useEffect(() => {
    if (!opened || !canvasRef.current) return;

    const frame = window.requestAnimationFrame(() => {
      if (canvasRef.current) {
        void renderQrCode(canvasRef.current);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [opened, renderQrCode]);

  const handleDownload = React.useCallback(() => {
    if (!qrUrl) {
      toast.error(t('shortUrlLoading'));
      return;
    }

    const downloadCanvas = document.createElement('canvas');

    void renderBrandedQrToCanvas(downloadCanvas, {
      qrUrl,
      size: 1024,
      margin: 3,
      foreground: selectedBrand?.qrForeground ?? '#111111',
      background: selectedBrand?.qrBackground ?? '#FFFFFF',
      logoUrl: selectedBrand?.logoUrl,
    })
      .then(() => {
        const link = document.createElement('a');
        const fileSuffix = selectedBrand ? `${slug}-${selectedBrand.name}` : slug;
        link.download = `qr-${fileSuffix.toLowerCase().replace(/[^a-z0-9-]+/g, '-')}.png`;
        link.href = downloadCanvas.toDataURL('image/png');
        link.click();
      })
      .catch(() => {
        toast.error(tToasts('qrDownloadError'));
      });
  }, [
    qrUrl,
    selectedBrand,
    slug,
    t,
    tToasts,
  ]);

  const handleCopyUrl = React.useCallback(() => {
    if (!shortUrl) {
      toast.error(t('shortUrlLoading'));
      return;
    }

    navigator.clipboard.writeText(shortUrl);
    toast.success(t('urlCopied'));
  }, [shortUrl, t]);

  return (
    <Dialog open={opened} onOpenChange={onOpened}>
      <DialogContent className="overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('scanToOpen')} <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">/{slug}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field>
            <FieldLabel>{t('brand')}</FieldLabel>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              value={selectedBrandId}
              onChange={(event) => setSelectedBrandId(event.target.value)}
            >
              <option value="standard">{t('standardQr')}</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                  {brand.isDefault ? ' (Default)' : ''}
                </option>
              ))}
            </select>
            <FieldDescription>
              {t('brandHelp')}
            </FieldDescription>
          </Field>

          {selectedBrand ? (
            <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
              <BrandLogo name={selectedBrand.name} logoUrl={selectedBrand.logoUrl} className="size-12 rounded-xl" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{selectedBrand.name}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Palette className="size-3.5" />
                  <div
                    className="size-4 rounded-full border"
                    style={{ backgroundColor: selectedBrand.qrForeground }}
                    aria-hidden="true"
                  />
                  <div
                    className="size-4 rounded-full border"
                    style={{ backgroundColor: selectedBrand.qrBackground }}
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    {selectedBrand.qrForeground} / {selectedBrand.qrBackground}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col items-center gap-3">
            <div className="flex w-full justify-center rounded-lg border bg-white p-3">
              {qrUrl ? (
                <canvas ref={handleCanvasRef} className="block h-auto max-w-full" />
              ) : (
                <div className="flex h-[280px] w-[280px] items-center justify-center text-center text-sm text-muted-foreground">
                  {t('loadingUrl')}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="flex w-full max-w-full items-center justify-center gap-1.5 break-all px-2 text-center text-xs text-muted-foreground transition-colors whitespace-normal hover:text-foreground"
            >
              <Copy className="h-3 w-3" />
              {shortUrl}
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button size="sm" className="w-full sm:w-auto" onClick={handleDownload} disabled={!qrUrl}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {tc('downloadPng')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
