"use client";

import { createContext, useContext, useState } from "react";

interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  type: string;
  setType: (type: string) => void;
  condition: string;
  setCondition: (condition: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [condition, setCondition] = useState("");

  return (
    <SearchContext.Provider
      value={{ query, setQuery, type, setType, condition, setCondition }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}