"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  ApiRankedResponse,
  ApiRankedPeriod,
  ApiStormsResponse,
  ApiWorthKnowingResponse,
  ApiWeatherResponse,
  ApiResortDetailResponse,
  ApiNotificationsResponse,
} from "@/types/api";
import {
  getRankedResorts,
  getStorms,
  getWorthKnowing,
  getWeather,
  getResortDetail,
  getNotifications,
  OnlySnowApiError,
} from "@/lib/api/client";

// ── Generic hook state ────────────────────────────────────────

interface UseApiState<T> {
  data: T | null;
  error: OnlySnowApiError | Error | null;
  loading: boolean;
}

interface UseApiResult<T> extends UseApiState<T> {
  refetch: () => void;
}

function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
): UseApiResult<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    loading: true,
  });
  const mountedRef = useRef(true);

  const fetch = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetcher()
      .then((data) => {
        if (mountedRef.current) {
          setState({ data, error: null, loading: false });
        }
      })
      .catch((err) => {
        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            error: err instanceof Error ? err : new Error(String(err)),
            loading: false,
          }));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => {
      mountedRef.current = false;
    };
  }, [fetch]);

  return { ...state, refetch: fetch };
}

// ── Lazy hook (only fetches when slug is provided) ────────────

function useLazyApi<T>(
  fetcher: (() => Promise<T>) | null,
  deps: unknown[],
): UseApiResult<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    loading: !!fetcher,
  });
  const mountedRef = useRef(true);

  const fetch = useCallback(() => {
    if (!fetcher) {
      setState({ data: null, error: null, loading: false });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetcher()
      .then((data) => {
        if (mountedRef.current) {
          setState({ data, error: null, loading: false });
        }
      })
      .catch((err) => {
        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            error: err instanceof Error ? err : new Error(String(err)),
            loading: false,
          }));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => {
      mountedRef.current = false;
    };
  }, [fetch]);

  return { ...state, refetch: fetch };
}

// ── Endpoint hooks ────────────────────────────────────────────

export function useRankedResorts(
  period: ApiRankedPeriod = "today",
): UseApiResult<ApiRankedResponse> {
  return useApi(() => getRankedResorts(period), [period]);
}

export function useStorms(): UseApiResult<ApiStormsResponse> {
  return useApi(() => getStorms(), []);
}

export function useWorthKnowing(): UseApiResult<ApiWorthKnowingResponse> {
  return useApi(() => getWorthKnowing(), []);
}

export function useWeather(
  slug: string | null,
  units: "metric" | "imperial" = "imperial",
): UseApiResult<ApiWeatherResponse> {
  return useLazyApi(
    slug ? () => getWeather(slug, units) : null,
    [slug, units],
  );
}

export function useResortDetail(
  slug: string | null,
  units: "metric" | "imperial" = "imperial",
): UseApiResult<ApiResortDetailResponse> {
  return useLazyApi(
    slug ? () => getResortDetail(slug, units) : null,
    [slug, units],
  );
}

export function useNotifications(): UseApiResult<ApiNotificationsResponse> {
  return useApi(() => getNotifications(), []);
}

// ── Helpers ───────────────────────────────────────────────────

export function formatFetchedAt(iso: string): string {
  const now = Date.now();
  const fetched = new Date(iso).getTime();
  const diffMs = now - fetched;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin === 1) return "1 min ago";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs === 1) return "1 hr ago";
  if (diffHrs < 24) return `${diffHrs} hrs ago`;

  return new Date(iso).toLocaleDateString();
}
