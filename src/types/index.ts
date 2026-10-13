export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Snippet {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  title: string;
  code: string;
  language: string;
  notes?: string;
  tags: string[];
  summary: string;
  explanation?: string;
  isPublic: boolean;
  isStarred?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysisResult {
  tags: string[];
  summary: string;
  explanation?: string;
}

export type SupportedLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'go'
  | 'rust'
  | 'html'
  | 'css'
  | 'sql'
  | 'json'
  | 'bash'
  | 'markdown'
  | 'yaml'
  | 'dockerfile'
  | 'java'
  | 'csharp'
  | 'cpp';
