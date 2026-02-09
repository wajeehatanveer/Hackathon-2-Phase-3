// frontend/src/config/api.ts
export const API_CONFIG = {
  // Base URL for the main API (tasks, auth, etc.)
  // Normalize so callers don't accidentally end up with duplicated '/api/api' segments.
  BASE_URL: (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/(api)\/?$/, ''),

  // Specific endpoint for chat functionality
  CHAT_ENDPOINT: '/api',

  // Full URL for chat API
  getChatUrl: (userId: string) => {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.CHAT_ENDPOINT}/${userId}/chat`;
  }
};