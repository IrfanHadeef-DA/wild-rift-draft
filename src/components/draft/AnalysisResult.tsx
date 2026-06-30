"use client";

import { useState } from "react";
import {
  ArrowLeft, RotateCcw, Sparkles, Star, AlertTriangle,
  Link2, Swords, Shield, Target, BookOpen, Trophy,
  ChevronDown, ChevronUp, Zap, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DraftPick, HeroPoolEntry, Role } from "@/types";

// ── Types from the AI response ──────────────────────────────────────────────

interface Synergy { champion_name: string; reason: string; }
interface Threat { champion_name: string; severity: "low" | "medium" | "high"; reason: string; }
interface WeakerPick { champion_name: string; reason: string; }
interface ItemEntry { name: string; reason: string; }
interface SituationalItem { name: string; when_to_buy: string; replaces?: string | null; }

interface Recommendation {
  champion_slug: string;
  champion_name: string;
  score: number;
  headline: string;
  why_strong: string;
  why_others_weaker: WeakerPick[];
  key_synergies: Synergy[];
  key_threats: Threat[];
}

interface CoachingPanel {
  matchup_analysis: string;
  lane_strategy: string;
  win_conditions: string[];
  item_build: {
    starting_items: ItemEntry[];
    core_items: ItemEntry[];
    situational_items: SituationalItem[];
    boot_choice: string;
    boot_reason: string;
    enchant_note: string;
  };
  rune_recommendations: {
    keystone: string;
    secondary_runes: string[];
    explanation: string;
  };
  gameplay_tips: string[];
  objective_priorities: string[];
  common_mistakes: string[];
  late_game_advice: string;
}

interface AnalysisResultProps {
  allyPicks: DraftPick[];
  enemyPicks: DraftPick[];
  userRole: Role;
  analysis: { recommendation: unknown; coaching_panel: unknown } | null;
  heroPool: HeroPoolEntry[];
  onBack: () => void;
  onReset: () => void;
}

const ROLE_LABELS: Record<Role, string> = {
  support: "Support", jungle: "Jungle", mid: "Mid", baron: "Baron", dragon: "Dragon",
};

function getInitialColor(name: string) {
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return {
    bg: `hsl(${hue}, 40%, 14%)`,
    border: `hsl(${hue}, 50%, 26%)`,
    text: `hsl(${hue}, 70%, 68%)`,
  };
}

// ── Main component ──────────────────────────────────────────────────────────

export function AnalysisResult({
  allyPicks, enemyPicks, userRole, analysis, heroPool, onBack, onReset,
}: AnalysisResultProps) {
  const rec = analysis?.recommendation as Recommendation | null;
  const panel = analysis?.coaching_panel as CoachingPanel | null;
  const [expandedSection, setExpandedSection] = useState<string | null>("lane");

  function toggleSection(id: string) {
    setExpandedSection(prev => prev === id ? null : id);
  }

  // No AI data yet — show the "coming soon" state
  if (!rec) {
    return <ComingSoonState
      allyPicks={allyPicks} enemyPicks={enemyPicks}
      userRole={userRole} heroPool={heroPool}
      onBack={onBack} onReset={onReset}
    />;
  }

  const recColors = getInitialColor(rec.champion_name);

  return (
    <div className="min-h-full p-4 md:p-6 max-w-2xl mx-auto">

      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Edit draft
        </button>
        <button onClick={onReset} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors">
          <RotateCcw className="h-3.5 w-3.5" /> New draft
        </button>
      </div>

      {/* ── HERO RECOMMENDATION CARD ─────────────────────── */}
      <div className="rounded-2xl border-2 border-gold/40 bg-gradient-to-b from-gold/8 to-surface-1 p-5 mb-4 gold-glow">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-gold" />
          <span className="text-xs font-semibold uppercase tracking-widest text-gold">Coach pick</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-xs text-gold/70">Patch 7.1f</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div
            className="h-14 w-14 rounded-xl flex-shrink-0 flex items-center justify-center text-lg font-bold border-2"
            style={{ backgroundColor: recColors.bg, borderColor: recColors.border, color: recColors.text }}
          >
            {rec.champion_name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-text-primary">{rec.champion_name}</h2>
            <p className="text-sm text-text-secondary mt-0.5">{rec.headline}</p>
          </div>
          <div className="flex flex-col items-center flex-shrink-0">
            <span className="text-2xl font-bold text-gold">{rec.score}</span>
            <span className="text-2xs text-gold/60">fit score</span>
          </div>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed mb-4">
          {rec.why_strong}
        </p>

        {/* Synergies & Threats row */}
        <div className="grid grid-cols-2 gap-3">
          {rec.key_synergies?.length > 0 && (
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
              <p className="text-2xs font-semibold uppercase tracking-wider text-accent mb-2 flex items-center gap-1">
                <Link2 className="h-3 w-3" /> Synergies
              </p>
              <div className="space-y-1.5">
                {rec.key_synergies.map((s, i) => (
                  <div key={i}>
                    <span className="text-xs font-semibold text-text-primary">{s.champion_name}</span>
                    <p className="text-2xs text-text-muted leading-snug">{s.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rec.key_threats?.length > 0 && (
            <div className="rounded-lg border border-danger/20 bg-danger/5 p-3">
              <p className="text-2xs font-semibold uppercase tracking-wider text-danger mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Threats
              </p>
              <div className="space-y-1.5">
                {rec.key_threats.map((t, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0",
                        t.severity === "high" ? "bg-danger" :
                        t.severity === "medium" ? "bg-warning" : "bg-success"
                      )} />
                      <span className="text-xs font-semibold text-text-primary">{t.champion_name}</span>
                    </div>
                    <p className="text-2xs text-text-muted leading-snug ml-3">{t.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Why others are weaker */}
        {rec.why_others_weaker?.length > 0 && (
          <details className="mt-3 group">
            <summary className="text-xs text-text-muted cursor-pointer hover:text-text-secondary transition-colors list-none flex items-center gap-1">
              <ChevronDown className="h-3.5 w-3.5 group-open:rotate-180 transition-transform" />
              Why not your other picks?
            </summary>
            <div className="mt-2 space-y-2 pl-4 border-l border-border-subtle">
              {rec.why_others_weaker.map((w, i) => (
                <div key={i}>
                  <span className="text-xs font-semibold text-text-secondary">{w.champion_name} — </span>
                  <span className="text-xs text-text-muted">{w.reason}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* ── COACHING PANEL SECTIONS ──────────────────────── */}
      {panel && (
        <div className="space-y-2">

          <CoachSection
            id="lane"
            icon={Swords}
            title="Lane strategy"
            isOpen={expandedSection === "lane"}
            onToggle={() => toggleSection("lane")}
          >
            <p className="text-sm text-text-secondary leading-relaxed mb-2">{panel.matchup_analysis}</p>
            <p className="text-sm text-text-secondary leading-relaxed">{panel.lane_strategy}</p>
          </CoachSection>

          <CoachSection
            id="items"
            icon={Package}
            title="Item build"
            isOpen={expandedSection === "items"}
            onToggle={() => toggleSection("items")}
          >
            <ItemBuildPanel build={panel.item_build} />
          </CoachSection>

          <CoachSection
            id="runes"
            icon={Zap}
            title="Runes"
            isOpen={expandedSection === "runes"}
            onToggle={() => toggleSection("runes")}
          >
            <RunePanel runes={panel.rune_recommendations} />
          </CoachSection>

          <CoachSection
            id="win"
            icon={Trophy}
            title="Win conditions"
            isOpen={expandedSection === "win"}
            onToggle={() => toggleSection("win")}
          >
            <ul className="space-y-2">
              {panel.win_conditions.map((wc, i) => (
                <li key={i} className="flex gap-2 text-sm text-text-secondary">
                  <span className="text-gold font-bold flex-shrink-0">{i + 1}.</span>
                  {wc}
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-border-subtle">
              <p className="text-xs text-text-muted">{panel.late_game_advice}</p>
            </div>
          </CoachSection>

          <CoachSection
            id="objectives"
            icon={Target}
            title="Objectives & tips"
            isOpen={expandedSection === "objectives"}
            onToggle={() => toggleSection("objectives")}
          >
            <div className="mb-3">
              <p className="text-2xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">Objective priorities</p>
              <ul className="space-y-1.5">
                {panel.objective_priorities.map((o, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text-secondary">
                    <span className="text-accent font-bold flex-shrink-0">→</span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">Gameplay tips</p>
              <ul className="space-y-1.5">
                {panel.gameplay_tips.map((t, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text-secondary">
                    <span className="text-accent font-bold flex-shrink-0">•</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </CoachSection>

          <CoachSection
            id="mistakes"
            icon={BookOpen}
            title="Common mistakes to avoid"
            isOpen={expandedSection === "mistakes"}
            onToggle={() => toggleSection("mistakes")}
          >
            <ul className="space-y-2">
              {panel.common_mistakes.map((m, i) => (
                <li key={i} className="flex gap-2 text-sm text-text-secondary">
                  <span className="text-danger font-bold flex-shrink-0">✗</span>
                  {m}
                </li>
              ))}
            </ul>
          </CoachSection>

        </div>
      )}
    </div>
  );
}

// ── Collapsible coach section ────────────────────────────────────────────────

function CoachSection({
  id, icon: Icon, title, isOpen, onToggle, children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "rounded-xl border transition-colors",
      isOpen ? "border-border-default bg-surface-1" : "border-border-subtle bg-surface-1/50"
    )}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <Icon className={cn("h-4 w-4 flex-shrink-0 transition-colors", isOpen ? "text-accent" : "text-text-muted")} />
        <span className={cn("text-sm font-semibold flex-1 transition-colors", isOpen ? "text-text-primary" : "text-text-secondary")}>
          {title}
        </span>
        {isOpen
          ? <ChevronUp className="h-4 w-4 text-text-muted flex-shrink-0" />
          : <ChevronDown className="h-4 w-4 text-text-muted flex-shrink-0" />
        }
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-border-subtle pt-3 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Item build panel ─────────────────────────────────────────────────────────

function ItemBuildPanel({ build }: { build: CoachingPanel["item_build"] }) {
  return (
    <div className="space-y-4">
      {build.starting_items?.length > 0 && (
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-text-muted mb-2">Starting items</p>
          <div className="space-y-1.5">
            {build.starting_items.map((item, i) => (
              <ItemRow key={i} name={item.name} reason={item.reason} />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-2xs font-semibold uppercase tracking-wider text-text-muted mb-2">Core build</p>
        <div className="space-y-1.5">
          {build.core_items?.map((item, i) => (
            <ItemRow key={i} name={item.name} reason={item.reason} index={i + 1} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-2xs font-semibold uppercase tracking-wider text-text-muted mb-2">Boots</p>
        <ItemRow name={build.boot_choice} reason={build.boot_reason} />
        {build.enchant_note && (
          <p className="text-xs text-text-muted mt-1 pl-8 border-l border-border-subtle">{build.enchant_note}</p>
        )}
      </div>

      {build.situational_items?.length > 0 && (
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-text-muted mb-2">Situational</p>
          <div className="space-y-2">
            {build.situational_items.map((item, i) => (
              <div key={i} className="rounded-lg border border-border-subtle bg-surface-2 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">{item.name}</span>
                  {item.replaces && (
                    <span className="text-2xs text-text-muted">replaces {item.replaces}</span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">{item.when_to_buy}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ItemRow({ name, reason, index }: { name: string; reason: string; index?: number }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="h-7 w-7 rounded-lg bg-surface-3 border border-border-subtle flex-shrink-0 flex items-center justify-center text-xs font-bold text-text-muted">
        {index ?? "·"}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-text-primary">{name}</span>
        <p className="text-xs text-text-muted leading-snug">{reason}</p>
      </div>
    </div>
  );
}

// ── Rune panel ───────────────────────────────────────────────────────────────

function RunePanel({ runes }: { runes: CoachingPanel["rune_recommendations"] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
          <Zap className="h-4 w-4 text-accent" />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">{runes.keystone}</p>
          <p className="text-2xs text-text-muted">Keystone</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {runes.secondary_runes?.map((r, i) => (
          <span key={i} className="text-xs text-text-secondary bg-surface-2 border border-border-subtle rounded-lg px-2.5 py-1">
            {r}
          </span>
        ))}
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">{runes.explanation}</p>
    </div>
  );
}

// ── Coming soon state (pre-M4 or if rec is null) ─────────────────────────────

function ComingSoonState({
  allyPicks, enemyPicks, userRole, heroPool, onBack, onReset,
}: Omit<AnalysisResultProps, "analysis">) {
  const poolForRole = heroPool.filter((e) => e.role === userRole);

  return (
    <div className="min-h-full p-4 md:p-6 max-w-2xl mx-auto animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Edit draft
        </button>
        <button onClick={onReset} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors">
          <RotateCcw className="h-3.5 w-3.5" /> New draft
        </button>
      </div>

      <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6 text-center mb-4">
        <Sparkles className="h-8 w-8 text-gold mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-text-primary mb-2">AI engine initializing</h2>
        <p className="text-sm text-text-muted mb-4">
          Add your <code className="text-xs bg-surface-2 px-1.5 py-0.5 rounded">ANTHROPIC_API_KEY</code> to{" "}
          <code className="text-xs bg-surface-2 px-1.5 py-0.5 rounded">.env.local</code> to activate the coaching engine.
        </p>
        {poolForRole.length > 0 && (
          <div>
            <p className="text-xs text-text-muted mb-2">Your {ROLE_LABELS[userRole]} pool is ready:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {poolForRole.map((e) => {
                const name = e.champion?.name ?? "Unknown";
                const colors = getInitialColor(name);
                return (
                  <span key={e.id} className="text-xs rounded-lg border px-2.5 py-1 font-medium"
                    style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}>
                    {name} {"★".repeat(e.proficiency)}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface-1 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-3">Draft entered</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-text-muted mb-1">Your team ({allyPicks.length})</p>
            {allyPicks.map((p, i) => <p key={i} className="text-text-secondary">{p.champion?.name ?? "?"}</p>)}
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Enemies ({enemyPicks.length})</p>
            {enemyPicks.map((p, i) => <p key={i} className="text-text-secondary">{p.champion?.name ?? "?"}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}
