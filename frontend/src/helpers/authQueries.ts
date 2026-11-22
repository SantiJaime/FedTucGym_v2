import env from "../config/env";

const URL = `${env.URL_BACK_DEPLOY}/users`;

const NETWORK_ERROR =
  "No se pudo conectar con el servidor. Revise su conexión e intente nuevamente";
const GENERIC_ERROR = "Ocurrió un error inesperado. Intente nuevamente";
const SESSION_EXPIRED =
  "La sesión ha expirado, por favor vuelva a iniciar sesión";

// Solo para respuestas sin { error }, como las páginas HTML de un proxy.
const fallbackMessage = (status: number) => {
  if (status === 403) return "No tiene permiso para realizar esta acción";
  if (status === 404) return "No se encontró el recurso solicitado";
  if (status === 413) return "Los datos enviados son demasiado grandes";
  if (status === 429) return "Demasiados intentos. Espere unos minutos";
  if (status >= 502 && status <= 504)
    return "El servicio no está disponible, intente nuevamente en unos minutos";
  return GENERIC_ERROR;
};

const toErrorResponse = async (response: Response): Promise<ErrorResponse> => {
  const body: unknown = await response.json().catch(() => null);
  const { error, redirect } = (body ?? {}) as Partial<ErrorResponse>;
  return {
    error:
      typeof error === "string" && error
        ? error
        : fallbackMessage(response.status),
    redirect: redirect === true,
  };
};

const send = async (url: string, init: RequestInit) => {
  try {
    return await fetch(url, { ...init, credentials: "include" });
  } catch {
    throw { error: NETWORK_ERROR } satisfies ErrorResponse;
  }
};

let refreshing: Promise<void> | null = null;

// Las peticiones simultáneas con 401 comparten una sola renovación.
export const refreshAccessToken = (): Promise<void> => {
  refreshing ??= (async () => {
    const response = await send(`${URL}/refresh-token`, { method: "POST" });
    if (response.status === 401 || response.status === 403) {
      throw { error: SESSION_EXPIRED, redirect: true } satisfies ErrorResponse;
    }
    if (!response.ok) throw await toErrorResponse(response);
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
};

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  // false en login y logout: un 401 ahí no significa que haya que renovar la sesión.
  auth?: boolean;
}

// Todo error sale con la forma ErrorResponse, así los hooks siempre tienen un mensaje.
export const request = async <T>(
  url: string,
  { method = "GET", body, auth = true }: RequestOptions = {},
): Promise<T> => {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }

  let response = await send(url, init);
  if (auth && response.status === 401) {
    await refreshAccessToken();
    response = await send(url, init);
    if (response.status === 401) {
      throw { error: SESSION_EXPIRED, redirect: true } satisfies ErrorResponse;
    }
  }

  if (!response.ok) throw await toErrorResponse(response);

  try {
    return (await response.json()) as T;
  } catch {
    throw { error: GENERIC_ERROR } satisfies ErrorResponse;
  }
};
