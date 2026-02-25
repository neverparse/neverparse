import { describe, it, expect } from "vitest";
import { parseError, normalizeError, classifyError } from "./handler";

// --- Parse ---

describe("errormap/parse", () => {
  it("parses a simple string error", () => {
    const result = parseError("Something went wrong", 500);
    expect(result.problem.status).toBe(500);
    expect(result.problem.title).toBe("Something went wrong");
    expect(result.problem.type).toContain("server");
  });

  it("parses a JSON object with nested error", () => {
    const raw = {
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests, please slow down",
      },
    };
    const result = parseError(raw, 429);
    expect(result.problem.status).toBe(429);
    expect(result.problem.title).toBe("Too many requests, please slow down");
    expect(result.problem.category).toBe("rate_limit");
    expect(result.problem.retryable).toBe(true);
  });

  it("parses a simple error string in JSON", () => {
    const raw = { error: "Not found" };
    const result = parseError(raw, 404);
    expect(result.problem.status).toBe(404);
    expect(result.problem.title).toBe("Not found");
    expect(result.problem.category).toBe("not_found");
    expect(result.problem.retryable).toBe(false);
  });

  it("parses an HTML error page", () => {
    const html = "<html><body><h1>503 Service Unavailable</h1></body></html>";
    const result = parseError(html, 503);
    expect(result.problem.status).toBe(503);
    expect(result.problem.category).toBe("server");
    expect(result.problem.retryable).toBe(true);
  });

  it("parses already-RFC-9457 format", () => {
    const raw = {
      type: "https://example.com/errors/validation",
      title: "Validation Error",
      status: 422,
      detail: "The 'email' field is invalid",
    };
    const result = parseError(raw);
    expect(result.problem.status).toBe(422);
    expect(result.problem.title).toBe("Validation Error");
    expect(result.problem.detail).toBe("The 'email' field is invalid");
  });

  it("handles null input", () => {
    const result = parseError(null, 500);
    expect(result.problem.status).toBe(500);
    expect(result.problem.title).toBe("Internal Server Error");
  });

  it("respects Retry-After header", () => {
    const raw = { error: "rate limited" };
    const result = parseError(raw, 429, { "Retry-After": "30" });
    expect(result.problem.retryAfterMs).toBe(30000);
    expect(result.problem.retryable).toBe(true);
  });

  it("parses AWS-style errors", () => {
    const raw = {
      __type: "ResourceNotFoundException",
      message: "Requested resource not found",
    };
    const result = parseError(raw, 404);
    expect(result.problem.title).toBe("Requested resource not found");
    expect(result.problem.category).toBe("not_found");
  });

  it("parses errors with array of sub-errors", () => {
    const raw = {
      message: "Validation failed",
      errors: [
        { message: "name is required" },
        { message: "email is invalid" },
      ],
    };
    const result = parseError(raw, 400);
    expect(result.problem.title).toBe("Validation failed");
    expect(result.problem.detail).toContain("name is required");
    expect(result.problem.detail).toContain("email is invalid");
  });

  it("infers status from raw when not provided", () => {
    const raw = { statusCode: 403, message: "Access denied" };
    const result = parseError(raw);
    expect(result.problem.status).toBe(403);
    expect(result.problem.category).toBe("forbidden");
  });
});

// --- Normalize ---

describe("errormap/normalize", () => {
  it("normalizes a simple error to RFC 9457", () => {
    const result = normalizeError({ message: "Not found" }, 404);
    expect(result.problem.type).toBe("about:blank");
    expect(result.problem.title).toBe("Not found");
    expect(result.problem.status).toBe(404);
    expect(result.problem.detail).toBe("Not found");
  });

  it("normalizes Stripe-style errors", () => {
    const result = normalizeError(
      {
        error: {
          type: "card_error",
          message: "Your card was declined",
          code: "card_declined",
        },
      },
      402
    );
    expect(result.problem.title).toBe("Your card was declined");
    expect(result.problem.status).toBe(402);
  });

  it("normalizes GitHub-style errors", () => {
    const result = normalizeError(
      {
        message: "Not Found",
        documentation_url: "https://docs.github.com/rest",
      },
      404
    );
    expect(result.problem.title).toBe("Not Found");
    expect(result.problem.instance).toBe("https://docs.github.com/rest");
  });

  it("defaults to status 500 when none provided", () => {
    const result = normalizeError({ message: "Oops" });
    expect(result.problem.status).toBe(500);
  });
});

// --- Classify ---

describe("errormap/classify", () => {
  it("classifies auth errors", () => {
    const result = classifyError({ message: "Invalid token" }, 401);
    expect(result.category).toBe("auth");
    expect(result.retryable).toBe(false);
    expect(result.suggestedAction).toBe("refresh_credentials");
  });

  it("classifies rate limit errors", () => {
    const result = classifyError({ message: "Rate limited" }, 429);
    expect(result.category).toBe("rate_limit");
    expect(result.retryable).toBe(true);
    expect(result.suggestedAction).toBe("retry_with_backoff");
    expect(result.retryAfterMs).toBe(60000);
  });

  it("classifies validation errors", () => {
    const result = classifyError({ message: "Invalid input" }, 400);
    expect(result.category).toBe("validation");
    expect(result.retryable).toBe(false);
    expect(result.suggestedAction).toBe("fix_input");
  });

  it("classifies timeout errors", () => {
    const result = classifyError({ message: "Timed out" }, 504);
    expect(result.category).toBe("timeout");
    expect(result.retryable).toBe(true);
    expect(result.suggestedAction).toBe("retry_once");
  });

  it("classifies server errors as retryable", () => {
    const result = classifyError({ message: "Bad gateway" }, 502);
    expect(result.category).toBe("server");
    expect(result.retryable).toBe(true);
  });

  it("uses Retry-After header for timing", () => {
    const result = classifyError(
      { message: "Slow down" },
      429,
      { "retry-after": "120" }
    );
    expect(result.retryAfterMs).toBe(120000);
  });

  it("classifies conflict errors", () => {
    const result = classifyError({ message: "Version conflict" }, 409);
    expect(result.category).toBe("conflict");
    expect(result.retryable).toBe(true);
  });

  it("classifies forbidden as non-retryable", () => {
    const result = classifyError({ message: "Insufficient permissions" }, 403);
    expect(result.category).toBe("forbidden");
    expect(result.retryable).toBe(false);
    expect(result.suggestedAction).toBe("check_permissions");
  });
});
