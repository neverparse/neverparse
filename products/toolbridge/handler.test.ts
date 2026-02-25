import { describe, it, expect } from "vitest";
import { convertTool, convertBatch, detectFormat } from "./handler";

// --- Sample tools in each format ---

const openaiTool = {
  type: "function",
  function: {
    name: "get_weather",
    description: "Get the current weather for a location",
    parameters: {
      type: "object",
      properties: {
        location: { type: "string", description: "City name" },
        units: { type: "string", enum: ["celsius", "fahrenheit"] },
      },
      required: ["location"],
    },
    strict: true,
  },
};

const anthropicTool = {
  name: "get_weather",
  description: "Get the current weather for a location",
  input_schema: {
    type: "object",
    properties: {
      location: { type: "string", description: "City name" },
      units: { type: "string", enum: ["celsius", "fahrenheit"] },
    },
    required: ["location"],
  },
};

const mcpTool = {
  name: "get_weather",
  description: "Get the current weather for a location",
  inputSchema: {
    type: "object",
    properties: {
      location: { type: "string", description: "City name" },
      units: { type: "string", enum: ["celsius", "fahrenheit"] },
    },
    required: ["location"],
  },
};

// --- detect ---

describe("toolbridge/detect", () => {
  it("detects OpenAI format", () => {
    const result = detectFormat(openaiTool);
    expect(result.format).toBe("openai");
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it("detects Anthropic format", () => {
    const result = detectFormat(anthropicTool);
    expect(result.format).toBe("anthropic");
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it("detects MCP format", () => {
    const result = detectFormat(mcpTool);
    expect(result.format).toBe("mcp");
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it("detects raw JSON Schema", () => {
    const result = detectFormat({
      type: "object",
      properties: { name: { type: "string" } },
    });
    expect(result.format).toBe("jsonschema");
    expect(result.confidence).toBeGreaterThanOrEqual(0.6);
  });

  it("returns low confidence for unrecognizable input", () => {
    const result = detectFormat({ foo: "bar" });
    expect(result.confidence).toBeLessThan(0.5);
  });
});

// --- convert ---

describe("toolbridge/convert", () => {
  it("converts OpenAI → Anthropic", () => {
    const { result } = convertTool(openaiTool, "openai", "anthropic");
    const r = result as any;
    expect(r.name).toBe("get_weather");
    expect(r.description).toBe("Get the current weather for a location");
    expect(r.input_schema).toBeDefined();
    expect(r.input_schema.properties.location.type).toBe("string");
    expect(r.input_schema.required).toEqual(["location"]);
  });

  it("converts Anthropic → MCP", () => {
    const { result } = convertTool(anthropicTool, "anthropic", "mcp");
    const r = result as any;
    expect(r.name).toBe("get_weather");
    expect(r.inputSchema).toBeDefined();
    expect(r.inputSchema.properties.location.type).toBe("string");
  });

  it("converts MCP → OpenAI", () => {
    const { result } = convertTool(mcpTool, "mcp", "openai");
    const r = result as any;
    expect(r.type).toBe("function");
    expect(r.function.name).toBe("get_weather");
    expect(r.function.parameters.properties.location.type).toBe("string");
  });

  it("converts OpenAI → JSON Schema", () => {
    const { result } = convertTool(openaiTool, "openai", "jsonschema");
    const r = result as any;
    expect(r.type).toBe("object");
    expect(r.properties.location.type).toBe("string");
  });

  it("converts JSON Schema → Anthropic", () => {
    const schema = {
      name: "search_docs",
      description: "Search documentation",
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "integer" },
      },
      required: ["query"],
    };
    const { result } = convertTool(schema, "jsonschema", "anthropic");
    const r = result as any;
    expect(r.name).toBe("search_docs");
    expect(r.description).toBe("Search documentation");
    expect(r.input_schema.properties.query.type).toBe("string");
  });

  it("warns about strict mode loss", () => {
    const { meta } = convertTool(openaiTool, "openai", "anthropic");
    expect(meta.warnings.length).toBeGreaterThan(0);
    expect(meta.warnings[0]).toContain("strict");
  });

  it("preserves nested schemas", () => {
    const nested = {
      type: "function",
      function: {
        name: "create_user",
        description: "Create a user",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string" },
            address: {
              type: "object",
              properties: {
                street: { type: "string" },
                city: { type: "string" },
                zip: { type: "string" },
              },
              required: ["street", "city"],
            },
            tags: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["name"],
        },
      },
    };
    const { result, meta } = convertTool(nested, "openai", "mcp");
    const r = result as any;
    expect(r.inputSchema.properties.address.properties.street.type).toBe("string");
    expect(r.inputSchema.properties.tags.items.type).toBe("string");
    expect(meta.fieldsPreserved).toBeGreaterThanOrEqual(5);
  });

  it("round-trips through all formats", () => {
    // OpenAI → Anthropic → MCP → JSON Schema → OpenAI
    const step1 = convertTool(openaiTool, "openai", "anthropic").result;
    const step2 = convertTool(step1, "anthropic", "mcp").result;
    const step3 = convertTool(step2, "mcp", "jsonschema").result;
    const step4 = convertTool(
      { ...(step3 as object), name: "get_weather", description: "Get the current weather for a location" },
      "jsonschema",
      "openai"
    ).result;
    const r = step4 as any;
    expect(r.function.name).toBe("get_weather");
    expect(r.function.parameters.properties.location.type).toBe("string");
    expect(r.function.parameters.required).toEqual(["location"]);
  });
});

// --- batch ---

describe("toolbridge/batch", () => {
  it("converts multiple tools", () => {
    const tools = [openaiTool, { ...openaiTool, function: { ...openaiTool.function, name: "get_forecast" } }];
    const result = convertBatch(tools, "openai", "mcp");
    expect(result.count).toBe(2);
    expect(result.errors).toEqual([]);
    const r0 = result.results[0] as any;
    const r1 = result.results[1] as any;
    expect(r0.name).toBe("get_weather");
    expect(r1.name).toBe("get_forecast");
  });

  it("reports errors per-tool without failing batch", () => {
    const tools = [openaiTool, { invalid: true }, openaiTool];
    const result = convertBatch(tools, "openai", "mcp");
    expect(result.results.length).toBe(2);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].index).toBe(1);
  });
});

// --- error cases ---

describe("toolbridge/errors", () => {
  it("throws on invalid OpenAI tool", () => {
    expect(() => convertTool({ type: "function", function: {} }, "openai", "mcp")).toThrow(
      "Invalid OpenAI tool"
    );
  });

  it("throws on invalid Anthropic tool", () => {
    expect(() => convertTool({}, "anthropic", "openai")).toThrow("Invalid Anthropic tool");
  });

  it("throws on invalid MCP tool", () => {
    expect(() => convertTool({}, "mcp", "openai")).toThrow("Invalid MCP tool");
  });
});
