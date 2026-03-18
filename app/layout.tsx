import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clearly Voices",
  description: "Canadian consumer research simulation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#2a3441] min-h-screen text-white antialiased font-sans overflow-hidden">
        {children}
      </body>
    </html>
  );
}
