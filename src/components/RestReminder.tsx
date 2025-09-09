import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Coffee, Activity, Heart, Brain, Sparkles } from 'lucide-react';

interface RestReminderProps {
  show: boolean;
  onClose: () => void;
}

const restAdvices = [
  {
    icon: Eye,
    title: "Rest Your Eyes",
    description: "Follow the 20-20-20 rule: Look at something 20 feet away for 20 seconds.",
    color: "text-blue-500"
  },
  {
    icon: Coffee,
    title: "Take a Water Break",
    description: "Hydrate yourself! Get up and drink a glass of water to refresh your mind.",
    color: "text-cyan-500"
  },
  {
    icon: Activity,
    title: "Stretch It Out",
    description: "Stand up, stretch your arms, neck, and back. Your body will thank you!",
    color: "text-green-500"
  },
  {
    icon: Heart,
    title: "Breathe Deeply",
    description: "Take 5 deep breaths. Inhale for 4 counts, hold for 4, exhale for 4.",
    color: "text-pink-500"
  },
  {
    icon: Brain,
    title: "Mental Reset",
    description: "Close your eyes for a minute and let your mind wander freely.",
    color: "text-purple-500"
  },
  {
    icon: Sparkles,
    title: "Quick Walk",
    description: "Take a 5-minute walk around your space to boost circulation and creativity.",
    color: "text-yellow-500"
  }
];

export function RestReminder({ show, onClose }: RestReminderProps) {
  const [currentAdvice, setCurrentAdvice] = useState(restAdvices[0]);
  
  useEffect(() => {
    if (show) {
      const randomAdvice = restAdvices[Math.floor(Math.random() * restAdvices.length)];
      setCurrentAdvice(randomAdvice);
    }
  }, [show]);
  
  const Icon = currentAdvice.icon;
  
  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-6 w-6 ${currentAdvice.color}`} />
            Time for a Break!
          </DialogTitle>
          <DialogDescription className="space-y-4 pt-4">
            <div className="p-4 bg-accent/50 rounded-lg">
              <h3 className="font-semibold mb-2">{currentAdvice.title}</h3>
              <p className="text-sm">{currentAdvice.description}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              You've been working hard for over an hour. Taking regular breaks helps maintain focus and productivity!
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Skip Break
          </Button>
          <Button onClick={onClose} className="bg-gradient-primary">
            I'll Take a Break!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}