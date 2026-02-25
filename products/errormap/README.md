# ErrorMap

**Normalize any API error into RFC 9457 Problem Details with agent-ready classification.**

Every API returns errors differently. Stripe wraps them in `{ error: { type, message, code } }`. AWS uses `{ __type, message }`. GitHub uses `{ message, documentation_url }`. Some APIs return HTML error pages. Agents calling multiple APIs need custom parsers for each one — or they fail to recover from errors entirely.

ErrorMap takes any error response — JSON, HTML, or plain text — and returns a consistent [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html) object with error classification, retryability, and suggested recovery actions.

## Quickstart

```bash
curl -X POST https://neverparse.com/api/v1/errormap/parse \
  -H 'Content-Type: application/json' \
  -d '{
    "raw": {"error": {"code": "RATE_LIMIT_EXCEEDED", "message": "Too many requests"}},
    "statusCode": 429,
    "headers": {"Retry-After": "30"}
  }'
```

Response:

```json
{
  "problem": {
    "type": "https://neverparse.com/errors/rate_limit",
    "title": "Too many requests",
    "status": 429,
    "detail": "Too many requests",
    "category": "rate_limit",
    "retryable": true,
    "suggestedAction": "retry_with_backoff",
    "retryAfterMs": 30000
  },
  "_meta": { "latencyMs": 1, "product": "errormap", "endpoint": "parse" }
}
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/errormap/parse` | Parse any raw error (JSON, HTML, string) into Problem Details with classification |
| POST | `/api/v1/errormap/normalize` | Normalize a JSON error object to RFC 9457 format |
| POST | `/api/v1/errormap/classify` | Classify an error by category with retry guidance |

## Error Categories

| Category | HTTP Codes | Retryable | Suggested Action |
|----------|-----------|-----------|------------------|
| `auth` | 401 | No | `refresh_credentials` |
| `forbidden` | 403 | No | `check_permissions` |
| `not_found` | 404 | No | `check_resource_id` |
| `validation` | 400, 422 | No | `fix_input` |
| `rate_limit` | 429 | Yes | `retry_with_backoff` |
| `timeout` | 408, 504 | Yes | `retry_once` |
| `conflict` | 409 | Yes | `retry_with_backoff` |
| `server` | 500, 502, 503 | Yes | `retry_with_backoff` |

## Supported Input Formats

ErrorMap automatically handles:

- **RFC 9457 Problem Details** — passed through with classification added
- **Nested error objects** — `{ error: { message, code } }` (Stripe, OpenAI, etc.)
- **Simple error strings** — `{ error: "Not found" }`
- **Flat message objects** — `{ message: "...", statusCode: 401 }`
- **AWS-style** — `{ __type: "ResourceNotFoundException", message: "..." }`
- **GitHub-style** — `{ message: "Not Found", documentation_url: "..." }`
- **Error arrays** — `{ errors: [{ message: "..." }, ...] }`
- **HTML error pages** — Extracts title/h1 content
- **Plain text** — Used as-is for title/detail

## Use Cases

**Agent error recovery**: When your agent calls an external API and gets an error, pipe it through ErrorMap to get a consistent format with retry guidance.

**Multi-API orchestration**: Agents calling Stripe, GitHub, AWS, and Slack in one workflow get wildly different error formats. ErrorMap normalizes them all.

**Retry logic**: Use `retryable` and `retryAfterMs` to build automatic retry logic without per-API retry configuration.

**Error logging**: Normalize all errors to RFC 9457 before logging for consistent, queryable error records.
