import Prism from 'prismjs';

// Load commonly used language components
if (typeof window !== 'undefined' || typeof global !== 'undefined') {
  try {
    require('prismjs/components/prism-javascript');
    require('prismjs/components/prism-typescript');
    require('prismjs/components/prism-python');
    require('prismjs/components/prism-jsx');
    require('prismjs/components/prism-tsx');
    require('prismjs/components/prism-sql');
    require('prismjs/components/prism-bash');
    require('prismjs/components/prism-json');
    require('prismjs/components/prism-yaml');
    require('prismjs/components/prism-markdown');
    require('prismjs/components/prism-docker');
    require('prismjs/components/prism-go');
    require('prismjs/components/prism-rust');
  } catch (e) {
    // If language loading fails in certain environments, fallback to basic tokens
  }
}

export function highlightCode(code: string, language: string = 'javascript'): string {
  if (!code) return '';

  const langMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    sh: 'bash',
    shell: 'bash',
    yml: 'yaml',
    md: 'markdown',
    dockerfile: 'docker',
  };

  const normalizedLang = langMap[language.toLowerCase()] || language.toLowerCase();
  const grammar = Prism.languages[normalizedLang] || Prism.languages.javascript || Prism.languages.markup;

  if (grammar) {
    try {
      return Prism.highlight(code, grammar, normalizedLang);
    } catch {
      return escapeHtml(code);
    }
  }

  return escapeHtml(code);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
