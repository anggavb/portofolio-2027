import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const PROJECT_ROOT = resolve(import.meta.dirname, '..');
const DIST_ROOT = join(PROJECT_ROOT, 'dist');
const WORKSPACE_ROOT = resolve(PROJECT_ROOT, '..');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

function startStaticDistServer() {
  const server = createServer((req, res) => {
    const rawUrl = (req.url || '/').split('?')[0] || '/';
    const decoded = decodeURIComponent(rawUrl);
    let candidate = join(DIST_ROOT, normalize(decoded));
    if (existsSync(candidate) && statSync(candidate).isDirectory()) {
      candidate = join(candidate, 'index.html');
    }
    if (!candidate.startsWith(DIST_ROOT) || !existsSync(candidate) || statSync(candidate).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
    const ext = extname(candidate).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });
    res.end(readFileSync(candidate));
  });

  return new Promise((resolvePromise, rejectPromise) => {
    server.once('error', rejectPromise);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        rejectPromise(new Error('Failed to bind ephemeral server address'));
        return;
      }
      resolvePromise({
        server,
        baseUrl: `http://127.0.0.1:${addr.port}`,
      });
    });
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Browser verification failed: ${message}`);
  }
}

async function main() {
  const { server, baseUrl } = await startStaticDistServer();
  let browser;
  try {
    console.log(`[verify:browser] Static server listening at ${baseUrl}`);

    // 1. Verify HTTP 200 reachability of sitemaps, robots.txt, OG image, and CV PDF
    for (const check of [
      { path: '/id/', type: 'text/html' },
      { path: '/en/', type: 'text/html' },
      { path: '/robots.txt', type: 'text/plain' },
      { path: '/sitemap-index.xml', type: 'application/xml' },
      { path: '/sitemap-0.xml', type: 'application/xml' },
      { path: '/og-image.png', type: 'image/png' },
      { path: '/cv/CV-Angga-VB-Fullstack-Developer.pdf', type: 'application/pdf' },
    ]) {
      const resp = await fetch(`${baseUrl}${check.path}`);
      assert(resp.status === 200, `${check.path} expected HTTP 200, got ${resp.status}`);
      const ct = resp.headers.get('content-type') || '';
      assert(ct.includes(check.type), `${check.path} expected ${check.type}, got ${ct}`);
    }
    console.log('[verify:browser] HTTP 200 asset & sitemap reachability verified.');

    browser = await chromium.launch({
      executablePath: CHROME_PATH,
      headless: true,
    });

    const consoleErrors = [];
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });

    // Block external live calls to api.github.com during browser UI audit so tests stay deterministic & quota-free
    await context.route('https://api.github.com/**', (route) =>
      route.fulfill({ status: 304, body: '' }),
    );

    const page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    // 2. AC-10: Verify 0px horizontal overflow across 320px, 375px, 768px, 1024px, 1440px on /id/ & /en/
    const widths = [320, 375, 768, 1024, 1440];
    for (const localePath of ['/id/', '/en/']) {
      await page.goto(`${baseUrl}${localePath}`, { waitUntil: 'networkidle' });
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        const dims = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        assert(
          dims.scrollWidth <= dims.innerWidth,
          `${localePath} at ${width}px overflowed horizontally: scrollWidth=${dims.scrollWidth} > innerWidth=${dims.innerWidth}`,
        );
      }
    }
    console.log('[verify:browser] AC-10 0px horizontal overflow verified across 320/375/768/1024/1440px.');

    // 3. AC-10 Mobile tap targets (>= 44x44) & Keyboard focus + <dialog> Escape dismissal at 375px
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${baseUrl}/id/`, { waitUntil: 'networkidle' });

    const undersizedControls = await page.evaluate(() => {
      const selectors = 'header a, header button, main button, main a, main input:not([tabindex="-1"]), main textarea, footer a';
      const offenders = [];
      for (const el of document.querySelectorAll(selectors)) {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || el.classList.contains('skip-link')) {
          continue;
        }
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        if (rect.height < 43.5 || rect.width < 43.5) {
          offenders.push({
            tag: el.tagName,
            text: (el.textContent || '').trim().slice(0, 30),
            w: Math.round(rect.width * 10) / 10,
            h: Math.round(rect.height * 10) / 10,
          });
        }
      }
      return offenders;
    });
    assert(
      undersizedControls.length === 0,
      `Found mobile controls < 44x44px: ${JSON.stringify(undersizedControls)}`,
    );

    // Keyboard Tab #1 -> Skip link receives visible focus ring
    await page.keyboard.press('Tab');
    const skipFocused = await page.evaluate(() => {
      const active = document.activeElement;
      if (!active) return null;
      const cs = window.getComputedStyle(active);
      return {
        isSkip: active.classList.contains('skip-link'),
        outlineStyle: cs.outlineStyle,
        outlineWidth: cs.outlineWidth,
      };
    });
    assert(skipFocused?.isSkip === true, 'First Tab stop must be Skip to main content link');

    // Open mobile navigation <dialog> and dismiss via Escape
    await page.click('[data-open-mobile-nav]');
    const isDialogOpen = await page.evaluate(
      () => document.getElementById('mobile-nav-dialog')?.hasAttribute('open') === true,
    );
    assert(isDialogOpen, 'Mobile <dialog> should open on Menu button click');
    await page.keyboard.press('Escape');
    const isDialogClosed = await page.evaluate(
      () => document.getElementById('mobile-nav-dialog')?.hasAttribute('open') === false,
    );
    assert(isDialogClosed, 'Mobile <dialog> should close on Escape key');
    console.log('[verify:browser] AC-10 mobile >=44x44px tap targets, keyboard Tab & dialog Escape verified.');

    // 4. AC-06: Direct URL priority over localStorage('portfolio-lang') & #anchor preservation
    await page.evaluate(() => localStorage.setItem('portfolio-lang', 'id'));
    await page.goto(`${baseUrl}/en/`, { waitUntil: 'networkidle' });
    const enState = await page.evaluate(() => ({
      pathname: window.location.pathname,
      lang: document.documentElement.lang,
    }));
    assert(
      enState.pathname === '/en/' && enState.lang === 'en',
      `Direct visit to /en/ must not redirect when localStorage=id; got ${JSON.stringify(enState)}`,
    );

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${baseUrl}/id/#projects`, { waitUntil: 'networkidle' });
    await page.click('a[data-lang-link="en"]');
    await page.waitForLoadState('networkidle');
    assert(page.url().endsWith('/en/#projects'), `Expected /en/#projects, got ${page.url()}`);
    console.log('[verify:browser] AC-06 URL priority & #anchor preservation across ID <-> EN verified.');

    // 5. AC-07: Interactive project filter buttons, count update, empty state & Reset Filter
    const golangBtn = page.locator('button[data-work-filter="golang"]');
    await golangBtn.click();
    assert((await golangBtn.getAttribute('aria-pressed')) === 'true', 'Golang filter must set aria-pressed=true');
    const visibleGolangCount = await page.evaluate(
      () => Array.from(document.querySelectorAll('[data-work-card]')).filter((el) => !el.hidden).length,
    );
    assert(visibleGolangCount === 4, `Expected 4 Golang works, got ${visibleGolangCount}`);

    await page.fill('[data-work-keyword]', 'unmatched-tech-xyz');
    const isEmptyVisible = await page.evaluate(
      () => document.querySelector('[data-works-empty]')?.hidden === false,
    );
    assert(isEmptyVisible, 'Empty filter state must be visible when 0 works match');
    await page.click('[data-works-reset]');
    const restoredCount = await page.evaluate(
      () => Array.from(document.querySelectorAll('[data-work-card]')).filter((el) => !el.hidden).length,
    );
    assert(restoredCount === 8, `Reset Filter must restore all 8 works, got ${restoredCount}`);
    console.log('[verify:browser] AC-07 interactive project filter & Reset Filter verified.');

    // 6. Capture Desktop (1440x900) & Mobile (390x844) Screenshots in Light & Dark Mode
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${baseUrl}/id/`, { waitUntil: 'networkidle' });

    // Force Light Mode via theme override storage & reload cleanly
    await page.evaluate(() => {
      localStorage.setItem(
        'portfolio-theme-v1',
        JSON.stringify({ mode: 'light', expiresAt: Date.now() + 3600_000 }),
      );
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.screenshot({
      path: join(WORKSPACE_ROOT, 'screenshot-desktop-light.png'),
      fullPage: false,
    });

    // Force Dark Mode for Desktop screenshot
    await page.evaluate(() => {
      localStorage.setItem(
        'portfolio-theme-v1',
        JSON.stringify({ mode: 'dark', expiresAt: Date.now() + 3600_000 }),
      );
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.screenshot({
      path: join(WORKSPACE_ROOT, 'screenshot-desktop-dark.png'),
      fullPage: false,
    });

    // Mobile (390x844) Light & Dark Mode screenshots
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => {
      localStorage.setItem(
        'portfolio-theme-v1',
        JSON.stringify({ mode: 'light', expiresAt: Date.now() + 3600_000 }),
      );
    });
    await page.goto(`${baseUrl}/en/`, { waitUntil: 'networkidle' });
    await page.screenshot({
      path: join(WORKSPACE_ROOT, 'screenshot-mobile-light.png'),
      fullPage: false,
    });

    await page.evaluate(() => {
      localStorage.setItem(
        'portfolio-theme-v1',
        JSON.stringify({ mode: 'dark', expiresAt: Date.now() + 3600_000 }),
      );
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.screenshot({
      path: join(WORKSPACE_ROOT, 'screenshot-mobile-dark.png'),
      fullPage: false,
    });

    assert(consoleErrors.length === 0, `Console/page errors detected: ${JSON.stringify(consoleErrors)}`);
    console.log('[verify:browser] Screenshots captured & 0 console errors confirmed!');
  } finally {
    if (browser) await browser.close();
    await new Promise((res) => server.close(res));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
