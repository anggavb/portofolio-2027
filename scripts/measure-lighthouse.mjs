import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import { launch } from 'chrome-launcher';
import { startStaticServer } from './lib/static-server.mjs';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'audit-artifacts/lighthouse');
mkdirSync(output, { recursive: true });
const server = await startStaticServer(resolve(root, 'dist'));
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const summaries = [];
try {
  for (const locale of ['id', 'en']) {
    for (const device of ['mobile', 'desktop']) {
      const chrome = await launch({
        chromePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        chromeFlags: ['--headless=new', '--no-first-run'],
      });
      try {
        console.log(`Auditing ${locale}/${device} at ${commit}`);
        const result = await lighthouse(`${server.url}/${locale}/`, {
          port: chrome.port,
          output: ['json', 'html'],
          logLevel: 'error',
          onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
          // Optional provider integrations remain unavailable until owner activation.
          blockedUrlPatterns: ['https://api.github.com/*', 'https://formspree.io/*'],
        }, device === 'desktop' ? desktopConfig : undefined);
        if (!result || result.lhr.runtimeError) throw new Error(JSON.stringify(result?.lhr.runtimeError));
        const name = `${locale}-${device}`;
        writeFileSync(resolve(output, `${name}.json`), result.report[0]);
        writeFileSync(resolve(output, `${name}.html`), result.report[1]);
        const { lhr } = result;
        const scores = Object.fromEntries(Object.entries(lhr.categories).map(([key, category]) => [key, Math.round(category.score * 100)]));
        const summary = { locale, device, commit, url: lhr.finalDisplayedUrl, fetchTime: lhr.fetchTime,
          lighthouseVersion: lhr.lighthouseVersion, userAgent: lhr.userAgent,
          throttlingMethod: lhr.configSettings.throttlingMethod, throttling: lhr.configSettings.throttling,
          screenEmulation: lhr.configSettings.screenEmulation, scores,
          metrics: Object.fromEntries(['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time', 'first-contentful-paint']
            .map(key => [key, { value: lhr.audits[key].numericValue, unit: lhr.audits[key].numericUnit }])),
          failures: Object.values(lhr.audits).filter(a => a.score !== null && a.score < 1 && a.details?.type !== 'opportunity')
            .map(a => ({ id: a.id, title: a.title, score: a.score, description: a.description })),
        };
        summaries.push(summary);
        console.log(JSON.stringify({ name, scores, metrics: summary.metrics }));
      } finally {
        chrome.kill();
      }
    }
  }
  const evidence = { commit, environment: 'Local static production build; Lighthouse simulated throttling defaults per device; optional provider URLs blocked',
    limitations: 'Lab navigation runs, not production/field data. TBT is not INP. No live Formspree delivery tested.', runs: summaries };
  writeFileSync(resolve(output, 'summary.json'), JSON.stringify(evidence, null, 2));
  if (summaries.some(run => Object.values(run.scores).some(score => score < 95))) process.exitCode = 1;
} finally {
  await server.close();
}
