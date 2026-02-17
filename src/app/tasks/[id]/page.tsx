'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task, UpdateTaskRequest } from '@/services/types';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { getAuthCookie } from '@/services/auth';

const EditTaskPage: React.FC = () => {
  const params = useParams();
  const taskId = parseInt(params.id as string, 10);

  // Get user ID from auth token
  const token = getAuthCookie();
  let userId = '';
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = parts[1];
        const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
        const decodedPayload = atob(paddedPayload);
        const userData = JSON.parse(decodedPayload);
        userId = userData.user_id || userData.sub || '';
      }
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  }

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<UpdateTaskRequest, 'tags'> & { tags: string }>({
    title: '',
    description: '',
    priority: 'medium',
    tags: '',
    due_date: '',
    recurrence: undefined,
    completed: false,
  });
  const [tagsPreview, setTagsPreview] = useState<string[]>([]);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    if (!taskId || !userId) return;

    try {
      setLoading(true);

      // Fetch task from API
      const fetchedTask = await api.getTask(userId, taskId);
      setTask(fetchedTask);

      // Convert tags array to string for form
      const tagsString = Array.isArray(fetchedTask.tags) ? fetchedTask.tags.join(', ') : fetchedTask.tags || '';

      setFormData({
        title: fetchedTask.title,
        description: fetchedTask.description || '',
        priority: fetchedTask.priority,
        tags: tagsString,
        due_date: fetchedTask.due_date || '',
        recurrence: fetchedTask.recurrence,
        completed: fetchedTask.completed,
      });

      // Set tags preview
      if (fetchedTask.tags && Array.isArray(fetchedTask.tags)) {
        setTagsPreview(fetchedTask.tags);
      }
    } catch (err: any) {
      console.error('Error loading task:', err);
      setError(err.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Update tags preview when tags field changes
    if (name === 'tags') {
      const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      setTagsPreview(tags);
    }
  };

  const handleSelectChange = (name: string, value: string): void => {
    if (name === 'recurrence' && value === 'none') {
      setFormData(prev => ({ ...prev, [name]: undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value as any }));
    }
  };

  const handleToggleComplete = () => {
    setFormData(prev => ({ ...prev, completed: !prev.completed }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert tags string to array
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      // Update the task via API
      const taskData = {
        title: formData.title,
        description: formData.description || undefined,
        completed: formData.completed,
        priority: formData.priority,
        tags: tagsArray,
        due_date: formData.due_date || undefined,
        recurrence: formData.recurrence,
      };

      await api.updateTask(userId, taskId, taskData);

      // Redirect to tasks list after successful update
      window.location.href = '/tasks';
    } catch (err: any) {
      console.error('Error updating task:', err);
      setError(err.message || 'Failed to update task');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/tasks';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="p-6 bg-destructive/10 text-destructive rounded-lg max-w-md text-center">
          <p>Error: {error}</p>
          <Button onClick={loadTask} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="p-4 text-gray-700">Task not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link href="/tasks" className="text-primary hover:underline flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Tasks
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Edit Task</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Task title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Task description (optional)"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleSelectChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      name="due_date"
                      type="datetime-local"
                      value={formData.due_date}
                      onChange={handleChange}
                      placeholder="Select due date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex items-center pt-2">
                      <input
                        type="checkbox"
                        id="completed"
                        checked={formData.completed}
                        onChange={handleToggleComplete}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="completed" className="ml-2 text-sm font-medium">
                        Mark as completed
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="work, personal, urgent"
                  />

                  {/* Tags Preview */}
                  {tagsPreview.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tagsPreview.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurrence">Recurrence</Label>
                  <Select
                    value={formData.recurrence || 'none'}
                    onValueChange={(value) => handleSelectChange('recurrence', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 mr-2 border-t-2 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Task'
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditTaskPage;