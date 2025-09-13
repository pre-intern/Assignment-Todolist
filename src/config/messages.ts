// Thông báo thành công
export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Tạo task thành công!',
  TASK_UPDATED: 'Cập nhật task thành công!',
  TASK_DELETED: 'Xóa task thành công',
  TASK_COMPLETED: 'Hoàn thành task! 🎉',
  TIMER_STARTED: 'Bắt đầu bấm giờ!',
  LOGIN: 'Đăng nhập thành công!',
  SIGNUP: 'Kiểm tra email để xác nhận tài khoản!',
} as const;

// Thông báo lỗi
export const ERROR_MESSAGES = {
  PASSWORDS_MISMATCH: 'Mật khẩu không khớp',
  EMAIL_EXISTS: 'Email đã được đăng ký. Vui lòng đăng nhập.',
  LOGIN_FAILED: 'Đăng nhập thất bại',
  SIGNUP_FAILED: 'Đăng ký thất bại',
  GOOGLE_LOGIN_FAILED: 'Đăng nhập với Google thất bại',
  TASK_CREATE_FAILED: 'Tạo task thất bại',
  TASK_UPDATE_FAILED: 'Cập nhật task thất bại',
  TASK_DELETE_FAILED: 'Xóa task thất bại',
  FETCH_TASKS_FAILED: 'Lỗi khi tải tasks',
} as const;

// Thông báo thông tin
export const INFO_MESSAGES = {
  LOADING_TASKS: 'Đang tải tasks...',
  NO_ACTIVE_TASKS: 'Không có task nào',
  CREATE_FIRST_TASK: 'Tạo Task Đầu Tiên',
  TASK_CREATED_LOCALLY: 'Task đã được tạo (offline)!',
  TASK_UPDATED_LOCALLY: 'Task đã được cập nhật (offline)!',
  TASK_DELETED_LOCALLY: 'Task đã được xóa (offline)',
} as const;

// Nhãn giao diện
export const LABELS = {
  LOGIN: 'Đăng nhập',
  SIGNUP: 'Đăng ký',
  LOGGING_IN: 'Đang đăng nhập...',
  CREATING_ACCOUNT: 'Đang tạo tài khoản...',
  CONTINUE_WITH_GOOGLE: 'Tiếp tục với Google',
  LOGIN_SIGNUP: 'Đăng nhập / Đăng ký',
  NEW_TASK: 'Task Mới',
  FOCUS_MODE: 'Chế độ Tập trung',
  CALENDAR: 'Lịch',
  ANALYTICS: 'Thống kê',
  ACTIVE_TASKS: 'Tasks Đang thực hiện',
  COMPLETED: 'Đã hoàn thành',
  HIGH_PROCRASTINATION_WARNING: '⚠️ Phát hiện độ trì hoãn cao',
} as const;