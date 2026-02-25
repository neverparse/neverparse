import { NextRequest, NextResponse } from "next/server";
import { generateTypes, GenerateInputSchema } from "@/products/infer/handler";

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const parsed = GenerateInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "'schema' is required, 'format' must be typescript|zod|jsonschema",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const output = generateTypes(
      parsed.data.schema as any,
      parsed.data.format as "typescript" | "zod" | "jsonschema"
    );
    const latency = Date.now() - start;

    return NextResponse.json({
      output,
      format: parsed.data.format,
      _meta: { latencyMs: latency, product: "infer", endpoint: "generate" },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: err instanceof Error ? err.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
