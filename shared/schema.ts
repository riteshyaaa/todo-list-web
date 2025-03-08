import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  order: serial("order").notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks)
  .pick({
    title: true,
    completed: true,
  })
  .extend({
    title: z.string().min(1, "Task title is required").max(100, "Task title is too long"),
  });

export const updateTaskSchema = createInsertSchema(tasks)
  .pick({
    title: true,
    completed: true,
  })
  .partial()
  .extend({
    title: z.string().min(1, "Task title is required").max(100, "Task title is too long").optional(),
  });

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type Task = typeof tasks.$inferSelect;
