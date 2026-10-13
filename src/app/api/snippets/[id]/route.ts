import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getSnippetById, updateSnippet, deleteSnippet } from '@/lib/db';
import { analyzeSnippetWithGemini } from '@/lib/gemini';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = params;
    const user = await getSessionUser();
    const snippet = await getSnippetById(id);

    if (!snippet) {
      return NextResponse.json({ error: 'Snippet not found' }, { status: 404 });
    }

    // Security check: if private, only owner can view
    if (!snippet.isPublic) {
      if (!user || user.id !== snippet.userId) {
        return NextResponse.json(
          { error: 'Unauthorized to view this private snippet' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ snippet });
  } catch (error) {
    console.error('Error getting snippet by ID:', error);
    return NextResponse.json({ error: 'Failed to retrieve snippet' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = params;
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to modify snippets' },
        { status: 401 }
      );
    }

    const existing = await getSnippetById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Snippet not found' }, { status: 404 });
    }

    // Enforce user can ONLY edit their own saved snippets
    if (existing.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only edit your own snippets' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, code, language, notes, isPublic, isStarred, reanalyzeAI } = body;
    let { tags, summary, explanation } = body;

    // Optional re-analysis with Gemini if code changed and requested
    if (reanalyzeAI && code) {
      try {
        const aiAnalysis = await analyzeSnippetWithGemini(code, language || existing.language, title || existing.title);
        tags = aiAnalysis.tags;
        summary = aiAnalysis.summary;
        explanation = aiAnalysis.explanation;
      } catch (e) {
        console.warn('Re-analysis with Gemini failed:', e);
      }
    }

    const updated = await updateSnippet(id, user.id, {
      title,
      code,
      language,
      notes,
      tags,
      summary,
      explanation,
      isPublic,
      isStarred,
    });

    return NextResponse.json({
      success: true,
      snippet: updated,
    });
  } catch (error) {
    console.error('Error updating snippet:', error);
    return NextResponse.json({ error: 'Failed to update snippet' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = params;
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to delete snippets' },
        { status: 401 }
      );
    }

    const existing = await getSnippetById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Snippet not found' }, { status: 404 });
    }

    // Enforce user can ONLY delete their own saved snippets
    if (existing.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own snippets' },
        { status: 403 }
      );
    }

    const ok = await deleteSnippet(id, user.id);
    if (!ok) {
      return NextResponse.json({ error: 'Failed to delete snippet' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Snippet deleted successfully' });
  } catch (error) {
    console.error('Error deleting snippet:', error);
    return NextResponse.json({ error: 'Failed to delete snippet' }, { status: 500 });
  }
}
