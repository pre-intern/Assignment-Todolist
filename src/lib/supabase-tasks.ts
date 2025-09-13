import { supabase } from '@/integrations/supabase/client';
import { Task, TaskStats, TaskCategory } from '@/types/task';
import { PROCRASTINATION_WEIGHTS, UI_CONFIG } from '@/config/constants';
import { handleError } from '@/utils/error-handler';

// Interface định nghĩa cấu trúc task trong database
interface DbTask {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  estimated_minutes: number;
  actual_minutes: number | null;
  deadline: string;
  created_at: string;
  completed_at: string | null;
  tags: string[];
  procrastination_factor: number | null;
}

// Object chứa các hàm tương tác với database Supabase cho tasks
export const supabaseTasks = {
  // Lấy tất cả tasks của người dùng hiện tại từ database
  async getTasks(): Promise<Task[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('deadline', { ascending: true });

    if (error) {
      handleError(error, 'Error fetching tasks');
      return [];
    }

    return (data || []).map(transformDbTask);
  },

  // Thêm task mới vào database
  async addTask(task: Task): Promise<Task | null> {
    // Lấy thông tin người dùng hiện tại
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Chuyển đổi task từ format app sang format database
    const dbTask = transformToDbTask(task);
    // Lưu task vào database với user_id
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...dbTask,
        user_id: user.id, // Gắn task với user hiện tại
        category: dbTask.category as TaskCategory
      } as any)
      .select()
      .single();

    if (error) {
      handleError(error, 'Error adding task');
      return null;
    }

    // Chuyển đổi kết quả từ database về format app
    return transformDbTask(data);
  },

  // Cập nhật thông tin task trong database
  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Tính toán hệ số trì hoãn nếu task được hoàn thành
    let procrastinationUpdate = {};
    if (updates.status === 'completed' && updates.actualMinutes) {
      const { data: existing } = await supabase
        .from('tasks')
        .select('estimated_minutes, procrastination_factor')
        .eq('id', id)
        .single();

      if (existing) {
        const currentFactor = existing.procrastination_factor || 1;
        const newFactor = (currentFactor * PROCRASTINATION_WEIGHTS.CURRENT + (updates.actualMinutes / existing.estimated_minutes) * PROCRASTINATION_WEIGHTS.NEW);
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
      .update(dbUpdates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleError(error, 'Error updating task');
      return null;
    }

    return transformDbTask(data);
  },

  // Xóa task khỏi database
  async deleteTask(id: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      handleError(error, 'Error deleting task');
      return false;
    }

    return true;
  },

  // Tính toán thống kê từ các tasks
  async getStats(): Promise<TaskStats> {
    const tasks = await this.getTasks();
    const now = new Date();

    // Lọc các task đã hoàn thành và quá hạn
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const overdueTasks = tasks.filter(t => 
      t.status !== 'completed' && new Date(t.deadline) < now
    );

    // Tính toán hệ số trì hoãn trung bình
    const completedWithActual = completedTasks.filter(t => t.actualMinutes && t.estimatedMinutes);
    const averageProcrastination = completedWithActual.length > 0
      ? completedWithActual.reduce((sum, task) => 
          sum + (task.actualMinutes! / task.estimatedMinutes), 0) / completedWithActual.length
      : 1;

    // Tính toán giờ làm việc hiệu quả nhất
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

    // Phân tích tasks theo danh mục
    const categoryBreakdown: Record<TaskCategory, number> = {
      class: 0,
      project: 0,
      work: 0,
      personal: 0,
      'self-care': 0,
      'pet-care': 0,
      housework: 0,
      'health-care': 0,
      fitness: 0,
      shopping: 0,
      workshop: 0,
      finance: 0,
      learning: 0,
      relax: 0,
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

// Chuyển đổi task từ format database sang format ứng dụng
function transformDbTask(dbTask: DbTask): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || undefined,
    category: dbTask.category as TaskCategory,
    priority: dbTask.priority as Task['priority'],
    status: dbTask.status as Task['status'],
    estimatedMinutes: dbTask.estimated_minutes,
    actualMinutes: dbTask.actual_minutes || undefined,
    deadline: dbTask.deadline,
    createdAt: dbTask.created_at,
    completedAt: dbTask.completed_at || undefined,
    tags: dbTask.tags || [],
    procrastinationFactor: dbTask.procrastination_factor || undefined
  };
}

// Chuyển đổi task từ format ứng dụng sang format database
function transformToDbTask(task: Partial<Task>): Partial<DbTask> {
  const dbTask: Partial<DbTask> = {};
  
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