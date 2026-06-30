import Link from "next/link";
import { Swords } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-surface-0 flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 border border-border-subtle mb-6">
        <Swords className="h-7 w-7 text-text-muted" />
      </div>
      <h1 className="text-3xl font-bold text-text-primary mb-2">404</h1>
      <p className="text-text-muted mb-6 max-w-xs">
        This page doesn&apos;t exist. You might have followed a broken link or typed the wrong URL.
      </p>
      <Link
        href="/draft"
        className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 transition-all"
      >
        Back to draft
      </Link>
    </div>
  );
}
