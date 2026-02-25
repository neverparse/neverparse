import { NextRequest, NextResponse } from "next/server";
import { parseError, ParseInputSchema } from "@/products/errormap/handler";

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const parsed = ParseInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "Required field: raw (the raw error to parse)",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const result = parseError(
      parsed.data.raw,
      parsed.data.statusCode,
      parsed.data.headers
    );
    const latency = Date.now() - start;

    return NextResponse.json({
      ...result,
      _meta: { latencyMs: latency, product: "errormap", endpoint: "parse" },
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
