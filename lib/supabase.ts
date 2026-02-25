import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function logApiCall(
  product: string,
  endpoint: string,
  statusCode: number,
  latencyMs: number,
  error?: string
) {
  await supabase.from("api_logs").insert({
    product,
    endpoint,
    status_code: statusCode,
    latency_ms: latencyMs,
    error: error || null,
    created_at: new Date().toISOString(),
  });
}
