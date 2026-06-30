import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a deterministic hash from a draft state for cache lookups.
 * Sorts picks to ensure order doesn't affect the hash.
 */
export function generateDraftHash(
  allyPicks: string[],
  enemyPicks: string[],
  heroPool: string[]
): string {
  const sorted = {
    allies: [...allyPicks].sort(),
    enemies: [...enemyPicks].sort(),
    pool: [...heroPool].sort(),
  };
  return btoa(JSON.stringify(sorted));
}

/**
 * Format a proficiency level to a readable label.
 */
export function formatProficiency(level: 1 | 2 | 3 | 4 | 5): string {
  const labels: Record<number, string> = {
    1: "Learning",
    2: "Familiar",
    3: "Comfortable",
    4: "Experienced",
    5: "Mastered",
  };
  return labels[level] ?? "Unknown";
}

/**
 * Returns a color class for a role badge.
 */
export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    support: "text-role-support border-role-support/30 bg-role-support/10",
    jungle: "text-role-jungle border-role-jungle/30 bg-role-jungle/10",
    mid: "text-role-mid border-role-mid/30 bg-role-mid/10",
    baron: "text-role-baron border-role-baron/30 bg-role-baron/10",
    dragon: "text-role-dragon border-role-dragon/30 bg-role-dragon/10",
  };
  return colors[role] ?? "text-text-secondary border-border-default bg-surface-2";
}

/**
 * Returns a color class for a threat severity badge.
 */
export function getThreatColor(severity: "low" | "medium" | "high"): string {
  const colors = {
    low: "text-success border-success/30 bg-success/10",
    medium: "text-warning border-warning/30 bg-warning/10",
    high: "text-danger border-danger/30 bg-danger/10",
  };
  return colors[severity];
}

/**
 * Truncate text to a max length with ellipsis.
 */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "…";
}

/**
 * Format a date to a relative time string (e.g. "2 hours ago").
 */
export function relativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}
