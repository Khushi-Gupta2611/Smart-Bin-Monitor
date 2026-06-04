import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, reportsTable } from "@workspace/db";
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

  const [report] = await db
    .insert(reportsTable)
    .values({
      ...parsed.data,
      ecoPointsAwarded: severityPoints[parsed.data.severity] ?? 10,
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

  const [report] = await db
    .update(reportsTable)
    .set({
      status: parsed.data.status,
      ...(parsed.data.assignedTo != null ? { assignedTo: parsed.data.assignedTo } : {}),
      ...(parsed.data.completionImageUrl != null ? { completionImageUrl: parsed.data.completionImageUrl } : {}),
    })
    .where(eq(reportsTable.id, params.data.id))
    .returning();

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

export default router;
