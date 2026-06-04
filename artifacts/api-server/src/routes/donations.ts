import { Router, type IRouter } from "express";
import { db, donationsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import {
  CreateDonationBody,
  ListDonationsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/donations", async (_req, res): Promise<void> => {
  const donations = await db
    .select()
    .from(donationsTable)
    .orderBy(desc(donationsTable.createdAt));

  res.json(
    ListDonationsResponse.parse(
      donations.map((d) => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
      }))
    )
  );
});

router.post("/donations", async (req, res): Promise<void> => {
  const parsed = CreateDonationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [donation] = await db
    .insert(donationsTable)
    .values({
      donorName: parsed.data.donorName,
      type: parsed.data.type,
      amount: parsed.data.amount,
      message: parsed.data.message ?? "",
    })
    .returning();

  res.status(201).json({
    ...donation,
    createdAt: donation.createdAt.toISOString(),
  });
});

export default router;
