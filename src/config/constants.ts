// Application constants
export const APP_NAME = 'Study Flow';
export const APP_TAGLINE = 'Beat procrastination, achieve your goals';
export const APP_DESCRIPTION = 'Smart task management that learns your patterns and helps you stay on track';

// Time constants (in milliseconds)
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const;

// Work session configuration
export const WORK_SESSION = {
  REST_REMINDER_AFTER: TIME.HOUR, // Remind to rest after 1 hour
  MIN_TASKS_FOR_REST: 1, // Minimum tasks before rest reminder
} as const;

// Task defaults
export const TASK_DEFAULTS = {
  ESTIMATED_MINUTES: 30,
  DEADLINE_OFFSET: TIME.DAY, // Default deadline is 1 day from now
  CATEGORY: 'class' as const,
  PRIORITY: 'medium' as const,
  STATUS: 'todo' as const,
} as const;

// Procrastination calculation weights
export const PROCRASTINATION_WEIGHTS = {
  CURRENT: 0.3,
  NEW: 0.7,
} as const;

// UI Configuration
export const UI_CONFIG = {
  MAX_COMPLETED_TASKS_SHOWN: 5,
  BEST_WORKING_HOURS_COUNT: 5,
  SEARCH_INPUT_WIDTH: 'w-64',
  HIGH_PROCRASTINATION_THRESHOLD: 1.5,
} as const;

// Animation durations
export const ANIMATIONS = {
  PULSE_DURATION: 2000,
  BOUNCE_DURATION: 1000,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  TASKS: 'studyflow_tasks',
  STATS: 'studyflow_stats',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
} as const;