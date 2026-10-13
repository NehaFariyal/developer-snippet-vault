'use client';

import { useState } from 'react';
import { Sparkles, Star, Edit3, Trash2, Globe, Lock, ExternalLink, Share2, Check } from 'lucide-react';
import { Snippet, User } from '@/types';
import CodeBlock from './CodeBlock';

interface SnippetCardProps {
  snippet: Snippet;
  currentUser?: User | null;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
  onSelectTag: (tag: string) => void;
  onViewDetails: (snippet: Snippet) => void;
  onToggleStar?: (snippet: Snippet) => void;
}

export default function SnippetCard({
  snippet,
  currentUser,
  onEdit,
  onDelete,
  onSelectTag,
  onViewDetails,
  onToggleStar,
}: SnippetCardProps) {
  const [copiedShare, setCopiedShare] = useState(false);
  const isOwner = currentUser?.id === snippet.userId;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/snippet/${snippet.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="group relative rounded-2xl bg-[#0b1224]/80 border border-slate-800 hover:border-blue-500/50 hover:shadow-blue-glow transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="p-5 pb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-600/20 text-blue-300 border border-blue-500/30">
              {snippet.language}
            </span>
            {snippet.isPublic ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded-full border border-sky-800/40">
                <Globe className="w-3 h-3" />
                <span>Public</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-full border border-slate-800">
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </span>
            )}
            {snippet.userName && (
              <span className="text-[11px] text-slate-500 truncate">
                by {snippet.userName}
              </span>
            )}
          </div>
          <h3
            onClick={() => onViewDetails(snippet)}
            className="text-base font-semibold text-white group-hover:text-blue-300 transition cursor-pointer truncate"
            title={snippet.title}
          >
            {snippet.title}
          </h3>
        </div>

        {/* Quick Card Controls */}
        <div className="flex items-center space-x-1 shrink-0">
          {onToggleStar && (
            <button
              onClick={() => onToggleStar(snippet)}
              className={`p-1.5 rounded-lg hover:bg-slate-800 transition ${
                snippet.isStarred ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title={snippet.isStarred ? 'Unstar snippet' : 'Star snippet'}
            >
              <Star className={`w-4 h-4 ${snippet.isStarred ? 'fill-amber-400' : ''}`} />
            </button>
          )}

          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-300 hover:bg-slate-800 transition"
            title="Copy shareable link"
          >
            {copiedShare ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>

          {isOwner && (
            <>
              <button
                onClick={() => onEdit(snippet)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-300 hover:bg-slate-800 transition"
                title="Edit snippet"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(snippet.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                title="Delete snippet"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* AI Plain-English Summary Banner */}
      {snippet.summary && (
        <div className="mx-5 mb-3 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-950/40 via-sky-950/30 to-blue-900/20 border border-blue-600/25 flex items-start space-x-2.5">
          <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5 animate-pulse" />
          <p className="text-xs text-blue-100/90 leading-snug line-clamp-2">
            {snippet.summary}
          </p>
        </div>
      )}

      {/* Code Block Snippet Preview */}
      <div className="px-5 flex-1 cursor-pointer" onClick={() => onViewDetails(snippet)}>
        <CodeBlock code={snippet.code} language={snippet.language} maxHeight="max-h-48" />
      </div>

      {/* Tags and Footer */}
      <div className="p-5 pt-3 mt-auto flex items-center justify-between gap-2 border-t border-slate-800/60 mt-3">
        <div className="flex flex-wrap gap-1.5 items-center">
          {snippet.tags && snippet.tags.length > 0 ? (
            snippet.tags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTag(tag);
                }}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-900 text-blue-300 hover:bg-blue-600/20 hover:text-blue-200 border border-slate-800 transition"
              >
                {tag}
              </button>
            ))
          ) : (
            <span className="text-[11px] text-slate-600">No tags</span>
          )}
        </div>

        <button
          onClick={() => onViewDetails(snippet)}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0 transition"
        >
          <span>Expand</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
