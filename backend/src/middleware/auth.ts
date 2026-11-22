import { Role } from "../constants/const";
import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.config";
import { env } from '../config/env';

const ROLES: readonly string[] = Object.values(Role);
type UserRole = Role;

export const authMiddleware = (requiredRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const signedAccessToken = req.signedCookies.accessToken;
    if (!signedAccessToken) {
      res
        .status(401)
        .json({ error: "No estás autorizado, no has iniciado sesión" });
      return;
    }

    const payloadUser = verifyToken(
      signedAccessToken,
      env.JWT_SECRET as string
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
