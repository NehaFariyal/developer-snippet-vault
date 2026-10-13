import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getSnippetsForUser, createSnippet, getPublicSnippets } from '@/lib/db';
import { analyzeSnippetWithGemini } from '@/lib/gemini';

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    const { searchParams } = new URL(request.url);

    const tab = searchParams.get('tab') || 'mine'; // 'mine' | 'starred' | 'community'
    const search = searchParams.get('search') || undefined;
    const language = searchParams.get('language') || undefined;
    const tag = searchParams.get('tag') || undefined;

    if (tab === 'community') {
      const publicSnippets = await getPublicSnippets();
      let filtered = publicSnippets;
      if (language && language !== 'all') {
        filtered = filtered.filter((s) => s.language.toLowerCase() === language.toLowerCase());
      }
      if (tag) {
        const cleanTag = tag.toLowerCase().startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
        filtered = filtered.filter((s) => s.tags.map((t) => t.toLowerCase()).includes(cleanTag));
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.code.toLowerCase().includes(q) ||
            s.summary.toLowerCase().includes(q) ||
            s.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return NextResponse.json({ snippets: filtered });
    }

    if (!user) {
      // If unauthenticated, show public snippets for browsing
      const publicSnippets = await getPublicSnippets();
      return NextResponse.json({ snippets: publicSnippets, isGuest: true });
    }

    const starredOnly = tab === 'starred';
    const snippets = await getSnippetsForUser(user.id, {
      search,
      language,
      tag,
      starredOnly,
      includePublic: false,
    });

    return NextResponse.json({ snippets, user });
  } catch (error) {
    console.error('Error fetching snippets:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve snippets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to create snippets.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, code, language, notes, tags, summary, explanation, isPublic, isStarred, autoAI } = body;

    if (!title || !code || !language) {
      return NextResponse.json(
        { error: 'Title, code content, and programming language are required.' },
        { status: 400 }
      );
    }

    let finalTags = tags;
    let finalSummary = summary;
    let finalExplanation = explanation;

    // AI Auto-Tagging & Summarization Integration
    // If tags/summary are empty or autoAI is requested, pass code to Google Gemini API (@google/genai)
    if (autoAI || !finalTags || finalTags.length === 0 || !finalSummary || finalSummary.trim() === '') {
      try {
        const aiAnalysis = await analyzeSnippetWithGemini(code, language, title);
        if (!finalTags || finalTags.length === 0) {
          finalTags = aiAnalysis.tags;
        }
        if (!finalSummary || finalSummary.trim() === '') {
          finalSummary = aiAnalysis.summary;
        }
        if (!finalExplanation) {
          finalExplanation = aiAnalysis.explanation;
        }
      } catch (aiErr) {
        console.warn('AI enrichment failed during snippet creation, proceeding with fallbacks:', aiErr);
      }
    }

    const snippet = await createSnippet({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      title: title.trim(),
      code: code.trim(),
      language: language.toLowerCase().trim(),
      notes: notes?.trim() || '',
      tags: Array.isArray(finalTags) ? finalTags : ['#code', `#${language.toLowerCase()}`],
      summary: finalSummary || 'Developer code snippet.',
      explanation: finalExplanation || '',
      isPublic: !!isPublic,
      isStarred: !!isStarred,
    });

    return NextResponse.json({
      success: true,
      snippet,
    });
  } catch (error) {
    console.error('Error creating snippet:', error);
    return NextResponse.json(
      { error: 'Failed to save code snippet.' },
      { status: 500 }
    );
  }
}
