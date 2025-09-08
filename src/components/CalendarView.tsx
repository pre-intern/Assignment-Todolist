import { Task } from '@/types/task';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimeEstimate, getDeadlineStatus } from '@/lib/task-utils';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    const date = new Date(task.deadline).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
  
  // Get next 30 days
  const dates: Date[] = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  
  const categoryColors: Record<string, string> = {
    class: 'bg-category-class',
    project: 'bg-category-project',
    work: 'bg-category-work',
    personal: 'bg-category-personal',
  };
  
  const today = new Date().toDateString();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Next 30 Days</h2>
      </div>
      
      <div className="grid gap-4">
        {dates.map((date) => {
          const dateStr = date.toDateString();
          const dayTasks = tasksByDate[dateStr] || [];
          const isToday = dateStr === today;
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          
          if (dayTasks.length === 0 && !isToday) return null;
          
          return (
            <Card 
              key={dateStr}
              className={cn(
                "p-4 bg-gradient-card border-border/50",
                isToday && "border-primary shadow-glow",
                isWeekend && "bg-muted/20"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  {isToday && (
                    <Badge variant="default" className="mt-1 bg-gradient-primary">
                      Today
                    </Badge>
                  )}
                </div>
                {dayTasks.length > 0 && (
                  <Badge variant="outline">
                    {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              
              {dayTasks.length > 0 ? (
                <div className="space-y-2">
                  {dayTasks
                    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                    .map((task) => {
                      const status = getDeadlineStatus(task.deadline);
                      const time = new Date(task.deadline).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      });
                      
                      return (
                        <div
                          key={task.id}
                          onClick={() => onTaskClick(task)}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                            "bg-background/50 border-border/50",
                            task.status === 'completed' && "opacity-60 line-through",
                            status === 'overdue' && "border-destructive bg-destructive/10",
                            status === 'danger' && "border-warning bg-warning/10"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{task.title}</span>
                            <span className="text-sm text-muted-foreground">{time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className={cn('text-xs text-white', categoryColors[task.category])}
                            >
                              {task.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {formatTimeEstimate(task.estimatedMinutes)}
                            </Badge>
                            {task.priority === 'critical' && (
                              <Badge variant="destructive" className="text-xs">
                                Critical
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No tasks scheduled</p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}