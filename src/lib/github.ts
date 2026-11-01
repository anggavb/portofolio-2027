export interface GitHubProfile {
  login: string;
  html_url: string;
  public_repos: number;
  followers: number;
}

export interface GitHubRepoItem {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  pushed_at: string;
  stargazers_count: number;
}

export interface GitHubSnapshot {
  fetchedAt: string;
  profile: GitHubProfile;
  recentRepos: GitHubRepoItem[];
}

export type GitHubFailureReason =
  | 'rate_limit'
  | 'http_error'
  | 'network_error'
  | 'timeout'
  | 'invalid_schema'
  | 'partial_pagination';

export type GitHubSyncResult =
  | { ok: true; snapshot: GitHubSnapshot; pagesFetched: number }
  | {
      ok: false;
      reason: GitHubFailureReason;
      status?: number;
      retryAfterHeader?: string | null;
      rateLimitResetHeader?: string | null;
      pagesFetched: number;
    };

export interface GitHubClientCacheRecord {
  snapshot: GitHubSnapshot | null;
  lastCheckedAt: number;
  cooldownUntil: number;
}

export const GITHUB_USERNAME = 'anggavb';
export const GITHUB_DEFAULT_API_BASE = 'https://api.github.com';
export const GITHUB_PER_PAGE = 100;
export const GITHUB_TARGET_REPOS = 4;
export const BUILD_MAX_PAGES = 10;
export const CLIENT_MAX_PAGES = 5;
export const BUILD_TIMEOUT_MS = 8000;
export const CLIENT_TIMEOUT_MS = 5000;
export const CLIENT_TTL_MS = 60 * 60 * 1000;
export const RATE_LIMIT_COOLDOWN_MS = 60 * 60 * 1000;
export const TRANSIENT_ERROR_COOLDOWN_MS = 15 * 60 * 1000;
export const GITHUB_CACHE_KEY = 'github-telemetry-v1';

export function hasNextPage(
  linkHeader: string | null,
  pageItemCount: number,
  perPage: number = GITHUB_PER_PAGE,
): boolean {
  if (linkHeader && linkHeader.trim().length > 0) {
    return /<[^>]+>;\s*rel="next"/i.test(linkHeader);
  }
  return pageItemCount === perPage;
}

export function validateGitHubProfile(raw: unknown): GitHubProfile | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const record = raw as Record<string, unknown>;
  if (
    typeof record.login !== 'string' ||
    record.login.length === 0 ||
    typeof record.html_url !== 'string' ||
    !record.html_url.startsWith('https://') ||
    typeof record.public_repos !== 'number' ||
    !Number.isFinite(record.public_repos) ||
    record.public_repos < 0 ||
    typeof record.followers !== 'number' ||
    !Number.isFinite(record.followers) ||
    record.followers < 0
  ) {
    return null;
  }
  return {
    login: record.login,
    html_url: record.html_url,
    public_repos: record.public_repos,
    followers: record.followers,
  };
}

interface RawParsedRepo extends GitHubRepoItem {
  fork: boolean;
}

export function validateGitHubRepoPage(raw: unknown): RawParsedRepo[] | null {
  if (!Array.isArray(raw)) return null;
  const parsed: RawParsedRepo[] = [];
  for (const entry of raw) {
    if (typeof entry !== 'object' || entry === null) return null;
    const item = entry as Record<string, unknown>;
    if (
      typeof item.name !== 'string' ||
      item.name.length === 0 ||
      typeof item.html_url !== 'string' ||
      !item.html_url.startsWith('https://') ||
      typeof item.fork !== 'boolean' ||
      typeof item.pushed_at !== 'string' ||
      Number.isNaN(Date.parse(item.pushed_at)) ||
      typeof item.stargazers_count !== 'number' ||
      !Number.isFinite(item.stargazers_count)
    ) {
      return null;
    }
    if (item.description !== null && item.description !== undefined && typeof item.description !== 'string') {
      return null;
    }
    if (item.language !== null && item.language !== undefined && typeof item.language !== 'string') {
      return null;
    }
    parsed.push({
      name: item.name,
      html_url: item.html_url,
      description: typeof item.description === 'string' && item.description.trim().length > 0 ? item.description.trim() : null,
      language: typeof item.language === 'string' && item.language.trim().length > 0 ? item.language.trim() : null,
      pushed_at: item.pushed_at,
      stargazers_count: item.stargazers_count,
      fork: item.fork,
    });
  }
  return parsed;
}

export function validateGitHubSnapshot(raw: unknown): GitHubSnapshot | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const record = raw as Record<string, unknown>;
  if (typeof record.fetchedAt !== 'string' || Number.isNaN(Date.parse(record.fetchedAt))) {
    return null;
  }
  const profile = validateGitHubProfile(record.profile);
  if (!profile) return null;
  if (!Array.isArray(record.recentRepos) || record.recentRepos.length > GITHUB_TARGET_REPOS) {
    return null;
  }
  const repos: GitHubRepoItem[] = [];
  for (const entry of record.recentRepos) {
    if (typeof entry !== 'object' || entry === null) return null;
    const item = entry as Record<string, unknown>;
    if (
      typeof item.name !== 'string' ||
      typeof item.html_url !== 'string' ||
      typeof item.pushed_at !== 'string' ||
      Number.isNaN(Date.parse(item.pushed_at)) ||
      typeof item.stargazers_count !== 'number'
    ) {
      return null;
    }
    repos.push({
      name: item.name,
      html_url: item.html_url,
      description: typeof item.description === 'string' ? item.description : null,
      language: typeof item.language === 'string' ? item.language : null,
      pushed_at: item.pushed_at,
      stargazers_count: item.stargazers_count,
    });
  }
  return {
    fetchedAt: record.fetchedAt,
    profile,
    recentRepos: repos,
  };
}

async function fetchJsonWithTimeout(
  url: string,
  options: {
    fetchImpl: typeof fetch;
    timeoutMs: number;
    headers: Record<string, string>;
  },
): Promise<
  | { ok: true; data: unknown; headers: Headers }
  | {
      ok: false;
      reason: Exclude<GitHubFailureReason, 'invalid_schema' | 'partial_pagination'>;
      status?: number;
      retryAfterHeader?: string | null;
      rateLimitResetHeader?: string | null;
    }
> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);
  try {
    const response = await options.fetchImpl(url, {
      method: 'GET',
      headers: options.headers,
      signal: controller.signal,
    });
    const retryAfterHeader = response.headers.get('retry-after');
    const rateLimitResetHeader = response.headers.get('x-ratelimit-reset');
    if (response.status === 403 || response.status === 429) {
      return {
        ok: false,
        reason: 'rate_limit',
        status: response.status,
        retryAfterHeader,
        rateLimitResetHeader,
      };
    }
    if (!response.ok) {
      return {
        ok: false,
        reason: 'http_error',
        status: response.status,
        retryAfterHeader,
        rateLimitResetHeader,
      };
    }
    const data: unknown = await response.json();
    return { ok: true, data, headers: response.headers };
  } catch (err) {
    const isAbort =
      err instanceof Error && (err.name === 'AbortError' || /abort/i.test(err.message));
    return {
      ok: false,
      reason: isAbort ? 'timeout' : 'network_error',
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchGitHubTelemetry(options: {
  username?: string;
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
  maxPages: number;
  timeoutMs: number;
  perPage?: number;
  token?: string;
  nowIso?: string;
}): Promise<GitHubSyncResult> {
  const username = options.username ?? GITHUB_USERNAME;
  const apiBase = (options.apiBaseUrl ?? GITHUB_DEFAULT_API_BASE).replace(/\/+$/, '');
  const fetchImpl = options.fetchImpl ?? fetch;
  const perPage = options.perPage ?? GITHUB_PER_PAGE;
  const nowIso = options.nowIso ?? new Date().toISOString();

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };
  if (options.token && options.token.trim().length > 0) {
    headers.Authorization = `Bearer ${options.token.trim()}`;
  }

  const profileResp = await fetchJsonWithTimeout(`${apiBase}/users/${encodeURIComponent(username)}`, {
    fetchImpl,
    timeoutMs: options.timeoutMs,
    headers,
  });

  if (!profileResp.ok) {
    return {
      ok: false,
      reason: profileResp.reason,
      status: profileResp.status,
      retryAfterHeader: profileResp.retryAfterHeader,
      rateLimitResetHeader: profileResp.rateLimitResetHeader,
      pagesFetched: 0,
    };
  }

  const profile = validateGitHubProfile(profileResp.data);
  if (!profile) {
    return { ok: false, reason: 'invalid_schema', pagesFetched: 0 };
  }

  const collectedNonForks: GitHubRepoItem[] = [];
  let page = 1;

  while (page <= options.maxPages) {
    const reposUrl = `${apiBase}/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&direction=desc&per_page=${perPage}&page=${page}`;
    const pageResp = await fetchJsonWithTimeout(reposUrl, {
      fetchImpl,
      timeoutMs: options.timeoutMs,
      headers,
    });

    if (!pageResp.ok) {
      // Partial accumulation before terminal completion MUST fail sync and preserve prior snapshot.
      return {
        ok: false,
        reason: pageResp.reason,
        status: pageResp.status,
        retryAfterHeader: pageResp.retryAfterHeader,
        rateLimitResetHeader: pageResp.rateLimitResetHeader,
        pagesFetched: page,
      };
    }

    const parsedPage = validateGitHubRepoPage(pageResp.data);
    if (!parsedPage) {
      return { ok: false, reason: 'invalid_schema', pagesFetched: page };
    }

    for (const repo of parsedPage) {
      if (repo.fork === false) {
        collectedNonForks.push({
          name: repo.name,
          html_url: repo.html_url,
          description: repo.description,
          language: repo.language,
          pushed_at: repo.pushed_at,
          stargazers_count: repo.stargazers_count,
        });
      }
    }

    collectedNonForks.sort(
      (a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at),
    );

    if (collectedNonForks.length >= GITHUB_TARGET_REPOS) {
      return {
        ok: true,
        snapshot: {
          fetchedAt: nowIso,
          profile,
          recentRepos: collectedNonForks.slice(0, GITHUB_TARGET_REPOS),
        },
        pagesFetched: page,
      };
    }

    const morePagesExist = hasNextPage(pageResp.headers.get('link'), parsedPage.length, perPage);
    if (!morePagesExist) {
      // Account genuinely has fewer than 4 non-fork repos (0..3): valid terminal exhaustion.
      return {
        ok: true,
        snapshot: {
          fetchedAt: nowIso,
          profile,
          recentRepos: collectedNonForks.slice(0, GITHUB_TARGET_REPOS),
        },
        pagesFetched: page,
      };
    }

    if (page === options.maxPages) {
      // Circuit breaker halted traversal while < 4 non-fork repos collected and more pages exist.
      return {
        ok: false,
        reason: 'partial_pagination',
        pagesFetched: page,
      };
    }

    page += 1;
  }

  return {
    ok: false,
    reason: 'partial_pagination',
    pagesFetched: options.maxPages,
  };
}

export function computeCooldownUntil(
  nowMs: number,
  failure: Extract<GitHubSyncResult, { ok: false }>,
): number {
  if (failure.reason === 'rate_limit') {
    let targetUntil = nowMs + RATE_LIMIT_COOLDOWN_MS;
    if (failure.retryAfterHeader) {
      const retrySeconds = Number.parseInt(failure.retryAfterHeader, 10);
      if (Number.isFinite(retrySeconds) && retrySeconds > 0) {
        targetUntil = Math.max(targetUntil, nowMs + retrySeconds * 1000);
      }
    }
    if (failure.rateLimitResetHeader) {
      const resetEpochSeconds = Number.parseInt(failure.rateLimitResetHeader, 10);
      if (Number.isFinite(resetEpochSeconds) && resetEpochSeconds * 1000 > targetUntil) {
        targetUntil = resetEpochSeconds * 1000;
      }
    }
    return targetUntil;
  }
  return nowMs + TRANSIENT_ERROR_COOLDOWN_MS;
}

export function readClientGitHubCache(
  storage: Pick<Storage, 'getItem'> | null,
): GitHubClientCacheRecord | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(GITHUB_CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const rec = parsed as Record<string, unknown>;
    const snapshot = rec.snapshot === null ? null : validateGitHubSnapshot(rec.snapshot);
    if (rec.snapshot !== null && !snapshot) return null;
    const lastCheckedAt = typeof rec.lastCheckedAt === 'number' && Number.isFinite(rec.lastCheckedAt) ? rec.lastCheckedAt : 0;
    const cooldownUntil = typeof rec.cooldownUntil === 'number' && Number.isFinite(rec.cooldownUntil) ? rec.cooldownUntil : 0;
    return { snapshot, lastCheckedAt, cooldownUntil };
  } catch {
    return null;
  }
}

export function writeClientGitHubCache(
  storage: Pick<Storage, 'setItem'> | null,
  record: GitHubClientCacheRecord,
): void {
  if (!storage) return;
  try {
    storage.setItem(GITHUB_CACHE_KEY, JSON.stringify(record));
  } catch {
    // Ignore storage quota errors without breaking rendering.
  }
}

export async function revalidateClientGitHubTelemetry(options: {
  buildSnapshot: GitHubSnapshot | null;
  storage: Pick<Storage, 'getItem' | 'setItem'> | null;
  fetchImpl?: typeof fetch;
  apiBaseUrl?: string;
  nowMs?: number;
  isOnline?: boolean;
}): Promise<{
  snapshot: GitHubSnapshot | null;
  didFetch: boolean;
  updated: boolean;
  cooldownUntil: number;
}> {
  const nowMs = options.nowMs ?? Date.now();
  const cached = readClientGitHubCache(options.storage);

  let baselineSnapshot = options.buildSnapshot;
  if (cached?.snapshot) {
    if (
      !baselineSnapshot ||
      Date.parse(cached.snapshot.fetchedAt) >= Date.parse(baselineSnapshot.fetchedAt)
    ) {
      baselineSnapshot = cached.snapshot;
    }
  }

  if (cached && cached.cooldownUntil > nowMs) {
    return {
      snapshot: baselineSnapshot,
      didFetch: false,
      updated: false,
      cooldownUntil: cached.cooldownUntil,
    };
  }

  const baselineAgeMs = baselineSnapshot
    ? nowMs - Date.parse(baselineSnapshot.fetchedAt)
    : Number.POSITIVE_INFINITY;

  if (baselineAgeMs < CLIENT_TTL_MS) {
    return {
      snapshot: baselineSnapshot,
      didFetch: false,
      updated: false,
      cooldownUntil: cached?.cooldownUntil ?? 0,
    };
  }

  if (options.isOnline === false) {
    const cooldownUntil = nowMs + TRANSIENT_ERROR_COOLDOWN_MS;
    writeClientGitHubCache(options.storage, {
      snapshot: baselineSnapshot,
      lastCheckedAt: nowMs,
      cooldownUntil,
    });
    return {
      snapshot: baselineSnapshot,
      didFetch: false,
      updated: false,
      cooldownUntil,
    };
  }

  const syncResult = await fetchGitHubTelemetry({
    fetchImpl: options.fetchImpl,
    apiBaseUrl: options.apiBaseUrl,
    maxPages: CLIENT_MAX_PAGES,
    timeoutMs: CLIENT_TIMEOUT_MS,
    nowIso: new Date(nowMs).toISOString(),
  });

  if (syncResult.ok) {
    writeClientGitHubCache(options.storage, {
      snapshot: syncResult.snapshot,
      lastCheckedAt: nowMs,
      cooldownUntil: 0,
    });
    return {
      snapshot: syncResult.snapshot,
      didFetch: true,
      updated: true,
      cooldownUntil: 0,
    };
  }

  const cooldownUntil = computeCooldownUntil(nowMs, syncResult);
  writeClientGitHubCache(options.storage, {
    snapshot: baselineSnapshot,
    lastCheckedAt: nowMs,
    cooldownUntil,
  });

  return {
    snapshot: baselineSnapshot,
    didFetch: true,
    updated: false,
    cooldownUntil,
  };
}
