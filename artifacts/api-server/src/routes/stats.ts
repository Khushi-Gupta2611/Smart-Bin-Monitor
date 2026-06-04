import { Router, type IRouter } from "express";
import { sql, eq, and } from "drizzle-orm";
import { db, reportsTable, donationsTable, volunteersTable, usersTable } from "@workspace/db";
import {
  GetStatsSummaryResponse,
  GetAreaStatsResponse,
  GetCategoryStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const [totals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where status = 'pending')::int`,
      accepted: sql<number>`count(*) filter (where status = 'accepted')::int`,
      underWork: sql<number>`count(*) filter (where status = 'under_work')::int`,
      completed: sql<number>`count(*) filter (where status = 'completed')::int`,
      totalPoints: sql<number>`coalesce(sum(eco_points_awarded), 0)::int`,
    })
    .from(reportsTable);

  const [donationTotals] = await db
    .select({
      totalAmount: sql<number>`coalesce(sum(amount), 0)::float`,
    })
    .from(donationsTable);

  const [volunteerCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(volunteersTable);

  const [resolutionTime] = await db
    .select({
      avgHours: sql<number>`coalesce(avg(extract(epoch from (updated_at - created_at)) / 3600), 0)::float`,
    })
    .from(reportsTable)
    .where(eq(reportsTable.status, "completed"));

  res.json(
    GetStatsSummaryResponse.parse({
      totalReports: totals.total,
      pendingReports: totals.pending,
      acceptedReports: totals.accepted,
      underWorkReports: totals.underWork,
      completedReports: totals.completed,
      totalDonations: donationTotals.totalAmount,
      totalVolunteers: volunteerCount.count,
      totalEcoPoints: totals.totalPoints,
      avgResolutionHours: resolutionTime.avgHours,
    })
  );
});

router.get("/stats/areas", async (_req, res): Promise<void> => {
  const areas = await db
    .select({
      location: reportsTable.location,
      reportCount: sql<number>`count(*)::int`,
      pendingCount: sql<number>`count(*) filter (where status = 'pending')::int`,
      completedCount: sql<number>`count(*) filter (where status = 'completed')::int`,
    })
    .from(reportsTable)
    .groupBy(reportsTable.location)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  res.json(GetAreaStatsResponse.parse(areas));
});

router.get("/stats/categories", async (_req, res): Promise<void> => {
  const cats = await db
    .select({
      category: reportsTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(reportsTable)
    .groupBy(reportsTable.category)
    .orderBy(sql`count(*) desc`);

  res.json(GetCategoryStatsResponse.parse(cats));
});

export default router;
