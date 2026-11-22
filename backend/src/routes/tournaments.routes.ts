import { Role } from "../constants/const";
import { Router } from "express";
import {
  createTournament,
  deleteTournament,
  getMembersNotInTournaments,
  getMembersTournamentByCategoryAndLevel,
  getMembersTournamentsByGym,
  getOneTournament,
  getPastTournamentsByDate,
  getTournamentsByDate,
  postDataOnSheets,
  redirectToGoogleSheets,
  deleteMemberFromTournament,
  updateTournament,
} from "../controllers/tournaments.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get(
  "/date",
  authMiddleware([Role.ADMIN, Role.GIMNASIO, Role.JUEZ]),
  getTournamentsByDate
);
router.get(
  "/date/past",
  authMiddleware([Role.ADMIN, Role.GIMNASIO, Role.JUEZ]),
  getPastTournamentsByDate
);
router.get(
  "/:tid/category/:cid/level/:lid/gym/:gid",
  authMiddleware([Role.ADMIN, Role.GIMNASIO]),
  getMembersTournamentsByGym
);
router.get(
  "/:tid/category/:cid/level/:lid",
  authMiddleware([Role.ADMIN, Role.JUEZ]),
  getMembersTournamentByCategoryAndLevel
);
router.get(
  "/:tid/sheets",
  authMiddleware([Role.ADMIN, Role.GIMNASIO, Role.JUEZ]),
  redirectToGoogleSheets
);
router.post("/:tid/sheets", authMiddleware([Role.ADMIN]), postDataOnSheets);
router.get(
  "/not-in/:tid/category/:cid/level/:lid/gym/:gid",
  authMiddleware([Role.ADMIN, Role.GIMNASIO]),
  getMembersNotInTournaments
);

router.get(
  "/:id",
  authMiddleware([Role.ADMIN, Role.GIMNASIO]),
  getOneTournament
);
router.post("/", authMiddleware([Role.ADMIN]), createTournament);
router.put("/:id", authMiddleware([Role.ADMIN]), updateTournament);
router.delete(
  "/:tid/member/:mid",
  authMiddleware([Role.ADMIN, Role.GIMNASIO]),
  deleteMemberFromTournament
);
router.delete("/:id", authMiddleware([Role.ADMIN]), deleteTournament);

export default router;
