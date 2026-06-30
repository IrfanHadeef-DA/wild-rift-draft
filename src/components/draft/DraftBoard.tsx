"use client";

import { useState } from "react";
import { Swords, X } from "lucide-react";
import { useChampions } from "@/hooks/useChampions";
import { useHeroPool } from "@/hooks/useHeroPool";
import { useDraftStore } from "@/store/draftStore";
import { ChampSelectScreen } from "./ChampSelectScreen";
import { AnalysisResult } from "./AnalysisResult";
import type { Champion, DraftPick } from "@/types";

type DraftPhase = "input" | "analyzing" | "result";

export function DraftBoard() {
  const { champions } = useChampions();
  const { pool } = useHeroPool();

  const {
    allyPicks, enemyPicks, userRole,
    addAllyPick, removeAllyPick, addEnemyPick, removeEnemyPick,
    setUserRole, resetDraft,
  } = useDraftStore();

  const [phase, setPhase] = useState<DraftPhase>("input");
  const [analysis, setAnalysis] = useState<null | { recommendation: unknown; coaching_panel: unknown }>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  function handleReset() {
    resetDraft();
    setPhase("input");
    setAnalysis(null);
    setAnalysisError(null);
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
        if (res.status === 501) {
          setPhase("result");
          setAnalysis({ recommendation: null, coaching_panel: null });
          return;
        }
        throw new Error(json.error);
      }

      setPhase("result");
      setAnalysis(json.data);

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
    <ChampSelectScreen
      champions={champions}
      heroPool={pool}
      allyPicks={allyPicks}
      enemyPicks={enemyPicks}
      userRole={userRole}
      isAnalyzing={phase === "analyzing"}
      analysisError={analysisError}
      onAddAlly={addAllyPick}
      onRemoveAlly={removeAllyPick}
      onAddEnemy={addEnemyPick}
      onRemoveEnemy={removeEnemyPick}
      onSetUserRole={setUserRole}
      onAnalyze={handleAnalyze}
      onReset={handleReset}
    />
  );
}
