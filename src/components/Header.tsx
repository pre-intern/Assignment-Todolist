import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Search, Plus, LogOut, User } from 'lucide-react';
import { APP_NAME, APP_TAGLINE, UI_CONFIG, ROUTES } from '@/config/constants';
import { LABELS } from '@/config/messages';

interface HeaderProps {
  user: any;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewTask: () => void;
  onSignOut: () => void;
}

export function Header({ user, searchQuery, onSearchChange, onNewTask, onSignOut }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                {APP_NAME}
              </h1>
              <p className="text-xs text-muted-foreground">{APP_TAGLINE}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`pl-9 ${UI_CONFIG.SEARCH_INPUT_WIDTH} bg-input`}
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
                  onClick={onSignOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline"
                className="border-blue-500/50 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                onClick={() => navigate(ROUTES.AUTH)}
              >
                <User className="h-4 w-4 mr-2" />
                {LABELS.LOGIN_SIGNUP}
              </Button>
            )}
            
            <Button 
              onClick={onNewTask}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              {LABELS.NEW_TASK}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}