/**
 * Module quản lý lưu trữ dữ liệu local (offline) cho ứng dụng
 * Sử dụng localStorage để lưu tasks và thống kê khi người dùng chưa đăng nhập
 */

import { Task, TaskStats } from '@/types/task';
import { STORAGE_KEYS, PROCRASTINATION_WEIGHTS } from '@/config/constants';

// Lấy key cho localStorage từ constants
const TASKS_KEY = STORAGE_KEYS.TASKS;
const STATS_KEY = STORAGE_KEYS.STATS;

/**
 * Object chứa các hàm xử lý localStorage
 * Dùng để lưu trữ và quản lý tasks offline
 */
export const storage = {
  /**
   * Lấy tất cả tasks từ localStorage
   * @returns Mảng các tasks đã lưu hoặc mảng rỗng
   */
  getTasks: (): Task[] => {
    const stored = localStorage.getItem(TASKS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  /**
   * Lưu danh sách tasks vào localStorage
   * @param tasks - Mảng tasks cần lưu
   */
  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },

  /**
   * Thêm task mới vào localStorage
   * @param task - Task mới cần thêm
   * @returns Task vừa được thêm
   */
  addTask: (task: Task) => {
    const tasks = storage.getTasks();
    tasks.push(task);
    storage.saveTasks(tasks);
    return task;
  },

  /**
   * Cập nhật thông tin task trong localStorage
   * @param id - ID của task cần cập nhật
   * @param updates - Các thông tin cần cập nhật
   * @returns Task đã cập nhật hoặc null nếu không tìm thấy
   */
  updateTask: (id: string, updates: Partial<Task>) => {
    const tasks = storage.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      // Gộp thông tin cũ với thông tin mới
      tasks[index] = { ...tasks[index], ...updates };
      
      // Cập nhật hệ số trì hoãn nếu task được hoàn thành
      // Hệ số này giúp dự đoán chính xác hơn thời gian thực tế cho các task sau
      if (updates.status === 'completed' && updates.actualMinutes) {
        const estimated = tasks[index].estimatedMinutes;
        const actual = updates.actualMinutes;
        const currentFactor = tasks[index].procrastinationFactor || 1;
        // Tính trung bình có trọng số: 70% giá trị cũ + 30% giá trị mới
        // Giúp hệ số ổn định hơn, không bị ảnh hưởng quá nhiều bởi 1 task
        tasks[index].procrastinationFactor = (currentFactor * PROCRASTINATION_WEIGHTS.CURRENT + (actual / estimated) * PROCRASTINATION_WEIGHTS.NEW);
      }
      
      storage.saveTasks(tasks);
      return tasks[index];
    }
    return null;
  },

  /**
   * Xóa task khỏi localStorage
   * @param id - ID của task cần xóa
   * @returns Danh sách tasks sau khi xóa
   */
  deleteTask: (id: string) => {
    const tasks = storage.getTasks();
    const filtered = tasks.filter(t => t.id !== id);
    storage.saveTasks(filtered);
    return filtered;
  },

  /**
   * Lấy thống kê từ localStorage
   * @returns Object thống kê hoặc giá trị mặc định
   */
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
        personal: 0,
        health: 0,
        learning: 0,
        'self-care': 0,
        'house-care': 0,
        'pet-care': 0,
      }
    };
  },

  /**
   * Cập nhật thống kê dựa trên danh sách tasks
   * @param tasks - Danh sách tasks hiện tại
   * @returns Object thống kê đã cập nhật
   */
  updateStats: (tasks: Task[]) => {
    const now = new Date();
    const stats: TaskStats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      // Đếm số task quá hạn (chưa hoàn thành và deadline đã qua)
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

/**
 * Tính hệ số trì hoãn trung bình
 * So sánh thời gian thực tế với thời gian ước tính của các task đã hoàn thành
 * @param tasks - Danh sách tasks
 * @returns Hệ số trì hoãn (1 = đúng thời gian, >1 = chậm hơn dự kiến)
 */
function calculateAverageProcrastination(tasks: Task[]): number {
  // Lọc các task đã hoàn thành và có cả thời gian thực tế lẫn ước tính
  const completedWithActual = tasks.filter(t => 
    t.status === 'completed' && t.actualMinutes && t.estimatedMinutes
  );
  
  if (completedWithActual.length === 0) return 1;
  
  // Tính tổng tỷ lệ thực tế/ước tính
  const total = completedWithActual.reduce((sum, task) => 
    sum + (task.actualMinutes! / task.estimatedMinutes), 0
  );
  
  return total / completedWithActual.length;
}

/**
 * Tìm các giờ làm việc hiệu quả nhất
 * Dựa trên số lượng task hoàn thành trong mỗi giờ
 * @param tasks - Danh sách tasks
 * @returns Top 5 giờ có nhiều task hoàn thành nhất
 */
function calculateBestWorkingHours(tasks: Task[]): { hour: number; productivity: number }[] {
  const hourProductivity: Record<number, number> = {};
  
  // Đếm số task hoàn thành trong mỗi giờ (0-23)
  tasks
    .filter(t => t.status === 'completed' && t.completedAt)
    .forEach(task => {
      const hour = new Date(task.completedAt!).getHours();
      hourProductivity[hour] = (hourProductivity[hour] || 0) + 1;
    });
  
  // Chuyển đổi, sắp xếp và lấy top 5
  return Object.entries(hourProductivity)
    .map(([hour, count]) => ({ hour: parseInt(hour), productivity: count }))
    .sort((a, b) => b.productivity - a.productivity)
    .slice(0, 5);
}

/**
 * Phân tích số lượng task theo danh mục
 * @param tasks - Danh sách tasks
 * @returns Object chứa số lượng task của mỗi danh mục
 */
function calculateCategoryBreakdown(tasks: Task[]): Record<string, number> {
  const breakdown: Record<string, number> = {};
  
  tasks.forEach(task => {
    breakdown[task.category] = (breakdown[task.category] || 0) + 1;
  });
  
  return breakdown;
}