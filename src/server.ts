import { app } from "./app.js";
import dotenv from "dotenv";
import { startWorkers } from "./jobs/worker.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`WoA Contract Hub API running on http://localhost:${PORT}`);
  try {
    await startWorkers();
  } catch (err) {
    console.error("Failed to start background workers:", err);
  }
});
