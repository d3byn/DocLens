import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"] });
const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "DocLens",
  description: "Ask questions grounded in your uploaded documents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={serif.variable}
      style={{ colorScheme: "light" }}
    >
      <body
        className={`${sans.className} min-h-dvh antialiased`}
        style={{ backgroundColor: "#F5EBDD", color: "#413333" }}
      >
        <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 sm:px-6">
          <header className="flex items-center gap-2.5 py-6">
            <img
              src="/favicon.png"
              alt="DocLens"
              className="h-8 w-8 object-contain"
            />

            <span className="font-(family-name:--font-serif) text-xl font-medium">
              DocLens
            </span>
          </header>

          <main className="flex-1 py-8 sm:py-12">
            {children}
          </main>

          <footer className="px-5 py-6">
            <p className="py-8 text-center text-xs text-[#413333]/50">
              Made by{" "}
              <a href="https://github.com/d3byn"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#F2765E] transition-colors duration-200 hover:text-[#C94F42]">
                Debayan
              </a>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}