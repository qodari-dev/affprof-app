import type { CSSProperties } from 'react';

export const TAG_COLOR_PALETTE = [
  { value: '#EF4444', label: 'Red' },
  { value: '#F97316', label: 'Orange' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#EAB308', label: 'Yellow' },
  { value: '#84CC16', label: 'Lime' },
  { value: '#22C55E', label: 'Green' },
  { value: '#10B981', label: 'Emerald' },
  { value: '#14B8A6', label: 'Teal' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#6366F1', label: 'Indigo' },
  { value: '#8B5CF6', label: 'Violet' },
  { value: '#D946EF', label: 'Fuchsia' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#6B7280', label: 'Gray' },
] as const;

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');

  if (normalized.length !== 6) {
    return { r: 107, g: 114, b: 128 };
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mix(hex: string, target: 'black' | 'white', amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const base = target === 'black' ? 0 : 255;

  const mixChannel = (value: number) => Math.round(value * (1 - amount) + base * amount);

  return `rgb(${mixChannel(r)}, ${mixChannel(g)}, ${mixChannel(b)})`;
}

export function isLightTagColor(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160;
}

export function getTagBadgeStyle(hex: string): CSSProperties {
  const isLight = isLightTagColor(hex);

  return {
    backgroundColor: rgba(hex, isLight ? 0.22 : 0.14),
    borderColor: rgba(hex, isLight ? 0.42 : 0.28),
    color: isLight ? mix(hex, 'black', 0.62) : mix(hex, 'black', 0.08),
  };
}

export function getTagSwatchStyle(hex: string): CSSProperties {
  return {
    backgroundColor: hex,
    boxShadow: `inset 0 0 0 1px ${rgba(hex, 0.12)}`,
  };
}

/**
 * Deterministically picks a color from the palette (excluding gray) based on
 * the tag name. Same name always gets the same color; different names spread
 * across the full palette.
 */
export function pickTagColor(name: string): string {
  const palette = TAG_COLOR_PALETTE.filter((c) => c.value !== '#6B7280');
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0; // keep it unsigned 32-bit
  }
  return palette[hash % palette.length].value;
}
