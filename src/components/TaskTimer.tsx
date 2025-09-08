import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { formatTimeEstimate } from '@/lib/task-utils';
import { cn } from '@/lib/utils';

interface TaskTimerProps {
  taskId: string;
  taskTitle: string;
  estimatedMinutes: number;
  onTimeUpdate: (minutes: number) => void;
  onComplete: () => void;
}

export function TaskTimer({ taskTitle, estimatedMinutes, onTimeUpdate, onComplete }: TaskTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const minutes = Math.floor(seconds / 60);
  const progress = (minutes / estimatedMinutes) * 100;
  
  // Get color based on progress
  const getProgressColor = () => {
    if (progress < 75) return 'text-success';
    if (progress < 100) return 'text-warning';
    return 'text-destructive';
  };
  
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);
  
  useEffect(() => {
    // Update time every minute
    if (seconds > 0 && seconds % 60 === 0) {
      onTimeUpdate(minutes);
    }
  }, [seconds, minutes, onTimeUpdate]);
  
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
    onTimeUpdate(0);
  };
  
  const handleComplete = () => {
    setIsRunning(false);
    onTimeUpdate(minutes);
    onComplete();
  };
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="p-6 bg-gradient-card border-primary/50 shadow-glow">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Currently Working On</h3>
          <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {taskTitle}
          </p>
        </div>
        
        <div className="text-center">
          <div className={cn("text-5xl font-mono font-bold mb-2", getProgressColor())}>
            {formatTime(seconds)}
          </div>
          <p className="text-sm text-muted-foreground">
            Estimated: {formatTimeEstimate(estimatedMinutes)}
          </p>
          {progress > 100 && (
            <p className="text-sm text-warning mt-1">
              Running {Math.round(progress - 100)}% over estimate!
            </p>
          )}
        </div>
        
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "absolute top-0 left-0 h-full transition-all duration-500",
              progress < 75 && "bg-gradient-success",
              progress >= 75 && progress < 100 && "bg-gradient-warning",
              progress >= 100 && "bg-gradient-danger"
            )}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-center gap-2">
          <Button
            onClick={toggleTimer}
            size="lg"
            className={cn(
              "min-w-[120px]",
              isRunning ? "bg-warning hover:bg-warning/90" : "bg-gradient-primary hover:opacity-90"
            )}
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                {seconds > 0 ? 'Resume' : 'Start'}
              </>
            )}
          </Button>
          
          <Button
            onClick={resetTimer}
            size="lg"
            variant="outline"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset
          </Button>
          
          <Button
            onClick={handleComplete}
            size="lg"
            className="bg-gradient-success hover:opacity-90"
          >
            Complete Task
          </Button>
        </div>
      </div>
    </Card>
  );
}