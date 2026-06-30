import { cn } from "@/lib/utils";
import type { Champion } from "@/types";

interface ChampionAvatarProps {
  champion: Pick<Champion, "name" | "metadata">;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  showName?: boolean;
}

const SIZE_CLASSES = {
  xs: "h-6 w-6 text-2xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export function ChampionAvatar({
  champion,
  size = "md",
  className,
  showName = false,
}: ChampionAvatarProps) {
  const imageUrl = champion.metadata?.image_url;
  const initials = champion.name.slice(0, 2).toUpperCase();

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className={cn(
          "relative rounded border border-border-default bg-surface-2 overflow-hidden flex-shrink-0 flex items-center justify-center",
          SIZE_CLASSES[size]
        )}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={champion.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              // Fallback to initials on image load error
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="font-semibold text-text-muted">{initials}</span>
        )}
      </div>
      {showName && (
        <span className="text-2xs text-text-secondary text-center leading-tight max-w-[48px] truncate">
          {champion.name}
        </span>
      )}
    </div>
  );
}
