import { NextRequest, NextResponse } from "next/server";
import { convertBatch, BatchInputSchema } from "@/products/toolbridge/handler";

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const parsed = BatchInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "Fields 'tools' (array, 1-100), 'from', and 'to' are required",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { tools, from, to } = parsed.data;
    const result = convertBatch(tools, from, to);
    const latency = Date.now() - start;

    return NextResponse.json({
      ...result,
      _meta: { latencyMs: latency, product: "toolbridge", endpoint: "batch" },
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
