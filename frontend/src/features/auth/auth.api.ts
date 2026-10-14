export type LoginCredentials = {
  username: string;
  password: string;
};

export type AuthUser = {
  id: number;
  username: string;
};

export type AuthRequestErrorType =
  | "invalid-credentials"
  | "username-exists"
  | "invalid-input"
  | "server-error";

export class AuthRequestError extends Error {
  readonly alertType: AuthRequestErrorType;

  constructor(alertType: AuthRequestErrorType) {
    super(alertType);
    this.name = "AuthRequestError";
    this.alertType = alertType;
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

async function requestAuth(
  endpoint: "login" | "register",
  credentials: LoginCredentials,
): Promise<AuthUser> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include",
    });
  } catch {
    throw new AuthRequestError("server-error");
  }

  if (response.status === 401 && endpoint === "login") {
    throw new AuthRequestError("invalid-credentials");
  }

  if (response.status === 409 && endpoint === "register") {
    throw new AuthRequestError("username-exists");
  }

  if (response.status === 400) {
    throw new AuthRequestError("invalid-input");
  }

  if (!response.ok) {
    throw new AuthRequestError("server-error");
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new AuthRequestError("server-error");
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("user" in result) ||
    typeof result.user !== "object" ||
    result.user === null ||
    !("id" in result.user) ||
    typeof result.user.id !== "number" ||
    !("username" in result.user) ||
    typeof result.user.username !== "string"
  ) {
    throw new AuthRequestError("server-error");
  }

  return { id: result.user.id, username: result.user.username };
}

export function login(credentials: LoginCredentials): Promise<AuthUser> {
  return requestAuth("login", credentials);
}

export function register(credentials: LoginCredentials): Promise<AuthUser> {
  return requestAuth("register", credentials);
}

export async function getCurrentUser(signal?: AbortSignal): Promise<AuthUser | null> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/auth/me`, {
      credentials: "include",
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new AuthRequestError("server-error");
  }

  if (response.status === 401) return null;
  if (!response.ok) throw new AuthRequestError("server-error");

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new AuthRequestError("server-error");
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("user" in result) ||
    typeof result.user !== "object" ||
    result.user === null ||
    !("username" in result.user) ||
    typeof result.user.username !== "string"
  ) {
    throw new AuthRequestError("server-error");
  }

  const userId =
    "id" in result.user && typeof result.user.id === "number"
      ? result.user.id
      : "userId" in result.user && typeof result.user.userId === "number"
        ? result.user.userId
        : null;

  if (userId === null) throw new AuthRequestError("server-error");

  return { id: userId, username: result.user.username };
}
