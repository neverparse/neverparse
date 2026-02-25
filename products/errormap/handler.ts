import { z } from "zod";

// --- Types ---

export type ErrorCategory =
  | "auth"
  | "rate_limit"
  | "not_found"
  | "validation"
  | "server"
  | "timeout"
  | "conflict"
  | "forbidden"
  | "unknown";

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}

export interface ClassifyResult {
  category: ErrorCategory;
  retryable: boolean;
  suggestedAction: string;
  retryAfterMs: number | null;
}

// --- Input Schemas ---

export const ParseInputSchema = z.object({
  raw: z.unknown(),
  statusCode: z.number().int().min(100).max(599).optional(),
  headers: z.record(z.string()).optional(),
});

export const NormalizeInputSchema = z.object({
  error: z.record(z.unknown()),
  statusCode: z.number().int().min(100).max(599).optional(),
});

export const ClassifyInputSchema = z.object({
  error: z.record(z.unknown()),
  statusCode: z.number().int().min(100).max(599).optional(),
  headers: z.record(z.string()).optional(),
});

// --- Parse ---

export function parseError(
  raw: unknown,
  statusCode?: number,
  headers?: Record<string, string>
): { problem: ProblemDetails & ClassifyResult } {
  const extracted = extractFields(raw);
  const status = statusCode || extracted.status || 500;
  const classification = classifyFromStatus(status, headers);

  return {
    problem: {
      type: `https://neverparse.com/errors/${classification.category}`,
      title: extracted.title || defaultTitle(status),
      status,
      detail: extracted.detail || extracted.title || "Unknown error",
      ...(extracted.instance ? { instance: extracted.instance } : {}),
      ...classification,
    },
  };
}

interface ExtractedFields {
  title: string | null;
  detail: string | null;
  status: number | null;
  instance: string | null;
}

function extractFields(raw: unknown): ExtractedFields {
  // Null / undefined
  if (raw === null || raw === undefined) {
    return { title: null, detail: null, status: null, instance: null };
  }

  // String input
  if (typeof raw === "string") {
    return extractFromString(raw);
  }

  // Object input
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return extractFromObject(raw as Record<string, unknown>);
  }

  // Anything else
  return { title: String(raw), detail: String(raw), status: null, instance: null };
}

function extractFromString(raw: string): ExtractedFields {
  const trimmed = raw.trim();

  // Try parsing as JSON
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        return extractFromObject(parsed);
      }
    } catch {
      // Not valid JSON, continue
    }
  }

  // HTML — extract title or h1 content
  if (trimmed.startsWith("<") || trimmed.includes("<!DOCTYPE")) {
    const titleMatch = trimmed.match(/<title[^>]*>([^<]+)<\/title>/i);
    const h1Match = trimmed.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const text = titleMatch?.[1] || h1Match?.[1] || null;
    const statusMatch = text?.match(/(\d{3})/);
    return {
      title: text?.trim() || "HTML error response",
      detail: text?.trim() || "Received an HTML error page",
      status: statusMatch ? parseInt(statusMatch[1], 10) : null,
      instance: null,
    };
  }

  // Plain text — check if it contains a status code
  const statusMatch = trimmed.match(/^(\d{3})\b/);
  return {
    title: trimmed.slice(0, 200),
    detail: trimmed.slice(0, 1000),
    status: statusMatch ? parseInt(statusMatch[1], 10) : null,
    instance: null,
  };
}

function extractFromObject(obj: Record<string, unknown>): ExtractedFields {
  // Already RFC 9457 format
  if (obj.type && obj.title && obj.status) {
    return {
      title: String(obj.title),
      detail: obj.detail ? String(obj.detail) : String(obj.title),
      status: typeof obj.status === "number" ? obj.status : null,
      instance: obj.instance ? String(obj.instance) : null,
    };
  }

  // Nested error object — drill into it
  // Formats: { error: { message, code } }, { error: "string" }
  if (obj.error !== undefined) {
    if (typeof obj.error === "string") {
      return {
        title: obj.error,
        detail: obj.error,
        status: extractStatusFromObj(obj),
        instance: null,
      };
    }
    if (typeof obj.error === "object" && obj.error !== null) {
      const nested = obj.error as Record<string, unknown>;
      return {
        title:
          extractMessage(nested) || extractMessage(obj) || "Unknown error",
        detail:
          extractDetail(nested) || extractMessage(nested) || "Unknown error",
        status: extractStatusFromObj(nested) || extractStatusFromObj(obj),
        instance: null,
      };
    }
  }

  // Flat object with message/code/etc
  const title = extractMessage(obj) || null;
  return {
    title,
    detail: extractDetail(obj) || title,
    status: extractStatusFromObj(obj),
    instance:
      (obj.instance as string) ||
      (obj.documentation_url as string) ||
      null,
  };
}

function extractMessage(obj: Record<string, unknown>): string | null {
  // Common message field names in order of specificity
  for (const key of ["message", "msg", "title", "error_description", "reason"]) {
    if (typeof obj[key] === "string" && obj[key]) {
      return obj[key] as string;
    }
  }
  // AWS-style __type
  if (typeof obj.__type === "string") {
    return humanizeCode(obj.__type);
  }
  // If there's a code but no message
  if (typeof obj.code === "string") {
    return humanizeCode(obj.code);
  }
  return null;
}

function extractDetail(obj: Record<string, unknown>): string | null {
  // Array of errors takes priority — more specific than a summary message
  if (Array.isArray(obj.errors) && obj.errors.length > 0) {
    const messages = obj.errors
      .slice(0, 5)
      .map((e: unknown) => {
        if (typeof e === "string") return e;
        if (typeof e === "object" && e !== null) {
          const err = e as Record<string, unknown>;
          return (err.message as string) || (err.msg as string) || JSON.stringify(e);
        }
        return String(e);
      });
    return messages.join("; ");
  }
  for (const key of ["detail", "description", "error_description"]) {
    if (typeof obj[key] === "string" && obj[key]) {
      return obj[key] as string;
    }
  }
  return null;
}

function extractStatusFromObj(obj: Record<string, unknown>): number | null {
  for (const key of ["status", "statusCode", "status_code", "code", "http_status"]) {
    const val = obj[key];
    if (typeof val === "number" && val >= 100 && val <= 599) {
      return val;
    }
  }
  return null;
}

function humanizeCode(code: string): string {
  // Convert "ResourceNotFoundException" → "Resource Not Found Exception"
  // Convert "RATE_LIMIT_EXCEEDED" → "Rate Limit Exceeded"
  if (code.includes("_")) {
    return code
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  // PascalCase
  return code.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function defaultTitle(status: number): string {
  const titles: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    408: "Request Timeout",
    409: "Conflict",
    422: "Unprocessable Entity",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
  };
  return titles[status] || `HTTP ${status} Error`;
}

// --- Normalize ---

export function normalizeError(
  error: Record<string, unknown>,
  statusCode?: number
): { problem: ProblemDetails } {
  const extracted = extractFromObject(error);
  const status = statusCode || extracted.status || 500;

  return {
    problem: {
      type: "about:blank",
      title: extracted.title || defaultTitle(status),
      status,
      detail:
        extracted.detail || extracted.title || defaultTitle(status),
      ...(extracted.instance ? { instance: extracted.instance } : {}),
    },
  };
}

// --- Classify ---

export function classifyError(
  error: Record<string, unknown>,
  statusCode?: number,
  headers?: Record<string, string>
): ClassifyResult {
  const extracted = extractFromObject(error);
  const status = statusCode || extracted.status || 500;
  return classifyFromStatus(status, headers);
}

function classifyFromStatus(
  status: number,
  headers?: Record<string, string>
): ClassifyResult {
  const retryAfterMs = parseRetryAfter(headers);

  if (status === 401) {
    return {
      category: "auth",
      retryable: false,
      suggestedAction: "refresh_credentials",
      retryAfterMs: null,
    };
  }

  if (status === 403) {
    return {
      category: "forbidden",
      retryable: false,
      suggestedAction: "check_permissions",
      retryAfterMs: null,
    };
  }

  if (status === 404) {
    return {
      category: "not_found",
      retryable: false,
      suggestedAction: "check_resource_id",
      retryAfterMs: null,
    };
  }

  if (status === 409) {
    return {
      category: "conflict",
      retryable: true,
      suggestedAction: "retry_with_backoff",
      retryAfterMs: retryAfterMs || 1000,
    };
  }

  if (status === 429) {
    return {
      category: "rate_limit",
      retryable: true,
      suggestedAction: "retry_with_backoff",
      retryAfterMs: retryAfterMs || 60000,
    };
  }

  if (status === 400 || status === 422) {
    return {
      category: "validation",
      retryable: false,
      suggestedAction: "fix_input",
      retryAfterMs: null,
    };
  }

  if (status === 408 || status === 504) {
    return {
      category: "timeout",
      retryable: true,
      suggestedAction: "retry_once",
      retryAfterMs: retryAfterMs || 5000,
    };
  }

  if (status >= 500) {
    return {
      category: "server",
      retryable: true,
      suggestedAction: "retry_with_backoff",
      retryAfterMs: retryAfterMs || 5000,
    };
  }

  return {
    category: "unknown",
    retryable: false,
    suggestedAction: "inspect_manually",
    retryAfterMs: null,
  };
}

function parseRetryAfter(
  headers?: Record<string, string>
): number | null {
  if (!headers) return null;

  // Case-insensitive header lookup
  const key = Object.keys(headers).find(
    (k) => k.toLowerCase() === "retry-after"
  );
  if (!key) return null;

  const value = headers[key];

  // Seconds (numeric)
  const seconds = parseInt(value, 10);
  if (!isNaN(seconds) && seconds > 0) {
    return seconds * 1000;
  }

  // HTTP-date
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    const ms = date.getTime() - Date.now();
    return ms > 0 ? ms : null;
  }

  return null;
}
