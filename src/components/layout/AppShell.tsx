"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Swords, User, History, LogOut, ChevronRight, Shield, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface AppShellProps {
  children: React.ReactNode;
  user: {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [poolCount, setPoolCount] = useState<number | null>(null);
  const [historyCount, setHistoryCount] = useState<number | null>(null);

  const displayName = user.display_name ?? user.email.split("@")[0] ?? "Summoner";
  const initials = displayName.slice(0, 2).toUpperCase();

  // Load badge counts once on mount
  useEffect(() => {
    fetch("/api/hero-pool")
      .then(r => r.json())
      .then(j => { if (!j.error) setPoolCount(j.data?.length ?? 0); })
      .catch(() => {});

    fetch("/api/draft-sessions?limit=1")
      .then(r => r.json())
      .then(j => { if (!j.error) setHistoryCount(j.data?.length ?? 0); })
      .catch(() => {});
  }, []);

  const NAV_ITEMS = [
    {
      href: "/draft",
      label: "Draft",
      icon: Swords,
      badge: null,
    },
    {
      href: "/profile",
      label: "Hero pool",
      icon: Shield,
      badge: poolCount && poolCount > 0 ? String(poolCount) : null,
    },
    {
      href: "/history",
      label: "History",
      icon: History,
      badge: historyCount && historyCount > 0 ? String(historyCount) : null,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
      badge: null,
    },
  ];

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-surface-0">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-surface-1 border-r border-border-subtle",
        "transition-transform duration-200 ease-out",
        "lg:relative lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-border-subtle">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
            <Swords className="h-4 w-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary tracking-tight">Wild Rift Draft</p>
            <p className="text-2xs text-text-muted uppercase tracking-widest">Patch 7.1f</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href) && item.href !== "/profile");
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                  active
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-2 border border-transparent"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  active ? "text-accent" : "text-text-muted group-hover:text-text-secondary"
                )} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={cn(
                    "text-2xs rounded-full px-1.5 py-0.5 font-semibold min-w-[18px] text-center",
                    active ? "bg-accent/20 text-accent" : "bg-surface-3 text-text-muted"
                  )}>
                    {item.badge}
                  </span>
                )}
                {active && !item.badge && <ChevronRight className="h-3 w-3 text-accent/60" />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-border-subtle p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="h-8 w-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-xs font-semibold text-accent flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{displayName}</p>
              <p className="text-2xs text-text-muted truncate">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-text-muted hover:text-danger transition-colors disabled:opacity-50"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="flex h-14 items-center gap-4 px-4 border-b border-border-subtle bg-surface-1 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Swords className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold">Wild Rift Draft</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
