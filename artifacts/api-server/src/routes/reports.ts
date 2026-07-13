import { Router, type IRouter } from "express";
import { eq, desc, and, sql } from "drizzle-orm";
import { db, reportsTable, usersTable } from "@workspace/db";
import {
  ListReportsQueryParams,
  CreateReportBody,
  GetReportParams,
  UpdateReportStatusParams,
  UpdateReportStatusBody,
  ListReportsResponse,
  ListRecentReportsResponse,
  GetReportResponse,
  UpdateReportStatusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reports", async (req, res): Promise<void> => {
  const parsed = ListReportsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status, category, severity } = parsed.data;

  const conditions = [];
  if (status) conditions.push(eq(reportsTable.status, status));
  if (category) conditions.push(eq(reportsTable.category, category));
  if (severity) conditions.push(eq(reportsTable.severity, severity));

  const reports = await db
    .select()
    .from(reportsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(reportsTable.createdAt));

  res.json(
    ListReportsResponse.parse(
      reports.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }))
    )
  );
});

router.get("/reports/recent", async (_req, res): Promise<void> => {
  const reports = await db
    .select()
    .from(reportsTable)
    .orderBy(desc(reportsTable.createdAt))
    .limit(10);

  res.json(
    ListRecentReportsResponse.parse(
      reports.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }))
    )
  );
});

router.post("/reports", async (req, res): Promise<void> => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const severityPoints: Record<string, number> = {
    low: 5,
    medium: 10,
    high: 20,
    critical: 30,
  };

  const sessionUser = (req.session as any).user;

  if (!sessionUser) {
    res.status(401).json({
      error: "Unauthorized",
    });
    return;
  }

  const [report] = await db
    .insert(reportsTable)
    .values({
      ...parsed.data,

      reporterId: sessionUser.id,
      reporterName: sessionUser.name,

      ecoPointsAwarded:
        severityPoints[parsed.data.severity] ?? 10,
    })
    .returning();

  res.status(201).json(
    GetReportResponse.parse({
      ...report,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    })
  );
});

router.get("/reports/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetReportParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [report] = await db
    .select()
    .from(reportsTable)
    .where(eq(reportsTable.id, params.data.id));

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  res.json(
    GetReportResponse.parse({
      ...report,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    })
  );
});

router.patch("/reports/:id/status", async (req, res): Promise<void> => {
  console.log("PATCH ROUTE HIT");
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateReportStatusParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateReportStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Get current report first
const [existingReport] = await db
  .select()
  .from(reportsTable)
  .where(eq(reportsTable.id, params.data.id));

if (!existingReport) {
  res.status(404).json({
    error: "Report not found",
  });
  return;
}

// Update report
const [report] = await db
  .update(reportsTable)
  .set({
    status: parsed.data.status,
    ...(parsed.data.assignedTo != null
      ? { assignedTo: parsed.data.assignedTo }
      : {}),
    ...(parsed.data.completionImageUrl != null
      ? { completionImageUrl: parsed.data.completionImageUrl }
      : {}),
  })
  .where(eq(reportsTable.id, params.data.id))
  .returning();

// Award eco points only once
if (
  existingReport.status !== "completed" &&
  parsed.data.status === "completed"
) {
  await db
    .update(usersTable)
    .set({
      ecoPoints: sql`${usersTable.ecoPoints} + ${existingReport.ecoPointsAwarded}`,
    })
    .where(eq(usersTable.id, existingReport.reporterId));
}

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  res.json(
    UpdateReportStatusResponse.parse({
      ...report,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    })
  );
});

router.delete("/reports/:id", async (req, res): Promise<void> => {
  const sessionUser = (req.session as any).user;

  if (!sessionUser) {
    res.status(401).json({
      error: "Unauthorized",
    });
    return;
  }

  const raw = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const id = parseInt(raw, 10);

  if (isNaN(id)) {
    res.status(400).json({
      error: "Invalid report ID",
    });
    return;
  }

  const [report] = await db
    .select()
    .from(reportsTable)
    .where(eq(reportsTable.id, id));

  if (!report) {
    res.status(404).json({
      error: "Report not found",
    });
    return;
  }

  // Citizen can delete only their own report
  if (report.reporterId !== sessionUser.id) {
    res.status(403).json({
      error: "You can only delete your own reports.",
    });
    return;
  }

  // Only pending reports can be deleted
  if (report.status !== "pending") {
    res.status(403).json({
      error: "Only pending reports can be deleted.",
    });
    return;
  }

  await db
    .delete(reportsTable)
    .where(eq(reportsTable.id, id));

  res.json({
    message: "Report deleted successfully",
  });
});

export default router;