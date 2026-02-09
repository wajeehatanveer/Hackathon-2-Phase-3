// frontend/src/services/types.ts

export interface User {
  id: string;
  email: string;
  created_at: string; // ISO date string
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  user_id: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  priority: 'low' | 'medium' | 'high'; // Task priority
  tags?: string[]; // Array of tags
  due_date?: string; // ISO date string for due date
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly'; // Recurrence pattern
}

// Authentication request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

// Frontend-only types for local state management
export interface CreateTaskRequest {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  due_date?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  due_date?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}