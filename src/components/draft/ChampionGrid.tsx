"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Champion, Role } from "@/types";

interface ChampionGridProps {
  champions: Champion[];
  onSelect: (champion: Champion) => void;
  side: "ally" | "enemy";
}

const ROLE_TABS: { value: Role | "all"; label: string; icon: string }[] = [
  { value: "all",     label: "All",     icon: "▦" },
  { value: "baron",   label: "Baron",   icon: "⚔" },
  { value: "jungle",  label: "Jungle",  icon: "❀" },
  { value: "mid",     label: "Mid",     icon: "✦" },
  { value: "dragon",  label: "Dragon",  icon: "➹" },
  { value: "support", label: "Support", icon: "✚" },
];

function getInitialColor(name: string) {
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return {
    bg: `hsl(${hue}, 35%, 22%)`,
    border: `hsl(${hue}, 40%, 38%)`,
    text: `hsl(${hue}, 55%, 78%)`,
  };
}

export function ChampionGrid({ champions, onSelect, side }: ChampionGridProps) {
  const [activeRole, setActiveRole] = useState<Role | "all">("all");

  const filtered = useMemo(() => {
    if (activeRole === "all") return champions;
    return champions.filter((c) => c.roles.includes(activeRole));
  }, [champions, activeRole]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => a.name.localeCompare(b.name)),
    [filtered]
  );

  const accentBorder = side === "ally" ? "border-accent/40" : "border-[#8C2F39]/60";
  const accentBg = side === "ally" ? "bg-accent/15" : "bg-[#8C2F39]/20";
  const accentText = side === "ally" ? "text-accent" : "text-[#C9707A]";

  return (
    <div className={cn("rounded-xl border overflow-hidden", accentBorder, "bg-surface-1")}>

      {/* Role tabs — like clicking role icons in champ select */}
      <div className="flex border-b border-border-subtle bg-surface-0/60 px-1">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveRole(tab.value)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2.5 transition-all duration-150 relative",
              activeRole === tab.value
                ? cn(accentText, "")
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            <span className="text-2xs font-medium uppercase tracking-wide">{tab.label}</span>
            {activeRole === tab.value && (
              <span className={cn("absolute bottom-0 left-2 right-2 h-0.5 rounded-full", side === "ally" ? "bg-accent" : "bg-[#8C2F39]")} />
            )}
          </button>
        ))}
      </div>

      {/* Champion grid — portrait + name underneath, like in-game */}
      <div className="max-h-[420px] overflow-y-auto p-3 bg-parchment-dark/5">
        {sorted.length === 0 ? (
          <div className="py-12 text-center text-sm text-text-muted">
            No champions available for this role
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5 md:grid-cols-6">
            {sorted.map((c) => {
              const colors = getInitialColor(c.name);
              return (
                <button
                  key={c.id}
                  onClick={() => onSelect(c)}
                  className="group flex flex-col items-center gap-1 transition-transform duration-150 hover:scale-105"
                >
                  <div
                    className={cn(
                      "h-14 w-14 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all",
                      "group-hover:shadow-lg",
                      side === "ally" ? "group-hover:border-accent" : "group-hover:border-[#8C2F39]"
                    )}
                    style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                  >
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-2xs text-text-secondary group-hover:text-text-primary font-medium text-center leading-tight max-w-[60px] truncate">
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer count */}
      <div className={cn("px-3 py-1.5 border-t border-border-subtle text-2xs text-text-muted", accentBg)}>
        {sorted.length} champion{sorted.length !== 1 ? "s" : ""} · tap to pick
      </div>
    </div>
  );
}
