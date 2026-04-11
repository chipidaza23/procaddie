"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CourseSearchResult } from "@/lib/types";

interface UseCourseSearchResult {
  query: string;
  setQuery: (q: string) => void;
  results: CourseSearchResult[];
  isLoading: boolean;
  error: string | null;
}

const DEBOUNCE_MS = 400;

export function useCourseSearch(): UseCourseSearchResult {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CourseSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/courses/search?q=${encodeURIComponent(q.trim())}`
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query), DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, search]);

  return { query, setQuery, results, isLoading, error };
}
