"use client";

import { useState, useEffect } from "react";
import { History, Swords, Trophy, X, ChevronRight, RotateCcw } from "lucide-react";
import { cn, relativeTime } from "@/lib/utils";
import Link from "next/link";

interface PickEntry {
  champion_id?: string;
  champion?: { name: string } | null;
  role?: string;
}

interface SessionRecord {
  id: string;
  ally_picks: PickEntry[];
  enemy_picks: PickEntry[];
  outcome: "win" | "loss" | "unknown" | null;
  created_at: string;
  picked_champion: { id: string; slug: string; name: string; metadata: Record<string, unknown> } | null;
}

function getInitialColor(name: string) {
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return {
    bg: `hsl(${hue}, 40%, 14%)`,
    border: `hsl(${hue}, 50%, 26%)`,
    text: `hsl(${hue}, 70%, 68%)`,
  };
}

export function HistoryPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/draft-sessions?limit=30")
      .then(r => r.json())
      .then(json => {
        if (!json.error) setSessions(json.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function markOutcome(id: string, outcome: "win" | "loss" | "unknown") {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/draft-sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, outcome }),
      });
      const json = await res.json();
      if (!json.error) {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, outcome } : s));
      }
    } finally {
      setUpdatingId(null);
    }
  }

  const wins = sessions.filter(s => s.outcome === "win").length;
  const losses = sessions.filter(s => s.outcome === "loss").length;
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : null;

  return (
    <div className="min-h-full p-5 md:p-8 max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
            <History className="h-4 w-4 text-accent" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Draft history</h1>
        </div>
        <p className="text-sm text-text-muted ml-12">Every draft you've analyzed, with win/loss tracking.</p>
      </div>

      {/* Stats row */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Drafts" value={String(sessions.length)} />
          <StatCard label="Wins" value={String(wins)} color="text-success" />
          <StatCard label="Win rate" value={winRate !== null ? `${winRate}%` : "—"} color={winRate !== null && winRate >= 50 ? "text-success" : "text-danger"} />
        </div>
      )}

      {/* Session list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 skeleton rounded-xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <EmptyHistory />
      ) : (
        <div className="space-y-3">
          {sessions.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              updating={updatingId === session.id}
              onMark={markOutcome}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-1 p-4 text-center">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className={cn("text-2xl font-bold text-text-primary", color)}>{value}</p>
    </div>
  );
}

function SessionCard({
  session,
  updating,
  onMark,
}: {
  session: SessionRecord;
  updating: boolean;
  onMark: (id: string, outcome: "win" | "loss" | "unknown") => void;
}) {
  const pickedName = session.picked_champion?.name;
  const colors = pickedName ? getInitialColor(pickedName) : null;

  const allyNames = (session.ally_picks ?? [])
    .map((p: PickEntry) => p.champion?.name ?? null)
    .filter(Boolean) as string[];

  const enemyNames = (session.enemy_picks ?? [])
    .map((p: PickEntry) => p.champion?.name ?? null)
    .filter(Boolean) as string[];

  const outcomeStyle = {
    win: "border-success/30 bg-success/5",
    loss: "border-danger/30 bg-danger/5",
    unknown: "border-border-subtle bg-surface-1",
    null: "border-border-subtle bg-surface-1",
  }[session.outcome ?? "null"];

  return (
    <div className={cn("rounded-xl border p-4 transition-colors", outcomeStyle)}>
      <div className="flex items-start gap-3">

        {/* Picked champion avatar */}
        <div
          className="h-10 w-10 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold border"
          style={colors
            ? { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }
            : { backgroundColor: "var(--surface-2)", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }
          }
        >
          {pickedName ? pickedName.slice(0, 2).toUpperCase() : "?"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {pickedName && (
              <span className="text-sm font-semibold text-text-primary">{pickedName}</span>
            )}
            <OutcomeBadge outcome={session.outcome} />
            <span className="text-xs text-text-muted ml-auto">{relativeTime(session.created_at)}</span>
          </div>

          {/* Team summary */}
          <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
            {allyNames.length > 0 && (
              <span className="text-accent/70">
                {allyNames.slice(0, 3).join(", ")}
                {allyNames.length > 3 ? ` +${allyNames.length - 3}` : ""}
              </span>
            )}
            {enemyNames.length > 0 && (
              <>
                <span className="text-border-strong">vs</span>
                <span className="text-danger/70">
                  {enemyNames.slice(0, 3).join(", ")}
                  {enemyNames.length > 3 ? ` +${enemyNames.length - 3}` : ""}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Win / Loss buttons */}
      {session.outcome === "unknown" || session.outcome === null ? (
        <div className="flex gap-2 mt-3 pt-3 border-t border-border-subtle">
          <p className="text-xs text-text-muted flex-1">How did it go?</p>
          <button
            disabled={updating}
            onClick={() => onMark(session.id, "win")}
            className="flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success hover:bg-success/20 transition-colors disabled:opacity-50"
          >
            <Trophy className="h-3 w-3" /> Win
          </button>
          <button
            disabled={updating}
            onClick={() => onMark(session.id, "loss")}
            className="flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
          >
            <X className="h-3 w-3" /> Loss
          </button>
        </div>
      ) : (
        <div className="flex justify-end mt-2">
          <button
            disabled={updating}
            onClick={() => onMark(session.id, "unknown")}
            className="text-2xs text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" /> Undo
          </button>
        </div>
      )}
    </div>
  );
}

function OutcomeBadge({ outcome }: { outcome: "win" | "loss" | "unknown" | null }) {
  if (!outcome || outcome === "unknown") return null;
  return (
    <span className={cn(
      "text-2xs font-bold uppercase tracking-wider rounded px-1.5 py-0.5",
      outcome === "win"
        ? "bg-success/15 text-success border border-success/30"
        : "bg-danger/15 text-danger border border-danger/30"
    )}>
      {outcome}
    </span>
  );
}

function EmptyHistory() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-default bg-surface-1/50 py-16 text-center px-6">
      <div className="mb-3 text-3xl opacity-50">📋</div>
      <p className="text-sm font-medium text-text-secondary mb-1">No drafts yet</p>
      <p className="text-xs text-text-muted mb-5">
        Every time you analyze a champion select, it appears here. You can also mark each game as a win or loss to track your performance.
      </p>
      <Link
        href="/draft"
        className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-all"
      >
        <Swords className="h-4 w-4" />
        Analyze your first draft
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
