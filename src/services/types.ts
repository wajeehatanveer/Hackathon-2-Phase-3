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

// Chat-related types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string; // ISO date string
  conversation_id?: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: number | null;
}

export interface ChatResponse {
  conversation_id: number;
  message: string;
  tool_calls?: Array<{
    tool: string;
    result: Record<string, any>;
  }> | null;
}

export interface Conversation {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export type ChatStatus = 'idle' | 'loading' | 'error' | 'connected';