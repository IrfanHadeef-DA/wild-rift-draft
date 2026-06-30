"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Loader2, Mail, Lock } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/draft";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-1 p-6 shadow-card">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Sign in</h2>
        <p className="mt-1 text-sm text-text-muted">
          Enter your email and password to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-medium text-text-secondary uppercase tracking-wider"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={cn(
                "w-full rounded border border-border-default bg-surface-2 pl-9 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted",
                "transition-colors focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
              )}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-medium text-text-secondary uppercase tracking-wider"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={cn(
                "w-full rounded border border-border-default bg-surface-2 pl-9 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted",
                "transition-colors focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
              )}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent",
            "transition-all duration-150 hover:bg-accent/20 hover:border-accent/50",
            "focus:outline-none focus:ring-2 focus:ring-accent/30",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-text-muted">
        No account?{" "}
        <Link
          href="/signup"
          className="text-accent hover:text-accent/80 transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
