"use client";

import { useState, useEffect, useCallback } from "react";
import { Industry, industriesData as staticIndustries } from "@/data/industries";
import { getIndustries } from "@/lib/api/industries";

export function useIndustriesData() {
  const [industries, setIndustries] = useState<Industry[]>(staticIndustries);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIndustries = useCallback(async () => {
    try {
      const data = await getIndustries();
      if (data && Array.isArray(data) && data.length > 0) {
        setIndustries(data);
      }
    } catch {
      // Retain static fallback
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
