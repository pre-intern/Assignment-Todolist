import { useState, useEffect } from 'react';
import { Task, TaskStats } from '@/types/task';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { TaskTimer } from '@/components/TaskTimer';
import { CalendarView } from '@/components/CalendarView';
import { StatsView } from '@/components/StatsView';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/lib/storage';
import { sortTasksByUrgency } from '@/lib/task-utils';
import { 
  Plus, 
  Search, 
  Brain,
  Calendar,
  BarChart3,
  ListTodo,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export default function Index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>(storage.getStats());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'focus' | 'calendar' | 'stats'>('focus');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [activeTimer, setActiveTimer] = useState<Task | undefined>();
  
  // Load tasks on mount
  useEffect(() => {
    const loadedTasks = storage.getTasks();
    setTasks(loadedTasks);
    updateStats(loadedTasks);
  }, []);
  
  const updateStats = (updatedTasks: Task[]) => {
    const newStats = storage.updateStats(updatedTasks);
    setStats(newStats);
  };
  
  const handleCreateTask = (task: Task) => {
    const newTask = storage.addTask(task);
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    updateStats(updatedTasks);
    toast.success('Task created successfully!');
  };
  
  const handleUpdateTask = (task: Task) => {
    const updated = storage.updateTask(task.id, task);
    if (updated) {
      const updatedTasks = tasks.map(t => t.id === task.id ? updated : t);
      setTasks(updatedTasks);
      updateStats(updatedTasks);
      toast.success('Task updated!');
    }
  };
  
  const handleDeleteTask = (id: string) => {
    const updatedTasks = storage.deleteTask(id);
    setTasks(updatedTasks);
    updateStats(updatedTasks);
    toast.success('Task deleted');
  };
  
  const handleStartTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const updated = storage.updateTask(id, { status: 'in-progress' });
      if (updated) {
        const updatedTasks = tasks.map(t => t.id === id ? updated : t);
        setTasks(updatedTasks);
        setActiveTimer(updated);
        toast.success('Timer started!');
      }
    }
  };
  
  const handleCompleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const actualMinutes = activeTimer?.id === id ? 0 : task.actualMinutes || task.estimatedMinutes;
      const updated = storage.updateTask(id, { 
        status: 'completed',
        completedAt: new Date().toISOString(),
        actualMinutes
      });
      if (updated) {
        const updatedTasks = tasks.map(t => t.id === id ? updated : t);
        setTasks(updatedTasks);
        updateStats(updatedTasks);
        if (activeTimer?.id === id) {
          setActiveTimer(undefined);
        }
        toast.success('Task completed! 🎉');
      }
    }
  };
  
  const handleTimerUpdate = (minutes: number) => {
    if (activeTimer) {
      storage.updateTask(activeTimer.id, { actualMinutes: minutes });
    }
  };
  
  const handleTimerComplete = () => {
    if (activeTimer) {
      handleCompleteTask(activeTimer.id);
    }
  };
  
  // Filter tasks based on search
  const filteredTasks = tasks.filter(task => {
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.category.includes(query) ||
      task.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });
  
  // Sort tasks for focus view
  const sortedTasks = sortTasksByUrgency(filteredTasks.filter(t => t.status !== 'completed'));
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  StudyFlow
                </h1>
                <p className="text-xs text-muted-foreground">Beat procrastination, ace your studies</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-input"
                />
              </div>
              
              <Button 
                onClick={() => {
                  setEditingTask(undefined);
                  setIsFormOpen(true);
                }}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Active Timer */}
      {activeTimer && (
        <div className="container mx-auto px-4 py-4">
          <TaskTimer
            taskId={activeTimer.id}
            taskTitle={activeTimer.title}
            estimatedMinutes={activeTimer.estimatedMinutes}
            onTimeUpdate={handleTimerUpdate}
            onComplete={handleTimerComplete}
          />
        </div>
      )}
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="focus" className="gap-2">
              <Zap className="h-4 w-4" />
              Focus Mode
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="focus" className="space-y-6">
            {/* Task Summary */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-1">
                  <ListTodo className="h-3 w-3" />
                  {sortedTasks.length} active
                </Badge>
                {stats.overdueTasks > 0 && (
                  <Badge variant="destructive">
                    {stats.overdueTasks} overdue
                  </Badge>
                )}
                {stats.averageProcrastination > 1.5 && (
                  <Badge variant="secondary" className="bg-warning text-warning-foreground">
                    ⚠️ High procrastination detected
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Active Tasks */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Active Tasks</h2>
              {sortedTasks.length > 0 ? (
                <div className="grid gap-4">
                  {sortedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStart={handleStartTask}
                      onComplete={handleCompleteTask}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setIsFormOpen(true);
                      }}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No active tasks</p>
                  <Button 
                    onClick={() => setIsFormOpen(true)}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    Create Your First Task
                  </Button>
                </div>
              )}
            </div>
            
            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-muted-foreground">Completed</h2>
                <div className="grid gap-4 opacity-60">
                  {completedTasks.slice(0, 5).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStart={handleStartTask}
                      onComplete={handleCompleteTask}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setIsFormOpen(true);
                      }}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="calendar">
            <CalendarView 
              tasks={tasks} 
              onTaskClick={(task) => {
                setEditingTask(task);
                setIsFormOpen(true);
              }}
            />
          </TabsContent>
          
          <TabsContent value="stats">
            <StatsView stats={stats} />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Task Form Dialog */}
      <TaskForm
        task={editingTask}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(undefined);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        procrastinationFactor={stats.averageProcrastination}
      />
    </div>
  );
}