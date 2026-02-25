# Infer — Schema Inference, Validation & Type Generation API

> Part of [Neverparse](https://neverparse.com) — agent-native primitives for the real world.

**Infer** lets agents understand unknown data. POST any JSON and get back a JSON Schema, TypeScript type, or Zod schema. Validate data against schemas. Generate typed interfaces on the fly.

## Why agents need this

- Agents call unknown APIs and receive untyped responses. Infer tells them the shape.
- Agents generate tool inputs. Infer validates them before execution.
- Agents compose multi-step pipelines. Infer generates the glue types.

## Quickstart

```bash
curl -X POST https://neverparse.com/api/v1/infer/detect \
  -H 'Content-Type: application/json' \
  -d '{"data": {"name": "Alice", "age": 30, "active": true}}'
```

Response:
```json
{
  "schema": {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "age": { "type": "integer" },
      "active": { "type": "boolean" }
    },
    "required": ["name", "age", "active"]
  },
  "meta": { "fieldCount": 3, "depth": 1, "hasArrays": false }
}
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/infer/detect` | Infer JSON Schema from data |
| POST | `/api/v1/infer/validate` | Validate data against a schema |
| POST | `/api/v1/infer/generate` | Generate TypeScript/Zod from schema |

## License

MIT
