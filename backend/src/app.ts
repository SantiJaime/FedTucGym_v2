import express, { type Request } from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import userRouter from "./routes/users.routes";
import tournamentsRouter from "./routes/tournaments.routes";
import membersRouter from "./routes/members.routes";
import cronRouter from "./routes/cron.routes";
import { env } from "./config/env";
import { errorHandler } from "./errors/error.middleware";

const app = express();
// Vercel agrega un proxy: req.ip debe ser el del cliente para limitar logins.
app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Los filtros llevan DNI y nombres en el query string: se registra solo la ruta.
morgan.token("path", (req) => (req as Request).originalUrl.split("?")[0]);
app.use(morgan(":method :path :status :response-time ms"));
// Producción: mismo origen (frontend y API bajo el mismo dominio), sin CORS. Los POST/PUT/PATCH/DELETE
// entre sitios no llevan cookies por SameSite=Lax. CORS solo para Vite en local.
if (env.NODE_ENV !== "production") {
  app.use(cors({ origin: "http://localhost:5173", credentials: true }));
}
app.use(cookieParser(env.COOKIE_SECRET));

app.use("/api/users", userRouter);
app.use("/api/tournaments", tournamentsRouter);
app.use("/api/members", membersRouter);
app.use("/api/cron", cronRouter);
app.use(errorHandler);

export default app;
