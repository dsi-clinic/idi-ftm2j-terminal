// Third-party imports
import { useState, useEffect } from "react";

// Application imports
import type { PagefindModule, PagefindSearchResult } from "@/types/pagefind";

type SearchResult = {
  metadata: Record<string, string>;
  url: string;
};

type UseSiteSearchReturn = {
  handleSearch: (query: string) => Promise<void>;
  results: SearchResult[];
};

export const useSiteSearch = (maxResults: number): UseSiteSearchReturn => {
  const [pagefind, setPagefind] = useState<PagefindModule | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    async function load() {
      const lib = await import(
        // @ts-expect-error
        /* webpackIgnore: true */ "/pagefind/pagefind.js"
      );
      await lib.init();
      setPagefind(lib);
    }
    load();
  }, []);

  const handleSearch = async (query: string) => {
    if (!pagefind || !query) return;
    const search = await pagefind.search(query);
    const topResults = await Promise.all(
      search.results
        .slice(0, maxResults)
        .map((r: PagefindSearchResult) => r.data()),
    );
    const mappedResults = topResults.map((result) => ({
      metadata: result.meta,
      url: result.url,
    }));
    setResults(mappedResults);
  };

  return { handleSearch, results };
};
