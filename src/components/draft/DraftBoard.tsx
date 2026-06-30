"use client";

import { useState, useCallback } from "react";
import { Swords, RotateCcw, Zap, ChevronRight, X, Users, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChampions } from "@/hooks/useChampions";
import { useHeroPool } from "@/hooks/useHeroPool";
import { useDraftStore } from "@/store/draftStore";
import { ChampionGrid } from "./ChampionGrid";
import { TeamSlot } from "./TeamSlot";
import { AnalysisResult } from "./AnalysisResult";
import type { Champion, DraftPick, Role } from "@/types";

type DraftSide = "ally" | "enemy" | null;
type DraftPhase = "input" | "analyzing" | "result";

const ROLE_OPTIONS: { value: Role; label: string; icon: string }[] = [
  { value: "support", label: "Support", icon: "🛡" },
  { value: "jungle", label: "Jungle", icon: "🌿" },
  { value: "mid", label: "Mid", icon: "⚡" },
  { value: "baron", label: "Baron", icon: "⚔️" },
  { value: "dragon", label: "Dragon", icon: "🏹" },
];

export function DraftBoard() {
  const { champions } = useChampions();
  const { pool } = useHeroPool();

  const {
    allyPicks, enemyPicks, userRole,
    addAllyPick, removeAllyPick, addEnemyPick, removeEnemyPick,
    setUserRole, resetDraft,
  } = useDraftStore();

  const [activeSide, setActiveSide] = useState<DraftSide>(null);
  const [phase, setPhase] = useState<DraftPhase>("input");
  const [analysis, setAnalysis] = useState<null | { recommendation: unknown; coaching_panel: unknown }>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // All picked champion IDs (can't pick same champ twice)
  const pickedIds = new Set([
    ...allyPicks.map((p) => p.champion_id),
    ...enemyPicks.map((p) => p.champion_id),
  ]);

  const availableChampions = champions.filter((c) => !pickedIds.has(c.id));

  function handleSelectChampion(champion: Champion) {
    if (!activeSide) return;

    const pick: DraftPick = { champion_id: champion.id, champion };

    if (activeSide === "ally") {
      addAllyPick(pick);
    } else {
      addEnemyPick(pick);
    }
    setActiveSide(null);
  }

  function handleReset() {
    resetDraft();
    setPhase("input");
    setAnalysis(null);
    setAnalysisError(null);
    setActiveSide(null);
  }

  async function handleAnalyze() {
    if (allyPicks.length === 0 && enemyPicks.length === 0) return;

    setPhase("analyzing");
    setAnalysisError(null);

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ally_picks: allyPicks.map((p) => p.champion?.slug ?? p.champion_id),
          enemy_picks: enemyPicks.map((p) => p.champion?.slug ?? p.champion_id),
          user_role: userRole,
          hero_pool: pool.map((e) => ({
            slug: e.champion?.slug ?? e.champion_id,
            proficiency: e.proficiency,
            role: e.role,
          })),
        }),
      });

      const json = await res.json();

      if (json.error) {
        // If analysis API is not yet fully implemented (M4), show a preview state
        if (res.status === 501) {
          setPhase("result");
          setAnalysis({ recommendation: null, coaching_panel: null });
          return;
        }
        throw new Error(json.error);
      }

      setPhase("result");
      setAnalysis(json.data);

      // Auto-save session to history (fire-and-forget)
      const recSlug = (json.data?.recommendation as { champion_slug?: string } | null)?.champion_slug;
      if (recSlug) {
        fetch("/api/champions").then(r => r.json()).then(cj => {
          const found = (cj.data ?? []).find((c: { slug: string; id: string }) => c.slug === recSlug);
          if (found) {
            fetch("/api/draft-sessions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ally_picks: allyPicks.map(p => ({ champion_id: p.champion_id })),
                enemy_picks: enemyPicks.map(p => ({ champion_id: p.champion_id })),
                picked_champion_id: found.id,
                outcome: "unknown",
              }),
            }).catch(() => {});
          }
        }).catch(() => {});
      }
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed");
      setPhase("input");
    }
  }

  const hasPoolForRole = pool.some((e) => e.role === userRole);
  const totalPicks = allyPicks.length + enemyPicks.length;
  const canAnalyze = totalPicks >= 1 && hasPoolForRole;

  if (phase === "result") {
    return (
      <AnalysisResult
        allyPicks={allyPicks}
        enemyPicks={enemyPicks}
        userRole={userRole}
        analysis={analysis}
        heroPool={pool}
        onBack={() => setPhase("input")}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="min-h-full p-4 md:p-6 max-w-4xl mx-auto">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <Swords className="h-5 w-5 text-accent" />
            Champion select
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Enter both teams&apos; picks, then get your recommendation.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {/* ── Your role selector ──────────────────────────────── */}
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-2">
          Your role this game
        </p>
        <div className="flex gap-2 flex-wrap">
          {ROLE_OPTIONS.map((r) => {
            const poolCount = pool.filter((e) => e.role === r.value).length;
            return (
              <button
                key={r.value}
                onClick={() => setUserRole(r.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
                  userRole === r.value
                    ? "bg-accent/10 border-accent/40 text-accent"
                    : "bg-surface-1 border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-2",
                  poolCount === 0 && userRole !== r.value && "opacity-40"
                )}
              >
                <span className="text-xs">{r.icon}</span>
                {r.label}
                {poolCount > 0 && (
                  <span className={cn(
                    "text-2xs rounded-full px-1.5 py-0.5 font-semibold",
                    userRole === r.value ? "bg-accent/20 text-accent" : "bg-surface-3 text-text-muted"
                  )}>
                    {poolCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {!hasPoolForRole && (
          <p className="mt-2 text-xs text-warning">
            You have no {ROLE_OPTIONS.find(r => r.value === userRole)?.label} champions saved. Add some in your Hero Pool first.
          </p>
        )}
      </div>

      {/* ── Draft grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-5">

        {/* Ally team */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-sm font-medium text-text-secondary uppercase tracking-wider text-xs">
              Your team
            </span>
            <span className="text-xs text-text-muted ml-auto">{allyPicks.length}/5</span>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const pick = allyPicks[i];
              return (
                <TeamSlot
                  key={i}
                  side="ally"
                  pick={pick}
                  isActive={activeSide === "ally" && !pick}
                  onAdd={() => !pick && allyPicks.length < 5 && setActiveSide("ally")}
                  onRemove={pick ? () => removeAllyPick(pick.champion_id) : undefined}
                  userRole={userRole}
                  slotIndex={i}
                />
              );
            })}
          </div>
        </div>

        {/* Enemy team */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-[#8C2F39]" />
            <span className="text-sm font-medium text-text-secondary uppercase tracking-wider text-xs">
              Enemy team
            </span>
            <span className="text-xs text-text-muted ml-auto">{enemyPicks.length}/5</span>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const pick = enemyPicks[i];
              return (
                <TeamSlot
                  key={i}
                  side="enemy"
                  pick={pick}
                  isActive={activeSide === "enemy" && !pick}
                  onAdd={() => !pick && enemyPicks.length < 5 && setActiveSide("enemy")}
                  onRemove={pick ? () => removeEnemyPick(pick.champion_id) : undefined}
                  userRole={userRole}
                  slotIndex={i}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Champion select panel — in-game style ───────────── */}
      {activeSide && (
        <div className="mb-5 animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-secondary">
              SELECT YOUR CHAMPION —{" "}
              <span className={activeSide === "ally" ? "text-accent" : "text-[#C9707A]"}>
                {activeSide === "ally" ? "your team" : "enemy team"}
              </span>
            </span>
            <button
              onClick={() => setActiveSide(null)}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ChampionGrid
            champions={availableChampions}
            onSelect={handleSelectChampion}
            side={activeSide}
          />
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────── */}
      {analysisError && (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {analysisError}
        </div>
      )}

      {/* ── Patch notice ────────────────────────────────────── */}
      <div className="mb-5 rounded-lg border border-border-subtle bg-surface-1 px-4 py-3 flex items-start gap-3">
        <div className="text-xs leading-none mt-0.5">📌</div>
        <div>
          <p className="text-xs font-medium text-text-secondary">Patch 7.1f · May 27, 2026</p>
          <p className="text-xs text-text-muted mt-0.5">
            Kayle, Akshan & Shen buffed. Taliyah, Viego, Ambessa, K&apos;Sante, Norra, Gragas & Kog&apos;Maw adjusted this patch.
          </p>
        </div>
      </div>

      {/* ── Analyze button ──────────────────────────────────── */}
      <button
        onClick={handleAnalyze}
        disabled={!canAnalyze || phase === "analyzing"}
        className={cn(
          "w-full flex items-center justify-center gap-3 rounded-xl py-4 text-base font-semibold transition-all duration-200",
          canAnalyze
            ? "bg-accent/10 border-2 border-accent/40 text-accent hover:bg-accent/20 hover:border-accent/60 accent-glow"
            : "bg-surface-1 border border-border-subtle text-text-muted cursor-not-allowed opacity-60"
        )}
      >
        {phase === "analyzing" ? (
          <>
            <div className="h-5 w-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            Analyzing draft…
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            Get recommendation
            <ChevronRight className="h-5 w-5" />
          </>
        )}
      </button>

      {!canAnalyze && totalPicks === 0 && (
        <p className="mt-3 text-center text-xs text-text-muted">
          Add at least one champion to either team to get started
        </p>
      )}
      {!canAnalyze && totalPicks > 0 && !hasPoolForRole && (
        <p className="mt-3 text-center text-xs text-warning">
          Save some {ROLE_OPTIONS.find(r => r.value === userRole)?.label} champions in your hero pool first
        </p>
      )}
    </div>
  );
}
