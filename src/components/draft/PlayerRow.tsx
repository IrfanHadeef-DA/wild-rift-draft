"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getChampionImageUrl } from "@/lib/championImages";
import type { DraftPick, Role } from "@/types";

interface PlayerRowProps {
  role: Role;
  pick?: DraftPick;
  isYou: boolean;
  side: "ally" | "enemy";
  isActive: boolean;
  onAdd: () => void;
  onRemove?: () => void;
}

const ROLE_ICONS: Record<Role, string> = {
  baron: "⚔", jungle: "❀", mid: "✦", dragon: "➹", support: "✚",
};

function getInitialColor(name: string) {
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return {
    bg: `hsl(${hue}, 35%, 22%)`,
    border: `hsl(${hue}, 40%, 38%)`,
    text: `hsl(${hue}, 55%, 78%)`,
  };
}

export function PlayerRow({ role, pick, isYou, side, isActive, onAdd, onRemove }: PlayerRowProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const hasPick = !!pick?.champion;
  const colors = hasPick ? getInitialColor(pick.champion!.name) : null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 transition-colors",
        isYou && "bg-gold/[0.06]",
        isActive && (side === "ally" ? "bg-accent/10" : "bg-[#8C2F39]/10")
      )}
    >
      {/* Role icon */}
      <div className={cn(
        "h-6 w-6 rounded flex items-center justify-center text-2xs flex-shrink-0",
        isYou ? "text-gold" : "text-text-muted"
      )}>
        {ROLE_ICONS[role]}
      </div>

      {/* Portrait */}
      <button
        onClick={hasPick ? undefined : onAdd}
        className={cn(
          "h-11 w-11 rounded-lg border-2 flex-shrink-0 flex items-center justify-center overflow-hidden transition-all",
          hasPick
            ? isYou ? "border-gold/50" : "border-border-default"
            : cn(
                "border-dashed",
                isActive
                  ? side === "ally" ? "border-accent" : "border-[#8C2F39]"
                  : "border-border-subtle hover:border-border-default"
              )
        )}
        style={hasPick ? { backgroundColor: colors!.bg } : undefined}
      >
        {hasPick ? (
          !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getChampionImageUrl(pick.champion!.slug)}
              alt={pick.champion!.name}
              className="h-full w-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span className="text-xs font-bold" style={{ color: colors!.text }}>
              {pick.champion!.name.slice(0, 2).toUpperCase()}
            </span>
          )
        ) : (
          <Plus className="h-4 w-4 text-text-muted" />
        )}
      </button>

      {/* Name / status */}
      <div className="flex-1 min-w-0">
        {hasPick ? (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-text-primary truncate">
              {pick.champion!.name}
            </span>
            {isYou && (
              <span className="text-2xs font-bold text-gold bg-gold/15 rounded px-1.5 py-0.5 flex-shrink-0">YOU</span>
            )}
          </div>
        ) : (
          <button onClick={onAdd} className="text-left w-full">
            <span className={cn(
              "text-sm",
              isActive ? "text-text-primary font-medium" : "text-text-muted"
            )}>
              {isActive ? "Selecting…" : isYou ? `Your ${role} pick` : "Empty"}
            </span>
          </button>
        )}
        {!hasPick && (
          <p className="text-2xs text-text-muted capitalize">{role}</p>
        )}
      </div>

      {/* Remove */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-text-muted hover:text-[#C9707A] transition-colors p-1 flex-shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
