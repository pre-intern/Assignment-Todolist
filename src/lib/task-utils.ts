import { Task, TaskPriority, TaskStatus } from '@/types/task';

export function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getDeadlineStatus(deadline: string): 'safe' | 'warning' | 'danger' | 'overdue' {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursUntilDeadline < 0) return 'overdue';
  if (hoursUntilDeadline < 6) return 'danger';
  if (hoursUntilDeadline < 24) return 'warning';
  return 'safe';
}

export function formatTimeEstimate(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function calculateRealisticDeadline(
  deadline: string,
  estimatedMinutes: number,
  procrastinationFactor: number = 1
): Date {
  const deadlineDate = new Date(deadline);
  const realisticMinutes = estimatedMinutes * procrastinationFactor;
  const bufferMinutes = realisticMinutes * 0.2; // 20% buffer
  const totalMinutes = realisticMinutes + bufferMinutes;
  
  // Calculate when to start based on realistic time needed
  const startTime = new Date(deadlineDate.getTime() - totalMinutes * 60 * 1000);
  return startTime;
}

export function sortTasksByUrgency(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Overdue tasks first
    const aStatus = getDeadlineStatus(a.deadline);
    const bStatus = getDeadlineStatus(b.deadline);
    
    if (aStatus === 'overdue' && bStatus !== 'overdue') return -1;
    if (bStatus === 'overdue' && aStatus !== 'overdue') return 1;
    
    // Then by priority
    const priorityOrder: Record<TaskPriority, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };
    
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    
    // Finally by deadline
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}

export function getTaskProgress(task: Task): number {
  if (task.status === 'completed') return 100;
  if (task.status === 'todo') return 0;
  if (task.status === 'in-progress' && task.actualMinutes) {
    return Math.min(100, (task.actualMinutes / task.estimatedMinutes) * 100);
  }
  return 25; // Default for in-progress without time tracking
}

export function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMs < 0) {
    const overdueDays = Math.abs(diffDays);
    if (overdueDays === 0) return 'Overdue by hours';
    return `Overdue by ${overdueDays} day${overdueDays !== 1 ? 's' : ''}`;
  }
  
  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} left`;
  }
  
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} left`;
  }
  
  if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}