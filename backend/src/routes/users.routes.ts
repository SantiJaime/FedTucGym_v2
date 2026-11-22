import { Role } from "../constants/const";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  login,
  getUsers,
  getOneUser,
  createUser,
  updateUserFullname,
  deleteUser,
  refreshAccessToken,
  logout,
  getUsersByRole,
  getMe,
} from "../controllers/users.controller";
import { refreshAuthMiddleware } from '../middleware/refreshAuth';

const router = Router();

router.get("/", authMiddleware([Role.ADMIN]), getUsers);
router.get("/me", getMe);
router.get("/:id", authMiddleware([Role.ADMIN, Role.ADMIN, Role.JUEZ]), getOneUser);
router.get("/role/:rid", authMiddleware([Role.ADMIN]), getUsersByRole);
router.post("/", authMiddleware([Role.ADMIN]), createUser);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshAuthMiddleware([Role.ADMIN, Role.GIMNASIO, Role.JUEZ]), refreshAccessToken);
router.patch(
  "/:id",
  authMiddleware([Role.ADMIN, Role.GIMNASIO, Role.JUEZ]),
  updateUserFullname
);
router.delete("/:id", authMiddleware([Role.ADMIN]), deleteUser);

export default router;
