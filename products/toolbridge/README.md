# ToolBridge

**Universal tool definition converter for multi-provider agents.**

By [Neverparse](https://neverparse.com) — agent-native primitives for the real world.

## Why agents need this

Every LLM provider uses a different format for tool definitions. OpenAI uses `function.parameters`, Anthropic uses `input_schema`, MCP uses `inputSchema`. The schemas are semantically identical but structurally incompatible. If your agent supports multiple providers — or consumes tools from MCP servers and needs to call them via OpenAI — you're stuck writing format conversion glue by hand.

ToolBridge converts between all major tool definition formats in a single API call. No LLM needed. Pure, deterministic JSON transformation.

## Supported formats

| Format | Key | Used by |
|--------|-----|---------|
| OpenAI function calling | `openai` | OpenAI GPT-4, GPT-3.5, Assistants API |
| Anthropic tool use | `anthropic` | Claude, Anthropic API |
| MCP tool schema | `mcp` | Model Context Protocol servers |
| JSON Schema | `jsonschema` | Universal schema format |

## Quickstart

```bash
curl -X POST https://neverparse.com/api/v1/toolbridge/convert \
  -H 'Content-Type: application/json' \
  -d '{
    "tool": {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get weather for a city",
        "parameters": {
          "type": "object",
          "properties": {
            "location": { "type": "string" }
          },
          "required": ["location"]
        }
      }
    },
    "from": "openai",
    "to": "anthropic"
  }'
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/toolbridge/convert` | Convert a single tool definition between formats |
| POST | `/api/v1/toolbridge/detect` | Auto-detect the format of a tool definition |
| POST | `/api/v1/toolbridge/batch` | Convert up to 100 tool definitions at once |

## Endpoints detail

### POST /api/v1/toolbridge/convert

Convert a tool definition from one format to another.

**Request body:**
```json
{
  "tool": { ... },
  "from": "openai",
  "to": "anthropic"
}
```

**Response:**
```json
{
  "result": { ... },
  "canonical": { "name": "...", "description": "...", "parameters": { ... } },
  "meta": { "from": "openai", "to": "anthropic", "fieldsPreserved": 2, "warnings": [] },
  "_meta": { "latencyMs": 1, "product": "toolbridge", "endpoint": "convert" }
}
```

### POST /api/v1/toolbridge/detect

Auto-detect the format of a tool definition.

**Request body:**
```json
{
  "tool": { "type": "function", "function": { "name": "...", ... } }
}
```

**Response:**
```json
{
  "format": "openai",
  "confidence": 1.0,
  "signals": ["has type: \"function\"", "function.name is string", ...],
  "_meta": { "latencyMs": 0, "product": "toolbridge", "endpoint": "detect" }
}
```

### POST /api/v1/toolbridge/batch

Convert multiple tool definitions at once (max 100).

**Request body:**
```json
{
  "tools": [{ ... }, { ... }],
  "from": "openai",
  "to": "mcp"
}
```

**Response:**
```json
{
  "results": [{ ... }, { ... }],
  "count": 2,
  "errors": [],
  "meta": { "from": "openai", "to": "mcp" },
  "_meta": { "latencyMs": 1, "product": "toolbridge", "endpoint": "batch" }
}
```

## License

MIT
