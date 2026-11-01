import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const USERNAME = process.env.GITHUB_USERNAME || 'anggavb';
const API_BASE = (process.env.GITHUB_API_BASE_URL || 'https://api.github.com').replace(/\/+$/, '');
const SNAPSHOT_PATH = resolve(
  process.cwd(),
  process.env.GITHUB_SNAPSHOT_PATH || 'src/data/github-snapshot.json',
);
const PER_PAGE = 100;
const TARGET_REPOS = 4;
const MAX_PAGES = 10;
const TIMEOUT_MS = 8000;

function hasNextPage(linkHeader, pageLength) {
  if (linkHeader && linkHeader.trim().length > 0) {
    return /<[^>]+>;\s*rel="next"/i.test(linkHeader);
  }
  return pageLength === PER_PAGE;
}

function readExistingValidSnapshot() {
  if (!existsSync(SNAPSHOT_PATH)) return null;
  try {
    const raw = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8'));
    if (
      raw &&
      typeof raw === 'object' &&
      typeof raw.fetchedAt === 'string' &&
      !Number.isNaN(Date.parse(raw.fetchedAt)) &&
      raw.profile &&
      typeof raw.profile.login === 'string' &&
      typeof raw.profile.public_repos === 'number' &&
      Array.isArray(raw.recentRepos)
    ) {
      return raw;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchPageJson(url, headers) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { method: 'GET', headers, signal: controller.signal });
    if (!res.ok) {
      return { ok: false, status: res.status };
    }
    const data = await res.json();
    return { ok: true, data, linkHeader: res.headers.get('link') };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  if (process.env.GITHUB_SYNC_OFFLINE === '1') {
    const existing = readExistingValidSnapshot();
    console.log(
      existing
        ? `[sync:github] Offline mode enabled; preserving snapshot from ${existing.fetchedAt}.`
        : '[sync:github] Offline mode enabled with no existing snapshot; build will use honest unavailable fallback.',
    );
    return;
  }

  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'portofolio-2027-build-sync',
  };
  // Server-only build token: never written into snapshot or client bundle.
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim().length > 0) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN.trim()}`;
  }

  const profileRes = await fetchPageJson(
    `${API_BASE}/users/${encodeURIComponent(USERNAME)}`,
    headers,
  );
  if (
    !profileRes.ok ||
    !profileRes.data ||
    typeof profileRes.data.login !== 'string' ||
    typeof profileRes.data.html_url !== 'string' ||
    typeof profileRes.data.public_repos !== 'number' ||
    typeof profileRes.data.followers !== 'number'
  ) {
    const existing = readExistingValidSnapshot();
    console.warn(
      existing
        ? `[sync:github] Profile fetch failed; preserving existing snapshot (${existing.fetchedAt}).`
        : '[sync:github] Profile fetch failed and no snapshot exists; proceeding with unavailable fallback.',
    );
    return;
  }

  const profile = {
    login: profileRes.data.login,
    html_url: profileRes.data.html_url,
    public_repos: profileRes.data.public_repos,
    followers: profileRes.data.followers,
  };

  const nonForkRepos = [];
  let page = 1;
  let terminalSuccess = false;

  while (page <= MAX_PAGES) {
    const reposUrl = `${API_BASE}/users/${encodeURIComponent(USERNAME)}/repos?type=owner&sort=pushed&direction=desc&per_page=${PER_PAGE}&page=${page}`;
    const pageRes = await fetchPageJson(reposUrl, headers);
    if (!pageRes.ok || !Array.isArray(pageRes.data)) {
      break;
    }

    let validSchema = true;
    for (const item of pageRes.data) {
      if (
        !item ||
        typeof item.name !== 'string' ||
        typeof item.html_url !== 'string' ||
        typeof item.fork !== 'boolean' ||
        typeof item.pushed_at !== 'string' ||
        typeof item.stargazers_count !== 'number'
      ) {
        validSchema = false;
        break;
      }
      if (item.fork === false) {
        nonForkRepos.push({
          name: item.name,
          html_url: item.html_url,
          description:
            typeof item.description === 'string' && item.description.trim().length > 0
              ? item.description.trim()
              : null,
          language:
            typeof item.language === 'string' && item.language.trim().length > 0
              ? item.language.trim()
              : null,
          pushed_at: item.pushed_at,
          stargazers_count: item.stargazers_count,
        });
      }
    }

    if (!validSchema) {
      break;
    }

    nonForkRepos.sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at));

    if (nonForkRepos.length >= TARGET_REPOS) {
      terminalSuccess = true;
      break;
    }

    if (!hasNextPage(pageRes.linkHeader, pageRes.data.length)) {
      terminalSuccess = true;
      break;
    }

    if (page === MAX_PAGES) {
      // Partial result before exhaustion is treated as a sync failure per PRD v1.2 §6.6.2.
      terminalSuccess = false;
      break;
    }

    page += 1;
  }

  if (!terminalSuccess) {
    const existing = readExistingValidSnapshot();
    console.warn(
      existing
        ? `[sync:github] Repo pagination incomplete; preserving existing snapshot (${existing.fetchedAt}).`
        : '[sync:github] Repo pagination incomplete and no snapshot exists; proceeding with unavailable fallback.',
    );
    return;
  }

  const snapshot = {
    fetchedAt: new Date().toISOString(),
    profile,
    recentRepos: nonForkRepos.slice(0, TARGET_REPOS),
  };

  mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
  writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(
    `[sync:github] Synced ${snapshot.recentRepos.length} non-fork repos for @${profile.login} (${profile.public_repos} public repos) at ${snapshot.fetchedAt}.`,
  );
}

main().catch((err) => {
  console.warn('[sync:github] Unexpected sync error; exiting 0 for resilient static build:', err);
  process.exit(0);
});
