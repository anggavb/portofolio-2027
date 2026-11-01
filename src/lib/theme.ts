export type ThemeMode = 'auto' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export interface StoredThemeOverride {
  mode: ResolvedTheme;
  expiresAt: number;
}

// Asia/Jakarta (WIB) has a fixed UTC+7 offset year-round with no DST.
export const UTC7_OFFSET_MS = 7 * 3600 * 1000;
export const MANUAL_THEME_TTL_MS = 12 * 3600 * 1000;
export const THEME_STORAGE_KEY = 'portfolio-theme-v1';

export function resolveUtc7Theme(nowMs: number = Date.now()): ResolvedTheme {
  const utc7Hour = new Date(nowMs + UTC7_OFFSET_MS).getUTCHours();
  return utc7Hour >= 5 && utc7Hour < 17 ? 'light' : 'dark';
}

export function getUtc7Clock(nowMs: number = Date.now()): {
  hours: number;
  minutes: number;
  formatted: string;
} {
  const shifted = new Date(nowMs + UTC7_OFFSET_MS);
  const hours = shifted.getUTCHours();
  const minutes = shifted.getUTCMinutes();
  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} UTC+7`;
  return { hours, minutes, formatted };
}

export function parseStoredThemeOverride(
  raw: string | null,
  nowMs: number = Date.now(),
): ResolvedTheme | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const record = parsed as Record<string, unknown>;
    const mode = record.mode;
    const expiresAt = record.expiresAt;
    if ((mode !== 'light' && mode !== 'dark') || typeof expiresAt !== 'number') {
      return null;
    }
    if (!Number.isFinite(expiresAt) || expiresAt <= nowMs) {
      return null;
    }
    return mode;
  } catch {
    return null;
  }
}

export function serializeThemeOverride(
  mode: ThemeMode,
  nowMs: number = Date.now(),
): string | null {
  if (mode === 'auto') return null;
  const payload: StoredThemeOverride = {
    mode,
    expiresAt: nowMs + MANUAL_THEME_TTL_MS,
  };
  return JSON.stringify(payload);
}

export function resolveEffectiveTheme(
  rawOverride: string | null,
  nowMs: number = Date.now(),
): { mode: ThemeMode; resolved: ResolvedTheme } {
  const manual = parseStoredThemeOverride(rawOverride, nowMs);
  if (manual) {
    return { mode: manual, resolved: manual };
  }
  return { mode: 'auto', resolved: resolveUtc7Theme(nowMs) };
}

// Inline synchronous <head> initializer kept minimal to prevent FOUC before first paint.
export const HEAD_THEME_INIT_SCRIPT = `(function(){var d=document.documentElement,m='auto',r,n=Date.now();try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');if(s){var p=JSON.parse(s);if(p&&(p.mode==='light'||p.mode==='dark')&&typeof p.expiresAt==='number'&&p.expiresAt>n){m=p.mode;r=p.mode;}else{localStorage.removeItem('${THEME_STORAGE_KEY}');}}}catch(e){}if(!r){var h=new Date(n+25200000).getUTCHours();r=(h>=5&&h<17)?'light':'dark';}d.dataset.theme=r;d.dataset.themeMode=m;d.classList.toggle('dark',r==='dark');var c=document.querySelector('meta[name="color-scheme"]');if(c){c.setAttribute('content',r);}})();`;
