export type TaskCategory = 'class' | 'project' | 'work' | 'personal';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'overdue';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedMinutes: number;
  actualMinutes?: number;
  deadline: string;
  createdAt: string;
  completedAt?: string;
  tags: string[];
  procrastinationFactor?: number; // How much longer tasks actually take vs estimate
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageProcrastination: number;
  bestWorkingHours: { hour: number; productivity: number }[];
  categoryBreakdown: Record<TaskCategory, number>;
}