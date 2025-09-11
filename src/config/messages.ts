// Success messages
export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Task created successfully!',
  TASK_UPDATED: 'Task updated!',
  TASK_DELETED: 'Task deleted',
  TASK_COMPLETED: 'Task completed! 🎉',
  TIMER_STARTED: 'Timer started!',
  LOGIN: 'Successfully logged in!',
  SIGNUP: 'Check your email to confirm your account!',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  PASSWORDS_MISMATCH: 'Passwords do not match',
  EMAIL_EXISTS: 'This email is already registered. Please login instead.',
  LOGIN_FAILED: 'Failed to login',
  SIGNUP_FAILED: 'Failed to sign up',
  GOOGLE_LOGIN_FAILED: 'Failed to login with Google',
  TASK_CREATE_FAILED: 'Failed to create task',
  TASK_UPDATE_FAILED: 'Failed to update task',
  TASK_DELETE_FAILED: 'Failed to delete task',
  FETCH_TASKS_FAILED: 'Error fetching tasks',
} as const;

// Info messages
export const INFO_MESSAGES = {
  LOADING_TASKS: 'Loading tasks...',
  NO_ACTIVE_TASKS: 'No active tasks',
  CREATE_FIRST_TASK: 'Create Your First Task',
  TASK_CREATED_LOCALLY: 'Task created (locally)!',
  TASK_UPDATED_LOCALLY: 'Task updated (locally)!',
  TASK_DELETED_LOCALLY: 'Task deleted (locally)',
} as const;

// UI Labels
export const LABELS = {
  LOGIN: 'Login',
  SIGNUP: 'Sign Up',
  LOGGING_IN: 'Logging in...',
  CREATING_ACCOUNT: 'Creating account...',
  CONTINUE_WITH_GOOGLE: 'Continue with Google',
  LOGIN_SIGNUP: 'Login / Sign Up',
  NEW_TASK: 'New Task',
  FOCUS_MODE: 'Focus Mode',
  CALENDAR: 'Calendar',
  ANALYTICS: 'Analytics',
  ACTIVE_TASKS: 'Active Tasks',
  COMPLETED: 'Completed',
  HIGH_PROCRASTINATION_WARNING: '⚠️ High procrastination detected',
} as const;