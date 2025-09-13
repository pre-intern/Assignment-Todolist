/**
 * File định nghĩa các types cho Task
 * Hỗ trợ quản lý thời gian cho sinh viên Việt Nam
 */

// Danh mục task mở rộng (hỗ trợ nhiều hoạt động của sinh viên)
export type TaskCategory = 
  | 'class'        // Lớp học
  | 'project'      // Dự án
  | 'work'         // Công việc
  | 'personal'     // Cá nhân
  | 'self-care'    // Chăm sóc bản thân
  | 'pet-care'     // Chăm sóc thú cưng
  | 'housework'    // Việc nhà
  | 'health-care'  // Chăm sóc sức khỏe
  | 'fitness'      // Thể dục
  | 'shopping'     // Mua sắm
  | 'workshop'     // Hội thảo
  | 'finance'      // Tài chính
  | 'learning'     // Học tập
  | 'relax';       // Thư giãn

// Tags chi tiết cho task (có thể chọn nhiều)
export type TaskTag = 
  // Tags thời gian
  | 'morning'      // Buổi sáng
  | 'afternoon'    // Buổi chiều
  | 'evening'      // Buổi tối
  | 'night'        // Ban đêm
  | 'midnight'     // Nửa đêm
  // Tags trạng thái
  | 'chill'        // Thư thái
  | 'serious'      // Nghiêm túc
  | 'vehicle'      // Di chuyển
  // Tags học tập
  | 'study'        // Học tập
  | 'assignment'   // Bài tập
  | 'presentation' // Thuyết trình
  | 'report'       // Báo cáo
  | 'research'     // Nghiên cứu
  | 'coding'       // Lập trình
  // Tags khác
  | 'meeting'      // Cuộc họp
  | 'must-do'      // Bắt buộc
  | 'big-goal'     // Mục tiêu lớn
  | 'self-care';   // Tự chăm sóc

// Mức độ ưu tiên của task
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

// Trạng thái của task
export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'overdue';

// Interface chính cho Task
export interface Task {
  id: string;                      // ID duy nhất của task
  title: string;                    // Tiêu đề task
  description?: string;             // Mô tả chi tiết (tùy chọn)
  category: TaskCategory;           // Danh mục task
  priority: TaskPriority;           // Mức độ ưu tiên
  status: TaskStatus;               // Trạng thái hiện tại
  estimatedMinutes: number;         // Thời gian ước tính (phút)
  actualMinutes?: number;           // Thời gian thực tế (phút)
  deadline: string;                 // Thời hạn hoàn thành
  createdAt: string;                // Thời gian tạo
  completedAt?: string;             // Thời gian hoàn thành
  tags: string[];                   // Danh sách tags (có thể chọn nhiều)
  procrastinationFactor?: number;   // Hệ số trì hoãn (thực tế/ước tính)
  isOverdue?: boolean;              // Cờ đánh dấu quá hạn (để hiển thị màu đỏ)
  missedEmailSent?: boolean;        // Đã gửi email thông báo miss chưa
}

// Interface thống kê tasks
export interface TaskStats {
  totalTasks: number;                           // Tổng số task
  completedTasks: number;                       // Số task hoàn thành
  overdueTasks: number;                         // Số task quá hạn
  averageProcrastination: number;               // Hệ số trì hoãn TB
  bestWorkingHours: { hour: number; productivity: number }[]; // Giờ làm việc hiệu quả
  categoryBreakdown: Record<TaskCategory, number>; // Phân bổ theo danh mục
}