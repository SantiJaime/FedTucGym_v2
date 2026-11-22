import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { DatabaseError } from "pg";
import { z } from "zod";
import { parseErrors } from "../utils/utils";
import { AppError } from "./app.error";

type KnownError = { status: number; error: string };

const INVALID_DATA: KnownError = {
  status: 400,
  error: "Los datos enviados no son válidos",
};
const UNAVAILABLE: KnownError = {
  status: 503,
  error: "El servicio no está disponible, intente nuevamente en unos minutos",
};

// https://www.postgresql.org/docs/current/errcodes-appendix.html
const PG_ERRORS: Record<string, KnownError> = {
  "23505": { status: 409, error: "Ya existe un registro con esos datos" },
  "23503": {
    status: 409,
    error: "La operación referencia un registro inexistente o que está en uso",
  },
  "23P01": { status: 409, error: "Los datos se superponen con otro registro" },
  "23502": { status: 400, error: "Falta un dato obligatorio" },
  "23514": INVALID_DATA,
  "22001": { status: 400, error: "Uno de los valores es demasiado largo" },
  "22003": { status: 400, error: "Uno de los valores numéricos está fuera de rango" },
  "22007": { status: 400, error: "La fecha no es válida" },
  "22008": { status: 400, error: "La fecha no es válida" },
  "22P02": INVALID_DATA,
};

const getPgError = (code = ""): KnownError | undefined =>
  PG_ERRORS[code] ?? (/^(08|53|57)/.test(code) ? UNAVAILABLE : undefined);

const isBodyParserError = (
  err: unknown,
): err is { status: number; type: string } =>
  typeof err === "object" &&
  err !== null &&
  "type" in err &&
  typeof (err as { type: unknown }).type === "string" &&
  (err as { type: string }).type.startsWith("entity.") &&
  "status" in err &&
  typeof (err as { status: unknown }).status === "number" &&
  (err as { status: number }).status >= 400 &&
  (err as { status: number }).status < 500;

const send = (res: Response, status: number, error: string) => {
  res.status(status).json({ status: status >= 500 ? "error" : "fail", error });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof z.ZodError) {
    send(res, 400, parseErrors(err.issues));
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) console.error("ERROR DE APLICACIÓN:", err.message);
    send(res, err.statusCode, err.message);
    return;
  }

  if (err instanceof DatabaseError) {
    const known = getPgError(err.code);
    // err.detail puede contener valores de la fila, como el DNI: nunca registrarlo.
    console.error("ERROR DE POSTGRESQL:", {
      code: err.code,
      table: err.table,
      column: err.column,
      constraint: err.constraint,
      message: known ? undefined : err.message,
    });
    if (known) send(res, known.status, known.error);
    else send(res, 500, "Algo salió muy mal en el servidor");
    return;
  }

  // TokenExpiredError y NotBeforeError extienden JsonWebTokenError.
  if (err instanceof jwt.JsonWebTokenError) {
    // 401 hace que el frontend renueve la sesión; 403 queda para falta de permisos.
    send(res, 401, "Token inválido o expirado");
    return;
  }

  // Errores del parser del body (JSON mal formado, cuerpo demasiado grande, etc.)
  if (isBodyParserError(err)) {
    send(
      res,
      err.status,
      err.type === "entity.too.large"
        ? "El cuerpo de la petición es demasiado grande"
        : "El cuerpo de la petición no es válido",
    );
    return;
  }

  if (err instanceof URIError) {
    send(res, 400, "La URL de la petición no es válida");
    return;
  }

  console.error("ERROR NO CONTROLADO:", err);
  send(res, 500, "Algo salió muy mal en el servidor");
};
