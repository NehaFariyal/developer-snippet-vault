'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Code2, Globe, Lock, FileText, Check, AlertCircle } from 'lucide-react';
import { Snippet } from '@/types';

interface SnippetEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  snippetToEdit?: Snippet | null;
  onSaved: (snippet: Snippet) => void;
}

const LANGUAGES = [
  { value: 'typescript', label: 'TypeScript (.ts/.tsx)' },
  { value: 'javascript', label: 'JavaScript (.js/.jsx)' },
  { value: 'python', label: 'Python (.py)' },
  { value: 'sql', label: 'SQL' },
  { value: 'go', label: 'Go (.go)' },
  { value: 'rust', label: 'Rust (.rs)' },
  { value: 'bash', label: 'Bash / Shell (.sh)' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown (.md)' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'yaml', label: 'YAML' },
];

export default function SnippetEditorModal({
  isOpen,
  onClose,
  snippetToEdit,
  onSaved,
}: SnippetEditorModalProps) {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [summary, setSummary] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'code' | 'notes'>('code');

  useEffect(() => {
    if (snippetToEdit) {
      setTitle(snippetToEdit.title);
      setLanguage(snippetToEdit.language);
      setCode(snippetToEdit.code);
      setNotes(snippetToEdit.notes || '');
      setTags(snippetToEdit.tags || []);
      setSummary(snippetToEdit.summary || '');
      setIsPublic(snippetToEdit.isPublic);
      setIsStarred(snippetToEdit.isStarred || false);
    } else {
      setTitle('');
      setLanguage('typescript');
      setCode('');
      setNotes('');
      setTags([]);
      setSummary('');
      setIsPublic(false);
      setIsStarred(false);
    }
    setError('');
  }, [snippetToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle on-demand AI Analysis with Google Gemini API
  const handleGenerateAI = async () => {
    if (!code.trim()) {
      setError('Please enter some code before analyzing with Google Gemini AI.');
      return;
    }

    setError('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, title }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze code with Gemini');
      }

      if (data.analysis) {
        setTags(data.analysis.tags || []);
        setSummary(data.analysis.summary || '');
      }
    } catch (err: any) {
      setError(err.message || 'AI enrichment failed. Check console.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      let cleaned = tagInput.trim().toLowerCase();
      if (!cleaned) return;
      if (!cleaned.startsWith('#')) cleaned = `#${cleaned}`;
      if (!tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) {
      setError('Title and code content are required.');
      return;
    }

    setError('');
    setSaveLoading(true);

    try {
      const isEditing = !!snippetToEdit;
      const url = isEditing ? `/api/snippets/${snippetToEdit.id}` : '/api/snippets';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          language,
          code,
          notes,
          tags,
          summary,
          isPublic,
          isStarred,
          autoAI: tags.length === 0 || !summary,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save snippet');
      }

      onSaved(data.snippet);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to persist snippet to vault.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#090e1c] border border-blue-500/30 rounded-2xl shadow-blue-glow overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d162a]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {snippetToEdit ? 'Edit Snippet' : 'New Developer Snippet'}
              </h2>
              <p className="text-xs text-blue-300/80">
                AI-powered code vault with auto-tagging and plain-English summaries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title and Language Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Snippet Title <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., PostgreSQL Connection Pool with SSL & Auto-Reconnect"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Syntax / Language <span className="text-blue-400">*</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tab Switcher for Code vs Documentation */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'code'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code Content</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'notes'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Technical Notes & Markdown</span>
              </button>
            </div>

            {/* AI Generator Button */}
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={aiLoading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition disabled:opacity-50"
              title="Trigger Google Gemini API to analyze this code and generate tags and summary"
            >
              <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
              <span>{aiLoading ? 'Gemini Analyzing...' : 'Auto-Generate with Gemini AI'}</span>
            </button>
          </div>

          {/* Editor Area */}
          {activeTab === 'code' ? (
            <div>
              <textarea
                required
                rows={10}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Paste or write your code snippet here..."
                className="w-full p-4 bg-[#050811] border border-slate-800 rounded-xl font-mono text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed resize-y"
              />
            </div>
          ) : (
            <div>
              <textarea
                rows={10}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="## Documentation & Usage Notes&#10;- Why was this snippet written?&#10;- Example parameters & return values..."
                className="w-full p-4 bg-[#050811] border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed resize-y"
              />
            </div>
          )}

          {/* AI Auto-Generated Metadata Section */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-600/20 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                Gemini AI Summary & Tags (Auto-generated on save or via button)
              </span>
              <span className="text-[11px] text-slate-400">Powered by @google/genai</span>
            </div>

            {/* Summary field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                1-Sentence Plain-English Summary
              </label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Plain-English explanation of snippet functionality..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-blue-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Tags input & chips */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tags (3–5 tags, press Enter or comma)
              </label>
              <div className="flex flex-wrap gap-1.5 items-center p-2 bg-slate-900 border border-slate-700 rounded-lg">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600/20 text-blue-300 border border-blue-500/30"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-400 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={tags.length === 0 ? 'Type tag and press Enter (#react, #async...)' : 'Add more...'}
                  className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none flex-1 min-w-[120px] px-1"
                />
              </div>
            </div>
          </div>

          {/* Visibility and Star Options */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
                />
                <span className="flex items-center gap-1">
                  {isPublic ? (
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>Publish to Community (Public Snippet URL)</span>
                </span>
              </label>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveLoading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition disabled:opacity-50 flex items-center space-x-2"
            >
              {saveLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving & Enriched...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{snippetToEdit ? 'Save Changes' : 'Save to Vault'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
