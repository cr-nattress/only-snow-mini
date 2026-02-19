import type {
  ApiHealthResponse,
  ApiWeatherResponse,
  ApiRankedResponse,
  ApiRankedPeriod,
  ApiResortDetailResponse,
  ApiStormsResponse,
  ApiWorthKnowingResponse,
  ApiPreferencesResponse,
  ApiPreferencesPostBody,
  ApiPreferencesPatchBody,
  ApiNotificationsResponse,
  ApiError,
} from "@/types/api";

// ── Configuration ──────────────────────────────────────────────

// Use relative /api path so requests go through the Next.js rewrite proxy
// (avoids CORS issues with direct cross-origin requests to the backend).
const API_BASE_URL = "/api";

const API_KEY = process.env.NEXT_PUBLIC_ONLYSNOW_API_KEY ?? "";

// ── Error class ────────────────────────────────────────────────

export class OnlySnowApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "OnlySnowApiError";
  }
}

// ── Core fetch helper ──────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (API_KEY) {
    headers["Authorization"] = `Bearer ${API_KEY}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    // Handle rate limiting
    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      throw new OnlySnowApiError(
        "RATE_LIMITED",
        `Rate limited. Retry after ${retryAfter ?? "unknown"} seconds.`,
        429,
      );
    }

    // Parse structured error
    try {
      const body = (await res.json()) as ApiError;
      throw new OnlySnowApiError(
        body.error.code,
        body.error.message,
        body.error.status,
        body.error.fields,
      );
    } catch (e) {
      if (e instanceof OnlySnowApiError) throw e;
      throw new OnlySnowApiError(
        "UNKNOWN_ERROR",
        `API returned ${res.status}`,
        res.status,
      );
    }
  }

  return res.json() as Promise<T>;
}

// ── Public endpoints (no auth required) ────────────────────────

export async function getHealth(): Promise<ApiHealthResponse> {
  return apiFetch<ApiHealthResponse>("/health");
}

export async function getWeather(
  resortSlug: string,
  units: "metric" | "imperial" = "imperial",
): Promise<ApiWeatherResponse> {
  return apiFetch<ApiWeatherResponse>(
    `/weather?resort=${encodeURIComponent(resortSlug)}&units=${units}`,
  );
}

// ── Authenticated endpoints ────────────────────────────────────

export async function getRankedResorts(
  period: ApiRankedPeriod = "today",
): Promise<ApiRankedResponse> {
  return apiFetch<ApiRankedResponse>(`/resorts/ranked?period=${period}`);
}

export async function getResortDetail(
  slug: string,
  units: "metric" | "imperial" = "imperial",
): Promise<ApiResortDetailResponse> {
  return apiFetch<ApiResortDetailResponse>(
    `/resorts/${encodeURIComponent(slug)}?units=${units}`,
  );
}

export async function getStorms(): Promise<ApiStormsResponse> {
  return apiFetch<ApiStormsResponse>("/storms");
}

export async function getWorthKnowing(): Promise<ApiWorthKnowingResponse> {
  return apiFetch<ApiWorthKnowingResponse>("/worth-knowing");
}

export async function getPreferences(): Promise<ApiPreferencesResponse> {
  return apiFetch<ApiPreferencesResponse>("/preferences");
}

export async function savePreferences(
  body: ApiPreferencesPostBody,
): Promise<ApiPreferencesResponse> {
  return apiFetch<ApiPreferencesResponse>("/preferences", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function patchPreferences(
  body: ApiPreferencesPatchBody,
): Promise<ApiPreferencesResponse> {
  return apiFetch<ApiPreferencesResponse>("/preferences", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function getNotifications(): Promise<ApiNotificationsResponse> {
  return apiFetch<ApiNotificationsResponse>("/notifications");
}
