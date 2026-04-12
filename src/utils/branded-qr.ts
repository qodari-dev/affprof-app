import QRCode from 'qrcode';

export interface BrandedQrOptions {
  qrUrl: string;
  size: number;
  margin?: number;
  foreground: string;
  background: string;
  logoUrl?: string | null;
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load brand logo'));
    image.src = src;
  });
}

export async function renderBrandedQrToCanvas(
  canvas: HTMLCanvasElement,
  options: BrandedQrOptions,
) {
  const {
    qrUrl,
    size,
    margin = 2,
    foreground,
    background,
    logoUrl,
  } = options;

  await QRCode.toCanvas(canvas, qrUrl, {
    width: size,
    margin,
    color: { dark: foreground, light: background },
    errorCorrectionLevel: logoUrl ? 'H' : 'M',
  });

  if (!logoUrl) {
    return;
  }

  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  try {
    const logo = await loadImage(logoUrl);
    const logoSize = Math.round(size * 0.18);
    const logoPadding = Math.max(10, Math.round(size * 0.02));
    const plateSize = logoSize + logoPadding * 2;
    const plateX = Math.round((canvas.width - plateSize) / 2);
    const plateY = Math.round((canvas.height - plateSize) / 2);

    context.save();
    context.fillStyle = '#FFFFFF';
    context.shadowColor = 'rgba(15, 23, 42, 0.14)';
    context.shadowBlur = Math.max(10, Math.round(size * 0.03));
    context.shadowOffsetY = Math.max(2, Math.round(size * 0.008));
    drawRoundedRect(context, plateX, plateY, plateSize, plateSize, Math.round(plateSize * 0.18));
    context.fill();
    context.restore();

    context.save();
    context.beginPath();
    drawRoundedRect(
      context,
      plateX + logoPadding,
      plateY + logoPadding,
      logoSize,
      logoSize,
      Math.round(logoSize * 0.16),
    );
    context.clip();
    context.drawImage(logo, plateX + logoPadding, plateY + logoPadding, logoSize, logoSize);
    context.restore();
  } catch {
    // If the brand logo cannot be loaded, keep the QR usable without blocking download.
  }
}
