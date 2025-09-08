import { useState } from 'react';
import { Task, TaskCategory, TaskPriority } from '@/types/task';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Calendar, 
  ChevronRight, 
  Play, 
  CheckCircle2,
  AlertCircle,
  Timer,
  Trash2,
  Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDeadline, formatTimeEstimate, getDeadlineStatus, getTaskProgress } from '@/lib/task-utils';

interface TaskCardProps {
  task: Task;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onStart, onComplete, onEdit, onDelete }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const deadlineStatus = getDeadlineStatus(task.deadline);
  const progress = getTaskProgress(task);
  
  const categoryColors: Record<TaskCategory, string> = {
    class: 'bg-category-class',
    project: 'bg-category-project',
    work: 'bg-category-work',
    personal: 'bg-category-personal',
  };
  
  const priorityColors: Record<TaskPriority, string> = {
    critical: 'bg-priority-critical',
    high: 'bg-priority-high',
    medium: 'bg-priority-medium',
    low: 'bg-priority-low',
  };
  
  const deadlineColors = {
    safe: 'text-muted-foreground',
    warning: 'text-warning',
    danger: 'text-destructive',
    overdue: 'text-destructive font-bold',
  };
  
  return (
    <Card className={cn(
      'p-4 transition-all duration-300 hover:shadow-lg',
      'bg-gradient-card border-border/50',
      deadlineStatus === 'danger' && 'border-destructive/50',
      deadlineStatus === 'overdue' && 'border-destructive animate-pulse',
      task.status === 'completed' && 'opacity-75'
    )}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-semibold text-lg",
                task.status === 'completed' && 'line-through text-muted-foreground'
              )}>
                {task.title}
              </h3>
              {task.status === 'in-progress' && (
                <Badge variant="default" className="bg-accent text-accent-foreground animate-pulse">
                  In Progress
                </Badge>
              )}
            </div>
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="secondary" 
                className={cn('text-white', categoryColors[task.category])}
              >
                {task.category}
              </Badge>
              <Badge 
                variant="secondary"
                className={cn('text-white', priorityColors[task.priority])}
              >
                {task.priority}
              </Badge>
              {task.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2"
          >
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-90"
            )} />
          </Button>
        </div>
        
        {/* Time Info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Est: {formatTimeEstimate(task.estimatedMinutes)}
            </span>
            {task.procrastinationFactor && task.procrastinationFactor > 1 && (
              <span className="text-warning text-xs">
                (Actually: {formatTimeEstimate(Math.round(task.estimatedMinutes * task.procrastinationFactor))})
              </span>
            )}
          </div>
          
          <div className={cn("flex items-center gap-1", deadlineColors[deadlineStatus])}>
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{formatDeadline(task.deadline)}</span>
            {deadlineStatus === 'overdue' && <AlertCircle className="h-4 w-4" />}
          </div>
        </div>
        
        {/* Progress Bar */}
        {task.status === 'in-progress' && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {/* Expanded Content */}
        {isExpanded && (
          <div className="pt-3 space-y-3 border-t border-border/50">
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}
            
            {task.actualMinutes && (
              <div className="flex items-center gap-2 text-sm">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span>Actual time: {formatTimeEstimate(task.actualMinutes)}</span>
                {task.procrastinationFactor && (
                  <Badge variant="outline" className="text-xs">
                    {Math.round((task.procrastinationFactor - 1) * 100)}% longer than estimated
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {task.status === 'todo' && (
            <Button
              size="sm"
              onClick={() => onStart(task.id)}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          )}
          
          {task.status === 'in-progress' && (
            <Button
              size="sm"
              onClick={() => onComplete(task.id)}
              className="bg-gradient-success hover:opacity-90"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Complete
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(task)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(task.id)}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}