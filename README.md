# portofolio-2027

Source repository for Angga VB's portfolio website (https://anggavb.my.id).

## Build and verification

Use Node.js 22.19+ (or a compatible current LTS) and Bun for the locked dependencies and unit suite:

```sh
bun install --frozen-lockfile
bun run check
bun run build:only
bun test
bun run verify:contact
bun run measure:lighthouse
```

`build:only` uses the checked-in GitHub snapshot. `build` first attempts a live GitHub refresh; a provider outage preserves the last valid snapshot. `verify:contact` builds an isolated fixture with a fake public Form ID, intercepts provider traffic in Playwright, and checks the real page after HTTP 400/422 in both languages: draft retention, visible recovery controls, clipboard, mailto, and no automatic retries. It never submits to live Formspree.

Both browser tools use installed Chrome (`CHROME_PATH` can override its location; default is the Windows Chrome installation). Every tool closes its browser and local HTTP server before exiting. Lighthouse serves the production `dist/` on localhost and measures ID/EN on desktop/mobile with the tool's default simulated throttling for each device. Raw HTML/JSON reports and a summary containing the Git commit, versions, timestamp, URL, throttling and metrics are written to ignored `audit-artifacts/lighthouse/`. The command exits nonzero if any category is below the PRD target of 95. Contact browser evidence is written to `audit-artifacts/contact-recovery.json`.

These are lab results for a local production build. They do not establish production Core Web Vitals, performance on arbitrary 3G/4G networks, or INP. Lighthouse navigation TBT is not an INP measurement. Evaluate INP separately with representative interactions/field data; do not report an unmeasured value as passed. Optional GitHub/Formspree URLs are blocked in the Lighthouse audit so no quota is spent and no email is sent. The reports must be regenerated after source changes and attached to the delivery for the measured head.

## Formspree activation and live UAT (owner)

The site is statically built. An empty `PUBLIC_FORMSPREE_FORM_ID` intentionally disables direct submission and shows email fallback; this is **not** a passing live contact integration. Changing the environment requires a rebuild/deployment.

1. Create/verify the Formspree account and recipient inbox `anggavb8@gmail.com`, then create a form and configure `PUBLIC_FORMSPREE_FORM_ID` in the hosting environment.
2. In **Workflow → Validation**, explicitly configure these rules; browser HTML attributes do not configure the server:

   | Field | Type | Required | Minimum length | Maximum length |
   | --- | --- | --- | --- | --- |
   | `name` | Text | Yes | 2 | 100 |
   | `email` | Email | Yes | Format validation | Format validation |
   | `subject` | Text | Yes | 3 | 120 |
   | `message` | Text | Yes | 20 | 2000 |

   Client values are trimmed, and email is limited to 254 characters. Per PRD v1.2, the documented server Text validator may flatten message line breaks. Do not use the earlier handoff's incorrect name limit of 80 or message range 10–3000.
3. Set Project **Restrict to Domain** to **`anggavb.my.id`**, without protocol or `www`. Serve with `Referrer-Policy: strict-origin-when-cross-origin`. This filters unmatched/missing Referer submissions into the Spam inbox; it is not sender authentication and does not guarantee HTTP 403. Visitors whose browsers remove Referer may be filtered; inspect the dashboard Spam inbox within the archive retention window.
4. Optional Turnstile: expose only `PUBLIC_TURNSTILE_SITE_KEY`; store its secret solely in the Formspree dashboard. No private keys belong in `PUBLIC_*`, Git, or browser assets.
5. After deployment, verify a valid submission actually arrives in the inbox. With controlled test data, send direct POSTs bypassing browser validation to verify required fields, invalid email, and name/subject/message boundaries. Verify an unauthorized Referer is classified as Spam without notification to the primary inbox. Do not load test the provider. UI simulations do not replace these live checks.

Formspree Free is the PRD's selected starting plan (50 submissions/month). Verify current quota and plan limits in the dashboard before launch; account activation, inbox receipt, server validation and Spam classification remain owner UAT prerequisites until directly observed.

## Data and delivery corrections

BRI is Fullstack Developer, July 2026–Present, with **Golang Microservice, MySQL, Next.js, Redis** in both languages. The earlier implementation handoff incorrectly described PostgreSQL as the BRI stack. The client contract is name **2–100**, subject **3–120**, message **20–2000**, email up to **254** characters. Earlier claims of AC-11 fully passing and LCP <1 second on 3G/4G were unsupported by measurement and are superseded by the attached, commit-specific audit results. Lighthouse targets and live UAT remain separate acceptance checks.
