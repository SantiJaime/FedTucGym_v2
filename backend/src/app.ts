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
import { AppError } from "./errors/app.error";
import { errorHandler } from "./errors/error.middleware";

const app = express();
const allowedOrigins = [
  "https://torneos-fedtucgim.vercel.app",
  ...(env.NODE_ENV === "production" ? [] : ["http://localhost:5173"]),
];

// Vercel agrega un proxy: req.ip debe ser el del cliente para limitar logins.
app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Los filtros llevan DNI y nombres en el query string: se registra solo la ruta.
morgan.token("path", (req) => (req as Request).originalUrl.split("?")[0]);
app.use(morgan(":method :path :status :response-time ms"));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Debe seguir siendo un error: es lo que frena el CSRF hasta pasar a SameSite=Lax (M8).
        callback(AppError.forbidden("Origen no permitido"));
      }
    },
    credentials: true,
  }),
);
app.use(cookieParser(env.COOKIE_SECRET));

app.use("/api/users", userRouter);
app.use("/api/tournaments", tournamentsRouter);
app.use("/api/members", membersRouter);
app.use("/api/cron", cronRouter);
app.use(errorHandler);

export default app;
