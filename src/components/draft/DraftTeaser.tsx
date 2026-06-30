"use client";

import Link from "next/link";
import { Swords, Shield, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { useHeroPool } from "@/hooks/useHeroPool";
import { cn } from "@/lib/utils";

const ROLES = [
  { value: "support", label: "Support", icon: "🛡" },
  { value: "jungle", label: "Jungle", icon: "🌿" },
  { value: "mid", label: "Mid", icon: "⚡" },
  { value: "baron", label: "Baron", icon: "⚔️" },
  { value: "dragon", label: "Dragon", icon: "🏹" },
] as const;

export function DraftTeaser() {
  const { pool, loading } = useHeroPool();
  const totalSaved = pool.length;
  const rolesWithChampions = new Set(pool.map((e) => e.role));
  const isReady = totalSaved >= 1;

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-md">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all",
            isReady
              ? "bg-accent/10 border-accent/40 accent-glow"
              : "bg-surface-2 border-border-default"
          )}>
            <Swords className={cn("h-7 w-7", isReady ? "text-accent" : "text-text-muted")} />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-text-primary mb-2">
            {isReady ? "Ready to draft" : "Set up your pool first"}
          </h1>
          <p className="text-sm text-text-muted">
            {isReady
              ? "Champion select analysis is coming in the next build. Your pool is saved and ready."
              : "Before analyzing a draft, save the champions you actually play. The AI will only recommend from your pool."}
          </p>
        </div>

        {/* Pool status card */}
        <div className="rounded-xl border border-border-subtle bg-surface-1 p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Your hero pool
            </span>
            {!loading && totalSaved > 0 && (
              <span className="text-xs text-text-secondary">
                {totalSaved} champion{totalSaved !== 1 ? "s" : ""} saved
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 skeleton rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {ROLES.map((r) => {
                const count = pool.filter((e) => e.role === r.value).length;
                const hasChamps = count > 0;
                return (
                  <div
                    key={r.value}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      hasChamps ? "bg-surface-2" : "opacity-40"
                    )}
                  >
                    {hasChamps
                      ? <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                      : <Circle className="h-4 w-4 text-text-muted flex-shrink-0" />
                    }
                    <span className="mr-1">{r.icon}</span>
                    <span className={hasChamps ? "text-text-primary" : "text-text-muted"}>
                      {r.label}
                    </span>
                    <span className="ml-auto text-xs text-text-muted">
                      {hasChamps ? `${count} champion${count !== 1 ? "s" : ""}` : "empty"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          href="/profile"
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-150",
            isReady
              ? "bg-surface-2 border border-border-default text-text-secondary hover:text-text-primary hover:bg-surface-3"
              : "bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/50 accent-glow"
          )}
        >
          <Shield className="h-4 w-4" />
          {isReady ? "Manage hero pool" : "Build your hero pool"}
          <ArrowRight className="h-4 w-4" />
        </Link>

        {isReady && (
          <p className="mt-4 text-center text-xs text-text-muted">
            Draft analysis is coming in Milestone 3 — your pool is already saved and will be used automatically.
          </p>
        )}
      </div>
    </div>
  );
}
