"use client";

import { useState, useMemo } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

function highlightTokens(code: string, language?: string): string {
  if (!language) return escapeHtml(code);

  let result = escapeHtml(code);

  if (language === "json") {
    result = result.replace(
      /(&quot;)(.*?)(&quot;)/g,
      '<span class="token-string">&quot;$2&quot;</span>'
    );
    result = result.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span class="token-number">$1</span>'
    );
    result = result.replace(
      /\b(true|false|null)\b/g,
      '<span class="token-boolean">$1</span>'
    );
    return result;
  }

  if (language === "bash" || language === "shell") {
    result = result.replace(
      /(#[^\n]*)/g,
      '<span class="token-comment">$1</span>'
    );
    result = result.replace(
      /(&#39;[^&#]*?&#39;|&quot;[^&]*?&quot;)/g,
      '<span class="token-string">$1</span>'
    );
    result = result.replace(
      /\b(curl|wget|npm|npx|echo|export)\b/g,
      '<span class="token-builtin">$1</span>'
    );
    result = result.replace(
      /(\s)(-{1,2}[\w-]+)/g,
      '$1<span class="token-keyword">$2</span>'
    );
    return result;
  }

  if (language === "typescript" || language === "javascript") {
    result = result.replace(
      /(\/\/[^\n]*)/g,
      '<span class="token-comment">$1</span>'
    );
    result = result.replace(
      /(&#39;[^&#]*?&#39;|&quot;[^&]*?&quot;|`[^`]*?`)/g,
      '<span class="token-string">$1</span>'
    );
    result = result.replace(
      /\b(const|let|var|function|return|import|from|export|default|async|await|new|if|else|try|catch|throw|class|interface|type|extends|implements)\b/g,
      '<span class="token-keyword">$1</span>'
    );
    result = result.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span class="token-number">$1</span>'
    );
    result = result.replace(
      /\b(true|false|null|undefined)\b/g,
      '<span class="token-boolean">$1</span>'
    );
    return result;
  }

  if (language === "python") {
    result = result.replace(
      /(#[^\n]*)/g,
      '<span class="token-comment">$1</span>'
    );
    result = result.replace(
      /(&#39;[^&#]*?&#39;|&quot;[^&]*?&quot;)/g,
      '<span class="token-string">$1</span>'
    );
    result = result.replace(
      /\b(import|from|def|return|class|if|else|elif|try|except|raise|with|as|for|in|while|True|False|None|and|or|not)\b/g,
      '<span class="token-keyword">$1</span>'
    );
    result = result.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span class="token-number">$1</span>'
    );
    return result;
  }

  if (language === "http") {
    result = result.replace(
      /^(\w[\w-]*?)(:)/gm,
      '<span class="token-keyword">$1</span><span class="token-operator">$2</span>'
    );
    return result;
  }

  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const highlighted = useMemo(
    () => highlightTokens(code, language),
    [code, language]
  );

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      {filename && (
        <div className="bg-np-surface-2 border border-np-border border-b-0 rounded-t-lg px-4 py-2 text-xs text-np-text-dim font-mono flex items-center justify-between">
          <span>{filename}</span>
          {language && (
            <span className="text-np-text-dim/60 uppercase text-[10px]">
              {language}
            </span>
          )}
        </div>
      )}
      <pre className={`${filename ? "rounded-t-none" : ""} relative`}>
        <button
          onClick={copy}
          className="absolute top-3 right-3 text-xs px-2 py-1 rounded bg-np-border text-np-text-dim hover:text-np-text opacity-0 group-hover:opacity-100 transition"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <code
          className={language ? `language-${language}` : ""}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}
