import { NextRequest, NextResponse } from "next/server";
import { validateData, ValidateInputSchema } from "@/products/infer/handler";

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const parsed = ValidateInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "Both 'data' and 'schema' fields are required",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const result = validateData(parsed.data.data as any, parsed.data.schema as any);
    const latency = Date.now() - start;

    return NextResponse.json({
      ...result,
      _meta: { latencyMs: latency, product: "infer", endpoint: "validate" },
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
