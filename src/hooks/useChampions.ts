"use client";

import { useState, useEffect } from "react";
import type { Champion, Role } from "@/types";

interface UseChampionsOptions {
  role?: Role;
}

interface UseChampionsResult {
  champions: Champion[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Module-level cache — shared across all hook instances in the same session
const cache: Map<string, { data: Champion[]; fetchedAt: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useChampions({ role }: UseChampionsOptions = {}): UseChampionsResult {
  const cacheKey = role ?? "all";

  const [champions, setChampions] = useState<Champion[]>(() => {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      return cached.data;
    }
    return [];
  });

  const [loading, setLoading] = useState(() => {
    const cached = cache.get(cacheKey);
    return !cached || Date.now() - cached.fetchedAt >= CACHE_TTL;
  });

  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      setChampions(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const url = role ? `/api/champions?role=${role}` : "/api/champions";

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        cache.set(cacheKey, { data: json.data, fetchedAt: Date.now() });
        setChampions(json.data);
      })
      .catch((err) => {
        setError(err.message ?? "Failed to load champions");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [cacheKey, role, tick]);

  return {
    champions,
    loading,
    error,
    refetch: () => {
      cache.delete(cacheKey);
      setTick((t) => t + 1);
    },
  };
}
