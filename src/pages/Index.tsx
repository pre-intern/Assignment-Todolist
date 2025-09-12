import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task } from '@/types/task';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { TaskTimer } from '@/components/TaskTimer';
import { CalendarView } from '@/components/CalendarView';
import { StatsView } from '@/components/StatsView';
import { RestReminder } from '@/components/RestReminder';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { sortTasksByUrgency } from '@/lib/task-utils';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { 
  Brain,
  Calendar,
  BarChart3,
  ListTodo,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { Congratulations } from '@/components/Congratulations';
import { 
  WORK_SESSION, 
  UI_CONFIG, 
  ROUTES,
  TIME 
} from '@/config/constants';
import { 
  SUCCESS_MESSAGES, 
  INFO_MESSAGES, 
  LABELS 
} from '@/config/messages';

// Component chính - Trang quản lý tasks
export default function Index() {
  const navigate = useNavigate();
  // Hooks xác thực và quản lý tasks
  const { user, signOut } = useAuth();
  const { tasks, stats, loading, loadTasks, createTask, updateTask, deleteTask } = useTasks(!!user);
  
  // States quản lý UI
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'focus' | 'calendar' | 'stats'>('focus');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [activeTimer, setActiveTimer] = useState<Task | undefined>();
  const [showCongrats, setShowCongrats] = useState(false);
  const [showRestReminder, setShowRestReminder] = useState(false);
  const workStartTimeRef = useRef<number | null>(null);
  const taskCountRef = useRef<number>(0);

  // Load tasks khi component mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Xử lý bắt đầu task
  const handleStartTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      // Cập nhật trạng thái task trong database
      const updated = await updateTask(id, { status: 'in-progress' });
      if (updated) {
        setActiveTimer(updated);
        
        // Theo dõi thời gian làm việc để nhắc nghỉ
        if (!workStartTimeRef.current) {
          workStartTimeRef.current = Date.now();
        }
        taskCountRef.current++;
        
        // Kiểm tra xem người dùng đã làm việc quá lâu chưa
        setTimeout(() => {
          const workDuration = Date.now() - (workStartTimeRef.current || Date.now());
          if (workDuration > WORK_SESSION.REST_REMINDER_AFTER && taskCountRef.current >= WORK_SESSION.MIN_TASKS_FOR_REST) {
            setShowRestReminder(true);
            workStartTimeRef.current = null;
            taskCountRef.current = 0;
          }
        }, WORK_SESSION.REST_REMINDER_AFTER);
        
        toast.success(SUCCESS_MESSAGES.TIMER_STARTED);
      }
    }
  };

  // Xử lý hoàn thành task
  const handleCompleteTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const actualMinutes = activeTimer?.id === id ? 0 : task.actualMinutes || task.estimatedMinutes;
      // Cập nhật task hoàn thành trong database
      const updated = await updateTask(id, { 
        status: 'completed',
        completedAt: new Date().toISOString(),
        actualMinutes
      });
      if (updated) {
        if (activeTimer?.id === id) {
          setActiveTimer(undefined);
        }
        setShowCongrats(true);
        toast.success(SUCCESS_MESSAGES.TASK_COMPLETED);
      }
    }
  };

  // Cập nhật thời gian thực tế khi timer chạy
  const handleTimerUpdate = async (minutes: number) => {
    if (activeTimer) {
      await updateTask(activeTimer.id, { actualMinutes: minutes });
    }
  };

  // Xử lý khi timer hoàn thành
  const handleTimerComplete = () => {
    if (activeTimer) {
      handleCompleteTask(activeTimer.id);
    }
  };

  // Xử lý đăng xuất
  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.AUTH);
  };

  // Lọc tasks theo từ khóa tìm kiếm
  const filteredTasks = tasks.filter(task => {
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.category.includes(query) ||
      task.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // Sắp xếp tasks theo độ ưu tiên cho chế độ focus
  const sortedTasks = sortTasksByUrgency(filteredTasks.filter(t => t.status !== 'completed'));
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">{INFO_MESSAGES.LOADING_TASKS}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewTask={() => {
          setEditingTask(undefined);
          setIsFormOpen(true);
        }}
        onSignOut={handleSignOut}
      />
      
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
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'focus' | 'calendar' | 'stats')}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="focus" className="gap-2">
              <Zap className="h-4 w-4" />
              {LABELS.FOCUS_MODE}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              {LABELS.CALENDAR}
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {LABELS.ANALYTICS}
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
                {stats.averageProcrastination > UI_CONFIG.HIGH_PROCRASTINATION_THRESHOLD && (
                  <Badge variant="secondary" className="bg-warning text-warning-foreground">
                    {LABELS.HIGH_PROCRASTINATION_WARNING}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Active Tasks */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{LABELS.ACTIVE_TASKS}</h2>
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
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">{INFO_MESSAGES.NO_ACTIVE_TASKS}</p>
                  <Button 
                    onClick={() => setIsFormOpen(true)}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    {INFO_MESSAGES.CREATE_FIRST_TASK}
                  </Button>
                </div>
              )}
            </div>
            
            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-muted-foreground">{LABELS.COMPLETED}</h2>
                <div className="grid gap-4 opacity-60">
                  {completedTasks.slice(0, UI_CONFIG.MAX_COMPLETED_TASKS_SHOWN).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStart={handleStartTask}
                      onComplete={handleCompleteTask}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setIsFormOpen(true);
                      }}
                      onDelete={deleteTask}
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
        onSubmit={editingTask ? (task) => updateTask(task.id, task) : createTask}
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