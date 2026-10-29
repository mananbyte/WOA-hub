import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authRouter } from "./routes/auth.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { contractRouter } from "./routes/contract.routes.js";
import { allianceRouter } from "./routes/alliance.routes.js";
import { cronRouter } from "./routes/cron.routes.js";
import { config } from "./config.js";
import { checkDbConnection } from "./db/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webDistPath = path.resolve(__dirname, "../web/dist");

export const app = express();

app.use(cors(config.corsOrigin ? { origin: config.corsOrigin } : undefined));
app.use(express.json());

const getHealthStatus = async () => {
  const dbHealth = await checkDbConnection();
  return {
    status: dbHealth.ok ? "ok" : "degraded",
    database: dbHealth.ok ? "connected" : dbHealth.error,
    databaseConfigured: config.isDatabaseConfigured,
    jwtConfigured: config.isJwtConfigured,
    nodeEnv: config.nodeEnv,
    isVercel: Boolean(process.env.VERCEL),
    timestamp: new Date().toISOString(),
  };
};

app.get("/health", async (req: Request, res: Response) => {
  const health = await getHealthStatus();
  res.status(health.status === "ok" ? 200 : 503).json(health);
});

app.get("/api/health", async (req: Request, res: Response) => {
  const health = await getHealthStatus();
  res.status(health.status === "ok" ? 200 : 503).json(health);
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/listings", contractRouter);
app.use("/api/alliances", allianceRouter);
app.use("/api/cron", cronRouter);

if (fs.existsSync(webDistPath)) {
  app.use(express.static(webDistPath));
  app.get(/^(?!\/api|\/health).*/, (req: Request, res: Response) => {
    res.sendFile(path.join(webDistPath, "index.html"));
  });
}

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  if (status >= 500) {
    console.error(`[API ERROR ${status}] ${req.method} ${req.originalUrl}:`, err);
  }
  res.status(status).json({
    error: message,
    hint: !config.isDatabaseConfigured
      ? "DATABASE_URL is not set in Vercel environment variables. Please add DATABASE_URL in Vercel Project Settings."
      : undefined,
  });
});

export default app;
