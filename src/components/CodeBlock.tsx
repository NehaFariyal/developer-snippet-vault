'use client';

import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { highlightCode } from '@/lib/prism';

interface CodeBlockProps {
  code: string;
  language: string;
  maxHeight?: string;
  showLineNumbers?: boolean;
}

export default function CodeBlock({
  code,
  language,
  maxHeight = 'max-h-72',
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const lines = code.split('\n');
  const highlighted = highlightCode(code, language);

  return (
    <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-[#070b14] font-mono text-sm text-slate-200">
      {/* Top mini-bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0b1222] border-b border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-blue-300 uppercase tracking-wider text-[11px]">
            {language || 'text'}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-500 text-[11px]">{lines.length} lines</span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-blue-600/30 hover:text-blue-300 border border-slate-700/60 transition-all text-xs"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300" />
              <span className="text-slate-300">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Container */}
      <div className={`p-3 overflow-x-auto ${maxHeight} overflow-y-auto leading-relaxed`}>
        {showLineNumbers ? (
          <div className="flex">
            <div
              className="select-none text-slate-600 text-right pr-3 font-mono text-xs border-r border-slate-800/80 select-none"
              style={{ minWidth: '2.5rem' }}
            >
              {lines.map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>
            <pre className="pl-3 overflow-visible flex-1 text-xs sm:text-sm font-mono leading-6">
              <code
                className={`language-${language}`}
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            </pre>
          </div>
        ) : (
          <pre className="text-xs sm:text-sm font-mono leading-6">
            <code
              className={`language-${language}`}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </pre>
        )}
      </div>
    </div>
  );
}
