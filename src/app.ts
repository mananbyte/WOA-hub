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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webDistPath = path.resolve(__dirname, "../web/dist");

export const app = express();

app.use(cors(config.corsOrigin ? { origin: config.corsOrigin } : undefined));
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
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
  if (status === 500) {
    console.error("Unhandled error:", err);
  }
  res.status(status).json({ error: message });
});
