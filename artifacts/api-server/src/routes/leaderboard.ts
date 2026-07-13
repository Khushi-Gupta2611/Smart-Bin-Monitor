import { Router, type IRouter } from "express";
import { db, usersTable, reportsTable } from "@workspace/db";
import { desc, eq, count } from "drizzle-orm";
import { GetLeaderboardResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/leaderboard", async (_req, res): Promise<void> => {
  const users = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.ecoPoints))
    .limit(20);

  const entries = await Promise.all(
  users.map(async (u, idx) => {
    const [stats] = await db
      .select({
        reportsCount: count(),
      })
      .from(reportsTable)
      .where(eq(reportsTable.reporterId, u.id));

    return {
      id: u.id,
      name: u.name,
      role: u.role,
      ecoPoints: u.ecoPoints,
      reportsCount: stats.reportsCount,
      badges: u.badges,
      rank: idx + 1,
    };
  }));

  res.json(GetLeaderboardResponse.parse(entries));
});

export default router;
