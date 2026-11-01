export interface ThemePalette {
  bgCanvas: string;
  bgSurface: string;
  bgSubtle: string;
  borderGrid: string;
  borderStrong: string;
  focusRing: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentPrimary: string;
  accentBrand: string;
  accentBrandForeground: string;
  accentStatus: string;
  stateError: string;
}

export const SWISS_TOKENS: Record<'light' | 'dark', ThemePalette> = {
  light: {
    bgCanvas: '#FAFAFA',
    bgSurface: '#FFFFFF',
    bgSubtle: '#F4F4F5',
    borderGrid: '#E4E4E7',
    borderStrong: '#71717A',
    focusRing: '#0369A1',
    textPrimary: '#09090B',
    textSecondary: '#3F3F46',
    textMuted: '#52525B',
    accentPrimary: '#0369A1',
    accentBrand: '#00ADD8',
    accentBrandForeground: '#09090B',
    accentStatus: '#047857',
    stateError: '#B91C1C',
  },
  dark: {
    bgCanvas: '#09090B',
    bgSurface: '#121215',
    bgSubtle: '#18181B',
    borderGrid: '#27272A',
    borderStrong: '#A1A1AA',
    focusRing: '#38BDF8',
    textPrimary: '#FAFAFA',
    textSecondary: '#D4D4D8',
    textMuted: '#A1A1AA',
    accentPrimary: '#38BDF8',
    accentBrand: '#00ADD8',
    accentBrandForeground: '#09090B',
    accentStatus: '#34D399',
    stateError: '#F87171',
  },
};

export function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    throw new Error(`Expected 6-digit hex color, received: ${hex}`);
  }
  const r = Number.parseInt(cleaned.slice(0, 2), 16);
  const g = Number.parseInt(cleaned.slice(2, 4), 16);
  const b = Number.parseInt(cleaned.slice(4, 6), 16);
  return [r, g, b];
}

function srgbChannelToLinear(channel8Bit: number): number {
  const s = channel8Bit / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (
    0.2126 * srgbChannelToLinear(r) +
    0.7152 * srgbChannelToLinear(g) +
    0.0722 * srgbChannelToLinear(b)
  );
}

export function contrastRatio(foregroundHex: string, backgroundHex: string): number {
  const l1 = relativeLuminance(foregroundHex);
  const l2 = relativeLuminance(backgroundHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
