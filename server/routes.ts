import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, updateTaskSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/tasks", async (_req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    const result = insertTaskSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: result.error.message });
      return;
    }
    const task = await storage.createTask(result.data);
    res.json(task);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid task ID" });
      return;
    }

    const result = updateTaskSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: result.error.message });
      return;
    }

    try {
      const task = await storage.updateTask(id, result.data);
      res.json(task);
    } catch (err) {
      res.status(404).json({ message: "Task not found" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid task ID" });
      return;
    }

    try {
      await storage.deleteTask(id);
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ message: "Task not found" });
    }
  });

  app.post("/api/tasks/reorder", async (req, res) => {
    const schema = z.object({
      orderedIds: z.array(z.number()),
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: result.error.message });
      return;
    }

    await storage.reorderTasks(result.data.orderedIds);
    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}
