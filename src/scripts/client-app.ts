import {
  resolveEffectiveTheme,
  serializeThemeOverride,
  THEME_STORAGE_KEY,
  UTC7_OFFSET_MS,
  type ThemeMode,
} from '../lib/theme';
import {
  revalidateClientGitHubTelemetry,
  validateGitHubSnapshot,
  type GitHubSnapshot,
} from '../lib/github';
import {
  buildMailtoHref,
  formatDraftForClipboard,
  isFormspreeConfigured,
  loadContactDraft,
  saveContactDraft,
  SUBMIT_SUCCESS_COOLDOWN_MS,
  submitContactToFormspree,
  validateSingleField,
  type ContactFieldKey,
  type ContactValidationMessages,
} from '../lib/contact';

function safeGetLocalStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetLocalStorage(key: string, value: string | null): void {
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage block in restricted browsing contexts.
  }
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function initThemeControls(): void {
  const cycleBtn = document.querySelector<HTMLButtonElement>('[data-theme-cycle]');
  const labelNode = document.querySelector<HTMLElement>('[data-theme-label]');
  const modeButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-theme-set]'),
  );
  const metaScheme = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');

  const applyThemeFromStorage = () => {
    const raw = safeGetLocalStorage(THEME_STORAGE_KEY);
    const { mode, resolved } = resolveEffectiveTheme(raw);
    const root = document.documentElement;
    root.dataset.theme = resolved;
    root.dataset.themeMode = mode;
    root.classList.toggle('dark', resolved === 'dark');
    if (metaScheme) {
      metaScheme.setAttribute('content', resolved);
    }
    if (cycleBtn && labelNode) {
      const text =
        mode === 'light'
          ? cycleBtn.dataset.labelLight
          : mode === 'dark'
            ? cycleBtn.dataset.labelDark
            : cycleBtn.dataset.labelAuto;
      if (text) labelNode.textContent = text;
    }
    for (const btn of modeButtons) {
      btn.setAttribute('aria-pressed', btn.dataset.themeSet === mode ? 'true' : 'false');
    }
  };

  const setThemeMode = (nextMode: ThemeMode) => {
    const serialized = serializeThemeOverride(nextMode);
    safeSetLocalStorage(THEME_STORAGE_KEY, serialized);
    applyThemeFromStorage();
  };

  applyThemeFromStorage();

  cycleBtn?.addEventListener('click', () => {
    const currentMode = (document.documentElement.dataset.themeMode as ThemeMode) || 'auto';
    const nextOrder: Record<ThemeMode, ThemeMode> = {
      auto: 'light',
      light: 'dark',
      dark: 'auto',
    };
    setThemeMode(nextOrder[currentMode]);
  });

  for (const btn of modeButtons) {
    btn.addEventListener('click', () => {
      const target = btn.dataset.themeSet as ThemeMode | undefined;
      if (target === 'auto' || target === 'light' || target === 'dark') {
        setThemeMode(target);
      }
    });
  }

  window.addEventListener('storage', (event) => {
    if (event.key === THEME_STORAGE_KEY) {
      applyThemeFromStorage();
    }
  });
}

function initMobileDialog(): void {
  const dialog = document.getElementById('mobile-nav-dialog') as HTMLDialogElement | null;
  const openBtn = document.querySelector<HTMLButtonElement>('[data-open-mobile-nav]');
  if (!dialog || !openBtn) return;

  openBtn.addEventListener('click', () => {
    if (!dialog.open) {
      dialog.showModal();
    }
  });

  // Fallback for browsers where <dialog closedby="any"> is not yet implemented (e.g. Safari).
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const inside =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!inside) {
        dialog.close();
      }
    });
  }

  for (const link of dialog.querySelectorAll<HTMLAnchorElement>('[data-mobile-nav-link]')) {
    link.addEventListener('click', () => {
      dialog.close();
    });
  }
}

function initLanguageSwitcherAnchorSync(): void {
  const langLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('[data-lang-link]'),
  );
  if (langLinks.length === 0) return;

  const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'));
  if (sections.length === 0) return;

  const getVisibleSection = (): string => {
    const hashTarget = (window.location.hash || '').replace('#', '');
    if (hashTarget) {
      const el = document.getElementById(hashTarget);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.6 && rect.bottom >= 50) {
          return `#${hashTarget}`;
        }
      }
    }

    let bestSection = '';
    let bestDistance = Infinity;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.bottom > 80 && rect.top < window.innerHeight * 0.8) {
        const distance = Math.abs(rect.top - 80);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestSection = `#${section.id}`;
        }
      }
    }

    return bestSection || (window.location.hash || '');
  };

  const syncHrefs = () => {
    const activeHash = getVisibleSection();
    for (const link of langLinks) {
      const targetLocale = link.dataset.langLink;
      if (targetLocale === 'id' || targetLocale === 'en') {
        link.href = `/${targetLocale}/${activeHash}`;
      }
    }
  };

  syncHrefs();

  window.addEventListener('hashchange', () => {
    syncHrefs();
  });

  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          syncHrefs();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true },
  );

  for (const link of langLinks) {
    link.addEventListener('click', () => {
      const targetLocale = link.dataset.langLink;
      if (targetLocale === 'id' || targetLocale === 'en') {
        safeSetLocalStorage('portfolio-lang', targetLocale);
      }
    });
  }
}

function initWorksFilter(): void {
  const section = document.querySelector<HTMLElement>('[data-works-section]');
  if (!section) return;

  const filterButtons = Array.from(
    section.querySelectorAll<HTMLButtonElement>('[data-work-filter]'),
  );
  const keywordInput = section.querySelector<HTMLInputElement>('[data-work-keyword]');
  const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-work-card]'));
  const countNode = section.querySelector<HTMLElement>('[data-works-count]');
  const emptyBox = section.querySelector<HTMLElement>('[data-works-empty]');
  const emptyMsg = section.querySelector<HTMLElement>('[data-works-empty-msg]');
  const resetBtn = section.querySelector<HTMLButtonElement>('[data-works-reset]');
  const enterpriseGroup = section.querySelector<HTMLElement>('[data-works-group="enterprise"]');
  const fullstackGroup = section.querySelector<HTMLElement>('[data-works-group="fullstack"]');

  const totalCount = Number.parseInt(section.dataset.totalCount || String(cards.length), 10);
  const countTemplate = section.dataset.countTemplate || '{shown} / {total}';
  const emptyTemplate = section.dataset.emptyTemplate || 'No matching works for "{filter}".';

  let activeFilter = 'all';
  let activeFilterLabel = 'All';

  const applyFilter = () => {
    const query = (keywordInput?.value || '').trim().toLowerCase();
    let shownCount = 0;
    let shownEnterprise = 0;
    let shownFullstack = 0;

    for (const card of cards) {
      const tags = (card.dataset.workTags || '').split(',').filter(Boolean);
      const searchCorpus = card.dataset.workSearch || '';
      const matchesCategory = activeFilter === 'all' || tags.includes(activeFilter);
      const matchesKeyword = query.length === 0 || searchCorpus.includes(query);
      const visible = matchesCategory && matchesKeyword;

      card.hidden = !visible;
      if (visible) {
        shownCount += 1;
        if (card.dataset.workGroup === 'enterprise') shownEnterprise += 1;
        if (card.dataset.workGroup === 'fullstack') shownFullstack += 1;
      }
    }

    if (enterpriseGroup) enterpriseGroup.hidden = shownEnterprise === 0;
    if (fullstackGroup) fullstackGroup.hidden = shownFullstack === 0;

    if (countNode) {
      countNode.textContent = countTemplate
        .replace('{shown}', String(shownCount))
        .replace('{total}', String(totalCount));
    }

    if (emptyBox) {
      emptyBox.hidden = shownCount > 0;
      if (shownCount === 0 && emptyMsg) {
        const descriptor = query.length > 0 ? query : activeFilterLabel;
        emptyMsg.textContent = emptyTemplate.replace('{filter}', descriptor);
      }
    }
  };

  for (const btn of filterButtons) {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.workFilter || 'all';
      activeFilterLabel = btn.dataset.filterLabel || activeFilter;
      for (const candidate of filterButtons) {
        candidate.setAttribute(
          'aria-pressed',
          candidate === btn ? 'true' : 'false',
        );
      }
      applyFilter();
    });
  }

  keywordInput?.addEventListener('input', () => {
    applyFilter();
  });

  resetBtn?.addEventListener('click', () => {
    activeFilter = 'all';
    if (keywordInput) keywordInput.value = '';
    for (const candidate of filterButtons) {
      const isAll = candidate.dataset.workFilter === 'all';
      candidate.setAttribute('aria-pressed', isAll ? 'true' : 'false');
      if (isAll) activeFilterLabel = candidate.dataset.filterLabel || 'All';
    }
    applyFilter();
  });
}

function formatUtc7Display(isoString: string, locale: string): string {
  const ms = Date.parse(isoString);
  if (Number.isNaN(ms)) return isoString;
  const shifted = new Date(ms + UTC7_OFFSET_MS);
  const yyyy = shifted.getUTCFullYear();
  const mm = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(shifted.getUTCDate()).padStart(2, '0');
  const hh = String(shifted.getUTCHours()).padStart(2, '0');
  const min = String(shifted.getUTCMinutes()).padStart(2, '0');
  return locale === 'id'
    ? `${dd}/${mm}/${yyyy} ${hh}:${min} WIB (UTC+7)`
    : `${yyyy}-${mm}-${dd} ${hh}:${min} UTC+7`;
}

function renderGitHubSnapshotToDom(container: HTMLElement, snapshot: GitHubSnapshot): void {
  const locale = container.dataset.locale || 'id';
  const noDescLabel = container.dataset.noDescLabel || '';
  const externalNotice = container.dataset.externalNotice || '';
  const cachedLabel = container.dataset.cachedLabel || 'Verified';

  const reposCountNode = container.querySelector<HTMLElement>('[data-gh-public-repos]');
  const followersNode = container.querySelector<HTMLElement>('[data-gh-followers]');
  const fetchedAtNode = container.querySelector<HTMLElement>('[data-gh-fetched-at]');
  const statusNode = container.querySelector<HTMLElement>('[data-gh-status]');
  const unavailableBox = container.querySelector<HTMLElement>('[data-gh-unavailable]');

  if (reposCountNode) reposCountNode.textContent = String(snapshot.profile.public_repos);
  if (followersNode) followersNode.textContent = String(snapshot.profile.followers);
  if (fetchedAtNode) {
    fetchedAtNode.dataset.rawFetchedAt = snapshot.fetchedAt;
    fetchedAtNode.textContent = formatUtc7Display(snapshot.fetchedAt, locale);
  }
  if (statusNode) statusNode.textContent = cachedLabel;
  if (unavailableBox) unavailableBox.hidden = true;

  let listNode = container.querySelector<HTMLUListElement>('[data-gh-repos-list]');
  if (!listNode) {
    const wrapper = document.createElement('div');
    wrapper.className = 'mt-5';
    wrapper.setAttribute('data-gh-repos-wrapper', '');
    listNode = document.createElement('ul');
    listNode.className = 'm-0 mt-3 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2';
    listNode.setAttribute('data-gh-repos-list', '');
    wrapper.appendChild(listNode);
    container.appendChild(wrapper);
  }

  listNode.replaceChildren();
  for (const repo of snapshot.recentRepos) {
    const li = document.createElement('li');
    li.className = 'rounded-[3px] border border-[var(--border-grid)] bg-[var(--bg-canvas)] p-3.5';

    const topRow = document.createElement('div');
    topRow.className = 'flex items-start justify-between gap-2';

    const anchor = document.createElement('a');
    anchor.href = repo.html_url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.className =
      'inline-flex min-h-[44px] items-center font-mono-tech text-sm font-semibold text-[var(--accent-primary)] underline underline-offset-4';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = repo.name;
    anchor.appendChild(nameSpan);

    if (externalNotice) {
      const srSpan = document.createElement('span');
      srSpan.className = 'visually-hidden';
      srSpan.textContent = externalNotice;
      anchor.appendChild(srSpan);
    }

    topRow.appendChild(anchor);

    if (repo.language) {
      const badge = document.createElement('span');
      badge.className = 'swiss-badge';
      badge.textContent = repo.language;
      topRow.appendChild(badge);
    }

    const desc = document.createElement('p');
    desc.className = 'm-0 mt-1 text-xs leading-relaxed text-[var(--text-secondary)]';
    desc.textContent = repo.description ?? noDescLabel;

    const pushed = document.createElement('p');
    pushed.className = 'm-0 mt-2 font-mono-tech text-[0.75rem] text-[var(--text-muted)]';
    pushed.textContent = `pushed: ${repo.pushed_at.slice(0, 10)}`;

    li.append(topRow, desc, pushed);
    listNode.appendChild(li);
  }
}

function initGitHubTelemetry(): void {
  const container = document.querySelector<HTMLElement>('[data-github-telemetry]');
  if (!container) return;

  let buildSnapshot: GitHubSnapshot | null = null;
  const rawBuild = container.dataset.buildSnapshot;
  if (rawBuild) {
    try {
      buildSnapshot = validateGitHubSnapshot(JSON.parse(rawBuild));
    } catch {
      buildSnapshot = null;
    }
  }

  let hasTriggered = false;
  const runRevalidation = async () => {
    if (hasTriggered) return;
    hasTriggered = true;

    let storageRef: Storage | null = null;
    try {
      storageRef = window.localStorage;
    } catch {
      storageRef = null;
    }

    const statusNode = container.querySelector<HTMLElement>('[data-gh-status]');
    const previousStatusText = statusNode?.textContent || '';
    if (statusNode && container.dataset.syncingLabel) {
      statusNode.textContent = container.dataset.syncingLabel;
    }

    const outcome = await revalidateClientGitHubTelemetry({
      buildSnapshot,
      storage: storageRef,
      isOnline: navigator.onLine,
    });

    if (outcome.snapshot) {
      renderGitHubSnapshotToDom(container, outcome.snapshot);
    } else if (statusNode) {
      statusNode.textContent = previousStatusText;
    }
  };

  const labSection = document.getElementById('github-lab');
  if ('IntersectionObserver' in window && labSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          void runRevalidation();
        }
      },
      { rootMargin: '120px 0px', threshold: 0.05 },
    );
    observer.observe(labSection);
  } else {
    void runRevalidation();
  }
}

function initDirectEmailCopy(): void {
  const copyBtn = document.querySelector<HTMLButtonElement>('[data-copy-email]');
  const feedbackNode = document.querySelector<HTMLElement>('[data-copy-email-feedback]');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.dataset.copyEmail || 'anggavb8@gmail.com';
    const ok = await copyTextToClipboard(email);
    if (feedbackNode) {
      feedbackNode.textContent = ok
        ? copyBtn.dataset.copiedMsg || email
        : copyBtn.dataset.copyFailedMsg || email;
    }
  });
}

function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;

  const formId = form.dataset.formspreeId || '';
  const recipientEmail = form.dataset.recipientEmail || 'anggavb8@gmail.com';
  const submitBtn = form.querySelector<HTMLButtonElement>('[data-contact-submit]');
  const banner = form.querySelector<HTMLElement>('[data-form-banner]');
  const bannerTitle = form.querySelector<HTMLElement>('[data-form-banner-title]');
  const bannerBody = form.querySelector<HTMLElement>('[data-form-banner-body]');
  const recoveryBox = form.querySelector<HTMLElement>('[data-form-recovery]');
  const recoveryCopyEmailBtn = form.querySelector<HTMLButtonElement>('[data-recovery-copy-email]');
  const recoveryCopyDraftBtn = form.querySelector<HTMLButtonElement>('[data-recovery-copy-draft]');
  const recoveryMailtoLink = form.querySelector<HTMLAnchorElement>('[data-recovery-mailto]');
  const recoveryFeedback = form.querySelector<HTMLElement>('[data-recovery-feedback]');

  let messages: ContactValidationMessages = {
    nameLength: '2-100 chars required.',
    emailInvalid: 'Valid email required.',
    subjectLength: '3-120 chars required.',
    messageLength: '20-2000 chars required.',
  };
  try {
    if (form.dataset.validationMessages) {
      messages = JSON.parse(form.dataset.validationMessages) as ContactValidationMessages;
    }
  } catch {
    // Use default fallback strings.
  }

  let sessionStore: Storage | null = null;
  try {
    sessionStore = window.sessionStorage;
  } catch {
    sessionStore = null;
  }

  const inputs: Record<ContactFieldKey, HTMLInputElement | HTMLTextAreaElement | null> = {
    name: form.querySelector<HTMLInputElement>('[name="name"]'),
    email: form.querySelector<HTMLInputElement>('[name="email"]'),
    subject: form.querySelector<HTMLInputElement>('[name="subject"]'),
    message: form.querySelector<HTMLTextAreaElement>('[name="message"]'),
  };
  const gotchaInput = form.querySelector<HTMLInputElement>('[name="_gotcha"]');

  const readCurrentDraft = () => ({
    name: inputs.name?.value || '',
    email: inputs.email?.value || '',
    subject: inputs.subject?.value || '',
    message: inputs.message?.value || '',
  });

  const existingDraft = loadContactDraft(sessionStore);
  if (existingDraft) {
    if (inputs.name && !inputs.name.value) inputs.name.value = existingDraft.name;
    if (inputs.email && !inputs.email.value) inputs.email.value = existingDraft.email;
    if (inputs.subject && !inputs.subject.value) inputs.subject.value = existingDraft.subject;
    if (inputs.message && !inputs.message.value) inputs.message.value = existingDraft.message;
  }

  const syncRecoveryMailto = () => {
    if (recoveryMailtoLink) {
      recoveryMailtoLink.href = buildMailtoHref(recipientEmail, readCurrentDraft());
    }
  };

  const setFieldError = (field: ContactFieldKey, errorText: string | null) => {
    const input = inputs[field];
    const errorNode = form.querySelector<HTMLElement>(`[data-field-error="${field}"]`);
    if (!input || !errorNode) return;
    if (errorText) {
      input.setAttribute('aria-invalid', 'true');
      errorNode.hidden = false;
      errorNode.textContent = `[!] ${errorText}`;
    } else {
      input.setAttribute('aria-invalid', 'false');
      errorNode.hidden = true;
      errorNode.textContent = '';
    }
  };

  const fieldKeys: ContactFieldKey[] = ['name', 'email', 'subject', 'message'];
  for (const key of fieldKeys) {
    const el = inputs[key];
    if (!el) continue;

    el.addEventListener('blur', () => {
      if (el.value.length > 0) {
        setFieldError(key, validateSingleField(key, el.value, messages));
      }
    });

    el.addEventListener('input', () => {
      saveContactDraft(sessionStore, readCurrentDraft());
      syncRecoveryMailto();
      if (el.getAttribute('aria-invalid') === 'true') {
        const nextErr = validateSingleField(key, el.value, messages);
        if (!nextErr) setFieldError(key, null);
      }
    });
  }

  recoveryCopyEmailBtn?.addEventListener('click', async () => {
    const ok = await copyTextToClipboard(recipientEmail);
    if (recoveryFeedback) {
      recoveryFeedback.textContent = ok
        ? form.dataset.emailCopiedMsg || recipientEmail
        : form.dataset.copyFailedMsg || recipientEmail;
    }
  });

  recoveryCopyDraftBtn?.addEventListener('click', async () => {
    const formatted = formatDraftForClipboard(readCurrentDraft());
    const ok = await copyTextToClipboard(formatted);
    if (recoveryFeedback) {
      recoveryFeedback.textContent = ok
        ? form.dataset.draftCopiedMsg || 'Copied draft.'
        : form.dataset.copyFailedMsg || recipientEmail;
    }
  });

  const showBanner = (options: {
    tone: 'success' | 'error';
    title: string;
    body: string;
    showRecovery: boolean;
  }) => {
    if (!banner || !bannerTitle || !bannerBody) return;
    banner.hidden = false;
    banner.style.backgroundColor =
      options.tone === 'success' ? 'var(--state-status-bg)' : 'var(--state-error-bg)';
    banner.style.borderColor =
      options.tone === 'success' ? 'var(--accent-status)' : 'var(--state-error)';
    bannerTitle.style.color =
      options.tone === 'success' ? 'var(--accent-status)' : 'var(--state-error)';
    bannerTitle.textContent =
      options.tone === 'success' ? `[OK] ${options.title}` : `[!] ${options.title}`;
    bannerBody.textContent = options.body;
    if (recoveryBox) {
      recoveryBox.hidden = !options.showRecovery;
      if (options.showRecovery) syncRecoveryMailto();
    }
    if (recoveryFeedback) recoveryFeedback.textContent = '';
  };

  if (!isFormspreeConfigured(formId)) {
    if (submitBtn) submitBtn.disabled = true;
    return;
  }

  let isSubmitting = false;
  let cooldownTimer: number | null = null;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isSubmitting || !submitBtn || submitBtn.disabled) return;

    const draft = readCurrentDraft();
    const turnstileInput = form.querySelector<HTMLInputElement>(
      'input[name="cf-turnstile-response"]',
    );

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.textContent = form.dataset.submittingLabel || 'Sending...';

    const outcome = await submitContactToFormspree({
      formId,
      payload: {
        ...draft,
        _gotcha: gotchaInput?.value || '',
      },
      messages,
      turnstileToken: turnstileInput?.value,
      storage: sessionStore,
    });

    isSubmitting = false;
    submitBtn.removeAttribute('aria-busy');

    if (outcome.status === 'success' || outcome.status === 'bot_ignored') {
      form.reset();
      for (const key of fieldKeys) {
        setFieldError(key, null);
        inputs[key]?.removeAttribute('aria-invalid');
      }
      showBanner({
        tone: 'success',
        title: form.dataset.successTitle || 'Message sent',
        body: form.dataset.successBody || '',
        showRecovery: false,
      });

      let remainingSeconds = Math.floor(SUBMIT_SUCCESS_COOLDOWN_MS / 1000);
      const template = form.dataset.cooldownTemplate || 'Wait {seconds}s';
      submitBtn.disabled = true;
      submitBtn.textContent = template.replace('{seconds}', String(remainingSeconds));

      if (cooldownTimer !== null) window.clearInterval(cooldownTimer);
      cooldownTimer = window.setInterval(() => {
        remainingSeconds -= 1;
        if (remainingSeconds <= 0) {
          if (cooldownTimer !== null) window.clearInterval(cooldownTimer);
          cooldownTimer = null;
          submitBtn.disabled = false;
          submitBtn.textContent = form.dataset.submitLabel || 'Send Message';
        } else {
          submitBtn.textContent = template.replace('{seconds}', String(remainingSeconds));
        }
      }, 1000);
      return;
    }

    submitBtn.disabled = false;
    submitBtn.textContent = form.dataset.submitLabel || 'Send Message';

    if (outcome.status === 'validation_error') {
      let firstInvalidField: (HTMLInputElement | HTMLTextAreaElement) | null = null;
      for (const key of fieldKeys) {
        const msg = outcome.fieldErrors[key] || null;
        setFieldError(key, msg);
        if (msg && !firstInvalidField && inputs[key]) {
          firstInvalidField = inputs[key];
        }
      }
      showBanner({
        tone: 'error',
        title: form.dataset.validationSummary || 'Validation error',
        body: outcome.summaryMessage || form.dataset.validationSummary || '',
        showRecovery: true,
      });
      firstInvalidField?.focus();
      return;
    }

    if (outcome.status === 'rate_limited') {
      showBanner({
        tone: 'error',
        title: 'HTTP 429',
        body: form.dataset.rateLimitMsg || 'Rate limit reached.',
        showRecovery: true,
      });
      return;
    }

    showBanner({
      tone: 'error',
      title: form.dataset.failedTitle || 'Delivery failed',
      body: form.dataset.failedBody || '',
      showRecovery: true,
    });
  });
}

function bootstrap(): void {
  initThemeControls();
  initMobileDialog();
  initLanguageSwitcherAnchorSync();
  initWorksFilter();
  initGitHubTelemetry();
  initDirectEmailCopy();
  initContactForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
