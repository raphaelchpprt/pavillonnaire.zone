"use client";

import { useState, useEffect } from "react";

export default function useMediaQuery(query: string): boolean {
  const [isMatchingQuery, setIsMatchingQuery] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setIsMatchingQuery(mediaQuery.matches);

    const onMediaQueryChange = (event: MediaQueryListEvent) => {
      setIsMatchingQuery(event.matches);
    };

    try {
      mediaQuery.addEventListener("change", onMediaQueryChange);
      return () => mediaQuery.removeEventListener("change", onMediaQueryChange);
    } catch {
      mediaQuery.addListener(onMediaQueryChange);
      return () => mediaQuery.removeListener(onMediaQueryChange);
    }
  }, [query]);

  return isMatchingQuery;
}
