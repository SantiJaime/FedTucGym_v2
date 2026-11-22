import { Router, type NextFunction, type Request, type Response } from "express";
import { timingSafeEqual } from "node:crypto";
import { env } from "../config/env";
import { AppError } from "../errors/app.error";
import { membersService, sheetsService } from "../services/index.service";

const router = Router();

// Vercel Cron envía Authorization: Bearer <CRON_SECRET>.
router.use((req: Request, _res: Response, next: NextFunction) => {
  const received = Buffer.from(req.headers.authorization ?? "");
  const expected = Buffer.from(`Bearer ${env.CRON_SECRET}`);
  if (
    !env.CRON_SECRET ||
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    throw AppError.unauthorized("Acceso denegado");
  }
  next();
});

// S4: la limpieza de impagas sigue pausada: ningún flujo marca paid = true.
router.get("/export", async (_req, res) => {
  await sheetsService.exportPendingTournaments();
  res.json({ message: "Exportación diaria finalizada" });
});

router.get("/categories", async (_req, res) => {
  await membersService.updateCategory();
  res.json({ message: "Categorías actualizadas" });
});

export default router;
