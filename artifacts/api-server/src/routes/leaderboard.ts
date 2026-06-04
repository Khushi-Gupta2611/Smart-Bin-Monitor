import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { GetLeaderboardResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/leaderboard", async (_req, res): Promise<void> => {
  const users = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.ecoPoints))
    .limit(20);

  const entries = users.map((u, idx) => ({
    id: u.id,
    name: u.name,
    role: u.role,
    ecoPoints: u.ecoPoints,
    reportsCount: u.reportsCount,
    badges: u.badges,
    rank: idx + 1,
  }));

  res.json(GetLeaderboardResponse.parse(entries));
});

export default router;
