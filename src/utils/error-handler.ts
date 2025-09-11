import { toast } from 'sonner';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown, fallbackMessage?: string): void {
  if (error instanceof AppError) {
    toast.error(error.message);
    console.error(`[${error.code}]`, error);
  } else if (error instanceof Error) {
    toast.error(error.message || fallbackMessage || 'An unexpected error occurred');
    console.error(error);
  } else {
    toast.error(fallbackMessage || 'An unexpected error occurred');
    console.error('Unknown error:', error);
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('Network')
  );
}