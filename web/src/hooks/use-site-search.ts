// Third-party imports
import { useState, useEffect } from "react";

// Application imports
import type { PagefindModule, PagefindSearchResult } from "@/types/pagefind";

type UseSiteSearchReturn<T> = {
  handleSearch: (query: string) => Promise<void>;
  results: T[];
};

export const useSiteSearch = <T>(
  maxResults: number,
): UseSiteSearchReturn<T> => {
  const [pagefind, setPagefind] = useState<PagefindModule | null>(null);
  const [results, setResults] = useState<T[]>([]);

  useEffect(() => {
    async function load() {
      const path = "/pagefind/pagefind.js";
      // @ts-expect-error - Pagefind is generated post-build
      const lib = await import(/* webpackIgnore: true */ path);
      await lib.init();
      setPagefind(lib);
    }
    load();
  }, []);

  const handleSearch = async (query: string) => {
    if (!pagefind || !query) return;
    const search = await pagefind.search(query);
    const topResults = await Promise.all(
      search.results.map((r: PagefindSearchResult) => r.data()),
    );
    const mappedResults = topResults.map((result) => result.meta as T);
    setResults(mappedResults);
  };

  return { handleSearch, results };
};
