import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const safeProfile = profile ?? {
    id: user.id,
    email: user.email ?? "",
    display_name: null,
    avatar_url: null,
  };

  return (
    <AppShell user={safeProfile}>
      <OnboardingGate>
        {children}
      </OnboardingGate>
    </AppShell>
  );
}
