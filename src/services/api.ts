// frontend/src/services/api.ts

import { getAuthCookie } from './auth';
import { ChatRequest, ChatResponse, ChatMessage } from './types';

// Base URL for the backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Creates headers for API requests with authentication
 */
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getAuthCookie();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Generic API request function
 */
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: getHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // If response is not ok, throw an error with the status text
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || response.statusText || `HTTP error! status: ${response.status}`);
    }
    
    // For DELETE requests, there's typically no content to return
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

/**
 * Task API functions
 */

// Get all tasks for a user
export const getTasks = async (userId: string) => {
  return apiRequest(`/${userId}/tasks`);
};

// Create a new task
export const createTask = async (userId: string, taskData: any) => {
  return apiRequest(`/${userId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
};

// Get a specific task
export const getTask = async (userId: string, taskId: number) => {
  return apiRequest(`/${userId}/tasks/${taskId}`);
};

// Update a task
export const updateTask = async (userId: string, taskId: number, taskData: any) => {
  return apiRequest(`/${userId}/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  });
};

// Delete a task
export const deleteTask = async (userId: string, taskId: number) => {
  return apiRequest(`/${userId}/tasks/${taskId}`, {
    method: 'DELETE',
  });
};

// Update task completion status
export const updateTaskCompletion = async (userId: string, taskId: number, completed: boolean) => {
  return apiRequest(`/${userId}/tasks/${taskId}/complete?completed=${completed}`, {
    method: 'PATCH',
  });
};

/**
 * Chat API functions
 */

// Send a message to the chatbot
export const sendMessage = async (userId: string, chatRequest: ChatRequest): Promise<ChatResponse> => {
  return apiRequest(`/${userId}/chat`, {
    method: 'POST',
    body: JSON.stringify(chatRequest),
  });
};

// Get conversation history for a user
export const getConversationHistory = async (userId: string, conversationId?: string): Promise<ChatMessage[]> => {
  const endpoint = conversationId 
    ? `/${userId}/chat/${conversationId}`
    : `/${userId}/chat`;
  return apiRequest(endpoint);
};

// Export all API functions
export const api = {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  updateTaskCompletion,
  sendMessage,
  getConversationHistory,
};