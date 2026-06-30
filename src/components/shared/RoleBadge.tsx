import { cn, getRoleColor } from "@/lib/utils";
import type { Role } from "@/types";

const ROLE_LABELS: Record<Role, string> = {
  support: "Support",
  jungle: "Jungle",
  mid: "Mid",
  baron: "Baron",
  dragon: "Dragon",
};

const ROLE_ICONS: Record<Role, string> = {
  support: "🛡",
  jungle: "🌿",
  mid: "⚡",
  baron: "⚔️",
  dragon: "🏹",
};

interface RoleBadgeProps {
  role: Role;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function RoleBadge({
  role,
  showIcon = true,
  showLabel = true,
  size = "sm",
  className,
}: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-2xs" : "px-2 py-1 text-xs",
        getRoleColor(role),
        className
      )}
    >
      {showIcon && (
        <span aria-hidden className="text-[10px] leading-none">
          {ROLE_ICONS[role]}
        </span>
      )}
      {showLabel && ROLE_LABELS[role]}
    </span>
  );
}
