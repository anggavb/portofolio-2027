import { describe, expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

import {
  MANUAL_THEME_TTL_MS,
  resolveEffectiveTheme,
  resolveUtc7Theme,
  serializeThemeOverride,
} from '../src/lib/theme';
import { contrastRatio, SWISS_TOKENS } from '../src/lib/contrast';
import {
  CLIENT_TTL_MS,
  fetchGitHubTelemetry,
  RATE_LIMIT_COOLDOWN_MS,
  revalidateClientGitHubTelemetry,
  TRANSIENT_ERROR_COOLDOWN_MS,
  type GitHubSnapshot,
} from '../src/lib/github';
import {
  buildMailtoHref,
  CONTACT_DRAFT_KEY,
  formatDraftForClipboard,
  isFormspreeConfigured,
  loadContactDraft,
  submitContactToFormspree,
  validateContactPayload,
} from '../src/lib/contact';
import { filterWorkItems } from '../src/lib/projects-filter';
import { PORTFOLIO_DICTIONARY } from '../src/data/portfolio';

class MemoryStorage {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

const PROJECT_ROOT = resolve(import.meta.dir, '..');
const DIST_DIR = join(PROJECT_ROOT, 'dist');

function collectFilesRecursive(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFilesRecursive(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

describe('AC-01: Deterministic UTC+7 Auto Theme & Manual Override TTL', () => {
  test('evaluates exact UTC+7 boundary timestamps accurately', () => {
    // 04:59:59 UTC+7 === 21:59:59 UTC previous day -> dark
    expect(resolveUtc7Theme(Date.parse('2026-11-01T21:59:59Z'))).toBe('dark');
    // 05:00:00 UTC+7 === 22:00:00 UTC previous day -> light
    expect(resolveUtc7Theme(Date.parse('2026-11-01T22:00:00Z'))).toBe('light');
    // 16:59:59 UTC+7 === 09:59:59 UTC same day -> light
    expect(resolveUtc7Theme(Date.parse('2026-11-02T09:59:59Z'))).toBe('light');
    // 17:00:00 UTC+7 === 10:00:00 UTC same day -> dark
    expect(resolveUtc7Theme(Date.parse('2026-11-02T10:00:00Z'))).toBe('dark');
  });

  test('remains invariant across simulated process timezones (UTC, America/New_York, Asia/Tokyo)', () => {
    const originalTz = process.env.TZ;
    const noonUtc7 = Date.parse('2026-11-02T05:00:00Z'); // 12:00:00 UTC+7 -> light
    const midnightUtc7 = Date.parse('2026-11-02T17:00:00Z'); // 00:00:00 UTC+7 -> dark
    try {
      for (const tz of ['UTC', 'America/New_York', 'Asia/Tokyo']) {
        process.env.TZ = tz;
        expect(resolveUtc7Theme(noonUtc7)).toBe('light');
        expect(resolveUtc7Theme(midnightUtc7)).toBe('dark');
      }
    } finally {
      if (originalTz === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = originalTz;
      }
    }
  });

  test('respects 12-hour manual override TTL and reverts to auto UTC+7 after expiry', () => {
    // 20:00 UTC+7 (13:00Z): auto is dark; pin dark, then 12h + 1ms later is 08:00:00.001 UTC+7 (auto = light)
    const baseNow = Date.parse('2026-11-02T13:00:00Z');
    const rawDark = serializeThemeOverride('dark', baseNow);
    expect(resolveEffectiveTheme(rawDark, baseNow + 1000)).toEqual({
      mode: 'dark',
      resolved: 'dark',
    });
    expect(resolveEffectiveTheme(rawDark, baseNow + MANUAL_THEME_TTL_MS + 1)).toEqual({
      mode: 'auto',
      resolved: 'light',
    });
    expect(serializeThemeOverride('auto', baseNow)).toBeNull();
  });
});

describe('AC-02, AC-03, AC-04, AC-05, AC-08: Content Accuracy, Anti-Slop & Conditional Modules', () => {
  test('places BRI first with Owner-Confirmed provenance and preserves reverse chronology across 6 roles', () => {
    for (const locale of ['id', 'en'] as const) {
      const roles = PORTFOLIO_DICTIONARY[locale].experience.items;
      expect(roles).toHaveLength(6);
      expect(roles[0]?.company).toContain('PT Bank Rakyat Indonesia (Persero) Tbk (BRI)');
      expect(roles[0]?.isCurrent).toBe(true);
      expect(roles[0]?.stack).toEqual(['Golang Microservice', 'MySQL', 'Next.js', 'Redis']);
      expect(roles[1]?.company).toBe('Koda Tech Academy');
      expect(roles[2]?.company).toBe('PT Centrinova Solusi Edukasi');
      expect(roles[3]?.company).toContain('Bappenas');
      expect(roles[4]?.company).toBe('PT Medika Solusi Pratamajaya');
      expect(roles[5]?.company).toBe('PT Exa Mitra Solusi');
    }
  });

  test('includes all 8 curated works, 5 lab explorations, 5 skill categories, and zero live-demo links', () => {
    for (const locale of ['id', 'en'] as const) {
      const dict = PORTFOLIO_DICTIONARY[locale];
      expect(dict.works.items).toHaveLength(8);
      expect(dict.lab.explorations).toHaveLength(5);
      expect(dict.skills.categories).toHaveLength(5);
      expect(dict.education.items).toHaveLength(3);
      expect(dict.education.certifications).toHaveLength(0);
      expect(dict.education.recommendations).toHaveLength(0);

      for (const work of dict.works.items) {
        for (const repo of work.repos) {
          expect(repo.url.startsWith('https://github.com/anggavb/')).toBe(true);
          expect(/demo|vercel\.app|netlify\.app/i.test(repo.url)).toBe(false);
          expect(/live demo|visit app/i.test(repo.label)).toBe(false);
        }
      }
    }
  });

  test('built HTML contains zero progress bars, zero retro fonts, zero em-dashes, zero leaked phone, and auto-hides empty LinkedIn sections', () => {
    for (const route of ['id', 'en']) {
      const html = readFileSync(join(DIST_DIR, route, 'index.html'), 'utf8');
      expect(html).not.toContain('VT323');
      expect(html).not.toContain('Pixelify Sans');
      expect(html).not.toContain('<progress');
      expect(html).not.toContain('role="progressbar"');
      expect(html).not.toContain('\u2014'); // zero em-dashes
      expect(html).not.toContain('6285156770131');
      expect(html).not.toContain('085156770131');
      expect(html).not.toContain('id="certifications"');
      expect(html).not.toContain('id="recommendations"');
      expect(html).not.toContain('href="#certifications"');
      expect(html).not.toContain('href="#recommendations"');
      expect(/live demo|visit app/i.test(html)).toBe(false);
    }
  });
});

describe('AC-06: Static Bilingual HTML (/id/ & /en/), Metadata & Sitemap Protocol Hierarchy', () => {
  test('renders 100% translated static HTML without JS execution and exact SEO/hreflang tags', () => {
    const idHtml = readFileSync(join(DIST_DIR, 'id', 'index.html'), 'utf8');
    const enHtml = readFileSync(join(DIST_DIR, 'en', 'index.html'), 'utf8');

    expect(idHtml).toContain('<html lang="id"');
    expect(idHtml).toContain('<link rel="canonical" href="https://anggavb.my.id/id/"');
    expect(idHtml).toContain('property="og:locale" content="id_ID"');
    expect(idHtml).toContain('property="og:url" content="https://anggavb.my.id/id/"');
    expect(idHtml).toContain('Pengalaman Profesional');
    expect(idHtml).toContain('Dikonfirmasi Pemilik Profil');

    expect(enHtml).toContain('<html lang="en"');
    expect(enHtml).toContain('<link rel="canonical" href="https://anggavb.my.id/en/"');
    expect(enHtml).toContain('property="og:locale" content="en_US"');
    expect(enHtml).toContain('property="og:url" content="https://anggavb.my.id/en/"');
    expect(enHtml).toContain('Professional Experience');
    expect(enHtml).toContain('Owner-Confirmed');

    for (const html of [idHtml, enHtml]) {
      expect(html).toContain('hreflang="id" href="https://anggavb.my.id/id/"');
      expect(html).toContain('hreflang="en" href="https://anggavb.my.id/en/"');
      expect(html).toContain('hreflang="x-default" href="https://anggavb.my.id/id/"');
      expect(html).toContain('name="referrer" content="strict-origin-when-cross-origin"');
    }
  });

  test('separates robots.txt -> sitemap-index.xml (<sitemapindex>) -> sitemap-0.xml (<urlset>)', () => {
    const robots = readFileSync(join(DIST_DIR, 'robots.txt'), 'utf8');
    const sitemapIndex = readFileSync(join(DIST_DIR, 'sitemap-index.xml'), 'utf8');
    const sitemapPage = readFileSync(join(DIST_DIR, 'sitemap-0.xml'), 'utf8');

    expect(robots).toContain('Sitemap: https://anggavb.my.id/sitemap-index.xml');

    expect(sitemapIndex).toContain('<sitemapindex');
    expect(sitemapIndex).toContain('<loc>https://anggavb.my.id/sitemap-0.xml</loc>');
    expect(sitemapIndex).not.toContain('<urlset');
    expect(sitemapIndex).not.toContain('<url>');

    expect(sitemapPage).toContain('<urlset');
    expect(sitemapPage).toContain('<loc>https://anggavb.my.id/id/</loc>');
    expect(sitemapPage).toContain('<loc>https://anggavb.my.id/en/</loc>');
    expect(sitemapPage).toContain('hreflang="id" href="https://anggavb.my.id/id/"');
    expect(sitemapPage).toContain('hreflang="en" href="https://anggavb.my.id/en/"');
    expect(sitemapPage).toContain('hreflang="x-default" href="https://anggavb.my.id/id/"');
    expect(sitemapPage).not.toContain('<loc>https://anggavb.my.id/</loc>');
  });
});

describe('AC-07: Project Filtering, CV Download Asset & Formspree Client Contract', () => {
  test('filters works accurately across categories and returns empty array for unmatched filter', () => {
    const works = PORTFOLIO_DICTIONARY.id.works.items;
    expect(filterWorkItems(works, 'all')).toHaveLength(8);
    expect(filterWorkItems(works, 'enterprise')).toHaveLength(5);
    expect(filterWorkItems(works, 'golang')).toHaveLength(4);
    expect(filterWorkItems(works, 'laravel')).toHaveLength(4);
    expect(filterWorkItems(works, 'nonexistent')).toHaveLength(0);
  });

  test('ships valid PDF CV file in dist/cv/CV-Angga-VB-Fullstack-Developer.pdf', () => {
    const pdfPath = join(DIST_DIR, 'cv', 'CV-Angga-VB-Fullstack-Developer.pdf');
    expect(existsSync(pdfPath)).toBe(true);
    const buf = readFileSync(pdfPath);
    expect(buf.byteLength).toBeGreaterThan(50_000);
    expect(buf.subarray(0, 5).toString('ascii')).toBe('%PDF-');
  });

  test('detects unconfigured Formspree ID and renders explicit unconfigured state by default', () => {
    expect(isFormspreeConfigured('')).toBe(false);
    expect(isFormspreeConfigured(undefined)).toBe(false);
    expect(isFormspreeConfigured('your_form_id')).toBe(false);
    expect(isFormspreeConfigured('xabcdefg')).toBe(true);

    const idHtml = readFileSync(join(DIST_DIR, 'id', 'index.html'), 'utf8');
    expect(idHtml).toContain('data-form-unconfigured');
    expect(idHtml).toContain('Konfigurasi formulir belum aktif');
  });

  test('enforces client validation bounds, honeypot interception, 0 auto-retries, and draft preservation across 422/429/500/timeout', async () => {
    const messages = PORTFOLIO_DICTIONARY.en.contact.validation;

    const invalidCheck = validateContactPayload(
      {
        name: ' A ',
        email: 'bad-email',
        subject: 'Hi',
        message: 'Too short',
        _gotcha: '',
      },
      messages,
    );
    expect(invalidCheck.valid).toBe(false);
    expect(Object.keys(invalidCheck.fieldErrors)).toEqual(['name', 'email', 'subject', 'message']);

    const botCheck = validateContactPayload(
      {
        name: 'Bot',
        email: 'bot@example.com',
        subject: 'Spam offer',
        message: ' automated spam message payload exceeding twenty chars ',
        _gotcha: 'filled-by-bot',
      },
      messages,
    );
    expect(botCheck.isBotHoneypot).toBe(true);

    const validPayload = {
      name: '  Budi Santoso  ',
      email: '  budi@company.co.id  ',
      subject: '  Senior Fullstack Engineer Role  ',
      message: '  Hello Angga, we would love to invite you for an architecture discussion next week.  ',
      _gotcha: '',
    };

    // 1. Simulated HTTP 422 server validation error -> maps field errors, 1 fetch call, preserves draft
    const storage422 = new MemoryStorage();
    let calls422 = 0;
    const res422 = await submitContactToFormspree({
      formId: 'xtest123',
      payload: validPayload,
      messages,
      storage: storage422,
      fetchImpl: (async () => {
        calls422 += 1;
        return new Response(
          JSON.stringify({
            error: 'Validation errors',
            errors: [{ field: 'email', code: 'TYPE_EMAIL', message: 'should be an email' }],
          }),
          { status: 422, headers: { 'Content-Type': 'application/json' } },
        );
      }) as unknown as typeof fetch,
    });
    expect(calls422).toBe(1);
    expect(res422.status).toBe('validation_error');
    if (res422.status === 'validation_error') {
      expect(res422.fieldErrors.email).toBe('should be an email');
    }
    expect(loadContactDraft(storage422)?.message).toContain('Hello Angga');

    // 2. Simulated HTTP 429 rate-limit -> 0 retries (1 fetch call), preserves draft
    const storage429 = new MemoryStorage();
    let calls429 = 0;
    const res429 = await submitContactToFormspree({
      formId: 'xtest123',
      payload: validPayload,
      messages,
      storage: storage429,
      fetchImpl: (async () => {
        calls429 += 1;
        return new Response('{}', { status: 429 });
      }) as unknown as typeof fetch,
    });
    expect(calls429).toBe(1);
    expect(res429.status).toBe('rate_limited');
    expect(loadContactDraft(storage429)?.email).toContain('budi@company.co.id');

    // 3. Simulated HTTP 500 & Abort timeout -> 0 retries, preserves draft, mailto & clipboard helpers work
    const storage500 = new MemoryStorage();
    let calls500 = 0;
    const res500 = await submitContactToFormspree({
      formId: 'xtest123',
      payload: validPayload,
      messages,
      storage: storage500,
      fetchImpl: (async () => {
        calls500 += 1;
        return new Response('Internal Error', { status: 500 });
      }) as unknown as typeof fetch,
    });
    expect(calls500).toBe(1);
    expect(res500).toEqual({ status: 'delivery_failed', reason: 'http_error', httpStatus: 500 });
    const preserved = loadContactDraft(storage500)!;
    expect(preserved.subject).toContain('Senior Fullstack Engineer Role');
    expect(buildMailtoHref('anggavb8@gmail.com', preserved)).toContain('mailto:anggavb8@gmail.com?subject=');
    expect(formatDraftForClipboard(preserved)).toContain('budi@company.co.id');

    const storageTimeout = new MemoryStorage();
    const resTimeout = await submitContactToFormspree({
      formId: 'xtest123',
      payload: validPayload,
      messages,
      storage: storageTimeout,
      timeoutMs: 30,
      fetchImpl: ((_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        })) as unknown as typeof fetch,
    });
    expect(resTimeout).toEqual({ status: 'delivery_failed', reason: 'timeout' });
    expect(storageTimeout.getItem(CONTACT_DRAFT_KEY)).not.toBeNull();

    // 4. Simulated HTTP 200 -> clears draft
    const res200 = await submitContactToFormspree({
      formId: 'xtest123',
      payload: validPayload,
      messages,
      storage: storageTimeout,
      fetchImpl: (async () =>
        new Response(JSON.stringify({ ok: true }), { status: 200 })) as unknown as typeof fetch,
    });
    expect(res200.status).toBe('success');
    expect(storageTimeout.getItem(CONTACT_DRAFT_KEY)).toBeNull();
  });
});

describe('AC-09: WCAG 2.1 AA sRGB Contrast Verification & #00ADD8 Cyan Restriction', () => {
  test('meets >= 4.5:1 for all text tokens and >= 3.0:1 for borderStrong and focusRing in Light and Dark modes', () => {
    for (const mode of ['light', 'dark'] as const) {
      const p = SWISS_TOKENS[mode];
      const surfaces = [p.bgCanvas, p.bgSurface, p.bgSubtle];
      const textTokens = [
        p.textPrimary,
        p.textSecondary,
        p.textMuted,
        p.accentPrimary,
        p.accentStatus,
        p.stateError,
      ];

      for (const bg of surfaces) {
        for (const fg of textTokens) {
          expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
        }
        expect(contrastRatio(p.borderStrong, bg)).toBeGreaterThanOrEqual(3.0);
        expect(contrastRatio(p.focusRing, bg)).toBeGreaterThanOrEqual(3.0);
      }

      // Brand cyan solid background paired with #09090B dark text must exceed 4.5:1 (actual ~7.55:1)
      expect(contrastRatio(p.accentBrandForeground, p.accentBrand)).toBeGreaterThanOrEqual(7.5);
    }

    // Confirm #00ADD8 indeed fails on white (< 3.0:1) and is never used as text/border/outline color in global.css
    expect(contrastRatio('#00ADD8', '#FFFFFF')).toBeLessThan(3.0);
    const css = readFileSync(join(PROJECT_ROOT, 'src', 'styles', 'global.css'), 'utf8');
    expect(css).not.toMatch(/(?:^|\s)color:\s*var\(--accent-brand\)/m);
    expect(css).not.toMatch(/border-color:\s*var\(--accent-brand\)/m);
    expect(css).not.toMatch(/outline[^;]*var\(--accent-brand\)/m);
  });
});

describe('AC-11: Bundle Size Budget (< 35 KB Gzipped) & Zero Leaked Secrets', () => {
  test('keeps total gzipped client JS under 35 KB and emits zero secrets in dist/', () => {
    const astroAssetsDir = join(DIST_DIR, '_astro');
    const jsFiles = existsSync(astroAssetsDir)
      ? readdirSync(astroAssetsDir).filter((f) => f.endsWith('.js'))
      : [];
    let totalGzipBytes = 0;
    for (const file of jsFiles) {
      const raw = readFileSync(join(astroAssetsDir, file));
      totalGzipBytes += gzipSync(raw).byteLength;
    }
    expect(totalGzipBytes).toBeGreaterThan(0);
    expect(totalGzipBytes).toBeLessThan(35 * 1024);

    const allDistFiles = collectFilesRecursive(DIST_DIR).filter(
      (f) => !f.endsWith('.pdf') && !f.endsWith('.png') && !f.endsWith('.woff2'),
    );
    for (const file of allDistFiles) {
      const text = readFileSync(file, 'utf8');
      expect(text).not.toContain('GITHUB_TOKEN');
      expect(text).not.toMatch(/ghp_[A-Za-z0-9]{20,}/);
      expect(text).not.toMatch(/github_pat_[A-Za-z0-9_]{20,}/);
    }
  });
});

describe('AC-12: GitHub Pagination, <4 Non-Fork Exhaustion, Partial Rejection, Runtime Backoff & Offline Builds', () => {
  const mockProfile = {
    login: 'anggavb',
    html_url: 'https://github.com/anggavb',
    public_repos: 505,
    followers: 15,
  };

  function makeRepo(name: string, fork: boolean, pushedAt: string) {
    return {
      name,
      html_url: `https://github.com/anggavb/${name}`,
      description: `Repo ${name}`,
      language: 'Go',
      fork,
      pushed_at: pushedAt,
      stargazers_count: 1,
    };
  }

  test('1. traverses >= 5 pages of fork-only repos via rel="next" until collecting top 4 non-fork repos', async () => {
    const mockFetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/users/anggavb')) {
        return new Response(JSON.stringify(mockProfile), { status: 200 });
      }
      const page = Number(new URL(url).searchParams.get('page') ?? '1');
      if (page <= 4) {
        const forks = Array.from({ length: 100 }, (_, idx) =>
          makeRepo(`fork-p${page}-${idx}`, true, '2026-10-01T00:00:00Z'),
        );
        return new Response(JSON.stringify(forks), {
          status: 200,
          headers: {
            Link: `<https://api.github.com/users/anggavb/repos?per_page=100&page=${page + 1}>; rel="next"`,
          },
        });
      }
      const page5 = [
        makeRepo('nonfork-1', false, '2026-10-25T10:00:00Z'),
        makeRepo('nonfork-2', false, '2026-10-24T10:00:00Z'),
        makeRepo('nonfork-3', false, '2026-10-23T10:00:00Z'),
        makeRepo('nonfork-4', false, '2026-10-22T10:00:00Z'),
        makeRepo('nonfork-5', false, '2026-10-21T10:00:00Z'),
      ];
      return new Response(JSON.stringify(page5), { status: 200 });
    }) as unknown as typeof fetch;

    const result = await fetchGitHubTelemetry({
      fetchImpl: mockFetch,
      maxPages: 10,
      timeoutMs: 5000,
      nowIso: '2026-11-01T12:00:00.000Z',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.pagesFetched).toBe(5);
      expect(result.snapshot.recentRepos.map((r) => r.name)).toEqual([
        'nonfork-1',
        'nonfork-2',
        'nonfork-3',
        'nonfork-4',
      ]);
    }
  });

  test('2. succeeds cleanly when an account genuinely has < 4 non-fork repos upon list exhaustion', async () => {
    const mockFetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/users/anggavb')) {
        return new Response(JSON.stringify({ ...mockProfile, public_repos: 12 }), { status: 200 });
      }
      const repos = [
        makeRepo('fork-a', true, '2026-10-20T00:00:00Z'),
        makeRepo('real-1', false, '2026-10-19T00:00:00Z'),
        makeRepo('real-2', false, '2026-10-18T00:00:00Z'),
      ];
      return new Response(JSON.stringify(repos), { status: 200 });
    }) as unknown as typeof fetch;

    const result = await fetchGitHubTelemetry({
      fetchImpl: mockFetch,
      maxPages: 5,
      timeoutMs: 5000,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.snapshot.recentRepos).toHaveLength(2);
      expect(result.snapshot.recentRepos.map((r) => r.name)).toEqual(['real-1', 'real-2']);
    }
  });

  test('3. rejects partial pagination on mid-traversal failure or circuit-breaker stop and preserves prior fetchedAt', async () => {
    const initialSnapshot: GitHubSnapshot = {
      fetchedAt: '2026-11-01T06:00:00.000Z',
      profile: {
        login: 'anggavb',
        html_url: 'https://github.com/anggavb',
        public_repos: 73,
        followers: 7,
      },
      recentRepos: [
        {
          name: 'tickitz-backend',
          html_url: 'https://github.com/anggavb/tickitz-backend',
          description: 'Backend',
          language: 'Go',
          pushed_at: '2026-06-20T00:00:00Z',
          stargazers_count: 2,
        },
      ],
    };

    // Circuit breaker hit at page 5 while only 2 non-forks found and rel="next" still present
    const breakerFetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/users/anggavb')) {
        return new Response(JSON.stringify(mockProfile), { status: 200 });
      }
      const page = Number(new URL(url).searchParams.get('page') ?? '1');
      const items =
        page === 1
          ? [
              makeRepo('partial-1', false, '2026-10-20T00:00:00Z'),
              makeRepo('partial-2', false, '2026-10-19T00:00:00Z'),
            ]
          : [makeRepo(`fork-p${page}`, true, '2026-10-01T00:00:00Z')];
      return new Response(JSON.stringify(items), {
        status: 200,
        headers: {
          Link: `<https://api.github.com/users/anggavb/repos?per_page=100&page=${page + 1}>; rel="next"`,
        },
      });
    }) as unknown as typeof fetch;

    const directRes = await fetchGitHubTelemetry({
      fetchImpl: breakerFetch,
      maxPages: 5,
      timeoutMs: 5000,
    });
    expect(directRes.ok).toBe(false);
    if (!directRes.ok) {
      expect(directRes.reason).toBe('partial_pagination');
    }

    const storage = new MemoryStorage();
    const staleNow = Date.parse('2026-11-01T08:30:00.000Z'); // > 60 min after 06:00Z
    const revalPartial = await revalidateClientGitHubTelemetry({
      buildSnapshot: initialSnapshot,
      storage,
      fetchImpl: breakerFetch,
      nowMs: staleNow,
      isOnline: true,
    });

    expect(revalPartial.updated).toBe(false);
    expect(revalPartial.snapshot?.fetchedAt).toBe('2026-11-01T06:00:00.000Z');
    expect(revalPartial.snapshot?.recentRepos[0]?.name).toBe('tickitz-backend');
    expect(revalPartial.cooldownUntil).toBe(staleNow + TRANSIENT_ERROR_COOLDOWN_MS);

    // Rate-limit 429 records >= 60 min cooldown and suppresses immediate retries
    const storage429 = new MemoryStorage();
    let rateCalls = 0;
    const rateLimitFetch = (async () => {
      rateCalls += 1;
      return new Response('Rate limited', {
        status: 429,
        headers: { 'Retry-After': '3600' },
      });
    }) as unknown as typeof fetch;

    const first429 = await revalidateClientGitHubTelemetry({
      buildSnapshot: initialSnapshot,
      storage: storage429,
      fetchImpl: rateLimitFetch,
      nowMs: staleNow,
      isOnline: true,
    });
    expect(rateCalls).toBe(1);
    expect(first429.updated).toBe(false);
    expect(first429.snapshot?.fetchedAt).toBe('2026-11-01T06:00:00.000Z');
    expect(first429.cooldownUntil).toBeGreaterThanOrEqual(staleNow + RATE_LIMIT_COOLDOWN_MS);

    // Second call 5 minutes later MUST NOT hit network during cooldown
    const secondDuringCooldown = await revalidateClientGitHubTelemetry({
      buildSnapshot: initialSnapshot,
      storage: storage429,
      fetchImpl: rateLimitFetch,
      nowMs: staleNow + 5 * 60 * 1000,
      isOnline: true,
    });
    expect(secondDuringCooldown.didFetch).toBe(false);
    expect(rateCalls).toBe(1);

    // Fresh snapshot within 60-min TTL also skips network call
    const freshStorage = new MemoryStorage();
    const freshNow = Date.parse(initialSnapshot.fetchedAt) + CLIENT_TTL_MS - 1000;
    const freshCheck = await revalidateClientGitHubTelemetry({
      buildSnapshot: initialSnapshot,
      storage: freshStorage,
      fetchImpl: rateLimitFetch,
      nowMs: freshNow,
      isOnline: true,
    });
    expect(freshCheck.didFetch).toBe(false);
    expect(rateCalls).toBe(1);
  });

  test('4. executes offline astro build both WITH snapshot and WITHOUT snapshot (first-build failure) exiting 0 without fake zeros', () => {
    const astroCli = join(PROJECT_ROOT, 'node_modules', 'astro', 'astro.js');
    const outWithSnap = join(PROJECT_ROOT, 'dist-test-with-snap');
    const outNoSnap = join(PROJECT_ROOT, 'dist-test-no-snap');

    try {
      const trackedSnapshot = JSON.parse(
        readFileSync(join(PROJECT_ROOT, 'src', 'data', 'github-snapshot.json'), 'utf8'),
      ) as GitHubSnapshot;

      // Offline build WITH existing snapshot
      execFileSync(process.execPath, [join(PROJECT_ROOT, 'scripts', 'sync-github-snapshot.mjs')], {
        cwd: PROJECT_ROOT,
        env: { ...process.env, GITHUB_SYNC_OFFLINE: '1' },
      });
      execFileSync(process.execPath, [astroCli, 'build', '--outDir', outWithSnap], {
        cwd: PROJECT_ROOT,
        env: { ...process.env, GITHUB_SYNC_OFFLINE: '1' },
      });

      const withSnapIdHtml = readFileSync(join(outWithSnap, 'id', 'index.html'), 'utf8');
      expect(withSnapIdHtml).toContain(String(trackedSnapshot.profile.public_repos));
      expect(withSnapIdHtml).toContain(`data-raw-fetched-at="${trackedSnapshot.fetchedAt}"`);

      // Offline first-build WITHOUT snapshot
      execFileSync(process.execPath, [astroCli, 'build', '--outDir', outNoSnap], {
        cwd: PROJECT_ROOT,
        env: {
          ...process.env,
          GITHUB_SYNC_OFFLINE: '1',
          GITHUB_SNAPSHOT_PATH: 'src/data/__missing_snapshot_for_test__.json',
        },
      });

      const noSnapIdHtml = readFileSync(join(outNoSnap, 'id', 'index.html'), 'utf8');
      const noSnapEnHtml = readFileSync(join(outNoSnap, 'en', 'index.html'), 'utf8');

      expect(noSnapIdHtml).toContain('Data aktivitas GitHub belum tersedia');
      expect(noSnapIdHtml).toContain('https://github.com/anggavb');
      expect(noSnapEnHtml).toContain('GitHub activity data currently unavailable');
      expect(noSnapEnHtml).toContain('https://github.com/anggavb');

      // Metric cells must render '--' rather than invented '0' values
      const reposCellMatch = /data-gh-public-repos[^>]*>\s*([^<\s]+)\s*</.exec(noSnapIdHtml);
      const followersCellMatch = /data-gh-followers[^>]*>\s*([^<\s]+)\s*</.exec(noSnapIdHtml);
      expect(reposCellMatch?.[1]).toBe('--');
      expect(followersCellMatch?.[1]).toBe('--');
    } finally {
      rmSync(outWithSnap, { recursive: true, force: true });
      rmSync(outNoSnap, { recursive: true, force: true });
    }
  }, 45_000);
});
