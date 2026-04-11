"use client";

import { useState, useEffect, useCallback } from "react";
import type { HoleStrategy } from "@/lib/types";

interface UseStrategyReturn {
  strategy: HoleStrategy | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  generateStrategy: () => Promise<void>;
}

export function useStrategy(holeId: string, profileId: string): UseStrategyReturn {
  const [strategy, setStrategy] = useState<HoleStrategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!holeId || !profileId) {
      setIsLoading(false);
      return;
    }

    async function fetchStrategy() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/ai/strategy?hole_id=${encodeURIComponent(holeId)}&profile_id=${encodeURIComponent(profileId)}`
        );
        if (res.ok) {
          const data = await res.json();
          setStrategy(data.strategy ?? null);
        } else if (res.status !== 404) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Failed to load strategy");
        }
      } catch {
        setError("Network error loading strategy");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStrategy();
  }, [holeId, profileId]);

  const generateStrategy = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hole_id: holeId, profile_id: profileId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to generate strategy");
      }
      const data = await res.json();
      setStrategy(data.strategy);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate strategy");
    } finally {
      setIsGenerating(false);
    }
  }, [holeId, profileId]);

  return { strategy, isLoading, isGenerating, error, generateStrategy };
}
