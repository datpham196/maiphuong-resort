const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type FieldValidationError = {
  path: string;
  code: string;
  message: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public errors?: FieldValidationError[],
  ) {
    super(message);
  }
}

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: unknown;
  formData?: FormData;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers();
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.formData ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
    cache: "no-store",
  });

  if (!response.ok) {
    let code: string | undefined;
    let message = `Request failed (${response.status})`;
    let errors: FieldValidationError[] | undefined;
    try {
      const data = (await response.json()) as
        | { code?: string; message?: string; errors?: FieldValidationError[] }
        | FieldValidationError[];
      if (Array.isArray(data)) {
        errors = data;
        if (data[0]?.message) message = data[0].message;
        if (data[0]?.code) code = data[0].code;
      } else {
        code = data.code;
        if (data.message) message = data.message;
        if (Array.isArray(data.errors)) errors = data.errors;
      }
    } catch {
      // ignore empty/non-JSON error bodies
    }
    throw new ApiError(message, response.status, code, errors);
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export function getApiBase() {
  return API_BASE;
}
