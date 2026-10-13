import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Developer Snippet Vault & AI Publisher',
  description:
    'A modern developer snippet vault featuring Google Gemini AI auto-tagging, 1-sentence summaries, and instant public publishing.',
  keywords: ['developer', 'snippets', 'code vault', 'gemini ai', 'google genai', 'syntax highlighting', 'nextjs'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#080d1a] text-slate-100 min-h-screen selection:bg-blue-600/30 selection:text-blue-200`}
      >
        {children}
      </body>
    </html>
  );
}
