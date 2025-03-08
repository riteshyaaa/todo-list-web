import { tasks, type Task, type InsertTask, type UpdateTask } from "@shared/schema";

export interface IStorage {
  getTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: UpdateTask): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  reorderTasks(orderedIds: number[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private tasks: Map<number, Task>;
  private currentId: number;
  private currentOrder: number;

  constructor() {
    this.tasks = new Map();
    this.currentId = 1;
    this.currentOrder = 1;
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => a.order - b.order);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentId++;
    const order = this.currentOrder++;
    const task: Task = { ...insertTask, id, order };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updateTask: UpdateTask): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error("Task not found");
    }
    const updatedTask = { ...task, ...updateTask };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    if (!this.tasks.has(id)) {
      throw new Error("Task not found");
    }
    this.tasks.delete(id);
  }

  async reorderTasks(orderedIds: number[]): Promise<void> {
    orderedIds.forEach((id, index) => {
      const task = this.tasks.get(id);
      if (task) {
        this.tasks.set(id, { ...task, order: index + 1 });
      }
    });
  }
}

export const storage = new MemStorage();
