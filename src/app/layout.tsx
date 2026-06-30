import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Wild Rift Draft",
    template: "%s — Wild Rift Draft",
  },
  description:
    "Champion select coaching for Wild Rift players. Get instant pick recommendations and deep strategic analysis from your own hero pool.",
  keywords: ["Wild Rift", "champion select", "draft", "support", "coach"],
  openGraph: {
    title: "Wild Rift Draft",
    description: "Your Challenger-level champion select coach.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#080B10",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head />
      <body className="min-h-dvh bg-surface-0 text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
