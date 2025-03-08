import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewTask } from "@/components/new-task";
import { TaskList } from "@/components/task-list";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Todo List
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <NewTask />
            <TaskList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
