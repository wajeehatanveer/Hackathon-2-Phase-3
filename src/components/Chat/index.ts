// frontend/src/components/Chat/index.ts
// Barrel export for Chat components

export { default as ChatButton } from './ChatButton';
export { default as ChatWindow } from './ChatWindow';
export { default as MessageInput } from './MessageInput';
export { default as MessageList } from './MessageList';
export { useChat } from './useChat';

// Re-export types for convenience
export type { ChatMessage, ChatRequest, ChatResponse, ChatStatus, MessageRole } from '@/services/types';
