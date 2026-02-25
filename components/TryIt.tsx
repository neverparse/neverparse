"use client";

import { useState } from "react";
import { trackTryIt } from "@/lib/analytics";

interface TryItProps {
  slug: string;
  endpoint: string;
  defaultInput: string;
}

export default function TryIt({ slug, endpoint, defaultInput }: TryItProps) {
  const [input, setInput] = useState(defaultInput);
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const run = async () => {
    setLoading(true);
    setError("");
    setOutput("");
    setResponseTime(null);
    setStatusCode(null);
    trackTryIt(slug);

    const start = performance.now();

    try {
      const parsed = JSON.parse(input);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const elapsed = Math.round(performance.now() - start);
      setResponseTime(elapsed);
      setStatusCode(res.status);
      const data = await res.json();
      setOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      setResponseTime(elapsed);
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-np-border rounded-lg overflow-hidden glow">
      <div className="bg-np-surface-2 px-4 py-3 border-b border-np-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-np-accent/20 text-np-accent">
            POST
          </span>
          <span className="text-xs font-mono text-np-text-dim">
            {endpoint}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {responseTime !== null && (
            <div className="flex items-center gap-2 text-xs font-mono">
              {statusCode !== null && (
                <span
                  className={
                    statusCode >= 200 && statusCode < 300
                      ? "text-np-accent"
                      : "text-red-400"
                  }
                >
                  {statusCode}
                </span>
              )}
              <span className="text-np-text-dim">{responseTime}ms</span>
            </div>
          )}
          <button
            onClick={run}
            disabled={loading}
            className="text-xs px-4 py-1.5 rounded bg-np-accent text-np-bg font-medium hover:bg-np-accent-dim disabled:opacity-50 transition flex items-center gap-2"
          >
            {loading && <span className="spinner" />}
            {loading ? "Running..." : "Run"}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-np-border">
        <div className="p-4">
          <label className="text-xs text-np-text-dim mb-2 block font-mono">
            Request Body
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-48 bg-np-bg border border-np-border rounded p-3 font-mono text-sm text-np-text resize-none focus:outline-none focus:border-np-accent/50 transition"
            spellCheck={false}
          />
        </div>
        <div className="p-4">
          <label className="text-xs text-np-text-dim mb-2 block font-mono">
            Response
          </label>
          <div className="w-full h-48 bg-np-bg border border-np-border rounded p-3 font-mono text-sm overflow-auto">
            {loading ? (
              <div className="flex items-center gap-2 text-np-text-dim">
                <span className="spinner" />
                <span>Sending request...</span>
              </div>
            ) : error ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <span className="text-red-400 font-semibold text-xs">
                    Error
                  </span>
                </div>
                <span className="text-red-400">{error}</span>
              </div>
            ) : output ? (
              <pre className="bg-transparent border-0 p-0 m-0 text-np-accent">
                {output}
              </pre>
            ) : (
              <span className="text-np-text-dim">
                Click &quot;Run&quot; to see the response
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
