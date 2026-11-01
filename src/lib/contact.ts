export interface ContactFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  _gotcha: string;
}

export type ContactFieldKey = 'name' | 'email' | 'subject' | 'message';

export interface ContactValidationMessages {
  nameLength: string;
  emailInvalid: string;
  subjectLength: string;
  messageLength: string;
}

export interface ContactValidationResult {
  valid: boolean;
  isBotHoneypot: boolean;
  sanitized: ContactFormInput;
  fieldErrors: Partial<Record<ContactFieldKey, string>>;
}

export type ContactSubmitOutcome =
  | { status: 'success' }
  | { status: 'bot_ignored' }
  | { status: 'unconfigured' }
  | {
      status: 'validation_error';
      fieldErrors: Partial<Record<ContactFieldKey, string>>;
      summaryMessage?: string;
    }
  | { status: 'rate_limited'; httpStatus: 429 }
  | {
      status: 'delivery_failed';
      reason: 'http_error' | 'timeout' | 'network_error';
      httpStatus?: number;
    };

export const CONTACT_DRAFT_KEY = 'contact-draft-v1';
export const FORMSPREE_TIMEOUT_MS = 10_000;
export const SUBMIT_SUCCESS_COOLDOWN_MS = 60_000;
export const CONTACT_RECIPIENT_EMAIL = 'anggavb8@gmail.com';

const PLACEHOLDER_FORM_IDS = new Set([
  'undefined',
  'null',
  'your_form_id',
  'your-form-id',
  'form_id',
  'placeholder',
  'changeme',
  'xxx',
  'todo',
]);

// Practical RFC 5322 / HTML5 email check requiring a domain with at least one dot and 2+ char TLD.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isFormspreeConfigured(formId: string | undefined | null): boolean {
  if (!formId) return false;
  const trimmed = formId.trim();
  if (trimmed.length < 4) return false;
  if (PLACEHOLDER_FORM_IDS.has(trimmed.toLowerCase())) return false;
  return /^[a-zA-Z0-9]+$/.test(trimmed);
}

export function validateSingleField(
  field: ContactFieldKey,
  rawValue: string,
  messages: ContactValidationMessages,
): string | null {
  const value = rawValue.trim();
  switch (field) {
    case 'name':
      return value.length >= 2 && value.length <= 100 ? null : messages.nameLength;
    case 'email':
      return value.length >= 5 && value.length <= 254 && EMAIL_PATTERN.test(value)
        ? null
        : messages.emailInvalid;
    case 'subject':
      return value.length >= 3 && value.length <= 120 ? null : messages.subjectLength;
    case 'message':
      return value.length >= 20 && value.length <= 2000 ? null : messages.messageLength;
  }
}

export function validateContactPayload(
  raw: ContactFormInput,
  messages: ContactValidationMessages,
): ContactValidationResult {
  const sanitized: ContactFormInput = {
    name: raw.name.trim(),
    email: raw.email.trim(),
    subject: raw.subject.trim(),
    message: raw.message.trim(),
    _gotcha: raw._gotcha ?? '',
  };

  if (sanitized._gotcha.length > 0) {
    return {
      valid: false,
      isBotHoneypot: true,
      sanitized,
      fieldErrors: {},
    };
  }

  const fieldErrors: Partial<Record<ContactFieldKey, string>> = {};
  const keys: ContactFieldKey[] = ['name', 'email', 'subject', 'message'];
  for (const key of keys) {
    const err = validateSingleField(key, sanitized[key], messages);
    if (err) {
      fieldErrors[key] = err;
    }
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    isBotHoneypot: false,
    sanitized,
    fieldErrors,
  };
}

export function buildMailtoHref(
  recipientEmail: string,
  draft: Pick<ContactFormInput, 'name' | 'email' | 'subject' | 'message'>,
): string {
  const subjectText = draft.subject.trim() || 'Portfolio Inquiry - Angga VB';
  const bodyLines = [
    draft.message.trim(),
    '',
    '---',
    `From: ${draft.name.trim() || '-'} (${draft.email.trim() || '-'})`,
  ];
  const params = new URLSearchParams();
  params.set('subject', subjectText);
  params.set('body', bodyLines.join('\n'));
  // URLSearchParams encodes spaces as '+'; mail clients expect '%20'.
  const query = params.toString().replace(/\+/g, '%20');
  return `mailto:${recipientEmail}?${query}`;
}

export function formatDraftForClipboard(
  draft: Pick<ContactFormInput, 'name' | 'email' | 'subject' | 'message'>,
): string {
  return [
    `Subject: ${draft.subject.trim()}`,
    `Name: ${draft.name.trim()}`,
    `Email: ${draft.email.trim()}`,
    '',
    draft.message.trim(),
  ].join('\n');
}

export function saveContactDraft(
  storage: Pick<Storage, 'setItem'> | null,
  draft: Pick<ContactFormInput, 'name' | 'email' | 'subject' | 'message'>,
): void {
  if (!storage) return;
  try {
    storage.setItem(CONTACT_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage quota issues.
  }
}

export function loadContactDraft(
  storage: Pick<Storage, 'getItem'> | null,
): Pick<ContactFormInput, 'name' | 'email' | 'subject' | 'message'> | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(CONTACT_DRAFT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const rec = parsed as Record<string, unknown>;
    return {
      name: typeof rec.name === 'string' ? rec.name : '',
      email: typeof rec.email === 'string' ? rec.email : '',
      subject: typeof rec.subject === 'string' ? rec.subject : '',
      message: typeof rec.message === 'string' ? rec.message : '',
    };
  } catch {
    return null;
  }
}

export function clearContactDraft(storage: Pick<Storage, 'removeItem'> | null): void {
  if (!storage) return;
  try {
    storage.removeItem(CONTACT_DRAFT_KEY);
  } catch {
    // Ignore storage issues.
  }
}

export async function submitContactToFormspree(options: {
  formId: string | undefined | null;
  payload: ContactFormInput;
  messages: ContactValidationMessages;
  turnstileToken?: string;
  storage?: Pick<Storage, 'setItem' | 'removeItem'> | null;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  endpointBaseUrl?: string;
}): Promise<ContactSubmitOutcome> {
  if (!isFormspreeConfigured(options.formId)) {
    return { status: 'unconfigured' };
  }

  saveContactDraft(options.storage ?? null, {
    name: options.payload.name,
    email: options.payload.email,
    subject: options.payload.subject,
    message: options.payload.message,
  });

  const validation = validateContactPayload(options.payload, options.messages);
  if (validation.isBotHoneypot) {
    return { status: 'bot_ignored' };
  }
  if (!validation.valid) {
    return {
      status: 'validation_error',
      fieldErrors: validation.fieldErrors,
    };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? FORMSPREE_TIMEOUT_MS;
  const baseUrl = (options.endpointBaseUrl ?? 'https://formspree.io/f').replace(/\/+$/, '');
  const endpoint = `${baseUrl}/${encodeURIComponent(options.formId!.trim())}`;

  const bodyPayload: Record<string, string> = {
    name: validation.sanitized.name,
    email: validation.sanitized.email,
    subject: validation.sanitized.subject,
    message: validation.sanitized.message,
    _gotcha: validation.sanitized._gotcha,
  };
  if (options.turnstileToken && options.turnstileToken.trim().length > 0) {
    bodyPayload['cf-turnstile-response'] = options.turnstileToken.trim();
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // Zero automatic retries by contract to prevent duplicate inbox submissions.
  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });

    if (response.ok) {
      clearContactDraft(options.storage ?? null);
      return { status: 'success' };
    }

    if (response.status === 400 || response.status === 422) {
      const fieldErrors: Partial<Record<ContactFieldKey, string>> = {};
      let summaryMessage: string | undefined;
      try {
        const errBody = (await response.json()) as {
          error?: unknown;
          errors?: Array<{ field?: unknown; message?: unknown; code?: unknown }>;
        };
        if (typeof errBody.error === 'string') {
          summaryMessage = errBody.error;
        }
        if (Array.isArray(errBody.errors)) {
          for (const item of errBody.errors) {
            if (
              item &&
              typeof item.field === 'string' &&
              (item.field === 'name' ||
                item.field === 'email' ||
                item.field === 'subject' ||
                item.field === 'message') &&
              typeof item.message === 'string' &&
              item.message.trim().length > 0
            ) {
              fieldErrors[item.field] = item.message.trim();
            } else if (item && typeof item.message === 'string' && !summaryMessage) {
              summaryMessage = item.message.trim();
            }
          }
        }
      } catch {
        // Fallback to generic validation outcome while preserving draft.
      }
      return {
        status: 'validation_error',
        fieldErrors,
        summaryMessage,
      };
    }

    if (response.status === 429) {
      return { status: 'rate_limited', httpStatus: 429 };
    }

    return {
      status: 'delivery_failed',
      reason: 'http_error',
      httpStatus: response.status,
    };
  } catch (err) {
    const isAbort =
      err instanceof Error && (err.name === 'AbortError' || /abort/i.test(err.message));
    return {
      status: 'delivery_failed',
      reason: isAbort ? 'timeout' : 'network_error',
    };
  } finally {
    clearTimeout(timer);
  }
}
