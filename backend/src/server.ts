import "dotenv/config";
import http from "node:http";
import { app } from "./routes.js";
import { createRealtime } from "./realtime.js";
import { setBroadcasters } from "./realtimeBus.js";
import { createAuthRoutes } from "./auth.js";

createAuthRoutes(app);

const server = http.createServer(app);
const realtime = createRealtime(server);
setBroadcasters(realtime);
export { realtime };

const PORT = Number(process.env.PORT || 4000);
server.listen(PORT, () => {
  console.log(`A²MP backend running on http://localhost:${PORT}`);
});

// Lightweight engine loop to advance meetings periodically
import { db } from "./db.js";
import { getMeeting } from "./services/meetingService.js";
import { runOneTurn, attemptConclusion, generateFinalReport } from "./services/conversationService.js";

const TICK_MS = Number(process.env.ENGINE_TICK_MS || 8000);
setInterval(async () => {
  try {
    const rows = db.prepare("SELECT id, status FROM meetings WHERE status = 'running'").all() as { id: string; status: string }[];
    for (const r of rows) {
      const meeting = getMeeting(r.id);
      const result = await runOneTurn(meeting, []);
      if (!result.concluded) {
        const check = await attemptConclusion(meeting);
        if (check.conclude) {
          await generateFinalReport(meeting);
        }
      }
    }
  } catch (err) {
    console.error("Engine loop error", err);
  }
}, TICK_MS);
