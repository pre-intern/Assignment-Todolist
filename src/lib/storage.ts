import { Task, TaskStats } from '@/types/task';

const TASKS_KEY = 'studyflow_tasks';
const STATS_KEY = 'studyflow_stats';

export const storage = {
  // Tasks CRUD
  getTasks: (): Task[] => {
    const stored = localStorage.getItem(TASKS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },

  addTask: (task: Task) => {
    const tasks = storage.getTasks();
    tasks.push(task);
    storage.saveTasks(tasks);
    return task;
  },

  updateTask: (id: string, updates: Partial<Task>) => {
    const tasks = storage.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      
      // Update procrastination factor if task is completed
      if (updates.status === 'completed' && updates.actualMinutes) {
        const estimated = tasks[index].estimatedMinutes;
        const actual = updates.actualMinutes;
        const currentFactor = tasks[index].procrastinationFactor || 1;
        // Weighted average with more weight on recent completions
        tasks[index].procrastinationFactor = (currentFactor * 0.3 + (actual / estimated) * 0.7);
      }
      
      storage.saveTasks(tasks);
      return tasks[index];
    }
    return null;
  },

  deleteTask: (id: string) => {
    const tasks = storage.getTasks();
    const filtered = tasks.filter(t => t.id !== id);
    storage.saveTasks(filtered);
    return filtered;
  },

  // Stats
  getStats: (): TaskStats => {
    const stored = localStorage.getItem(STATS_KEY);
    return stored ? JSON.parse(stored) : {
      totalTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      averageProcrastination: 1,
      bestWorkingHours: [],
      categoryBreakdown: {
        class: 0,
        project: 0,
        work: 0,
        personal: 0
      }
    };
  },

  updateStats: (tasks: Task[]) => {
    const now = new Date();
    const stats: TaskStats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      overdueTasks: tasks.filter(t => {
        return t.status !== 'completed' && new Date(t.deadline) < now;
      }).length,
      averageProcrastination: calculateAverageProcrastination(tasks),
      bestWorkingHours: calculateBestWorkingHours(tasks),
      categoryBreakdown: calculateCategoryBreakdown(tasks),
    };
    
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    return stats;
  }
};

function calculateAverageProcrastination(tasks: Task[]): number {
  const completedWithActual = tasks.filter(t => 
    t.status === 'completed' && t.actualMinutes && t.estimatedMinutes
  );
  
  if (completedWithActual.length === 0) return 1;
  
  const total = completedWithActual.reduce((sum, task) => 
    sum + (task.actualMinutes! / task.estimatedMinutes), 0
  );
  
  return total / completedWithActual.length;
}

function calculateBestWorkingHours(tasks: Task[]): { hour: number; productivity: number }[] {
  const hourProductivity: Record<number, number> = {};
  
  tasks
    .filter(t => t.status === 'completed' && t.completedAt)
    .forEach(task => {
      const hour = new Date(task.completedAt!).getHours();
      hourProductivity[hour] = (hourProductivity[hour] || 0) + 1;
    });
  
  return Object.entries(hourProductivity)
    .map(([hour, count]) => ({ hour: parseInt(hour), productivity: count }))
    .sort((a, b) => b.productivity - a.productivity)
    .slice(0, 5);
}

function calculateCategoryBreakdown(tasks: Task[]): Record<string, number> {
  const breakdown: Record<string, number> = {};
  
  tasks.forEach(task => {
    breakdown[task.category] = (breakdown[task.category] || 0) + 1;
  });
  
  return breakdown;
}