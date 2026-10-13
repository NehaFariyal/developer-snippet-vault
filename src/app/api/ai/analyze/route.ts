import { NextResponse } from 'next/server';
import { analyzeSnippetWithGemini } from '@/lib/gemini';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to use AI analysis.' },
        { status: 401 }
      );
    }

    const { code, language, title } = await request.json();

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        { error: 'Code content is required for AI analysis.' },
        { status: 400 }
      );
    }

    const result = await analyzeSnippetWithGemini(code, language || 'text', title || '');

    return NextResponse.json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    console.error('AI Analysis Route error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze code snippet with Gemini AI.' },
      { status: 500 }
    );
  }
}
