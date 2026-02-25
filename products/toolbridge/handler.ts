import { z } from "zod";

// --- Types ---

/** Internal canonical representation of a tool definition */
export interface CanonicalTool {
  name: string;
  description: string;
  parameters: JsonSchema;
  strict?: boolean;
}

export interface JsonSchema {
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  description?: string;
  enum?: unknown[];
  format?: string;
  default?: unknown;
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  allOf?: JsonSchema[];
  $ref?: string;
  $defs?: Record<string, JsonSchema>;
  additionalProperties?: boolean | JsonSchema;
  [key: string]: unknown;
}

export type ToolFormat = "openai" | "anthropic" | "mcp" | "jsonschema";

// OpenAI function calling format
export interface OpenAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: JsonSchema;
    strict?: boolean;
  };
}

// Anthropic tool use format
export interface AnthropicTool {
  name: string;
  description: string;
  input_schema: JsonSchema;
}

// MCP tool format
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: JsonSchema;
}

// --- Format Detection ---

export function detectFormat(tool: unknown): {
  format: ToolFormat;
  confidence: number;
  signals: string[];
} {
  if (!tool || typeof tool !== "object") {
    return { format: "jsonschema", confidence: 0, signals: ["not an object"] };
  }

  const obj = tool as Record<string, unknown>;
  const signals: string[] = [];

  // OpenAI: has `type: "function"` and `function` object with `name`
  if (obj.type === "function" && typeof obj.function === "object" && obj.function !== null) {
    const fn = obj.function as Record<string, unknown>;
    signals.push('has type: "function"');
    if (typeof fn.name === "string") signals.push("function.name is string");
    if (typeof fn.parameters === "object") signals.push("function.parameters exists");
    if (typeof fn.description === "string") signals.push("function.description exists");
    return { format: "openai", confidence: signals.length >= 3 ? 1.0 : 0.8, signals };
  }

  // Anthropic: has `input_schema` (snake_case)
  if ("input_schema" in obj && typeof obj.input_schema === "object") {
    signals.push("has input_schema (snake_case)");
    if (typeof obj.name === "string") signals.push("has name");
    if (typeof obj.description === "string") signals.push("has description");
    return { format: "anthropic", confidence: signals.length >= 2 ? 1.0 : 0.8, signals };
  }

  // MCP: has `inputSchema` (camelCase)
  if ("inputSchema" in obj && typeof obj.inputSchema === "object") {
    signals.push("has inputSchema (camelCase)");
    if (typeof obj.name === "string") signals.push("has name");
    if (typeof obj.description === "string") signals.push("has description");
    return { format: "mcp", confidence: signals.length >= 2 ? 1.0 : 0.8, signals };
  }

  // Raw JSON Schema: has `type`, `properties`, or looks like a schema
  if (
    obj.type === "object" ||
    (typeof obj.properties === "object" && obj.properties !== null)
  ) {
    signals.push("looks like JSON Schema");
    if (obj.type === "object") signals.push('has type: "object"');
    if (typeof obj.properties === "object") signals.push("has properties");
    return { format: "jsonschema", confidence: signals.length >= 2 ? 0.9 : 0.6, signals };
  }

  return { format: "jsonschema", confidence: 0.3, signals: ["no recognizable format signals"] };
}

// --- Parsing (format → canonical) ---

function parseOpenAI(tool: unknown): CanonicalTool {
  const obj = tool as OpenAITool;
  if (!obj.function?.name) {
    throw new Error("Invalid OpenAI tool: missing function.name");
  }
  return {
    name: obj.function.name,
    description: obj.function.description || "",
    parameters: (obj.function.parameters as JsonSchema) || { type: "object", properties: {} },
    strict: obj.function.strict,
  };
}

function parseAnthropic(tool: unknown): CanonicalTool {
  const obj = tool as AnthropicTool;
  if (!obj.name) {
    throw new Error("Invalid Anthropic tool: missing name");
  }
  return {
    name: obj.name,
    description: obj.description || "",
    parameters: (obj.input_schema as JsonSchema) || { type: "object", properties: {} },
  };
}

function parseMCP(tool: unknown): CanonicalTool {
  const obj = tool as MCPTool;
  if (!obj.name) {
    throw new Error("Invalid MCP tool: missing name");
  }
  return {
    name: obj.name,
    description: obj.description || "",
    parameters: (obj.inputSchema as JsonSchema) || { type: "object", properties: {} },
  };
}

function parseJsonSchema(tool: unknown): CanonicalTool {
  const obj = tool as JsonSchema & { name?: string; description?: string };
  return {
    name: obj.name || "unnamed_tool",
    description: obj.description || "",
    parameters: stripMeta(obj),
  };
}

/** Remove non-schema keys (name at top level) from a JSON Schema */
function stripMeta(schema: Record<string, unknown>): JsonSchema {
  const { name, ...rest } = schema;
  return rest as JsonSchema;
}

function parseToCanonical(tool: unknown, format: ToolFormat): CanonicalTool {
  switch (format) {
    case "openai":
      return parseOpenAI(tool);
    case "anthropic":
      return parseAnthropic(tool);
    case "mcp":
      return parseMCP(tool);
    case "jsonschema":
      return parseJsonSchema(tool);
    default:
      throw new Error(`Unsupported source format: ${format}`);
  }
}

// --- Emission (canonical → format) ---

function emitOpenAI(canonical: CanonicalTool): OpenAITool {
  const result: OpenAITool = {
    type: "function",
    function: {
      name: canonical.name,
      description: canonical.description,
      parameters: ensureObjectSchema(canonical.parameters),
    },
  };
  if (canonical.strict !== undefined) {
    result.function.strict = canonical.strict;
  }
  return result;
}

function emitAnthropic(canonical: CanonicalTool): AnthropicTool {
  return {
    name: canonical.name,
    description: canonical.description,
    input_schema: ensureObjectSchema(canonical.parameters),
  };
}

function emitMCP(canonical: CanonicalTool): MCPTool {
  return {
    name: canonical.name,
    description: canonical.description,
    inputSchema: ensureObjectSchema(canonical.parameters),
  };
}

function emitJsonSchema(canonical: CanonicalTool): JsonSchema {
  return {
    ...ensureObjectSchema(canonical.parameters),
    description: canonical.description || undefined,
  };
}

/** Ensure parameters are wrapped in a top-level object schema */
function ensureObjectSchema(schema: JsonSchema): JsonSchema {
  if (!schema.type) {
    return { type: "object", properties: schema.properties || {}, ...schema };
  }
  return schema;
}

function emitFromCanonical(canonical: CanonicalTool, format: ToolFormat): unknown {
  switch (format) {
    case "openai":
      return emitOpenAI(canonical);
    case "anthropic":
      return emitAnthropic(canonical);
    case "mcp":
      return emitMCP(canonical);
    case "jsonschema":
      return emitJsonSchema(canonical);
    default:
      throw new Error(`Unsupported target format: ${format}`);
  }
}

// --- Public API ---

export function convertTool(
  tool: unknown,
  from: ToolFormat,
  to: ToolFormat
): {
  result: unknown;
  canonical: CanonicalTool;
  meta: { from: ToolFormat; to: ToolFormat; fieldsPreserved: number; warnings: string[] };
} {
  const canonical = parseToCanonical(tool, from);
  const result = emitFromCanonical(canonical, to);
  const warnings: string[] = [];

  // Warn about strict mode loss when converting from OpenAI
  if (from === "openai" && to !== "openai" && canonical.strict !== undefined) {
    warnings.push(`'strict' mode is OpenAI-specific and was not preserved in ${to} output`);
  }

  // Warn about $ref usage (some formats don't support it)
  if (hasRefs(canonical.parameters)) {
    warnings.push("Schema contains $ref pointers which may not be supported by all formats");
  }

  const fieldsPreserved = countFields(canonical.parameters);

  return {
    result,
    canonical,
    meta: { from, to, fieldsPreserved, warnings },
  };
}

export function convertBatch(
  tools: unknown[],
  from: ToolFormat,
  to: ToolFormat
): {
  results: unknown[];
  count: number;
  errors: Array<{ index: number; error: string }>;
  meta: { from: ToolFormat; to: ToolFormat };
} {
  const results: unknown[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  for (let i = 0; i < tools.length; i++) {
    try {
      const converted = convertTool(tools[i], from, to);
      results.push(converted.result);
    } catch (err) {
      errors.push({
        index: i,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return {
    results,
    count: results.length,
    errors,
    meta: { from, to },
  };
}

// --- Helpers ---

function hasRefs(schema: JsonSchema): boolean {
  if (schema.$ref) return true;
  if (schema.properties) {
    for (const prop of Object.values(schema.properties)) {
      if (hasRefs(prop)) return true;
    }
  }
  if (schema.items && hasRefs(schema.items)) return true;
  if (schema.anyOf?.some(hasRefs)) return true;
  if (schema.oneOf?.some(hasRefs)) return true;
  if (schema.allOf?.some(hasRefs)) return true;
  return false;
}

function countFields(schema: JsonSchema): number {
  let count = 0;
  if (schema.properties) {
    count += Object.keys(schema.properties).length;
    for (const prop of Object.values(schema.properties)) {
      count += countFields(prop);
    }
  }
  if (schema.items) {
    count += countFields(schema.items);
  }
  return count;
}

// --- Input Schemas (for API route validation) ---

const ToolFormatEnum = z.enum(["openai", "anthropic", "mcp", "jsonschema"]);

export const ConvertInputSchema = z.object({
  tool: z.unknown().refine((v) => v !== undefined && v !== null, "tool is required"),
  from: ToolFormatEnum,
  to: ToolFormatEnum,
});

export const DetectInputSchema = z.object({
  tool: z.unknown().refine((v) => v !== undefined && v !== null, "tool is required"),
});

export const BatchInputSchema = z.object({
  tools: z.array(z.unknown()).min(1, "At least one tool is required").max(100, "Maximum 100 tools per batch"),
  from: ToolFormatEnum,
  to: ToolFormatEnum,
});
