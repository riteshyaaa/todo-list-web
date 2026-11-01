import { useState } from "react";
import { Task } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Trash2, GripVertical } from "lucide-react";

interface TaskItemProps {
  task: Task;
  index: number;
  total: number;
  onDragEnd: (taskId: number, newIndex: number) => void;
}

export function TaskItem({ task, index, total, onDragEnd }: TaskItemProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [isDragging, setIsDragging] = useState(false);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null,
  );

  const updateMutation = useMutation({
    mutationFn: async (data: { title?: string; completed?: boolean }) => {
      await apiRequest("PATCH", `/api/tasks/${task.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Task updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tasks/${task.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const handleDragStart = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, input, textarea, [role='checkbox']")) {
      e.preventDefault();
      return;
    }

    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = (rect.bottom + rect.top) / 2;

    setDropPosition(e.clientY < midpoint ? "before" : "after");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropPosition(null);

    const dragId = Number(e.dataTransfer.getData("text/plain"));
    if (!Number.isInteger(dragId)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = (rect.bottom + rect.top) / 2;
    const dropIndex = e.clientY < midpoint ? index : index + 1;

    onDragEnd(dragId, dropIndex);
  };

  return (
    <Card
      className={`relative p-3 flex items-center gap-2 transition-[opacity,box-shadow,transform] duration-150 ${
        isDragging ? "opacity-50" : ""
      } ${
        dropPosition === "before"
          ? "before:absolute before:-top-1 before:left-2 before:right-2 before:h-0.5 before:rounded-full before:bg-primary"
          : ""
      } ${
        dropPosition === "after"
          ? "after:absolute after:-bottom-1 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-primary"
          : ""
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => {
        setIsDragging(false);
        setDropPosition(null);
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className="cursor-grab touch-none active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) =>
          updateMutation.mutate({ completed: checked as boolean })
        }
      />

      {isEditing ? (
        <form
          className="flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate({ title: editValue });
          }}
        >
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8"
            autoFocus
          />
        </form>
      ) : (
        <span
          className={`flex-1 ${
            task.completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {task.title}
        </span>
      )}

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => deleteMutation.mutate()}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
