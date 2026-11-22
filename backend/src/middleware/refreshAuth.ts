import { Role } from "../constants/const";
import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.config";
import { env } from '../config/env';

const ROLES: readonly string[] = Object.values(Role);
type UserRole = Role;

export const refreshAuthMiddleware = (requiredRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const signedRefreshToken = req.signedCookies.refreshToken;
    if (!signedRefreshToken) {
      res
        .status(401)
        .json({ error: "La sesión ha expirado, por favor vuelve a iniciar sesión", redirect: true });
      return;
    }

    const payloadUser = verifyToken(
      signedRefreshToken,
      env.JWT_REFRESH_SECRET as string
    );

    const isValidRole = (role: string): role is UserRole => {
      return ROLES.includes(role);
    };

    if (
      !isValidRole(payloadUser.role) ||
      !requiredRoles.includes(payloadUser.role as UserRole)
    ) {
      res.status(403).json({ error: "Acceso denegado" });
      return;
    }

    req.user = payloadUser;
    next();
  };
};
