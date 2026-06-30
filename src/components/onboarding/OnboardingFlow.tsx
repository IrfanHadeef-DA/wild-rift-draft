"use client";

import { useState } from "react";
import { Swords, Shield, Zap, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const STEPS = [
  {
    id: "welcome",
    icon: Swords,
    title: "Welcome to Wild Rift Draft",
    subtitle: "Your personal champion select coach",
    body: "This app watches your draft in real time and tells you exactly which champion to pick from your own hero pool — and explains why, the way a Challenger coach would.",
    cta: "Let's get started",
  },
  {
    id: "pool",
    icon: Shield,
    title: "Build your hero pool",
    subtitle: "Only the champions you actually play",
    body: "The coach will never suggest a champion you don't know. Your first step is saving the champions you play. You can add as few as 2 or 3 — you don't need a big pool to get started.",
    cta: "Got it",
  },
  {
    id: "draft",
    icon: Zap,
    title: "Use it during champion select",
    subtitle: "Takes about 30 seconds",
    body: "Open the Draft tab when champion select starts. As picks come in, type each champion into the board. Hit \"Get recommendation\" and the coach tells you who to pick and why — before you have to lock in.",
    cta: "Take me to my pool",
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  function handleCta() {
    if (isLast) {
      localStorage.setItem("wrd_onboarded", "1");
      onComplete();
      router.push("/profile");
    } else {
      setStep(s => s + 1);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm animate-slide-up">

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full transition-all duration-300",
                i === step
                  ? "w-6 h-2 bg-accent"
                  : i < step
                  ? "w-2 h-2 bg-accent/40"
                  : "w-2 h-2 bg-border-default"
              )}
            />
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border-subtle bg-surface-1 p-7 shadow-card">

          {/* Icon */}
          <div className={cn(
            "mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border-2",
            step === 0 ? "bg-accent/10 border-accent/30" :
            step === 1 ? "bg-role-support/10 border-role-support/30" :
            "bg-gold/10 border-gold/30"
          )}>
            <Icon className={cn(
              "h-6 w-6",
              step === 0 ? "text-accent" :
              step === 1 ? "text-role-support" :
              "text-gold"
            )} />
          </div>

          {/* Text */}
          <div className="text-center mb-6">
            <p className="text-xs font-medium uppercase tracking-widest text-text-muted mb-2">
              {current.subtitle}
            </p>
            <h2 className="text-xl font-bold text-text-primary mb-3 leading-tight">
              {current.title}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {current.body}
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={handleCta}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all",
              isLast
                ? "bg-gold/10 border-2 border-gold/40 text-gold hover:bg-gold/20"
                : "bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20"
            )}
          >
            {current.cta}
            {isLast ? <Shield className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          {/* Skip */}
          {step < STEPS.length - 1 && (
            <button
              onClick={() => {
                localStorage.setItem("wrd_onboarded", "1");
                onComplete();
              }}
              className="w-full mt-3 text-xs text-text-muted hover:text-text-secondary transition-colors py-1"
            >
              Skip intro
            </button>
          )}
        </div>

        {/* Completed steps summary */}
        {step > 0 && (
          <div className="mt-4 space-y-1">
            {STEPS.slice(0, step).map(s => (
              <div key={s.id} className="flex items-center gap-2 text-xs text-text-muted px-2">
                <Check className="h-3 w-3 text-success flex-shrink-0" />
                {s.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
