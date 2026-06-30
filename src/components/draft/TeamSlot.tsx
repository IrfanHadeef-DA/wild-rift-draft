"use client";

import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DraftPick, Role } from "@/types";

const ROLE_LABELS: Record<string, string> = {
  support: "Support", jungle: "Jungle", mid: "Mid", baron: "Baron", dragon: "Dragon",
};

const SLOT_ROLE_HINTS: Record<number, string> = {
  0: "baron",
  1: "jungle",
  2: "mid",
  3: "dragon",
  4: "support",
};

interface TeamSlotProps {
  side: "ally" | "enemy";
  pick?: DraftPick;
  isActive: boolean;
  onAdd: () => void;
  onRemove?: () => void;
  userRole: Role;
  slotIndex: number;
}

function getInitialColor(name: string): { bg: string; border: string; text: string } {
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return {
    bg: `hsl(${hue}, 40%, 14%)`,
    border: `hsl(${hue}, 50%, 26%)`,
    text: `hsl(${hue}, 70%, 68%)`,
  };
}

export function TeamSlot({
  side, pick, isActive, onAdd, onRemove, userRole, slotIndex,
}: TeamSlotProps) {
  const isUserSlot = side === "ally" && SLOT_ROLE_HINTS[slotIndex] === userRole;
  const hintRole = SLOT_ROLE_HINTS[slotIndex] ?? "";

  const accentColor = side === "ally" ? "accent" : "danger";

  if (pick?.champion) {
    const colors = getInitialColor(pick.champion.name);
    const engageTypes = pick.champion.engage_type ?? [];

    return (
      <div
        className={cn(
          "group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all",
          isUserSlot
            ? "border-gold/40 bg-gold/5"
            : side === "ally"
            ? "border-border-subtle bg-surface-1"
            : "border-[#8C2F39]/30 bg-[#8C2F39]/5",
        )}
      >
        {/* Avatar */}
        <div
          className="h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold border"
          style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
        >
          {pick.champion.name.slice(0, 2).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-text-primary truncate">
              {pick.champion.name}
            </span>
            {isUserSlot && (
              <span className="text-2xs font-medium text-gold bg-gold/10 border border-gold/20 rounded px-1.5 py-0.5 flex-shrink-0">
                You
              </span>
            )}
          </div>
          <div className="flex gap-1 mt-0.5 flex-wrap">
            {engageTypes.slice(0, 2).map((t: string) => (
              <span key={t} className="text-2xs text-text-muted bg-surface-3 rounded px-1 py-0.5 capitalize">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Difficulty dot */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              pick.champion.difficulty === "easy" ? "bg-success" :
              pick.champion.difficulty === "medium" ? "bg-warning" : "bg-danger"
            )}
          />
        </div>

        {/* Remove */}
        {onRemove && (
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 ml-1 text-text-muted hover:text-[#C9707A] transition-all p-0.5 rounded"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  // Empty slot
  return (
    <button
      onClick={onAdd}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-all duration-150",
        isActive
          ? side === "ally"
            ? "border-accent/50 bg-accent/5 text-accent"
            : "border-[#8C2F39]/60 bg-[#8C2F39]/10 text-[#C9707A]"
          : isUserSlot
          ? "border-dashed border-gold/30 bg-gold/5 text-gold/60 hover:text-gold hover:border-gold/50"
          : "border-dashed border-border-subtle text-text-muted hover:text-text-secondary hover:border-border-default"
      )}
    >
      <div className={cn(
        "h-8 w-8 rounded-lg border flex items-center justify-center flex-shrink-0",
        isActive
          ? side === "ally" ? "border-accent/40 bg-accent/10" : "border-danger/40 bg-danger/10"
          : isUserSlot
          ? "border-gold/20 bg-gold/5"
          : "border-border-subtle bg-surface-2"
      )}>
        <Plus className="h-3.5 w-3.5" />
      </div>
      <span className="text-xs">
        {isUserSlot
          ? `Your ${ROLE_LABELS[userRole] ?? userRole} pick`
          : `Add ${ROLE_LABELS[hintRole] ?? "champion"}`
        }
      </span>
      {isActive && (
        <span className="ml-auto text-2xs animate-pulse">Searching…</span>
      )}
    </button>
  );
}
