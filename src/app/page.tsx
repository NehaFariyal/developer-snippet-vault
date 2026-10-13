'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import SnippetCard from '@/components/SnippetCard';
import SnippetEditorModal from '@/components/SnippetEditorModal';
import SnippetDetailModal from '@/components/SnippetDetailModal';
import AuthModal from '@/components/AuthModal';
import { Snippet, User } from '@/types';
import {
  Sparkles,
  FolderCode,
  Tag,
  Star,
  Globe,
  Grid3X3,
  List,
  Plus,
  Code2,
} from 'lucide-react';

const POPULAR_LANGUAGES = [
  'all',
  'typescript',
  'javascript',
  'python',
  'sql',
  'go',
  'rust',
  'bash',
  'html',
];

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [activeTab, setActiveTab] = useState<'mine' | 'starred' | 'community'>('mine');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [detailedSnippet, setDetailedSnippet] = useState<Snippet | null>(null);

  // Fetch Session User
  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    }
  };

  // Fetch Snippets
  const fetchSnippets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('tab', activeTab);
      if (selectedLanguage && selectedLanguage !== 'all') {
        params.set('language', selectedLanguage);
      }
      if (selectedTag) {
        params.set('tag', selectedTag);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const res = await fetch(`/api/snippets?${params.toString()}`);
      const data = await res.json();
      setSnippets(data.snippets || []);
    } catch (err) {
      console.error('Failed to load snippets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchSnippets();
  }, [activeTab, selectedLanguage, selectedTag, searchQuery, user]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setActiveTab('community');
      fetchSnippets();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSnippetSaved = () => {
    fetchSnippets();
    setEditingSnippet(null);
  };

  const handleDeleteSnippet = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this snippet?')) return;

    try {
      const res = await fetch(`/api/snippets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSnippets(snippets.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete snippet:', err);
    }
  };

  const handleToggleStar = async (snippet: Snippet) => {
    if (!user || user.id !== snippet.userId) return;

    const newStarred = !snippet.isStarred;
    try {
      const res = await fetch(`/api/snippets/${snippet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isStarred: newStarred }),
      });
      if (res.ok) {
        setSnippets(
          snippets.map((s) => (s.id === snippet.id ? { ...s, isStarred: newStarred } : s))
        );
      }
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  // Derive unique tags from snippets for tag cloud
  const allTags = useMemo(() => {
    const map = new Map<string, number>();
    snippets.forEach((s) => {
      s.tags?.forEach((t) => {
        const clean = t.toLowerCase();
        map.set(clean, (map.get(clean) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  }, [snippets]);

  // Metrics
  const stats = useMemo(() => {
    const total = snippets.length;
    const languagesCount = new Set(snippets.map((s) => s.language.toLowerCase())).size;
    const starredCount = snippets.filter((s) => s.isStarred).length;
    const publicCount = snippets.filter((s) => s.isPublic).length;
    return { total, languagesCount, starredCount, publicCount };
  }, [snippets]);

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCreate={() => {
          setEditingSnippet(null);
          setIsEditorOpen(true);
        }}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Hero Banner / Developer Stats */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#0d162d] via-[#0b1426] to-[#0a1020] border border-blue-500/25 shadow-blue-glow overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-xs font-semibold text-blue-300">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Google Gemini 2.5 Flash SDK Integration</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Developer Snippet Vault <span className="text-blue-400">& AI Publisher</span>
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Save your code snippets, technical notes, and reusable patterns. Gemini automatically extracts 
                relevant tags and 1-sentence plain-English summaries for effortless search and sharing.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <p className="text-xl font-bold text-white">{stats.total}</p>
                <p className="text-[11px] font-medium text-slate-400">Total Snippets</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <p className="text-xl font-bold text-blue-400">{stats.languagesCount}</p>
                <p className="text-[11px] font-medium text-slate-400">Languages</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <p className="text-xl font-bold text-amber-400">{stats.starredCount}</p>
                <p className="text-[11px] font-medium text-slate-400">Starred</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <p className="text-xl font-bold text-sky-400">{stats.publicCount}</p>
                <p className="text-[11px] font-medium text-slate-400">Public Live</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher & View Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          {/* Main Navigation Tabs */}
          <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
            <button
              onClick={() => {
                setActiveTab('mine');
                setSelectedTag(null);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'mine'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderCode className="w-3.5 h-3.5" />
              <span>My Vault</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('starred');
                setSelectedTag(null);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'starred'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Starred</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('community');
                setSelectedTag(null);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'community'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Community Feed</span>
            </button>
          </div>

          {/* View Toggles & Tag Reset */}
          <div className="flex items-center space-x-3">
            {selectedTag && (
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/30 text-xs text-blue-300">
                <span>Filtering: {selectedTag}</span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="hover:text-white font-bold ml-1 text-sm"
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex items-center space-x-1 p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-800 text-blue-400' : 'hover:text-white'}`}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-800 text-blue-400' : 'hover:text-white'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Language Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {POPULAR_LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                selectedLanguage === lang
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500 shadow-blue-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Tag Cloud Pills */}
        {allTags.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto py-1">
            <span className="text-xs text-slate-500 font-medium shrink-0 flex items-center gap-1">
              <Tag className="w-3 h-3 text-blue-400" />
              AI Tags:
            </span>
            {allTags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  selectedTag === tag
                    ? 'bg-blue-500 text-white shadow'
                    : 'bg-slate-900 text-blue-300/80 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {tag} <span className="text-[10px] opacity-60">({count})</span>
              </button>
            ))}
          </div>
        )}

        {/* Snippets Grid / List Display */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse p-6 space-y-4"
              >
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-6 bg-slate-800 rounded w-3/4" />
                <div className="h-32 bg-slate-950 rounded-xl" />
              </div>
            ))}
          </div>
        ) : snippets.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col space-y-4'
            }
          >
            {snippets.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                currentUser={user}
                onEdit={(s) => {
                  setEditingSnippet(s);
                  setIsEditorOpen(true);
                }}
                onDelete={handleDeleteSnippet}
                onSelectTag={(t) => setSelectedTag(t)}
                onViewDetails={(s) => setDetailedSnippet(s)}
                onToggleStar={handleToggleStar}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 text-center space-y-4 border border-dashed border-slate-800 rounded-3xl p-8 bg-slate-900/20">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Code2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No snippets found in this view</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                {activeTab === 'mine' && !user
                  ? 'Sign in or use 1-click Demo to see your personal snippets.'
                  : 'Start by saving your first snippet or adjust your search filter.'}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center space-x-3">
              {user ? (
                <button
                  onClick={() => {
                    setEditingSnippet(null);
                    setIsEditorOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Snippet</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow transition"
                >
                  Sign In / Demo Login
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>Developer Snippet Vault & AI Publisher • Powered by Next.js & Google Gemini API (@google/genai)</p>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setActiveTab('mine');
        }}
      />

      <SnippetEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingSnippet(null);
        }}
        snippetToEdit={editingSnippet}
        onSaved={handleSnippetSaved}
      />

      <SnippetDetailModal
        snippet={detailedSnippet}
        currentUser={user}
        onClose={() => setDetailedSnippet(null)}
        onEdit={(s) => {
          setEditingSnippet(s);
          setIsEditorOpen(true);
        }}
      />
    </div>
  );
}
