'use client';

import { useState } from 'react';
import { X, Sparkles, Download, Check, Globe, Lock, Share2, Calendar, User as UserIcon } from 'lucide-react';
import { Snippet, User } from '@/types';
import CodeBlock from './CodeBlock';

interface SnippetDetailModalProps {
  snippet: Snippet | null;
  currentUser?: User | null;
  onClose: () => void;
  onEdit?: (snippet: Snippet) => void;
}

export default function SnippetDetailModal({
  snippet,
  currentUser,
  onClose,
  onEdit,
}: SnippetDetailModalProps) {
  const [copiedShare, setCopiedShare] = useState(false);

  if (!snippet) return null;

  const isOwner = currentUser?.id === snippet.userId;

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      typescript: 'ts',
      javascript: 'js',
      python: 'py',
      sql: 'sql',
      go: 'go',
      rust: 'rs',
      bash: 'sh',
      html: 'html',
      css: 'css',
      json: 'json',
      markdown: 'md',
      yaml: 'yaml',
      dockerfile: 'dockerfile',
    };
    const ext = extMap[snippet.language.toLowerCase()] || 'txt';
    const filename = `${snippet.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${ext}`;
    const blob = new Blob([snippet.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/snippet/${snippet.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      // fallback
    }
  };

  const formattedDate = new Date(snippet.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#090e1c] border border-blue-500/30 rounded-2xl shadow-blue-glow overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-slate-800 bg-[#0d162a]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2.5 mb-2 flex-wrap gap-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-600/20 text-blue-300 border border-blue-500/30">
                  {snippet.language}
                </span>
                {snippet.isPublic ? (
                  <span className="inline-flex items-center gap-1 text-xs text-sky-400 bg-sky-950/40 px-2.5 py-0.5 rounded-full border border-sky-800/40">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Public AI Snippet</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-900/60 px-2.5 py-0.5 rounded-full border border-slate-800">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Private Vault Snippet</span>
                  </span>
                )}
                <div className="flex items-center text-xs text-slate-400 gap-1 ml-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formattedDate}</span>
                </div>
                {snippet.userName && (
                  <div className="flex items-center text-xs text-slate-400 gap-1 ml-2">
                    <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-blue-300">{snippet.userName}</span>
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{snippet.title}</h2>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
                title="Copy shareable link"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Share</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
                title="Download code file"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export</span>
              </button>

              {isOwner && onEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit(snippet);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
                >
                  Edit
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Gemini AI Summary & Explanation Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-sky-950/30 to-indigo-950/40 border border-blue-500/30">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                Google Gemini AI Summary & Insights
              </h4>
            </div>
            <p className="text-sm text-slate-100 font-medium leading-relaxed mb-2">
              {snippet.summary}
            </p>
            {snippet.explanation && (
              <p className="text-xs text-blue-200/80 leading-relaxed border-t border-blue-800/40 pt-2 mt-2">
                <span className="font-semibold text-blue-300">Technical Note: </span>
                {snippet.explanation}
              </p>
            )}
          </div>

          {/* Full Code Block */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Source Code
              </span>
            </div>
            <CodeBlock
              code={snippet.code}
              language={snippet.language}
              maxHeight="max-h-96"
              showLineNumbers={true}
            />
          </div>

          {/* Technical Documentation / Notes */}
          {snippet.notes && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Documentation & Usage Notes
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {snippet.notes}
              </p>
            </div>
          )}

          {/* Tags */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {snippet.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-blue-600/15 text-blue-300 border border-blue-500/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
