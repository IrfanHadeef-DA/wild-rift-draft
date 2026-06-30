"use client";

import { useState, useEffect } from "react";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  // Start as null (unknown) to avoid flash
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem("wrd_onboarded");
    setShowOnboarding(!seen);
  }, []);

  // While checking localStorage, render children silently (no flash)
  if (showOnboarding === null) return <>{children}</>;

  return (
    <>
      {children}
      {showOnboarding && (
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
      )}
    </>
  );
}
