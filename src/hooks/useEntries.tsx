"use client";

import { useState, useEffect, useCallback } from "react";
import { Entry } from "@/types/entry";

export type UseEntriesResult = {
  entries: Entry[];
  isLoading: boolean;
  error: Error | null;
  reload: () => void;
};

export function useEntries(): UseEntriesResult {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    setIsLoading(true);
    setError(null);

    const load = (attempt = 0) => {
      fetch("/api/entries", { cache: "no-store" })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((data: { entries: Entry[] }) => {
          if (cancelled) return;
          setEntries(data.entries);
          setIsLoading(false);
          setError(null);
        })
        .catch((err: Error) => {
          if (cancelled) return;
          if (attempt < 2) {
            retryTimer = setTimeout(() => load(attempt + 1), 800);
            return;
          }
          console.error("useEntries: failed to load entries:", err);
          setError(err);
          setIsLoading(false);
        });
    };

    load();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [reloadKey]);

  return { entries, isLoading, error, reload };
}
