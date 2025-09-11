import { useState, useCallback } from 'react';
import { Task, TaskStats } from '@/types/task';
import { storage } from '@/lib/storage';
import { supabaseTasks } from '@/lib/supabase-tasks';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, INFO_MESSAGES } from '@/config/messages';

export function useTasks(isAuthenticated: boolean) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({
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
  });
  const [loading, setLoading] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const loadedTasks = await supabaseTasks.getTasks();
        setTasks(loadedTasks);
        const newStats = await supabaseTasks.getStats();
        setStats(newStats);
      } else {
        const localTasks = storage.getTasks();
        setTasks(localTasks);
        const localStats = storage.updateStats(localTasks);
        setStats(localStats);
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_TASKS_FAILED, error);
      // Fallback to localStorage
      const localTasks = storage.getTasks();
      setTasks(localTasks);
      const localStats = storage.updateStats(localTasks);
      setStats(localStats);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createTask = useCallback(async (task: Task) => {
    try {
      if (isAuthenticated) {
        const newTask = await supabaseTasks.addTask(task);
        if (newTask) {
          setTasks(prev => [...prev, newTask]);
          const newStats = await supabaseTasks.getStats();
          setStats(newStats);
          toast.success(SUCCESS_MESSAGES.TASK_CREATED);
          return newTask;
        }
      }
      
      // Fallback to localStorage
      const localTask = storage.addTask(task);
      setTasks(prev => [...prev, localTask]);
      const localStats = storage.updateStats([...tasks, localTask]);
      setStats(localStats);
      toast.success(isAuthenticated ? INFO_MESSAGES.TASK_CREATED_LOCALLY : SUCCESS_MESSAGES.TASK_CREATED);
      return localTask;
    } catch (error) {
      console.error(ERROR_MESSAGES.TASK_CREATE_FAILED, error);
      toast.error(ERROR_MESSAGES.TASK_CREATE_FAILED);
      return null;
    }
  }, [isAuthenticated, tasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      if (isAuthenticated) {
        const updated = await supabaseTasks.updateTask(id, updates);
        if (updated) {
          setTasks(prev => prev.map(t => t.id === id ? updated : t));
          const newStats = await supabaseTasks.getStats();
          setStats(newStats);
          toast.success(SUCCESS_MESSAGES.TASK_UPDATED);
          return updated;
        }
      }
      
      // Fallback to localStorage
      const localUpdated = storage.updateTask(id, updates);
      if (localUpdated) {
        setTasks(prev => prev.map(t => t.id === id ? localUpdated : t));
        const updatedTasks = tasks.map(t => t.id === id ? localUpdated : t);
        const localStats = storage.updateStats(updatedTasks);
        setStats(localStats);
        toast.success(isAuthenticated ? INFO_MESSAGES.TASK_UPDATED_LOCALLY : SUCCESS_MESSAGES.TASK_UPDATED);
        return localUpdated;
      }
      return null;
    } catch (error) {
      console.error(ERROR_MESSAGES.TASK_UPDATE_FAILED, error);
      toast.error(ERROR_MESSAGES.TASK_UPDATE_FAILED);
      return null;
    }
  }, [isAuthenticated, tasks]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      if (isAuthenticated) {
        const success = await supabaseTasks.deleteTask(id);
        if (success) {
          setTasks(prev => prev.filter(t => t.id !== id));
          const newStats = await supabaseTasks.getStats();
          setStats(newStats);
          toast.success(SUCCESS_MESSAGES.TASK_DELETED);
          return true;
        }
      }
      
      // Fallback to localStorage
      const localUpdatedTasks = storage.deleteTask(id);
      setTasks(localUpdatedTasks);
      const localStats = storage.updateStats(localUpdatedTasks);
      setStats(localStats);
      toast.success(isAuthenticated ? INFO_MESSAGES.TASK_DELETED_LOCALLY : SUCCESS_MESSAGES.TASK_DELETED);
      return true;
    } catch (error) {
      console.error(ERROR_MESSAGES.TASK_DELETE_FAILED, error);
      toast.error(ERROR_MESSAGES.TASK_DELETE_FAILED);
      return false;
    }
  }, [isAuthenticated]);

  return {
    tasks,
    stats,
    loading,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}