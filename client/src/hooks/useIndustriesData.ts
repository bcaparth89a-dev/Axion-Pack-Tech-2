"use client";

import { useState, useEffect, useCallback } from "react";
import { Industry } from "@/data/industries";
import { getIndustries } from "@/lib/api/industries";

export function useIndustriesData() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIndustries = useCallback(async () => {
    try {
      const data = await getIndustries();
      if (Array.isArray(data)) {
        setIndustries(data);
      }
    } catch {
      // Retain state on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIndustries();

    const handleIndustryChange = () => {
      fetchIndustries();
    };

    window.addEventListener("industries-updated", handleIndustryChange);
    return () => {
      window.removeEventListener("industries-updated", handleIndustryChange);
    };
  }, [fetchIndustries]);

  return { industries, isLoading, refetch: fetchIndustries };
}
