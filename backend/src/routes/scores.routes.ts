import { Role } from "../constants/const";
import { Router } from "express";
import {
  getAllScores,
  getScoresByCategoryAndLevel,
  getScoresByGym,
  getScoresByTournament,
  postPuntaje,
} from "../controllers/scores.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get(
  "/",
  authMiddleware([Role.ADMIN, Role.JUEZ]),
  getAllScores
);
router.get(
  "/:tid",
  authMiddleware([Role.ADMIN, Role.JUEZ]),
  getScoresByTournament
);
router.get(
  "/tournament/:tid/category/:cid/level/:lid",
  authMiddleware([Role.ADMIN, Role.JUEZ]),
  getScoresByCategoryAndLevel
);
router.get(
  "/tournament/:tid/category/:cid/level/:lid/gym/:gid",
  authMiddleware([Role.ADMIN, Role.JUEZ]),
  getScoresByGym
);
router.post(
  "/:mid/tournament/:tid",
  authMiddleware([Role.ADMIN, Role.JUEZ]),
  postPuntaje
);

export default router;
