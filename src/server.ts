import { app } from "./app.js";
import dotenv from "dotenv";
import { startWorkers } from "./jobs/worker.js";
import { config } from "./config.js";
app.listen(config.port, async () => {
  console.log(`WoA Contract Hub API running on port ${config.port}`);
  try {
    await startWorkers();
  } catch (err) {
    console.error("Failed to start background workers:", err);
  }
});
