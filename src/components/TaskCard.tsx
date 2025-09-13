/**
 * Component TaskCard - Hiển thị thông tin chi tiết của một task
 * Bao gồm: tiêu đề, danh mục, độ ưu tiên, deadline, tiến độ và các nút hành động
 * Có animation cảnh báo cho task quá hạn
 */

import { useState, useEffect } from 'react';
import { Task, TaskCategory, TaskPriority } from '@/types/task';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Calendar, 
  ChevronRight, 
  Play, 
  CheckCircle2,
  AlertCircle,
  Timer,
  Trash2,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDeadline, formatTimeEstimate, getDeadlineStatus, getTaskProgress } from '@/lib/task-utils';

// Props interface cho TaskCard component
interface TaskCardProps {
  task: Task; // Dữ liệu task cần hiển thị
  onStart: (id: string) => void; // Callback khi bắt đầu task
  onComplete: (id: string) => void; // Callback khi hoàn thành task
  onEdit: (task: Task) => void; // Callback khi chỉnh sửa task
  onDelete: (id: string) => void; // Callback khi xóa task
}

export function TaskCard({ task, onStart, onComplete, onEdit, onDelete }: TaskCardProps) {
  // State quản lý mở rộng/thu gọn card
  const [isExpanded, setIsExpanded] = useState(false);
  // State quản lý animation cảnh báo
  const [alertAnimation, setAlertAnimation] = useState('');
  // Lấy trạng thái deadline (safe/warning/danger/overdue)
  const deadlineStatus = getDeadlineStatus(task.deadline);
  // Tính tiến độ task dựa trên thời gian thực tế
  const progress = getTaskProgress(task);
  // Kiểm tra task có quá hạn không
  const isOverdue = deadlineStatus === 'overdue' && task.status !== 'completed';
  
  // Effect xử lý animation cho task quá hạn
  useEffect(() => {
    if (isOverdue && task.status === 'todo') {
      // Task quá hạn chưa bắt đầu: animation bounce mạnh để thu hút chú ý
      setAlertAnimation('animate-bounce');
    } else if (isOverdue && task.status === 'in-progress') {
      // Task quá hạn đang làm: animation pulse nhẹ nhàng hơn
      setAlertAnimation('animate-pulse');
    } else if (task.status === 'completed' && deadlineStatus === 'overdue') {
      // Task đã hoàn thành (dù quá hạn): không cần animation
      setAlertAnimation('');
    }
  }, [isOverdue, task.status, deadlineStatus]);
  
  // Màu sắc cho từng danh mục task
  const categoryColors: Record<TaskCategory, string> = {
    class: 'bg-blue-500/10 text-blue-500',
    project: 'bg-purple-500/10 text-purple-500',
    work: 'bg-green-500/10 text-green-500',
    personal: 'bg-pink-500/10 text-pink-500',
    'self-care': 'bg-yellow-500/10 text-yellow-500',
    'pet-care': 'bg-teal-500/10 text-teal-500',
    housework: 'bg-orange-500/10 text-orange-500',
    'health-care': 'bg-red-500/10 text-red-500',
    fitness: 'bg-emerald-500/10 text-emerald-500',
    shopping: 'bg-violet-500/10 text-violet-500',
    workshop: 'bg-cyan-500/10 text-cyan-500',
    finance: 'bg-amber-500/10 text-amber-500',
    learning: 'bg-indigo-500/10 text-indigo-500',
    relax: 'bg-lime-500/10 text-lime-500',
  };
  
  // Màu sắc cho từng mức độ ưu tiên
  const priorityColors: Record<TaskPriority, string> = {
    critical: 'bg-priority-critical',
    high: 'bg-priority-high',
    medium: 'bg-priority-medium',
    low: 'bg-priority-low',
  };
  
  // Màu sắc text theo trạng thái deadline
  const deadlineColors = {
    safe: 'text-muted-foreground', // Còn nhiều thời gian
    warning: 'text-warning', // Sắp đến hạn
    danger: 'text-destructive', // Rất gần deadline
    overdue: 'text-destructive font-bold', // Đã quá hạn
  };
  
  return (
    <div className="relative">
      {/* Icon cảnh báo cho task quá hạn chưa bắt đầu */}
      {isOverdue && task.status === 'todo' && (
        <div className={cn(
          "absolute -top-2 -right-2 z-10",
          alertAnimation
        )}>
          <div className="relative">
            <AlertTriangle className="h-6 w-6 text-destructive fill-destructive/20" />
            <div className="absolute inset-0 animate-ping">
              <AlertTriangle className="h-6 w-6 text-destructive opacity-75" />
            </div>
          </div>
        </div>
      )}
      
      {/* Card chính chứa thông tin task */}
      <Card className={cn(
        'p-4 transition-all duration-300 hover:shadow-lg relative overflow-hidden',
        'bg-gradient-card border-border/50',
        deadlineStatus === 'danger' && 'border-warning/50', // Viền vàng khi sắp hết hạn
        isOverdue && task.status === 'todo' && 'border-destructive shadow-destructive/20 shadow-lg', // Viền đỏ + shadow cho task quá hạn
        isOverdue && task.status === 'in-progress' && 'border-warning', // Viền cảnh báo cho task đang làm quá hạn
        task.status === 'completed' && deadlineStatus === 'overdue' && 'bg-destructive/5 border-destructive/30', // Nền nhạt cho task hoàn thành muộn
        task.status === 'completed' && deadlineStatus !== 'overdue' && 'opacity-75', // Làm mờ task đã hoàn thành
        alertAnimation // Thêm animation nếu có
      )}>
        {/* Overlay gradient cho task đang làm quá hạn */}
        {isOverdue && task.status === 'in-progress' && (
          <div 
            className="absolute inset-0 bg-gradient-to-r from-warning/10 to-transparent transition-all duration-500"
            style={{ width: `${100 - progress}%` }}
          />
        )}
      <div className="space-y-3">
        {/* Phần header với tiêu đề và badges */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {/* Tiêu đề task - gạch ngang nếu đã hoàn thành */}
              <h3 className={cn(
                "font-semibold text-lg",
                task.status === 'completed' && 'line-through text-muted-foreground'
              )}>
                {task.title}
              </h3>
              {/* Badge "In Progress" với animation pulse */}
              {task.status === 'in-progress' && (
                <Badge variant="default" className="bg-accent text-accent-foreground animate-pulse">
                  In Progress
                </Badge>
              )}
            </div>
            
            {/* Hiển thị các badges: danh mục, độ ưu tiên, tags */}
            <div className="flex flex-wrap gap-2">
              {/* Badge danh mục với màu tương ứng */}
              <Badge 
                variant="secondary" 
                className={cn('text-white', categoryColors[task.category])}
              >
                {task.category}
              </Badge>
              {/* Badge độ ưu tiên với màu tương ứng */}
              <Badge 
                variant="secondary"
                className={cn('text-white', priorityColors[task.priority])}
              >
                {task.priority}
              </Badge>
              {/* Hiển thị danh sách tags */}
              {task.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Nút mở rộng/thu gọn card */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2"
          >
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-90" // Xoay 90 độ khi mở rộng
            )} />
          </Button>
        </div>
        
        {/* Phần hiển thị thông tin thời gian */}
        <div className="flex items-center gap-4 text-sm">
          {/* Thời gian ước tính */}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Est: {formatTimeEstimate(task.estimatedMinutes)}
            </span>
            {/* Hiển thị thời gian thực tế dự kiến dựa trên hệ số trì hoãn */}
            {task.procrastinationFactor && task.procrastinationFactor > 1 && (
              <span className="text-warning text-xs">
                (Actually: {formatTimeEstimate(Math.round(task.estimatedMinutes * task.procrastinationFactor))})
              </span>
            )}
          </div>
          
          {/* Deadline với màu sắc tương ứng trạng thái */}
          <div className={cn("flex items-center gap-1", deadlineColors[deadlineStatus])}>
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{formatDeadline(task.deadline)}</span>
            {deadlineStatus === 'overdue' && <AlertCircle className="h-4 w-4" />}
          </div>
        </div>
        
        {/* Thanh tiến độ cho task đang thực hiện */}
        {task.status === 'in-progress' && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {/* Nội dung mở rộng khi click vào nút expand */}
        {isExpanded && (
          <div className="pt-3 space-y-3 border-t border-border/50">
            {/* Mô tả chi tiết của task */}
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}
            
            {/* Thời gian thực tế đã làm */}
            {task.actualMinutes && (
              <div className="flex items-center gap-2 text-sm">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span>Actual time: {formatTimeEstimate(task.actualMinutes)}</span>
                {/* Hiển thị % chênh lệch so với ước tính */}
                {task.procrastinationFactor && (
                  <Badge variant="outline" className="text-xs">
                    {Math.round((task.procrastinationFactor - 1) * 100)}% longer than estimated
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Các nút hành động */}
        <div className="flex items-center gap-2 pt-2">
          {/* Nút Start - chỉ hiện khi task ở trạng thái todo */}
          {task.status === 'todo' && (
            <Button
              size="sm"
              onClick={() => onStart(task.id)}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          )}
          
          {/* Nút Complete - chỉ hiện khi task đang thực hiện */}
          {task.status === 'in-progress' && (
            <Button
              size="sm"
              onClick={() => onComplete(task.id)}
              className="bg-gradient-success hover:opacity-90"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Complete
            </Button>
          )}
          
          {/* Nút Edit - luôn hiển thị */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(task)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          
          {/* Nút Delete - luôn hiển thị */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(task.id)}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
    </div>
  );
}