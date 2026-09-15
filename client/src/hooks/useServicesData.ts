"use client";

import { useState, useEffect, useCallback } from "react";
import { Service, servicesData as staticServices } from "@/data/services";
import { getServices } from "@/lib/api/services";

export function useServicesData() {
  const [services, setServices] = useState<Service[]>(staticServices);
  const [isLoading, setIsLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      const data = await getServices();
      if (data && Array.isArray(data)) {
        setServices(data);
      }
    } catch {
      // Retain previous state on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();

    const handleServiceChange = () => {
      fetchServices();
    };

    window.addEventListener("services-updated", handleServiceChange);
    return () => {
      window.removeEventListener("services-updated", handleServiceChange);
    };
  }, [fetchServices]);

  return { services, isLoading, refetch: fetchServices };
}
