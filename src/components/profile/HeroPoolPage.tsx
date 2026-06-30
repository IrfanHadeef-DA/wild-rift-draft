"use client";

import { useState } from "react";
import { Shield, Plus, Search, X, Star, Trash2, ChevronDown } from "lucide-react";
import { cn, getRoleColor, formatProficiency } from "@/lib/utils";
import { useHeroPool } from "@/hooks/useHeroPool";
import { useChampions } from "@/hooks/useChampions";
import { PoolGridSkeleton } from "@/components/shared/Skeleton";
import type { Role, Champion } from "@/types";

const ROLES: { value: Role; label: string; icon: string }[] = [
  { value: "support", label: "Support", icon: "🛡" },
  { value: "jungle", label: "Jungle", icon: "🌿" },
  { value: "mid", label: "Mid", icon: "⚡" },
  { value: "baron", label: "Baron", icon: "⚔️" },
  { value: "dragon", label: "Dragon", icon: "🏹" },
];

export function HeroPoolPage() {
  const [activeRole, setActiveRole] = useState<Role>("support");
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const { pool, loading: poolLoading, addToPool, removeFromPool, isInPool } = useHeroPool();
  const { champions, loading: champsLoading } = useChampions();

  const poolForRole = pool.filter((e) => e.role === activeRole);

  // Champions available to add: match the active role AND not already in pool for that role
  const pickableChampions = champions.filter(
    (c) =>
      c.roles.includes(activeRole) &&
      !isInPool(c.id, activeRole) &&
      (search === "" || c.name.toLowerCase().includes(search.toLowerCase()))
  );

  function showToast(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  async function handleAdd(champion: Champion) {
    const ok = await addToPool(champion.id, activeRole, 3);
    if (ok) {
      showToast(`${champion.name} added to your pool`);
      setSearch("");
    } else {
      showToast("Couldn't add champion — try again", "err");
    }
  }

  async function handleRemove(entryId: string, name: string) {
    const ok = await removeFromPool(entryId);
    if (ok) showToast(`${name} removed`);
  }

  const totalInPool = pool.length;

  return (
    <div className="relative min-h-full p-5 md:p-8 max-w-3xl mx-auto">

      {/* ── Toast ──────────────────────────────────────────── */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-card animate-slide-up",
            toast.type === "ok"
              ? "bg-surface-2 border-border-default text-text-primary"
              : "bg-danger/10 border-danger/30 text-danger"
          )}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
            <Shield className="h-4 w-4 text-accent" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Hero pool
          </h1>
        </div>
        <p className="text-sm text-text-muted ml-12">
          Save the champions you actually play.{" "}
          {totalInPool > 0 && (
            <span className="text-text-secondary">
              {totalInPool} champion{totalInPool !== 1 ? "s" : ""} saved across all roles.
            </span>
          )}
        </p>
      </div>

      {/* ── Role tabs ──────────────────────────────────────── */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {ROLES.map((r) => {
          const count = pool.filter((e) => e.role === r.value).length;
          return (
            <button
              key={r.value}
              onClick={() => { setActiveRole(r.value); setShowPicker(false); setSearch(""); }}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150 border flex-shrink-0",
                activeRole === r.value
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : "bg-surface-1 border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-2"
              )}
            >
              <span>{r.icon}</span>
              {r.label}
              {count > 0 && (
                <span className={cn(
                  "text-2xs rounded-full px-1.5 py-0.5 font-semibold min-w-[18px] text-center",
                  activeRole === r.value
                    ? "bg-accent/20 text-accent"
                    : "bg-surface-3 text-text-muted"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Pool grid ──────────────────────────────────────── */}
      {poolLoading ? (
        <PoolGridSkeleton count={4} />
      ) : poolForRole.length === 0 ? (
        <EmptyPool
          role={activeRole}
          onAdd={() => setShowPicker(true)}
        />
      ) : (
        <div className="space-y-2 mb-4">
          {poolForRole.map((entry) => (
            <PoolEntry
              key={entry.id}
              entry={entry}
              onRemove={() => handleRemove(entry.id, entry.champion?.name ?? "Champion")}
            />
          ))}
        </div>
      )}

      {/* ── Add champion button (when pool has entries) ────── */}
      {poolForRole.length > 0 && !showPicker && (
        <button
          onClick={() => setShowPicker(true)}
          className={cn(
            "mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-default",
            "py-3 text-sm text-text-muted hover:text-text-secondary hover:border-border-strong transition-colors"
          )}
        >
          <Plus className="h-4 w-4" />
          Add champion
        </button>
      )}

      {/* ── Champion picker ────────────────────────────────── */}
      {showPicker && (
        <ChampionPicker
          role={activeRole}
          champions={pickableChampions}
          loading={champsLoading}
          search={search}
          onSearch={setSearch}
          onAdd={handleAdd}
          onClose={() => { setShowPicker(false); setSearch(""); }}
        />
      )}
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyPool({ role, onAdd }: { role: Role; onAdd: () => void }) {
  const label = ROLES.find((r) => r.value === role)?.label ?? role;
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-default bg-surface-1/50 py-14 text-center">
      <div className="mb-3 text-3xl opacity-60">
        {ROLES.find((r) => r.value === role)?.icon}
      </div>
      <p className="text-sm font-medium text-text-secondary mb-1">
        No {label} champions saved yet
      </p>
      <p className="text-xs text-text-muted mb-5">
        Add the champions you actually play and know
      </p>
      <button
        onClick={onAdd}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent",
          "hover:bg-accent/20 hover:border-accent/50 transition-all"
        )}
      >
        <Plus className="h-4 w-4" />
        Add {label} champion
      </button>
    </div>
  );
}

// ── Pool entry card ──────────────────────────────────────────────────────────

function PoolEntry({
  entry,
  onRemove,
}: {
  entry: ReturnType<typeof useHeroPool>["pool"][number];
  onRemove: () => void;
}) {
  const [showProficiency, setShowProficiency] = useState(false);
  const name = entry.champion?.name ?? "Unknown";
  const title = entry.champion?.metadata?.title ?? "";
  const tags: string[] = entry.champion?.metadata?.tags ?? [];
  const difficulty = entry.champion?.difficulty ?? "medium";

  const difficultyColor = {
    easy: "text-success",
    medium: "text-warning",
    hard: "text-danger",
  }[difficulty];

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-1 px-4 py-3 hover:border-border-default hover:bg-surface-2 transition-all duration-150">

      {/* Avatar */}
      <ChampionInitials name={name} size="md" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-text-primary">{name}</span>
          <span className={cn("text-2xs font-medium uppercase tracking-wider", difficultyColor)}>
            {difficulty}
          </span>
        </div>
        {title && (
          <p className="text-xs text-text-muted truncate">{title}</p>
        )}
        {tags.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-2xs text-text-muted bg-surface-3 border border-border-subtle rounded px-1.5 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Proficiency stars */}
      <div className="flex flex-col items-end gap-1">
        <ProficiencyStars level={entry.proficiency} />
        <span className="text-2xs text-text-muted">
          {formatProficiency(entry.proficiency)}
        </span>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="ml-1 opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all p-1 rounded"
        title={`Remove ${name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Proficiency stars ────────────────────────────────────────────────────────

function ProficiencyStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i <= level
              ? "fill-gold text-gold"
              : "fill-transparent text-border-default"
          )}
        />
      ))}
    </div>
  );
}

// ── Champion initials avatar (no external image needed) ──────────────────────

function ChampionInitials({ name, size }: { name: string; size: "sm" | "md" | "lg" }) {
  const initials = name.slice(0, 2).toUpperCase();
  // Generate a consistent hue from the name
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  const sizeClass = {
    sm: "h-7 w-7 text-2xs",
    md: "h-9 w-9 text-xs",
    lg: "h-11 w-11 text-sm",
  }[size];

  return (
    <div
      className={cn(
        "rounded-lg flex items-center justify-center font-bold flex-shrink-0 border",
        sizeClass
      )}
      style={{
        backgroundColor: `hsl(${hue}, 40%, 16%)`,
        borderColor: `hsl(${hue}, 50%, 28%)`,
        color: `hsl(${hue}, 70%, 70%)`,
      }}
    >
      {initials}
    </div>
  );
}

// ── Champion picker panel ────────────────────────────────────────────────────

function ChampionPicker({
  role,
  champions,
  loading,
  search,
  onSearch,
  onAdd,
  onClose,
}: {
  role: Role;
  champions: Champion[];
  loading: boolean;
  search: string;
  onSearch: (v: string) => void;
  onAdd: (c: Champion) => void;
  onClose: () => void;
}) {
  const roleLabel = ROLES.find((r) => r.value === role)?.label ?? role;

  return (
    <div className="mt-4 rounded-xl border border-border-default bg-surface-1 overflow-hidden animate-slide-up">
      {/* Picker header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <span className="text-sm font-semibold text-text-primary">
          Add {roleLabel} champion
        </span>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-border-subtle">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={`Search ${roleLabel.toLowerCase()} champions…`}
            className={cn(
              "w-full rounded-lg border border-border-default bg-surface-2 pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted",
              "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
            )}
          />
          {search && (
            <button
              onClick={() => onSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Champion list */}
      <div className="max-h-72 overflow-y-auto divide-y divide-border-subtle">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-text-muted">
            Loading champions…
          </div>
        ) : champions.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-text-secondary">
              {search ? `No ${roleLabel} champions match "${search}"` : `No more ${roleLabel} champions to add`}
            </p>
            {search && (
              <button
                onClick={() => onSearch("")}
                className="mt-2 text-xs text-accent hover:text-accent/80 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          champions.map((c) => (
            <button
              key={c.id}
              onClick={() => onAdd(c)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-2 transition-colors group"
            >
              <ChampionInitials name={c.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{c.name}</p>
                {c.metadata?.title && (
                  <p className="text-xs text-text-muted truncate">{c.metadata.title}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <DifficultyPip difficulty={c.difficulty} />
                <span className="text-xs text-text-muted group-hover:text-accent transition-colors">
                  Add +
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer hint */}
      {champions.length > 0 && (
        <div className="px-4 py-2 border-t border-border-subtle bg-surface-0/50">
          <p className="text-2xs text-text-muted">
            {champions.length} champion{champions.length !== 1 ? "s" : ""} available for {roleLabel} · You can add more roles later
          </p>
        </div>
      )}
    </div>
  );
}

// ── Difficulty pip ────────────────────────────────────────────────────────────

function DifficultyPip({ difficulty }: { difficulty: string }) {
  const colors = {
    easy: "bg-success",
    medium: "bg-warning",
    hard: "bg-danger",
  };
  return (
    <span className="flex items-center gap-1">
      <span className={cn("h-1.5 w-1.5 rounded-full", colors[difficulty as keyof typeof colors] ?? "bg-border-default")} />
      <span className="text-2xs text-text-muted capitalize">{difficulty}</span>
    </span>
  );
}
