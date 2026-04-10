'use client';

import * as React from 'react';
import QRCode from 'qrcode';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LinkQrDialogProps {
  shortUrl: string;
  slug: string;
  opened: boolean;
  onOpened: (opened: boolean) => void;
}

export function LinkQrDialog({ shortUrl, slug, opened, onOpened }: LinkQrDialogProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const qrUrl = shortUrl ? `${shortUrl}?qr=1` : '';

  const renderQrCode = React.useCallback(async (canvas: HTMLCanvasElement) => {
    if (!qrUrl) {
      const context = canvas.getContext('2d');
      context?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    try {
      await QRCode.toCanvas(canvas, qrUrl, {
        width: 280,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
    } catch {
      toast.error('Could not generate QR code');
    }
  }, [qrUrl]);

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
      toast.error('Short URL is still loading');
      return;
    }

    // Re-render at higher resolution for download
    const downloadCanvas = document.createElement('canvas');
    QRCode.toCanvas(downloadCanvas, qrUrl, {
      width: 1024,
      margin: 3,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }, () => {
      const link = document.createElement('a');
      link.download = `qr-${slug}.png`;
      link.href = downloadCanvas.toDataURL('image/png');
      link.click();
    });
  }, [qrUrl, slug]);

  const handleCopyUrl = React.useCallback(() => {
    if (!shortUrl) {
      toast.error('Short URL is still loading');
      return;
    }

    navigator.clipboard.writeText(shortUrl);
    toast.success('Short URL copied to clipboard');
  }, [shortUrl]);

  return (
    <Dialog open={opened} onOpenChange={onOpened}>
      <DialogContent className="overflow-hidden sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>
            Scan to open <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">/{slug}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3">
          <div className="flex w-full justify-center rounded-lg border bg-white p-3">
            {qrUrl ? (
              <canvas ref={handleCanvasRef} className="block h-auto max-w-full" />
            ) : (
              <div className="flex h-[280px] w-[280px] items-center justify-center text-center text-sm text-muted-foreground">
                Loading short URL...
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

        <DialogFooter>
          <Button size="sm" className="w-full sm:w-auto" onClick={handleDownload} disabled={!qrUrl}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
