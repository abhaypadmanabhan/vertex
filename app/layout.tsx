import type { Metadata } from "next";
import { Space_Grotesk, Inter, DM_Mono } from "next/font/google";
import "./globals.css";

// Display — heavy geometric grotesk standing in for PP Neue Machina (padzy display face).
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

// Body.
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// All data: numbers, IDs, timestamps, metrics (padzy invariant #1).
const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vertex — company intelligence by graph",
  description:
    "Type any company, even one launched days ago. Vertex enriches it live and traverses a shared graph to surface competitors and investor signals by structure, not by guess.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-screen bg-ground text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
