import { NextRequest, NextResponse } from "next/server";
import {
  normalizeError,
  NormalizeInputSchema,
} from "@/products/errormap/handler";

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const parsed = NormalizeInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message:
              "Required field: error (object with the error to normalize)",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const result = normalizeError(parsed.data.error, parsed.data.statusCode);
    const latency = Date.now() - start;

    return NextResponse.json({
      ...result,
      _meta: {
        latencyMs: latency,
        product: "errormap",
        endpoint: "normalize",
      },
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
