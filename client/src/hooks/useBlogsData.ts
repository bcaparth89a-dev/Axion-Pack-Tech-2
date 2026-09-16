"use client";

import { useState, useEffect, useCallback } from "react";
import { BlogCategory } from "@/data/blogs";
import { getBlogCategories } from "@/lib/api/blogs";

export function useBlogsData() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getBlogCategories();
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

    const handleBlogChange = () => {
      fetchCategories();
    };

    window.addEventListener("blogs-updated", handleBlogChange);
    return () => {
      window.removeEventListener("blogs-updated", handleBlogChange);
    };
  }, [fetchCategories]);

  return { categories, isLoading, refetch: fetchCategories };
}
