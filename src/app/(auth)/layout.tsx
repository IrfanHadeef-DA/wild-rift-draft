import { Swords } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-surface-0 bg-grid flex flex-col items-center justify-center p-4">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(79,142,247,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 accent-glow">
            <Swords className="h-6 w-6 text-accent" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold tracking-tight text-text-primary">
              Wild Rift Draft
            </h1>
            <p className="text-sm text-text-muted">Your champion select coach</p>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
