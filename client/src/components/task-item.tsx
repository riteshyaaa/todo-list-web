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
  onDragEnd: (newIndex: number) => void;
}

export function TaskItem({ task, index, total, onDragEnd }: TaskItemProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [isDragging, setIsDragging] = useState(false);

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
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const midpoint = (rect.bottom + rect.top) / 2;
    
    if (e.clientY < midpoint) {
      target.style.borderTop = "2px solid var(--primary)";
      target.style.borderBottom = "";
    } else {
      target.style.borderTop = "";
      target.style.borderBottom = "2px solid var(--primary)";
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.borderTop = "";
    target.style.borderBottom = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.style.borderTop = "";
    target.style.borderBottom = "";
    
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    const rect = target.getBoundingClientRect();
    const midpoint = (rect.bottom + rect.top) / 2;
    const dropIndex = e.clientY < midpoint ? index : index + 1;
    
    if (dragIndex !== dropIndex && dragIndex !== dropIndex - 1) {
      onDragEnd(dropIndex > dragIndex ? dropIndex - 1 : dropIndex);
    }
    
    setIsDragging(false);
  };

  return (
    <Card
      className={`p-3 flex items-center gap-2 transition-colors ${
        isDragging ? "opacity-50" : ""
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={() => setIsDragging(false)}
    >
      <div
        className="cursor-move touch-none"
        onMouseDown={(e) => e.preventDefault()}
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
