"use client";

import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export default function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      {filename && (
        <div className="bg-np-surface-2 border border-np-border border-b-0 rounded-t-lg px-4 py-2 text-xs text-np-text-dim font-mono">
          {filename}
        </div>
      )}
      <pre
        className={`${filename ? "rounded-t-none" : ""} relative`}
      >
        <button
          onClick={copy}
          className="absolute top-3 right-3 text-xs px-2 py-1 rounded bg-np-border text-np-text-dim hover:text-np-text opacity-0 group-hover:opacity-100 transition"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <code className={language ? `language-${language}` : ""}>
          {code}
        </code>
      </pre>
    </div>
  );
}
