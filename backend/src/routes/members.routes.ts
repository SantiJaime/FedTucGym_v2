import { Role } from "../constants/const";
import { Router } from "express";
import {
  createMember,
  deleteMember,
  getMembersByGym,
  getOneMember,
  registerMemberToTournament,
  updateMember,
} from "../controllers/members.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/:gid", authMiddleware([Role.GIMNASIO, Role.ADMIN]), getMembersByGym);
router.get(
  "/:gid/:mid",
  authMiddleware([Role.GIMNASIO, Role.ADMIN]),
  getOneMember
);
router.post("/", authMiddleware([Role.GIMNASIO, Role.ADMIN]), createMember);
router.post(
  "/:mid/tournament/:tid",
  authMiddleware([Role.GIMNASIO, Role.ADMIN]),
  registerMemberToTournament
);
router.patch(
  "/:id",
  authMiddleware([Role.GIMNASIO, Role.ADMIN]),
  updateMember
);
router.delete(
  "/:id",
  authMiddleware([Role.GIMNASIO, Role.ADMIN]),
  deleteMember
);

export default router;
