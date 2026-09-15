"use client";

import { useState, useEffect, useCallback } from "react";
import { NewsCategory, newsCategories as staticNewsCategories } from "@/data/news";
import { getNewsCategories } from "@/lib/api/news";

export function useNewsData() {
  const [categories, setCategories] = useState<NewsCategory[]>(staticNewsCategories);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getNewsCategories();
      if (data && Array.isArray(data) && data.length > 0) {
        setCategories(data);
      }
    } catch {
      // Retain static fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();

    const handleNewsChange = () => {
      fetchCategories();
    };

    window.addEventListener("news-updated", handleNewsChange);
    return () => {
      window.removeEventListener("news-updated", handleNewsChange);
    };
  }, [fetchCategories]);

  return { categories, isLoading, refetch: fetchCategories };
}
