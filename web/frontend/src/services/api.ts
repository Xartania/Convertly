import type {
  ApiCredentials,
  LoginRequest,
  ProjectRequest,
  ProjectResponse,
  RegisterRequest,
  UserResponse
} from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const encodeBasicAuth = ({ email, password }: ApiCredentials) => {
  const token = window.btoa(unescape(encodeURIComponent(`${email}:${password}`)));
  return `Basic ${token}`;
};

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  credentials?: ApiCredentials
): Promise<T> {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (credentials) {
    headers.set("Authorization", encodeBasicAuth(credentials));
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = (await response.json()) as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      const text = await response.text();
      message = text || message;
    }

    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  register(payload: RegisterRequest) {
    return apiRequest<UserResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  login(payload: LoginRequest) {
    return apiRequest<UserResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  me(credentials: ApiCredentials) {
    return apiRequest<UserResponse>("/api/users/me", {}, credentials);
  },
  listProjects(credentials: ApiCredentials) {
    return apiRequest<ProjectResponse[]>("/api/projects", {}, credentials);
  },
  createProject(credentials: ApiCredentials, payload: ProjectRequest) {
    return apiRequest<ProjectResponse>(
      "/api/projects",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      credentials
    );
  }
};

export { ApiError };
