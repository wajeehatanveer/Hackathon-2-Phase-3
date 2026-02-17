'use client';

import React, { useState } from 'react';
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
import { CreateTaskRequest } from '@/services/types';
import { api } from '@/services/api';
import { getAuthCookie } from '@/services/auth';

const CreateTaskPage: React.FC = () => {
  const [formData, setFormData] = useState<Omit<CreateTaskRequest, 'tags'> & { tags: string }>({
    title: '',
    description: '',
    priority: 'medium',
    tags: '',
    due_date: '',
    recurrence: 'none' as any,
    completed: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagsPreview, setTagsPreview] = useState<string[]>([]);

  // Use a mock user ID
  const userId = 'user1';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Update tags preview when tags field changes
    if (name === 'tags') {
      const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
      setTagsPreview(tags);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert tags string to array
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

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

      if (!userId) {
        setError('User not authenticated');
        return;
      }

      // Create the task via API
      const taskData = {
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
        tags: tagsArray,
        due_date: formData.due_date || undefined,
        recurrence: formData.recurrence,
      };

      await api.createTask(userId, taskData);

      // Redirect to tasks list after successful creation
      window.location.href = '/tasks';
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/tasks';
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link href="/tasks" className="text-indigo-700 hover:text-indigo-900 flex items-center font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Tasks
            </Link>
          </div>

          <Card className="glass-card rounded-2xl border-0 overflow-hidden backdrop-blur-sm border-white/20">
            <CardHeader className="pt-6 px-6">
              <CardTitle className="text-2xl font-bold text-gray-900">Create New Task</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 text-red-700 rounded-lg backdrop-blur-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Task title"
                    className="py-5 px-4 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all input-focus"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Task description (optional)"
                    rows={3}
                    className="py-3 px-4 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all input-focus"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-gray-700">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleSelectChange('priority', value)}
                    >
                      <SelectTrigger className="py-3 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-focus">
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
                    <Label htmlFor="due_date" className="text-gray-700">Due Date</Label>
                    <Input
                      id="due_date"
                      name="due_date"
                      type="datetime-local"
                      value={formData.due_date}
                      onChange={handleChange}
                      placeholder="Select due date"
                      className="py-3 px-4 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all input-focus"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-gray-700">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="work, personal, urgent"
                    className="py-3 px-4 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all input-focus"
                  />

                  {/* Tags Preview */}
                  {tagsPreview.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tagsPreview.map((tag, index) => (
                        <Badge key={index} className="bg-indigo-500/20 text-indigo-800 hover:bg-indigo-500/30 backdrop-blur-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurrence" className="text-gray-700">Recurrence</Label>
                  <Select
                    value={formData.recurrence || 'none'}
                    onValueChange={(value) => handleSelectChange('recurrence', value)}
                  >
                    <SelectTrigger className="py-3 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-focus">
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
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-6 btn-gradient text-white rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 mr-2 border-t-2 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Task'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1 py-6 border-white/30 text-gray-700 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                  >
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

export default CreateTaskPage;