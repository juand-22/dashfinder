export type LoginCredentials = {
  username: string;
  password: string;
};

type LoginResponse = {
  user: {
    id: number;
    username: string;
  };
  token: string;
};

export class LoginRequestError extends Error {
  readonly alertType: "invalid-credentials" | "server-error";

  constructor(alertType: "invalid-credentials" | "server-error") {
    super(alertType);
    this.name = "LoginRequestError";
    this.alertType = alertType;
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new LoginRequestError("server-error");
  }

  if (response.status === 401) {
    throw new LoginRequestError("invalid-credentials");
  }

  if (!response.ok) {
    throw new LoginRequestError("server-error");
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new LoginRequestError("server-error");
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("token" in result) ||
    typeof result.token !== "string" ||
    !("user" in result) ||
    typeof result.user !== "object" ||
    result.user === null ||
    !("id" in result.user) ||
    typeof result.user.id !== "number" ||
    !("username" in result.user) ||
    typeof result.user.username !== "string"
  ) {
    throw new LoginRequestError("server-error");
  }

  return {
    token: result.token,
    user: {
      id: result.user.id,
      username: result.user.username,
    },
  };
}
