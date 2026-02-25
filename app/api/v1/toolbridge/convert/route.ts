import { NextRequest, NextResponse } from "next/server";
import { convertTool, ConvertInputSchema } from "@/products/toolbridge/handler";

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const parsed = ConvertInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "Fields 'tool', 'from', and 'to' are required. 'from'/'to' must be one of: openai, anthropic, mcp, jsonschema",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { tool, from, to } = parsed.data;
    const result = convertTool(tool, from, to);
    const latency = Date.now() - start;

    return NextResponse.json({
      ...result,
      _meta: { latencyMs: latency, product: "toolbridge", endpoint: "convert" },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: {
          code: "CONVERSION_ERROR",
          message: err instanceof Error ? err.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
