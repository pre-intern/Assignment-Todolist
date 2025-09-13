/**
 * Component TaskForm - Form tạo mới hoặc chỉnh sửa task
 * Cho phép người dùng nhập thông tin task: tiêu đề, mô tả, danh mục, độ ưu tiên, thời gian, deadline, tags
 * Tự động tính toán thời gian thực tế dựa trên hệ số trì hoãn
 */

import { useState } from 'react';
import { Task, TaskCategory, TaskPriority, TaskTag } from '@/types/task';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { generateTaskId } from '@/lib/task-utils';

// Props interface cho TaskForm
interface TaskFormProps {
  task?: Task; // Task cần edit (optional - nếu không có thì là tạo mới)
  open: boolean; // Trạng thái mở/đóng dialog
  onClose: () => void; // Callback đóng form
  onSubmit: (task: Task) => void; // Callback submit form
  procrastinationFactor: number; // Hệ số trì hoãn để tính thời gian thực tế
}

export function TaskForm({ task, open, onClose, onSubmit, procrastinationFactor }: TaskFormProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: task?.title || '',
    description: task?.description || '',
    category: task?.category || 'class',
    priority: task?.priority || 'medium',
    estimatedMinutes: task?.estimatedMinutes || 30,
    deadline: task?.deadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    tags: task?.tags || [],
    status: task?.status || 'todo',
  });
  
  const [tagInput, setTagInput] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask: Task = {
      id: task?.id || generateTaskId(),
      title: formData.title!,
      description: formData.description,
      category: formData.category as TaskCategory,
      priority: formData.priority as TaskPriority,
      estimatedMinutes: formData.estimatedMinutes!,
      deadline: formData.deadline!,
      tags: formData.tags!,
      status: formData.status || 'todo',
      createdAt: task?.createdAt || new Date().toISOString(),
      procrastinationFactor: task?.procrastinationFactor || procrastinationFactor,
    };
    
    onSubmit(newTask);
    onClose();
  };
  
  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };
  
  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || []
    });
  };
  
  const realisticTime = Math.round((formData.estimatedMinutes || 0) * procrastinationFactor);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card" aria-describedby="task-form-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <p id="task-form-description" className="sr-only">
            Form to {task ? 'edit an existing' : 'create a new'} task
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Complete calculus assignment"
              required
              className="bg-input border-border"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details..."
              rows={3}
              className="bg-input border-border"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as TaskCategory })}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="self-care">Self Care</SelectItem>
                  <SelectItem value="house-care">House Care</SelectItem>
                  <SelectItem value="pet-care">Pet Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated">Estimated Time (minutes)</Label>
              <Input
                id="estimated"
                type="number"
                min="5"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) })}
                required
                className="bg-input border-border"
              />
              {procrastinationFactor > 1.1 && (
                <p className="text-xs text-warning">
                  Realistic time: ~{realisticTime} minutes
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
                className="bg-input border-border"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="space-y-2">
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !formData.tags?.includes(value)) {
                    setFormData({
                      ...formData,
                      tags: [...(formData.tags || []), value]
                    });
                  }
                }}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select tags..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="study">Study</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="housework">Housework</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="must-do">Must Do</SelectItem>
                  <SelectItem value="chill">Chill</SelectItem>
                  <SelectItem value="big-goal">Big Goal</SelectItem>
                  <SelectItem value="self-care">Self Care</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Or add custom tag..."
                  className="bg-input border-border"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary hover:opacity-90">
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}