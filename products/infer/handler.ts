import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// --- Schema Inference ---

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

interface JsonSchemaNode {
  type: string | string[];
  properties?: Record<string, JsonSchemaNode>;
  items?: JsonSchemaNode;
  required?: string[];
  enum?: JsonValue[];
  format?: string;
  description?: string;
}

function inferType(value: JsonValue): JsonSchemaNode {
  if (value === null) return { type: "null" };
  if (typeof value === "string") {
    // Detect common formats
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return { type: "string", format: "date-time" };
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return { type: "string", format: "date" };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { type: "string", format: "email" };
    if (/^https?:\/\//.test(value)) return { type: "string", format: "uri" };
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    )
      return { type: "string", format: "uuid" };
    return { type: "string" };
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? { type: "integer" } : { type: "number" };
  }
  if (typeof value === "boolean") return { type: "boolean" };

  if (Array.isArray(value)) {
    if (value.length === 0) return { type: "array", items: { type: "unknown" } };
    // Merge schemas of all items
    const itemSchemas = value.map(inferType);
    const merged = mergeSchemas(itemSchemas);
    return { type: "array", items: merged };
  }

  if (typeof value === "object") {
    const properties: Record<string, JsonSchemaNode> = {};
    const required: string[] = [];
    for (const [k, v] of Object.entries(value)) {
      properties[k] = inferType(v as JsonValue);
      required.push(k);
    }
    return { type: "object", properties, required };
  }

  return { type: "unknown" };
}

function mergeSchemas(schemas: JsonSchemaNode[]): JsonSchemaNode {
  if (schemas.length === 0) return { type: "unknown" };
  if (schemas.length === 1) return schemas[0];

  const types = new Set(schemas.map((s) => (Array.isArray(s.type) ? s.type[0] : s.type)));
  if (types.size === 1) return schemas[0];

  // Mixed types: use anyOf or union type
  return { type: Array.from(types) };
}

export function detectSchema(data: JsonValue): {
  schema: JsonSchemaNode;
  meta: { fieldCount: number; depth: number; hasArrays: boolean };
} {
  const schema = inferType(data);
  const meta = analyzeSchema(schema);
  return { schema, meta };
}

function analyzeSchema(
  schema: JsonSchemaNode,
  depth = 0
): { fieldCount: number; depth: number; hasArrays: boolean } {
  let fieldCount = 0;
  let maxDepth = depth;
  let hasArrays = false;

  if (schema.properties) {
    fieldCount += Object.keys(schema.properties).length;
    for (const prop of Object.values(schema.properties)) {
      const sub = analyzeSchema(prop, depth + 1);
      fieldCount += sub.fieldCount;
      maxDepth = Math.max(maxDepth, sub.depth);
      hasArrays = hasArrays || sub.hasArrays;
    }
  }
  if (schema.type === "array" || (Array.isArray(schema.type) && schema.type.includes("array"))) {
    hasArrays = true;
    if (schema.items) {
      const sub = analyzeSchema(schema.items, depth + 1);
      fieldCount += sub.fieldCount;
      maxDepth = Math.max(maxDepth, sub.depth);
    }
  }

  return { fieldCount, depth: maxDepth, hasArrays };
}

// --- Validation ---

export function validateData(
  data: JsonValue,
  schema: JsonSchemaNode
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  validateNode(data, schema, "$", errors);
  return { valid: errors.length === 0, errors };
}

function validateNode(
  data: JsonValue,
  schema: JsonSchemaNode,
  path: string,
  errors: string[]
) {
  const expectedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];

  const actualType = getJsonType(data);
  // "integer" matches "number" in JSON
  const typeMatches = expectedTypes.some(
    (t) =>
      t === actualType ||
      (t === "integer" && actualType === "number" && Number.isInteger(data)) ||
      (t === "number" && actualType === "number")
  );

  if (!typeMatches && !expectedTypes.includes("null")) {
    errors.push(
      `${path}: expected ${expectedTypes.join("|")}, got ${actualType}`
    );
    return;
  }

  if (schema.type === "object" || expectedTypes.includes("object")) {
    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      if (schema.required) {
        for (const key of schema.required) {
          if (!(key in data)) {
            errors.push(`${path}.${key}: required field missing`);
          }
        }
      }
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          if (key in data) {
            validateNode(
              (data as Record<string, JsonValue>)[key],
              propSchema,
              `${path}.${key}`,
              errors
            );
          }
        }
      }
    }
  }

  if (
    (schema.type === "array" || expectedTypes.includes("array")) &&
    Array.isArray(data) &&
    schema.items
  ) {
    data.forEach((item, i) => {
      validateNode(item, schema.items!, `${path}[${i}]`, errors);
    });
  }
}

function getJsonType(value: JsonValue): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

// --- Type Generation ---

export function generateTypes(
  schema: JsonSchemaNode,
  format: "typescript" | "zod" | "jsonschema"
): string {
  if (format === "jsonschema") {
    return JSON.stringify(schema, null, 2);
  }
  if (format === "typescript") {
    return schemaToTypeScript(schema, "InferredType");
  }
  if (format === "zod") {
    return schemaToZod(schema, "inferredSchema");
  }
  return JSON.stringify(schema, null, 2);
}

function schemaToTypeScript(schema: JsonSchemaNode, name: string): string {
  const type = tsType(schema);
  return `type ${name} = ${type};`;
}

function tsType(schema: JsonSchemaNode): string {
  const t = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  switch (t) {
    case "string":
      return "string";
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "null":
      return "null";
    case "array":
      return schema.items ? `(${tsType(schema.items)})[]` : "unknown[]";
    case "object": {
      if (!schema.properties) return "Record<string, unknown>";
      const props = Object.entries(schema.properties)
        .map(([k, v]) => {
          const optional = !(schema.required?.includes(k));
          return `  ${k}${optional ? "?" : ""}: ${tsType(v)};`;
        })
        .join("\n");
      return `{\n${props}\n}`;
    }
    default:
      return "unknown";
  }
}

function schemaToZod(schema: JsonSchemaNode, name: string): string {
  const zodExpr = zodType(schema);
  return `import { z } from "zod";\n\nconst ${name} = ${zodExpr};`;
}

function zodType(schema: JsonSchemaNode): string {
  const t = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  switch (t) {
    case "string": {
      let base = "z.string()";
      if (schema.format === "email") base += ".email()";
      if (schema.format === "uri") base += ".url()";
      if (schema.format === "uuid") base += ".uuid()";
      return base;
    }
    case "number":
      return "z.number()";
    case "integer":
      return "z.number().int()";
    case "boolean":
      return "z.boolean()";
    case "null":
      return "z.null()";
    case "array":
      return schema.items ? `z.array(${zodType(schema.items)})` : "z.array(z.unknown())";
    case "object": {
      if (!schema.properties) return "z.record(z.unknown())";
      const props = Object.entries(schema.properties)
        .map(([k, v]) => {
          const optional = !(schema.required?.includes(k));
          const expr = zodType(v);
          return `  ${k}: ${expr}${optional ? ".optional()" : ""},`;
        })
        .join("\n");
      return `z.object({\n${props}\n})`;
    }
    default:
      return "z.unknown()";
  }
}

// --- Input Schemas (for validation) ---

export const DetectInputSchema = z.object({
  data: z.unknown(),
});

export const ValidateInputSchema = z.object({
  data: z.unknown(),
  schema: z.record(z.unknown()),
});

export const GenerateInputSchema = z.object({
  schema: z.record(z.unknown()),
  format: z.enum(["typescript", "zod", "jsonschema"]).default("jsonschema"),
});
