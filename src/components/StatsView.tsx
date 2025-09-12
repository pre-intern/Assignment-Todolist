/**
 * Component StatsView - Hiển thị thống kê tổng quan về tasks
 * Bao gồm: tổng số task, task hoàn thành, task quá hạn, hệ số trì hoãn
 * Hiển thị biểu đồ giờ làm việc hiệu quả và phân bổ task theo danh mục
 */

import { TaskStats } from '@/types/task';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  BarChart3,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Props interface cho StatsView
interface StatsViewProps {
  stats: TaskStats; // Object chứa các thống kê
}

export function StatsView({ stats }: StatsViewProps) {
  const completionRate = stats.totalTasks > 0 
    ? (stats.completedTasks / stats.totalTasks) * 100 
    : 0;
    
  const procrastinationLevel = stats.averageProcrastination > 2 ? 'high' 
    : stats.averageProcrastination > 1.5 ? 'medium' 
    : 'low';
    
  const procrastinationColors = {
    low: 'text-success',
    medium: 'text-warning',
    high: 'text-destructive'
  };
  
  return (
    <div className="grid gap-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-card border-border/50">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{stats.totalTasks}</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Tasks</p>
        </Card>
        
        <Card className="p-6 bg-gradient-card border-border/50">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="text-2xl font-bold">{stats.completedTasks}</span>
          </div>
          <p className="text-sm text-muted-foreground">Completed</p>
          <Progress value={completionRate} className="mt-2 h-2" />
        </Card>
        
        <Card className="p-6 bg-gradient-card border-border/50">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-2xl font-bold">{stats.overdueTasks}</span>
          </div>
          <p className="text-sm text-muted-foreground">Overdue</p>
        </Card>
        
        <Card className="p-6 bg-gradient-card border-border/50">
          <div className="flex items-center justify-between mb-2">
            <Clock className={cn("h-5 w-5", procrastinationColors[procrastinationLevel])} />
            <span className="text-2xl font-bold">
              {Math.round((stats.averageProcrastination - 1) * 100)}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Procrastination Rate</p>
          <p className={cn("text-xs mt-1", procrastinationColors[procrastinationLevel])}>
            Tasks take {stats.averageProcrastination.toFixed(1)}x longer
          </p>
        </Card>
      </div>
      
      {/* Best Working Hours */}
      {stats.bestWorkingHours.length > 0 && (
        <Card className="p-6 bg-gradient-card border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Your Most Productive Hours</h3>
          </div>
          <div className="space-y-3">
            {stats.bestWorkingHours.map((hour) => {
              const hourLabel = hour.hour === 0 ? '12 AM' 
                : hour.hour < 12 ? `${hour.hour} AM` 
                : hour.hour === 12 ? '12 PM' 
                : `${hour.hour - 12} PM`;
                
              return (
                <div key={hour.hour} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-16">{hourLabel}</span>
                  <div className="flex-1">
                    <Progress 
                      value={(hour.productivity / Math.max(...stats.bestWorkingHours.map(h => h.productivity))) * 100} 
                      className="h-3"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {hour.productivity}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Based on your task completion history
          </p>
        </Card>
      )}
      
      {/* Category Breakdown */}
      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Tasks by Category</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
            <div key={category} className="text-center">
              <div className={cn(
                "rounded-lg p-3 mb-2",
                `bg-category-${category}/20`
              )}>
                <span className="text-2xl font-bold">{count}</span>
              </div>
              <p className="text-sm capitalize text-muted-foreground">{category}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}