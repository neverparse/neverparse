import { NextRequest, NextResponse } from "next/server";
import { detectSchema, DetectInputSchema } from "@/products/infer/handler";

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const parsed = DetectInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "The 'data' field is required",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const result = detectSchema(parsed.data.data as any);
    const latency = Date.now() - start;

    return NextResponse.json({
      ...result,
      _meta: { latencyMs: latency, product: "infer", endpoint: "detect" },
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
