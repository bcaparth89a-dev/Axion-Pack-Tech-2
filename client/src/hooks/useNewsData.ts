"use client";

import { useState, useEffect, useCallback } from "react";
import { NewsCategory } from "@/data/news";
import { getNewsCategories } from "@/lib/api/news";

export function useNewsData() {
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getNewsCategories();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch {
      // Retain state on error
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
