import { useQuery, useMutation } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { TaskItem } from "./task-item";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export function TaskList() {
  const { toast } = useToast();
  
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: number[]) => {
      await apiRequest("POST", "/api/tasks/reorder", { orderedIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reorder tasks",
        variant: "destructive",
      });
    },
  });

  const handleDragEnd = (taskId: number, newIndex: number) => {
    if (!tasks) return;
    
    const oldIndex = tasks.findIndex((t) => t.id === taskId);
    if (oldIndex === newIndex) return;

    const newTasks = [...tasks];
    const [removed] = newTasks.splice(oldIndex, 1);
    newTasks.splice(newIndex, 0, removed);
    
    reorderMutation.mutate(newTasks.map((t) => t.id));
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!tasks?.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No tasks yet. Add one above!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          onDragEnd={(newIndex) => handleDragEnd(task.id, newIndex)}
          index={index}
          total={tasks.length}
        />
      ))}
    </div>
  );
}
