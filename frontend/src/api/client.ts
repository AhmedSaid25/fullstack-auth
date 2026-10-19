const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// An error with the HTTP status, so callers can react to e.g. 401 vs 409
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      // Send and receive the httpOnly auth cookie on cross-origin requests
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    // fetch only throws on network failure (server down, no internet)
    throw new ApiError(0, 'Cannot reach the server. Please try again.');
  }

  if (!response.ok) {
    // Backend errors look like { message: string | string[] }
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(body?.message)
      ? body.message.join('. ')
      : (body?.message ?? 'Something went wrong');
    throw new ApiError(response.status, message);
  }

  // 204 No Content has no body to parse
  return (response.status === 204 ? undefined : await response.json()) as T;
}
