import { useEffect, useState } from 'react';
import { CheckCircle2, Trophy, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CongratulationsProps {
  show: boolean;
  onClose: () => void;
}

export function Congratulations({ show, onClose }: CongratulationsProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
      "transition-all duration-300",
      isVisible ? "opacity-100" : "opacity-0"
    )}>
      <div className={cn(
        "relative bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20",
        "border-2 border-green-500/50 rounded-3xl p-12",
        "transform transition-all duration-500",
        isVisible ? "scale-100 rotate-0" : "scale-0 rotate-12"
      )}>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Trophy className="h-20 w-20 text-yellow-500 animate-bounce" />
            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400 animate-pulse" />
            <Star className="absolute -bottom-2 -left-2 h-6 w-6 text-yellow-400 animate-pulse" />
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Congratulations! 🎉
          </h2>
          
          <p className="text-lg text-muted-foreground">
            Task completed successfully!
          </p>
          
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <span className="text-sm text-green-500 font-medium">
              Keep up the great work!
            </span>
          </div>
        </div>
        
        <div className="absolute inset-0 -z-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute h-2 w-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400",
                "animate-ping"
              )}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}