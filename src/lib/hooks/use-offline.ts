"use client";

import { useContext } from "react";
import { OfflineContext } from "@/components/providers/offline-provider";

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) {
    throw new Error("useOffline must be used within OfflineProvider");
  }
  return ctx;
}
