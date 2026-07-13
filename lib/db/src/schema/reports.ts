import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),

  title: text("title").notNull(),
  description: text("description").notNull(),

  category: text("category").notNull(), // garbage | illegal_dumping | water_pollution | burning_waste | toxic_waste

  status: text("status")
    .notNull()
    .default("pending"), // pending | accepted | under_work | completed

  severity: text("severity")
    .notNull()
    .default("medium"), // low | medium | high | critical

  location: text("location").notNull(),

  latitude: real("latitude"),
  longitude: real("longitude"),

  imageUrl: text("image_url"),
  completionImageUrl: text("completion_image_url"),

  // Report Owner
  reporterId: integer("reporter_id").notNull(),
  reporterName: text("reporter_name").notNull(),

  assignedTo: text("assigned_to"),

  ecoPointsAwarded: integer("eco_points_awarded")
    .notNull()
    .default(10),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,

  reporterId: true,
  reporterName: true,

  ecoPointsAwarded: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;