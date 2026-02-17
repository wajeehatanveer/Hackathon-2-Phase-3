import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/services/types';
import {
  Flag,
  Calendar,
  Repeat2 as RepeatIcon,
  Pencil,
  Trash2
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete
}) => {
  // Function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-red-500';
      case 'medium': return 'border-l-4 border-l-orange-500';
      case 'low': return 'border-l-4 border-l-blue-500';
      default: return 'border-l-4 border-l-gray-500';
    }
  };

  // Function to get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Flag className="h-4 w-4 text-red-500" />;
      case 'medium': return <Flag className="h-4 w-4 text-orange-500" />;
      case 'low': return <Flag className="h-4 w-4 text-blue-500" />;
      default: return <Flag className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="group">
      <Card className={`${getPriorityColor(task.priority)} task-card glass-card transition-all duration-300 border-0 backdrop-blur-sm border-white/20 ${task.completed ? 'completed-task' : ''}`}>
        <CardContent className="p-5">
          <div className="flex items-start space-x-4">
            <div className="pt-1">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleComplete(task.id)}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-indigo-500 data-[state=checked]:to-purple-500 data-[state=checked]:text-primary-foreground w-5 h-5 border-2"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {task.title}
                </h3>

                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {task.recurrence && task.recurrence !== 'none' && (
                    <RepeatIcon className="h-4 w-4 text-gray-500" />
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(task.id)}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-indigo-600 hover:bg-white/30 rounded-full transition-all"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(task.id)}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-red-600 hover:bg-white/30 rounded-full transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {task.description && (
                <p className={`mt-2 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-600'}`}>
                  {task.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center text-xs text-gray-600 bg-white/40 backdrop-blur-sm px-2 py-1 rounded-full">
                  {getPriorityIcon(task.priority)}
                  <span className="ml-1 capitalize font-medium">{task.priority}</span>
                </div>

                {task.due_date && (
                  <div className="flex items-center text-xs text-gray-600 bg-white/40 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                )}

                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag, index) => (
                      <Badge key={index} className="bg-indigo-500/20 text-indigo-800 text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};