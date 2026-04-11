"use client";

import { createContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { cacheCoursePack, getCoursePack, type CoursePack } from "@/lib/services/offline-store";

interface OfflineContextValue {
  isOnline: boolean;
  cacheCourse: (courseId: string) => Promise<void>;
  isCaching: boolean;
  cachedCourseIds: string[];
  getOfflinePack: (courseId: string) => Promise<CoursePack | null>;
}

export const OfflineContext = createContext<OfflineContextValue | null>(null);

interface OfflineProviderProps {
  children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isCaching, setIsCaching] = useState(false);
  const [cachedCourseIds, setCachedCourseIds] = useState<string[]>([]);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const cacheCourse = useCallback(async (courseId: string) => {
    setIsCaching(true);
    try {
      // Fetch all data for this course from the API
      const res = await fetch(`/api/courses/${courseId}/pack`);
      if (!res.ok) throw new Error("Failed to fetch course pack");
      const pack: CoursePack = await res.json();
      await cacheCoursePack(pack);
      setCachedCourseIds((prev) =>
        prev.includes(courseId) ? prev : [...prev, courseId]
      );
    } finally {
      setIsCaching(false);
    }
  }, []);

  const getOfflinePack = useCallback(
    (courseId: string) => getCoursePack(courseId),
    []
  );

  return (
    <OfflineContext.Provider
      value={{ isOnline, cacheCourse, isCaching, cachedCourseIds, getOfflinePack }}
    >
      {children}
    </OfflineContext.Provider>
  );
}
