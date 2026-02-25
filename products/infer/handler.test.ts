import { describe, it, expect } from "vitest";
import { detectSchema, validateData, generateTypes } from "./handler";

describe("infer/detect", () => {
  it("infers primitives", () => {
    expect(detectSchema("hello").schema).toEqual({
      type: "string",
    });
    expect(detectSchema(42).schema).toEqual({ type: "integer" });
    expect(detectSchema(3.14).schema).toEqual({ type: "number" });
    expect(detectSchema(true).schema).toEqual({ type: "boolean" });
    expect(detectSchema(null).schema).toEqual({ type: "null" });
  });

  it("infers object schema", () => {
    const result = detectSchema({ name: "Alice", age: 30, active: true });
    expect(result.schema.type).toBe("object");
    expect(result.schema.properties).toHaveProperty("name");
    expect(result.schema.properties!.name.type).toBe("string");
    expect(result.schema.properties!.age.type).toBe("integer");
    expect(result.schema.properties!.active.type).toBe("boolean");
    expect(result.schema.required).toEqual(["name", "age", "active"]);
  });

  it("infers array schema", () => {
    const result = detectSchema([1, 2, 3]);
    expect(result.schema.type).toBe("array");
    expect(result.schema.items!.type).toBe("integer");
  });

  it("detects string formats", () => {
    expect(detectSchema("test@example.com").schema.format).toBe("email");
    expect(detectSchema("https://example.com").schema.format).toBe("uri");
    expect(detectSchema("2026-02-24T00:00:00Z").schema.format).toBe("date-time");
    expect(detectSchema("2026-02-24").schema.format).toBe("date");
    expect(detectSchema("550e8400-e29b-41d4-a716-446655440000").schema.format).toBe("uuid");
  });

  it("returns meta", () => {
    const result = detectSchema({ a: 1, b: [1, 2], c: { d: "e" } });
    expect(result.meta.fieldCount).toBeGreaterThan(0);
    expect(result.meta.depth).toBeGreaterThan(0);
    expect(result.meta.hasArrays).toBe(true);
  });
});

describe("infer/validate", () => {
  it("validates correct data", () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer" },
      },
      required: ["name", "age"],
    };
    const result = validateData({ name: "Alice", age: 30 }, schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("detects missing required fields", () => {
    const schema = {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    };
    const result = validateData({}, schema);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("detects type mismatches", () => {
    const schema = { type: "string" };
    const result = validateData(42, schema);
    expect(result.valid).toBe(false);
  });
});

describe("infer/generate", () => {
  const schema = {
    type: "object",
    properties: {
      name: { type: "string" },
      age: { type: "integer" },
    },
    required: ["name", "age"],
  };

  it("generates TypeScript", () => {
    const output = generateTypes(schema, "typescript");
    expect(output).toContain("type InferredType");
    expect(output).toContain("name: string");
    expect(output).toContain("age: number");
  });

  it("generates Zod", () => {
    const output = generateTypes(schema, "zod");
    expect(output).toContain("z.object");
    expect(output).toContain("z.string()");
    expect(output).toContain("z.number().int()");
  });

  it("generates JSON Schema", () => {
    const output = generateTypes(schema, "jsonschema");
    const parsed = JSON.parse(output);
    expect(parsed.type).toBe("object");
    expect(parsed.properties.name.type).toBe("string");
  });
});
