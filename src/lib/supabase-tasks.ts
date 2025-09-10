import { supabase } from '@/integrations/supabase/client';
import { Task, TaskStats, TaskCategory } from '@/types/task';

export const supabaseTasks = {
  // Get all tasks for current user
  async getTasks(): Promise<Task[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('deadline', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return (data || []).map(transformDbTask);
  },

  // Add a new task
  async addTask(task: Task): Promise<Task | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const dbTask = transformToDbTask(task);
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...dbTask,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      return null;
    }

    return transformDbTask(data);
  },

  // Update a task
  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Calculate procrastination factor if completing
    let procrastinationUpdate = {};
    if (updates.status === 'completed' && updates.actualMinutes) {
      const { data: existing } = await supabase
        .from('tasks')
        .select('estimated_minutes, procrastination_factor')
        .eq('id', id)
        .single();

      if (existing) {
        const currentFactor = existing.procrastination_factor || 1;
        const newFactor = (currentFactor * 0.3 + (updates.actualMinutes / existing.estimated_minutes) * 0.7);
        procrastinationUpdate = { procrastination_factor: newFactor };
      }
    }

    const dbUpdates = {
      ...transformToDbTask(updates as Task),
      ...procrastinationUpdate,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return null;
    }

    return transformDbTask(data);
  },

  // Delete a task
  async deleteTask(id: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return false;
    }

    return true;
  },

  // Calculate stats
  async getStats(): Promise<TaskStats> {
    const tasks = await this.getTasks();
    const now = new Date();

    const completedTasks = tasks.filter(t => t.status === 'completed');
    const overdueTasks = tasks.filter(t => 
      t.status !== 'completed' && new Date(t.deadline) < now
    );

    // Calculate average procrastination
    const completedWithActual = completedTasks.filter(t => t.actualMinutes && t.estimatedMinutes);
    const averageProcrastination = completedWithActual.length > 0
      ? completedWithActual.reduce((sum, task) => 
          sum + (task.actualMinutes! / task.estimatedMinutes), 0) / completedWithActual.length
      : 1;

    // Calculate best working hours
    const hourProductivity: Record<number, number> = {};
    completedTasks
      .filter(t => t.completedAt)
      .forEach(task => {
        const hour = new Date(task.completedAt!).getHours();
        hourProductivity[hour] = (hourProductivity[hour] || 0) + 1;
      });

    const bestWorkingHours = Object.entries(hourProductivity)
      .map(([hour, count]) => ({ hour: parseInt(hour), productivity: count }))
      .sort((a, b) => b.productivity - a.productivity)
      .slice(0, 5);

    // Calculate category breakdown
    const categoryBreakdown: Record<TaskCategory, number> = {
      class: 0,
      project: 0,
      work: 0,
      personal: 0,
      health: 0,
      learning: 0,
      'self-care': 0,
      'house-care': 0,
      'pet-care': 0,
    };

    tasks.forEach(task => {
      categoryBreakdown[task.category] = (categoryBreakdown[task.category] || 0) + 1;
    });

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      averageProcrastination,
      bestWorkingHours,
      categoryBreakdown
    };
  }
};

// Transform database task to app task
function transformDbTask(dbTask: any): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    category: dbTask.category,
    priority: dbTask.priority,
    status: dbTask.status,
    estimatedMinutes: dbTask.estimated_minutes,
    actualMinutes: dbTask.actual_minutes,
    deadline: dbTask.deadline,
    createdAt: dbTask.created_at,
    completedAt: dbTask.completed_at,
    tags: dbTask.tags || [],
    procrastinationFactor: dbTask.procrastination_factor
  };
}

// Transform app task to database format
function transformToDbTask(task: Partial<Task>): any {
  const dbTask: any = {};
  
  if (task.title !== undefined) dbTask.title = task.title;
  if (task.description !== undefined) dbTask.description = task.description;
  if (task.category !== undefined) dbTask.category = task.category;
  if (task.priority !== undefined) dbTask.priority = task.priority;
  if (task.status !== undefined) dbTask.status = task.status;
  if (task.estimatedMinutes !== undefined) dbTask.estimated_minutes = task.estimatedMinutes;
  if (task.actualMinutes !== undefined) dbTask.actual_minutes = task.actualMinutes;
  if (task.deadline !== undefined) dbTask.deadline = task.deadline;
  if (task.createdAt !== undefined) dbTask.created_at = task.createdAt;
  if (task.completedAt !== undefined) dbTask.completed_at = task.completedAt;
  if (task.tags !== undefined) dbTask.tags = task.tags;
  if (task.procrastinationFactor !== undefined) dbTask.procrastination_factor = task.procrastinationFactor;
  
  return dbTask;
}