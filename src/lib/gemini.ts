import { GoogleGenAI } from '@google/genai';
import { AIAnalysisResult } from '@/types';

/**
 * Intelligent fallback generator when GEMINI_API_KEY is missing or offline
 */
function generateFallbackAnalysis(code: string, language: string, title: string): AIAnalysisResult {
  const lowerCode = code.toLowerCase();
  const tagsSet = new Set<string>();

  // Add language tag
  if (language) {
    tagsSet.add(`#${language.toLowerCase()}`);
  }

  // Detect frameworks and concepts
  if (lowerCode.includes('react') || lowerCode.includes('usestate') || lowerCode.includes('useeffect') || lowerCode.includes('jsx')) {
    tagsSet.add('#react');
  }
  if (lowerCode.includes('next') || lowerCode.includes('next/server') || lowerCode.includes('next/router')) {
    tagsSet.add('#nextjs');
  }
  if (lowerCode.includes('async') || lowerCode.includes('await') || lowerCode.includes('promise')) {
    tagsSet.add('#async');
  }
  if (lowerCode.includes('interface ') || lowerCode.includes('type ') || lowerCode.includes(': string')) {
    tagsSet.add('#typescript');
  }
  if (lowerCode.includes('select ') || lowerCode.includes('from ') || lowerCode.includes('insert ') || lowerCode.includes('table')) {
    tagsSet.add('#database');
    tagsSet.add('#sql');
  }
  if (lowerCode.includes('fetch(') || lowerCode.includes('axios') || lowerCode.includes('http') || lowerCode.includes('endpoint')) {
    tagsSet.add('#api');
    tagsSet.add('#networking');
  }
  if (lowerCode.includes('jwt') || lowerCode.includes('bcrypt') || lowerCode.includes('token') || lowerCode.includes('auth')) {
    tagsSet.add('#security');
    tagsSet.add('#auth');
  }
  if (lowerCode.includes('def ') || lowerCode.includes('import ') && language === 'python') {
    tagsSet.add('#python');
    tagsSet.add('#backend');
  }
  if (lowerCode.includes('class ') || lowerCode.includes('struct ')) {
    tagsSet.add('#oop');
  }
  if (lowerCode.includes('error') || lowerCode.includes('catch') || lowerCode.includes('try')) {
    tagsSet.add('#error-handling');
  }
  if (lowerCode.includes('docker') || lowerCode.includes('container')) {
    tagsSet.add('#devops');
  }

  // Ensure 3-5 tags
  const defaults = ['#snippet', '#utility', '#code', '#developer', '#productivity'];
  for (const def of defaults) {
    if (tagsSet.size >= 4) break;
    tagsSet.add(def);
  }

  const tags = Array.from(tagsSet).slice(0, 5);

  // Generate clean 1-sentence summary
  let summary = '';
  if (title && title.trim().length > 3) {
    summary = `A ${language || 'code'} implementation designed for ${title.toLowerCase().trim()} with modular developer utilities.`;
  } else if (lowerCode.includes('function') || lowerCode.includes('const ') || lowerCode.includes('def ')) {
    summary = `Provides an optimized ${language || 'programming'} routine implementing core logic and error-resilient execution.`;
  } else {
    summary = `A reusable ${language || 'code'} snippet configured for clean developer workflows.`;
  }

  return {
    tags,
    summary,
    explanation: 'Generated via fallback semantic analyzer. Set GEMINI_API_KEY in your environment to use Google Gemini AI directly.',
  };
}

/**
 * Main AI function: analyzes snippet code with Google Gemini API (@google/genai)
 */
export async function analyzeSnippetWithGemini(
  code: string,
  language: string = 'text',
  title: string = ''
): Promise<AIAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('GEMINI_API_KEY not detected, using intelligent heuristic fallback.');
    return generateFallbackAnalysis(code, language, title);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are a developer assistant integrated into Developer Snippet Vault.
Analyze the following code snippet and generate:
1. 3 to 5 relevant developer tags prefixed with '#' (e.g. #react, #typescript, #async, #api, #database).
2. Exactly 1 clear, plain-English summary sentence explaining what the code snippet does.
3. An optional 1-to-2 sentence technical explanation highlighting any key pattern, algorithm, or library used.

Title: ${title || 'Untitled Snippet'}
Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

You MUST respond strictly with a valid JSON object in this exact schema with no surrounding Markdown code fence:
{
  "tags": ["#tag1", "#tag2", "#tag3", "#tag4"],
  "summary": "A concise one-sentence plain-English summary of what this code accomplishes.",
  "explanation": "Brief technical note on design pattern or library used."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    
    // Clean potential markdown blocks
    let cleanJson = text.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(cleanJson);
    
    const formattedTags: string[] = Array.isArray(parsed.tags)
      ? parsed.tags
          .map((t: string) => (t.startsWith('#') ? t.toLowerCase().trim() : `#${t.toLowerCase().trim()}`))
          .filter((t: string) => t.length > 1)
          .slice(0, 5)
      : ['#code', `#${language.toLowerCase()}`, '#snippet'];

    return {
      tags: formattedTags.length >= 3 ? formattedTags : [...formattedTags, '#developer', '#productivity'].slice(0, 4),
      summary: parsed.summary || 'Reusable code snippet for developer workflows.',
      explanation: parsed.explanation || '',
    };
  } catch (error) {
    console.error('Error invoking Google Gemini API (@google/genai):', error);
    // Graceful fallback so saving snippets never breaks
    return generateFallbackAnalysis(code, language, title);
  }
}
