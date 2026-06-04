import { Router, type IRouter } from "express";
import { db, volunteersTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { ListVolunteersResponse, ListVolunteersResponseItem, CreateVolunteerBody } from "@workspace/api-zod";

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

router.post("/volunteers", async (req, res): Promise<void> => {
  const parsed = CreateVolunteerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { name, type, location, specialization } = parsed.data;

  const [volunteer] = await db
    .insert(volunteersTable)
    .values({
      name,
      type,
      location,
      specialization: specialization ?? null,
      tasksCompleted: 0,
      ecoPoints: 0,
    })
    .returning();

  res.status(201).json(
    ListVolunteersResponseItem.parse({
      ...volunteer,
      joinedAt: volunteer.joinedAt.toISOString(),
    })
  );
});

export default router;
