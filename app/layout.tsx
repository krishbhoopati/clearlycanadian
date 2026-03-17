import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Consumer Simulation Lab",
  description: "Logic-based Canadian consumer research simulation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen text-gray-900 antialiased">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-semibold tracking-tight">Consumer Simulation Lab</h1>
          <p className="text-sm text-gray-500">Canadian retail research · local · zero API cost</p>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
