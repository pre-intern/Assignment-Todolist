// Các hằng số của ứng dụng
export const APP_NAME = 'Study Flow';
export const APP_TAGLINE = 'Beat procrastination, achieve your goals';
export const APP_DESCRIPTION = 'Smart task management that learns your patterns and helps you stay on track';

// Hằng số thời gian (tính bằng milliseconds)
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const;

// Cấu hình phiên làm việc
export const WORK_SESSION = {
  REST_REMINDER_AFTER: TIME.HOUR, // Nhắc nhở nghỉ ngơi sau 1 giờ
  MIN_TASKS_FOR_REST: 1, // Số task tối thiểu trước khi nhắc nghỉ
} as const;

// Giá trị mặc định cho task
export const TASK_DEFAULTS = {
  ESTIMATED_MINUTES: 30,
  DEADLINE_OFFSET: TIME.DAY, // Deadline mặc định là 1 ngày từ hiện tại
  CATEGORY: 'class' as const,
  PRIORITY: 'medium' as const,
  STATUS: 'todo' as const,
} as const;

// Trọng số tính toán độ trì hoãn
export const PROCRASTINATION_WEIGHTS = {
  CURRENT: 0.3, // Trọng số cho hệ số hiện tại
  NEW: 0.7, // Trọng số cho hệ số mới
} as const;

// Cấu hình giao diện người dùng
export const UI_CONFIG = {
  MAX_COMPLETED_TASKS_SHOWN: 5, // Số task đã hoàn thành hiển thị tối đa
  BEST_WORKING_HOURS_COUNT: 5, // Số giờ làm việc hiệu quả nhất hiển thị
  SEARCH_INPUT_WIDTH: 'w-64', // Độ rộng ô tìm kiếm
  HIGH_PROCRASTINATION_THRESHOLD: 1.5, // Ngưỡng cảnh báo trì hoãn cao
} as const;

// Thời gian animation
export const ANIMATIONS = {
  PULSE_DURATION: 2000, // Thời gian hiệu ứng pulse
  BOUNCE_DURATION: 1000, // Thời gian hiệu ứng bounce
} as const;

// Khóa lưu trữ localStorage
export const STORAGE_KEYS = {
  TASKS: 'studyflow_tasks', // Khóa lưu trữ tasks
  STATS: 'studyflow_stats', // Khóa lưu trữ thống kê
} as const;

// Đường dẫn trong ứng dụng
export const ROUTES = {
  HOME: '/', // Trang chủ
  AUTH: '/auth', // Trang đăng nhập/đăng ký
} as const;