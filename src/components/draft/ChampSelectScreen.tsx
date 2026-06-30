"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, Zap, X, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChampionGrid } from "./ChampionGrid";
import { PlayerRow } from "./PlayerRow";
import type { Champion, DraftPick, HeroPoolEntry, Role } from "@/types";

type Side = "ally" | "enemy" | null;

interface ChampSelectScreenProps {
  champions: Champion[];
  heroPool: HeroPoolEntry[];
  allyPicks: DraftPick[];
  enemyPicks: DraftPick[];
  userRole: Role;
  isAnalyzing: boolean;
  analysisError: string | null;
  onAddAlly: (pick: DraftPick) => void;
  onRemoveAlly: (championId: string) => void;
  onAddEnemy: (pick: DraftPick) => void;
  onRemoveEnemy: (championId: string) => void;
  onSetUserRole: (role: Role) => void;
  onAnalyze: () => void;
  onReset: () => void;
}

const SLOT_ROLES: Role[] = ["baron", "jungle", "mid", "dragon", "support"];

const ROLE_ICONS: Record<Role, string> = {
  baron: "⚔", jungle: "❀", mid: "✦", dragon: "➹", support: "✚",
};

export function ChampSelectScreen({
  champions, heroPool, allyPicks, enemyPicks, userRole,
  isAnalyzing, analysisError,
  onAddAlly, onRemoveAlly, onAddEnemy, onRemoveEnemy,
  onSetUserRole, onAnalyze, onReset,
}: ChampSelectScreenProps) {
  const router = useRouter();
  const [activeSide, setActiveSide] = useState<Side>(null);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

  const pickedIds = new Set([
    ...allyPicks.map((p) => p.champion_id),
    ...enemyPicks.map((p) => p.champion_id),
  ]);
  const availableChampions = champions.filter((c) => !pickedIds.has(c.id));

  function openPicker(side: "ally" | "enemy", slotIndex: number) {
    setActiveSide(side);
    setActiveSlotIndex(slotIndex);
  }

  function handleSelect(champion: Champion) {
    if (!activeSide) return;
    const pick: DraftPick = { champion_id: champion.id, champion, role: activeSlotIndex !== null ? SLOT_ROLES[activeSlotIndex] : undefined };
    if (activeSide === "ally") onAddAlly(pick);
    else onAddEnemy(pick);
    setActiveSide(null);
    setActiveSlotIndex(null);
  }

  const hasPoolForRole = heroPool.some((e) => e.role === userRole);
  const totalPicks = allyPicks.length + enemyPicks.length;
  const canAnalyze = totalPicks >= 1 && hasPoolForRole;

  return (
    <div className="fixed inset-0 z-40 bg-surface-0 overflow-y-auto">

      {/* ── Top bar — mimics in-game champ select header ───── */}
      <div className="sticky top-0 z-10 border-b border-border-subtle bg-surface-0/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 md:px-8 py-3 max-w-5xl mx-auto">
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center gap-2 text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Exit
          </button>

          <div className="text-center flex-1">
            <h1 className="text-sm md:text-base font-bold uppercase tracking-[0.2em] text-gold flex items-center justify-center gap-2">
              <Swords className="h-4 w-4" /> Select Your Champion
            </h1>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">

        {/* ── Role select — your role this game ──────────────── */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {SLOT_ROLES.map((role) => {
            const count = heroPool.filter((e) => e.role === role).length;
            const active = userRole === role;
            return (
              <button
                key={role}
                onClick={() => onSetUserRole(role)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-gold/15 border-gold/50 text-gold"
                    : "bg-surface-1 border-border-subtle text-text-secondary hover:border-border-default",
                  count === 0 && !active && "opacity-50"
                )}
              >
                <span>{ROLE_ICONS[role]}</span>
                <span className="capitalize">{role}</span>
                {count > 0 && (
                  <span className={cn(
                    "text-2xs rounded-full px-1.5 py-0.5 font-bold",
                    active ? "bg-gold/25" : "bg-surface-3 text-text-muted"
                  )}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {!hasPoolForRole && (
          <p className="text-center text-xs text-warning mb-4">
            You have no {userRole} champions saved — add some in Hero Pool first.
          </p>
        )}

        {/* ── In-game style two-column roster ────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6 mb-6">

          {/* Ally roster */}
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-2xs font-bold uppercase tracking-widest text-text-secondary">Your team</span>
              <span className="text-2xs text-text-muted ml-auto">{allyPicks.length}/5</span>
            </div>
            <div className="rounded-xl border border-accent/20 bg-surface-1/60 divide-y divide-border-subtle/60 overflow-hidden">
              {SLOT_ROLES.map((role, i) => (
                <PlayerRow
                  key={i}
                  role={role}
                  pick={allyPicks[i]}
                  isYou={role === userRole}
                  side="ally"
                  isActive={activeSide === "ally" && activeSlotIndex === i}
                  onAdd={() => openPicker("ally", i)}
                  onRemove={allyPicks[i] ? () => onRemoveAlly(allyPicks[i].champion_id) : undefined}
                />
              ))}
            </div>
          </div>

          {/* Enemy roster */}
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="h-2 w-2 rounded-full bg-[#8C2F39]" />
              <span className="text-2xs font-bold uppercase tracking-widest text-text-secondary">Enemy team</span>
              <span className="text-2xs text-text-muted ml-auto">{enemyPicks.length}/5</span>
            </div>
            <div className="rounded-xl border border-[#8C2F39]/25 bg-surface-1/60 divide-y divide-border-subtle/60 overflow-hidden">
              {SLOT_ROLES.map((role, i) => (
                <PlayerRow
                  key={i}
                  role={role}
                  pick={enemyPicks[i]}
                  isYou={false}
                  side="enemy"
                  isActive={activeSide === "enemy" && activeSlotIndex === i}
                  onAdd={() => openPicker("enemy", i)}
                  onRemove={enemyPicks[i] ? () => onRemoveEnemy(enemyPicks[i].champion_id) : undefined}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Champion grid picker — appears below, in-game style ── */}
        {activeSide && (
          <div className="mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-2xs font-bold uppercase tracking-widest text-text-secondary">
                Select your champion —{" "}
                <span className={activeSide === "ally" ? "text-accent" : "text-[#C9707A]"}>
                  {activeSide === "ally" ? "your team" : "enemy team"}
                </span>
                {activeSlotIndex !== null && (
                  <span className="text-text-muted"> ({SLOT_ROLES[activeSlotIndex]})</span>
                )}
              </span>
              <button
                onClick={() => { setActiveSide(null); setActiveSlotIndex(null); }}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ChampionGrid champions={availableChampions} onSelect={handleSelect} side={activeSide} />
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────── */}
        {analysisError && (
          <div className="mb-4 rounded-lg border border-[#8C2F39]/40 bg-[#8C2F39]/10 px-4 py-3 text-sm text-[#C9707A]">
            {analysisError}
          </div>
        )}

        {/* ── Patch footer note ───────────────────────────────── */}
        <div className="mb-5 rounded-lg border border-border-subtle bg-surface-1 px-4 py-2.5 flex items-center gap-3">
          <span className="text-2xs text-text-muted">
            Patch 7.1f · Kayle, Akshan &amp; Shen buffed this patch · Taliyah, Viego, K&apos;Sante adjusted
          </span>
        </div>

        {/* ── Lock in button ──────────────────────────────────── */}
        <button
          onClick={onAnalyze}
          disabled={!canAnalyze || isAnalyzing}
          className={cn(
            "w-full flex items-center justify-center gap-3 rounded-full py-4 text-base font-bold uppercase tracking-wider transition-all duration-200",
            canAnalyze
              ? "bg-gold/15 border-2 border-gold/60 text-gold hover:bg-gold/25 gold-glow"
              : "bg-surface-1 border border-border-subtle text-text-muted cursor-not-allowed opacity-60"
          )}
        >
          {isAnalyzing ? (
            <>
              <div className="h-5 w-5 rounded-full border-2 border-gold border-t-transparent animate-spin" />
              Analyzing draft…
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Get Recommendation
            </>
          )}
        </button>

        {!canAnalyze && totalPicks === 0 && (
          <p className="mt-3 text-center text-xs text-text-muted">
            Add at least one champion to either team to get started
          </p>
        )}
      </div>
    </div>
  );
}
