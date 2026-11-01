import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright-core';
import { startStaticServer } from './lib/static-server.mjs';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist-test-contact');
const artifacts = resolve(root, 'audit-artifacts');
mkdirSync(artifacts, { recursive: true });
// A separate build embeds a fake public ID. Production dist/environment stay untouched.
execFileSync(process.execPath, [resolve(root, 'node_modules/astro/astro.js'), 'build', '--outDir', output], {
  cwd: root,
  env: { ...process.env, PUBLIC_FORMSPREE_FORM_ID: 'reviewtest', PUBLIC_TURNSTILE_SITE_KEY: '' },
  stdio: 'inherit',
});
const server = await startStaticServer(output);
let browser;
const results = [];
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  // All provider traffic is intercepted: no real messages or GitHub requests.
  await context.route('https://api.github.com/**', route => route.abort());
  let status = 400;
  let requests = [];
  await context.route('https://formspree.io/**', async route => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({
      errors: [{ field: 'email', code: 'TYPE_EMAIL', message: 'Provider rejected email' }],
    }) });
  });
  const page = await context.newPage();
  for (const locale of ['id', 'en']) {
    for (status of [400, 422]) {
      requests = [];
      await page.goto(`${server.url}/${locale}/`, { waitUntil: 'networkidle' });
      const form = page.locator('[data-contact-form]');
      const draft = { name: 'Review User', email: 'review@example.com', subject: 'Contract review',
        message: 'This is a local simulated validation failure, never sent to Formspree.' };
      for (const [field, value] of Object.entries(draft)) await form.locator(`[name="${field}"]`).fill(value);
      await form.locator('[data-contact-submit]').click();
      await page.waitForFunction(() => document.querySelector('[name="email"]').getAttribute('aria-invalid') === 'true');
      assert.equal(requests.length, 1, 'No automatic retry');
      assert.equal(requests[0].message, draft.message);
      for (const [field, value] of Object.entries(draft)) assert.equal(await form.locator(`[name="${field}"]`).inputValue(), value);
      for (const selector of ['[data-recovery-copy-email]', '[data-recovery-copy-draft]', '[data-recovery-mailto]']) {
        assert.equal(await form.locator(selector).isVisible(), true, `${locale}/${status}: ${selector}`);
      }
      const mailto = await form.locator('[data-recovery-mailto]').getAttribute('href');
      assert.ok(decodeURIComponent(mailto).includes(draft.message));
      await form.locator('[data-recovery-copy-draft]').click();
      await page.waitForFunction(async message => (await navigator.clipboard.readText()).includes(message), draft.message);
      await form.locator('[data-recovery-copy-email]').click();
      await page.waitForFunction(async () => (await navigator.clipboard.readText()) === 'anggavb8@gmail.com');
      const stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem('contact-draft-v1')));
      assert.equal(stored.message, draft.message);
      results.push({ locale, status, requests: requests.length, retainedDraft: true, recoveryVisible: true, clipboardVerified: true });
    }
  }
  const evidence = { commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    measuredAt: new Date().toISOString(), provider: 'Playwright intercepted HTTP responses; not live Formspree', results };
  writeFileSync(resolve(artifacts, 'contact-recovery.json'), JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  if (browser) await browser.close();
  await server.close();
}
