import { Router, type IRouter } from "express";
import { db, volunteersTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { ListVolunteersResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/volunteers", async (_req, res): Promise<void> => {
  const volunteers = await db
    .select()
    .from(volunteersTable)
    .orderBy(desc(volunteersTable.tasksCompleted));

  res.json(
    ListVolunteersResponse.parse(
      volunteers.map((v) => ({
        ...v,
        joinedAt: v.joinedAt.toISOString(),
      }))
    )
  );
});

export default router;
