"use client";

import { useState, useEffect, useCallback } from "react";
import type { HeroPoolEntry, Role } from "@/types";

interface UseHeroPoolResult {
  pool: HeroPoolEntry[];
  loading: boolean;
  error: string | null;
  addToPool: (championId: string, role: Role, proficiency?: 1 | 2 | 3 | 4 | 5) => Promise<boolean>;
  removeFromPool: (entryId: string) => Promise<boolean>;
  isInPool: (championId: string, role?: Role) => boolean;
  refetch: () => void;
}

export function useHeroPool(): UseHeroPoolResult {
  const [pool, setPool] = useState<HeroPoolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("/api/hero-pool")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setPool(json.data);
      })
      .catch((err) => setError(err.message ?? "Failed to load hero pool"))
      .finally(() => setLoading(false));
  }, [tick]);

  const addToPool = useCallback(
    async (
      championId: string,
      role: Role,
      proficiency: 1 | 2 | 3 | 4 | 5 = 3
    ): Promise<boolean> => {
      try {
        const res = await fetch("/api/hero-pool", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ champion_id: championId, role, proficiency }),
        });

        const json = await res.json();
        if (json.error) throw new Error(json.error);

        // Optimistic update
        setPool((prev) => [...prev, json.data]);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add champion");
        return false;
      }
    },
    []
  );

  const removeFromPool = useCallback(async (entryId: string): Promise<boolean> => {
    try {
      // Optimistic removal
      setPool((prev) => prev.filter((e) => e.id !== entryId));

      const res = await fetch(`/api/hero-pool?id=${entryId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.error) {
        // Revert on failure
        setTick((t) => t + 1);
        throw new Error(json.error);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove champion");
      return false;
    }
  }, []);

  const isInPool = useCallback(
    (championId: string, role?: Role): boolean => {
      if (role) {
        return pool.some(
          (e) => e.champion_id === championId && e.role === role
        );
      }
      return pool.some((e) => e.champion_id === championId);
    },
    [pool]
  );

  return {
    pool,
    loading,
    error,
    addToPool,
    removeFromPool,
    isInPool,
    refetch: () => setTick((t) => t + 1),
  };
}
