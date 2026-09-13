import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Document Q&A Assistant",
  description: "Ask questions grounded in your uploaded documents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen text-gray-900 antialiased">
        <header className="border-b bg-white sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center text-white text-sm font-bold">
              QA
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                DocLens
              </h1>
              <p className="text-xs text-gray-500">
                Answers are grounded in your uploaded document — not model memory.
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>

        <footer className="max-w-3xl mx-auto px-6 pb-10 text-xs text-gray-400">
          Retrieval-Augmented Generation demo · Next.js + Gemini
        </footer>
      </body>
    </html>
  );
}