"use client";

import { useState, useEffect, useCallback } from "react";
import { BlogCategory, blogCategories as staticBlogCategories } from "@/data/blogs";
import { getBlogCategories } from "@/lib/api/blogs";

export function useBlogsData() {
  const [categories, setCategories] = useState<BlogCategory[]>(staticBlogCategories);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getBlogCategories();
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
