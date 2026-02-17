// frontend/src/components/TaskForm.tsx
import React, { useState, useEffect } from 'react';
import Input from './Input';
import Button from './Button';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/services/types';

interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: CreateTaskRequest | UpdateTaskRequest) => void;
  onCancel: () => void;
  submitButtonText?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  submitButtonText = task ? 'Update Task' : 'Create Task'
}) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    completed: task?.completed || false,
    priority: task?.priority || 'medium',
    tags: Array.isArray(task?.tags) ? task.tags.join(', ') : (task?.tags || ''),
    due_date: task?.due_date || '',
    recurrence: task?.recurrence || undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        completed: task.completed || false,
        priority: task.priority || 'medium',
        tags: Array.isArray(task.tags) ? task.tags.join(', ') : task.tags || '',
        due_date: task.due_date || '',
        recurrence: task.recurrence || undefined,
      });
    }
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Convert tags string to array
      const tagsArray = formData.tags
        ? formData.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
        : [];

      // Use recurrence value as is for mock API
      const recurrence = formData.recurrence || undefined;

      const taskData: any = {
        title: formData.title,
        description: formData.description || undefined,
        completed: formData.completed,
        priority: formData.priority as 'low' | 'medium' | 'high',
        tags: tagsArray,
        recurrence: recurrence as 'none' | 'daily' | 'weekly' | 'monthly',
      };

      // Only include due_date if it has a value
      if (formData.due_date) {
        taskData.due_date = formData.due_date;
      }

      // Remove undefined values
      Object.keys(taskData).forEach(key => 
        taskData[key] === undefined && delete taskData[key]
      );

      onSubmit(taskData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <Input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Task title"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Task description (optional)"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <Input
            id="tags"
            name="tags"
            type="text"
            value={formData.tags}
            onChange={handleChange}
            placeholder="work, personal, urgent"
          />
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            id="due_date"
            name="due_date"
            type="datetime-local"
            value={formData.due_date}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Recurrence */}
        <div>
          <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700 mb-1">
            Recurrence
          </label>
          <select
            id="recurrence"
            name="recurrence"
            value={formData.recurrence}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="completed"
          name="completed"
          type="checkbox"
          checked={formData.completed}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="completed" className="ml-2 block text-sm text-gray-900">
          Mark as completed
        </label>
      </div>

      <div className="flex space-x-4">
        <Button type="submit">
          {submitButtonText}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;