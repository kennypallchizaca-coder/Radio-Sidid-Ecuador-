/**
 * services/api.ts
 * ──────────────────────────────────────────────────────────────
 * Capa base para consumir un backend (REST / tRPC / GraphQL).
 *
 * ► Cuando implementes un backend:
 *   1. Configura API_BASE_URL en .env (VITE_API_URL)
 *   2. Usa apiClient.get() / apiClient.post() desde los servicios
 *   3. Centraliza manejo de errores, auth tokens y retry aquí
 *
 * Por ahora solo exporta helpers reutilizables.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL as string | undefined;
const DEFAULT_TIMEOUT = 10_000;

interface RequestOptions extends Omit<RequestInit, "body"> {
  timeout?: number;
  body?: unknown;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { timeout = DEFAULT_TIMEOUT, body, headers, ...rest } = options;
  const url = `${API_BASE_URL ?? ""}${endpoint}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...rest,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = (await response.json()) as T;
    return { data, status: response.status, ok: response.ok };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Cliente HTTP base para consumir APIs.
 *
 * Ejemplo de uso futuro:
 *   const { data } = await apiClient.get<Song[]>("/api/songs");
 *   await apiClient.post("/api/contact", { body: formData });
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST" }),

  put: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PUT" }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
