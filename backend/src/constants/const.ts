import { env } from "../config/env";

export const IS_PRODUCTION = env.NODE_ENV === "production";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: "lax" as const,
  signed: true,
};

export enum Role {
  ADMIN = "Administrador",
  GIMNASIO = "Gimnasio",
  JUEZ = "Juez",
}
