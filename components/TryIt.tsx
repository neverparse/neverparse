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

  const run = async () => {
    setLoading(true);
    setError("");
    setOutput("");
    trackTryIt(slug);

    try {
      const parsed = JSON.parse(input);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      setOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-np-border rounded-lg overflow-hidden">
      <div className="bg-np-surface-2 px-4 py-2 border-b border-np-border flex items-center justify-between">
        <span className="text-xs font-mono text-np-text-dim">
          Try it — POST {endpoint}
        </span>
        <button
          onClick={run}
          disabled={loading}
          className="text-xs px-3 py-1 rounded bg-np-accent text-np-bg font-medium hover:bg-np-accent-dim disabled:opacity-50 transition"
        >
          {loading ? "Running..." : "Run"}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-np-border">
        <div className="p-4">
          <label className="text-xs text-np-text-dim mb-2 block">
            Request Body
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-48 bg-np-bg border border-np-border rounded p-3 font-mono text-sm text-np-text resize-none focus:outline-none focus:border-np-accent/50"
            spellCheck={false}
          />
        </div>
        <div className="p-4">
          <label className="text-xs text-np-text-dim mb-2 block">
            Response
          </label>
          <div className="w-full h-48 bg-np-bg border border-np-border rounded p-3 font-mono text-sm overflow-auto">
            {error ? (
              <span className="text-red-400">{error}</span>
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
