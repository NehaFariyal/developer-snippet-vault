import { Metadata } from 'next';
import Link from 'next/link';
import { getSnippetById } from '@/lib/db';
import { notFound } from 'next/navigation';
import CodeBlock from '@/components/CodeBlock';
import { Sparkles, Terminal, ArrowLeft, Calendar, User as UserIcon, Globe, Lock } from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const snippet = await getSnippetById(params.id);
  if (!snippet) {
    return { title: 'Snippet Not Found - SnippetVault' };
  }
  return {
    title: `${snippet.title} | SnippetVault AI Publisher`,
    description: snippet.summary || `A ${snippet.language} code snippet stored in Developer Snippet Vault.`,
  };
}

export default async function SnippetPublicPage({ params }: PageProps) {
  const snippet = await getSnippetById(params.id);

  if (!snippet) {
    notFound();
  }

  const formattedDate = new Date(snippet.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-[#090e1c]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Snippet Vault</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Terminal className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              Snippet<span className="text-blue-400">Vault</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Snippet Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0b1224] border border-blue-500/30 shadow-blue-glow space-y-6">
          {/* Header Metadata */}
          <div>
            <div className="flex items-center space-x-2.5 mb-3 flex-wrap gap-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-600/20 text-blue-300 border border-blue-500/40">
                {snippet.language}
              </span>
              {snippet.isPublic ? (
                <span className="inline-flex items-center gap-1 text-xs text-sky-400 bg-sky-950/40 px-2.5 py-0.5 rounded-full border border-sky-800/40">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Public Snippet</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-900/60 px-2.5 py-0.5 rounded-full border border-slate-800">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Private Snippet</span>
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

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {snippet.title}
            </h1>
          </div>

          {/* AI Summary Banner */}
          {snippet.summary && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/50 via-sky-950/40 to-indigo-950/50 border border-blue-500/30">
              <div className="flex items-center space-x-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  Google Gemini AI Plain-English Summary
                </span>
              </div>
              <p className="text-sm text-slate-100 font-medium leading-relaxed">
                {snippet.summary}
              </p>
              {snippet.explanation && (
                <p className="text-xs text-blue-200/80 leading-relaxed border-t border-blue-800/40 pt-2 mt-2">
                  <span className="font-semibold text-blue-300">Technical Context: </span>
                  {snippet.explanation}
                </p>
              )}
            </div>
          )}

          {/* Code Viewer */}
          <div>
            <CodeBlock code={snippet.code} language={snippet.language} maxHeight="max-h-[600px]" />
          </div>

          {/* Documentation */}
          {snippet.notes && (
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Technical Documentation
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {snippet.notes}
              </p>
            </div>
          )}

          {/* Tags */}
          {snippet.tags && snippet.tags.length > 0 && (
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
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        Published with SnippetVault & Google Gemini AI (@google/genai)
      </footer>
    </div>
  );
}
