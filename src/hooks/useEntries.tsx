"use client";

import { useState, useEffect } from "react";
import { Entry } from "@/types/entry";

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const load = (attempt = 0) => {
      fetch("/api/entries", { cache: "no-store" })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((data: { entries: Entry[] }) => {
          if (!cancelled) {
            setEntries(data.entries);
            setIsLoading(false);
            setError(null);
          }
        })
        .catch((err: Error) => {
          if (cancelled) return;
          if (attempt < 2) {
            retryTimer = setTimeout(() => load(attempt + 1), 800);
            return;
          }
          setError(err);
          setIsLoading(false);
        });
    };

    load();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  return { entries, isLoading, error };
}
