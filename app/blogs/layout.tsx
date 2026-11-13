import type { ReactNode } from "react";

export default function BlogsLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[#f6efdc] text-[#2a2118]"
      style={{ fontFamily: "Archivo, system-ui, sans-serif" }}
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700&family=Playfair+Display:wght@700;900&display=swap"
      />

      <header className="bg-[#2d7550] text-[#f6efdc]">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 text-sm font-semibold">
          {/* Plain links: "/" is the static homepage, so a full page load is needed */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">FAST Islamic Society</a>
          <div className="flex gap-6">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/">Home</a>
            <a href="/blogs">Blogs</a>
          </div>
        </nav>
      </header>

      {children}

      <footer className="mt-16 border-t border-[#d8c9a3] py-8 text-center text-xs text-[#6b5b45]">
        FAST Islamic Society
      </footer>
    </div>
  );
}