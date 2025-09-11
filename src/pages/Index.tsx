import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskStats } from '@/types/task';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { TaskTimer } from '@/components/TaskTimer';
import { CalendarView } from '@/components/CalendarView';
import { StatsView } from '@/components/StatsView';
import { RestReminder } from '@/components/RestReminder';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/lib/storage';
import { supabaseTasks } from '@/lib/supabase-tasks';
import { sortTasksByUrgency } from '@/lib/task-utils';
import { 
  Plus, 
  Search, 
  Brain,
  Calendar,
  BarChart3,
  ListTodo,
  Zap,
  LogOut,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { Congratulations } from '@/components/Congratulations';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export default function Index() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'focus' | 'calendar' | 'stats'>('focus');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [activeTimer, setActiveTimer] = useState<Task | undefined>();
  const [showCongrats, setShowCongrats] = useState(false);
  const [showRestReminder, setShowRestReminder] = useState(false);
  const [loading, setLoading] = useState(true);
  const workStartTimeRef = useRef<number | null>(null);
  const taskCountRef = useRef<number>(0);
  
  // Setup auth listener and load tasks
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Reload tasks when auth state changes
        if (session) {
          loadTasks();
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      loadTasks();
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const loadTasks = async () => {
    setLoading(true);
    try {
      const loadedTasks = await supabaseTasks.getTasks();
      setTasks(loadedTasks);
      await updateStats();
    } catch (error) {
      // Fallback to localStorage if not authenticated
      const localTasks = storage.getTasks();
      setTasks(localTasks);
      const localStats = storage.updateStats(localTasks);
      setStats(localStats);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async () => {
    const newStats = await supabaseTasks.getStats();
    setStats(newStats);
  };
  
  const handleCreateTask = async (task: Task) => {
    const newTask = await supabaseTasks.addTask(task);
    if (newTask) {
      setTasks([...tasks, newTask]);
      await updateStats();
      toast.success('Task created successfully!');
    } else {
      // Fallback to localStorage
      const localTask = storage.addTask(task);
      setTasks([...tasks, localTask]);
      const localStats = storage.updateStats([...tasks, localTask]);
      setStats(localStats);
      toast.success('Task created (locally)!');
    }
  };
  
  const handleUpdateTask = async (task: Task) => {
    const updated = await supabaseTasks.updateTask(task.id, task);
    if (updated) {
      const updatedTasks = tasks.map(t => t.id === task.id ? updated : t);
      setTasks(updatedTasks);
      await updateStats();
      toast.success('Task updated!');
    } else {
      // Fallback to localStorage
      const localUpdated = storage.updateTask(task.id, task);
      if (localUpdated) {
        const updatedTasks = tasks.map(t => t.id === task.id ? localUpdated : t);
        setTasks(updatedTasks);
        const localStats = storage.updateStats(updatedTasks);
        setStats(localStats);
        toast.success('Task updated (locally)!');
      }
    }
  };
  
  const handleDeleteTask = async (id: string) => {
    const success = await supabaseTasks.deleteTask(id);
    if (success) {
      const updatedTasks = tasks.filter(t => t.id !== id);
      setTasks(updatedTasks);
      await updateStats();
      toast.success('Task deleted');
    } else {
      // Fallback to localStorage
      const localUpdatedTasks = storage.deleteTask(id);
      setTasks(localUpdatedTasks);
      const localStats = storage.updateStats(localUpdatedTasks);
      setStats(localStats);
      toast.success('Task deleted (locally)');
    }
  };
  
  const handleStartTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const updated = await supabaseTasks.updateTask(id, { status: 'in-progress' });
      if (updated) {
        const updatedTasks = tasks.map(t => t.id === id ? updated : t);
        setTasks(updatedTasks);
        setActiveTimer(updated);
        
        // Track work session for rest reminders
        if (!workStartTimeRef.current) {
          workStartTimeRef.current = Date.now();
        }
        taskCountRef.current++;
        
        // Check if user has been working for more than an hour
        setTimeout(() => {
          const workDuration = Date.now() - (workStartTimeRef.current || Date.now());
          if (workDuration > 60 * 60 * 1000 && taskCountRef.current >= 1) {
            setShowRestReminder(true);
            workStartTimeRef.current = null;
            taskCountRef.current = 0;
          }
        }, 60 * 60 * 1000); // Check after 1 hour
        
        toast.success('Timer started!');
      } else {
        // Fallback to localStorage
        const localUpdated = storage.updateTask(id, { status: 'in-progress' });
        if (localUpdated) {
          const updatedTasks = tasks.map(t => t.id === id ? localUpdated : t);
          setTasks(updatedTasks);
          setActiveTimer(localUpdated);
          
          // Track work session for rest reminders
          if (!workStartTimeRef.current) {
            workStartTimeRef.current = Date.now();
          }
          taskCountRef.current++;
          
          // Check if user has been working for more than an hour
          setTimeout(() => {
            const workDuration = Date.now() - (workStartTimeRef.current || Date.now());
            if (workDuration > 60 * 60 * 1000 && taskCountRef.current >= 1) {
              setShowRestReminder(true);
              workStartTimeRef.current = null;
              taskCountRef.current = 0;
            }
          }, 60 * 60 * 1000); // Check after 1 hour
          
          toast.success('Timer started!');
        }
      }
    }
  };
  
  const handleCompleteTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const actualMinutes = activeTimer?.id === id ? 0 : task.actualMinutes || task.estimatedMinutes;
      const updated = await supabaseTasks.updateTask(id, { 
        status: 'completed',
        completedAt: new Date().toISOString(),
        actualMinutes
      });
      if (updated) {
        const updatedTasks = tasks.map(t => t.id === id ? updated : t);
        setTasks(updatedTasks);
        await updateStats();
        if (activeTimer?.id === id) {
          setActiveTimer(undefined);
        }
        setShowCongrats(true);
        toast.success('Task completed! 🎉');
      } else {
        // Fallback to localStorage
        const localUpdated = storage.updateTask(id, { 
          status: 'completed',
          completedAt: new Date().toISOString(),
          actualMinutes
        });
        if (localUpdated) {
          const updatedTasks = tasks.map(t => t.id === id ? localUpdated : t);
          setTasks(updatedTasks);
          const localStats = storage.updateStats(updatedTasks);
          setStats(localStats);
          if (activeTimer?.id === id) {
            setActiveTimer(undefined);
          }
          setShowCongrats(true);
          toast.success('Task completed! 🎉');
        }
      }
    }
  };
  
  const handleTimerUpdate = async (minutes: number) => {
    if (activeTimer) {
      await supabaseTasks.updateTask(activeTimer.id, { actualMinutes: minutes });
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
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }
  
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
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  Study Flow
                </h1>
                <p className="text-xs text-muted-foreground">Beat procrastination, achieve your goals</p>
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
              
              {user ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <User className="h-3 w-3" />
                    {user.email?.split('@')[0]}
                  </Badge>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      navigate('/auth');
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline"
                  className="border-blue-500/50 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                  onClick={() => navigate('/auth')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Login / Sign Up
                </Button>
              )}
              
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
      
      {/* Congratulations Modal */}
      <Congratulations 
        show={showCongrats} 
        onClose={() => setShowCongrats(false)} 
      />
      
      {/* Rest Reminder Dialog */}
      <RestReminder
        show={showRestReminder}
        onClose={() => setShowRestReminder(false)}
      />
    </div>
  );
}