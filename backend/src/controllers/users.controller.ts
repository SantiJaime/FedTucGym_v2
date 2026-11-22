import type { Request, Response } from "express";
import {
  CreateUserDTO,
  LoginUserDTO,
  UpdateUserDTO,
} from "../schemas/users.schema";
import { hashPassword, hashToken } from "../utils/bcrypt";
import { comparePassword } from "../utils/bcrypt";
import { generateToken, verifyToken } from "../utils/jwt.config";
import { IdDTO } from "../schemas/id.schema";
import { env } from "../config/env";
import { userService } from "../services/index.service";
import { COOKIE_OPTIONS, Role } from "../constants/const";

const clearAuthCookies = (res: Response): void => {
  res.clearCookie("accessToken", COOKIE_OPTIONS);
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.signedCookies;

  if (!refreshToken) {
    res.status(401).json({ error: "Acceso denegado" });
    return;
  }

  const payload = req.user;

  if (!payload) {
    res
      .status(401)
      .json({ error: "Acceso denegado, no se encontró el usuario" });
    return;
  }

  const hashedToken = hashToken(refreshToken);
  const isRefreshTokenValid = await userService.validateToken(
    hashedToken,
    payload.userId,
  );

  if (!isRefreshTokenValid) {
    clearAuthCookies(res);
    res.status(401).json({
      error: "Sesión expirada. Por favor, vuelva a iniciar sesión",
      redirect: true,
    });
    return;
  }

  // Conserva el vencimiento original: rotar no extiende la sesión más allá de 24 h.
  const remainingSeconds = payload.exp! - Math.floor(Date.now() / 1000);
  const newRefreshToken = generateToken(
    {
      userId: payload.userId,
      role: payload.role,
      full_name: payload.full_name,
    },
    env.JWT_REFRESH_SECRET,
    remainingSeconds,
  );
  await userService.rotateToken(
    hashedToken,
    hashToken(newRefreshToken),
    payload.userId,
    new Date(Date.now() + remainingSeconds * 1000),
  );
  res.cookie("refreshToken", newRefreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: remainingSeconds * 1000,
  });

  const token = generateToken(
    {
      userId: payload.userId,
      role: payload.role,
      full_name: payload.full_name,
    },
    env.JWT_SECRET as string,
    60 * 60,
  );

  res.cookie("accessToken", token, {
    ...COOKIE_OPTIONS,
    maxAge: 1 * 60 * 60 * 1000,
  });

  res.status(200).json({ message: "Sesión extendida correctamente" });
};

export const login = async (req: Request, res: Response) => {
  const parsedUser = LoginUserDTO.parse(req.body);

  const { full_name, password } = parsedUser;

  const ipKey = `ip:${req.ip}`;
  const accountKey = `${ipKey}|${full_name.toLowerCase()}`;
  if (await userService.isLoginBlocked(accountKey, ipKey)) {
    res.status(429).json({
      error: "Demasiados intentos fallidos. Vuelva a intentar en 15 minutos",
    });
    return;
  }

  const user = await userService.getByName(full_name);
  if (!user) {
    await userService.recordFailedLogin(accountKey, ipKey);
    res
      .status(401)
      .json({ error: "Nombre de usuario y/o contraseña incorrectos" });
    return;
  }

  const validPassword = await comparePassword(password, user.password);
  if (!validPassword) {
    await userService.recordFailedLogin(accountKey, ipKey);
    res
      .status(401)
      .json({ error: "Nombre de usuario y/o contraseña incorrectos" });
    return;
  }
  await userService.clearLoginAttempts(accountKey);

  const payload = {
    userId: user.id,
    role: user.role,
    full_name,
    category: user.category,
    id_category: user.id_category,
  };
  const accessToken = generateToken(payload, env.JWT_SECRET, 60 * 60);
  const refreshToken = generateToken(
    payload,
    env.JWT_REFRESH_SECRET,
    60 * 60 * 24,
  );

  const hashedToken = hashToken(refreshToken);

  await userService.saveToken(hashedToken, user.id);

  res.cookie("accessToken", accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 30 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    message: "Sesión iniciada correctamente",
    userInfo: {
      userId: user.id,
      role: user.role,
      full_name,
      category: user.category,
      id_category: user.id_category,
    },
  });
};

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  const users = await userService.getAll();
  res.status(200).json({ message: "Usuarios obtenidos correctamente", users });
};

export const getOneUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsedId = IdDTO.parse(Number(req.params.id));

  const user = await userService.getById(parsedId);
  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  res.status(200).json({ message: "Usuario obtenido correctamente", user });
};

export const getUsersByRole = async (req: Request, res: Response) => {
  const parsedId = IdDTO.parse(Number(req.params.rid));

  const users = await userService.getByRole(parsedId);
  res.status(200).json({ message: "Usuarios obtenidos correctamente", users });
};

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsedUser = CreateUserDTO.parse(req.body);

  parsedUser.password = await hashPassword(parsedUser.password);

  const user = await userService.create(parsedUser);
  res.status(201).json({ message: "Usuario creado correctamente", user });
};

export const updateUserFullname = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsedId = IdDTO.parse(req.params.id);

  const parsedUser = UpdateUserDTO.parse(req.body);

  if (req.user?.role !== Role.ADMIN && parsedId !== req.user?.userId) {
    res
      .status(403)
      .json({ error: "No tienes permiso para modificar este usuario" });
    return;
  }

  const user = await userService.updateFullname(parsedId, parsedUser);
  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado o nombre ya en uso" });
    return;
  }
  res
    .status(200)
    .json({ message: "Nombre del usuario actualizado correctamente", user });
};

export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsedId = IdDTO.parse(Number(req.params.id));

  const deletedUser = await userService.delete(parsedId);
  if (!deletedUser) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  res.status(200).json({ message: "Usuario eliminado" });
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.signedCookies;
  if (refreshToken) {
    try {
      await userService.revokeToken(hashToken(refreshToken));
    } catch (error) {
      // Un fallo de BD no debe impedir cerrar la sesión en el navegador.
      console.error("Error al revocar el refresh token:", error);
    }
  }

  clearAuthCookies(res);

  res.status(200).json({ message: "Sesión cerrada correctamente" });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const signedAccessToken = req.signedCookies.accessToken;

  if (!signedAccessToken) {
    res.status(401).json({
      msg: "No autenticado",
      error: "No autenticado, por favor inicie sesión",
    });
    return;
  }

  const payload = verifyToken(signedAccessToken, env.JWT_SECRET);
  const user = await userService.getById(payload.userId);
  if (!user) {
    res.status(404).json({ error: "El usuario no existe" });
    return;
  }

  res.status(200).json({ user });
};
