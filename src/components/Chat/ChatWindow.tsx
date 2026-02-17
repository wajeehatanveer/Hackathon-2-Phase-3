// frontend/src/components/Chat/ChatWindow.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage, ChatStatus } from '@/services/types';
import { sendMessage, getConversationHistory } from '@/services/api';
import { getCurrentUser } from '@/services/auth';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// Local storage key for conversation persistence
const CONVERSATION_STORAGE_KEY = 'chat_conversation_history';

/**
 * Main chat container component.
 * Features:
 * - Manages chat panel state (open/closed)
 * - Handles sending messages to backend
 * - Displays typing indicator during API calls
 * - Persists conversation to localStorage
 * - Error handling with retry logic
 * - Connection status indicator
 */
const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  onClose,
  className = '',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [conversationId, setConversationId] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const messagesRef = useRef<ChatMessage[]>([]);
  const isInitialMount = useRef(true);

  // Get current user ID from auth
  const getCurrentUserId = useCallback(() => {
    const user = getCurrentUser();
    return user?.email || null;
  }, []);

  // Load conversation from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(CONVERSATION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setMessages(parsed.messages || []);
          setConversationId(parsed.conversationId ? Number(parsed.conversationId) : undefined);
          messagesRef.current = parsed.messages || [];
        }
      } catch (e) {
        console.error('Failed to load conversation from storage:', e);
      }
    }
  }, []);

  // Save conversation to localStorage when messages change
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem(
          CONVERSATION_STORAGE_KEY,
          JSON.stringify({
            messages,
            conversationId,
            updatedAt: new Date().toISOString(),
          })
        );
        messagesRef.current = messages;
      } catch (e) {
        console.error('Failed to save conversation to storage:', e);
      }
    }
  }, [messages, conversationId]);

  // Load conversation history from backend on first open
  useEffect(() => {
    if (isOpen && isInitialMount.current && messages.length === 0) {
      isInitialMount.current = false;
      loadConversationHistory();
    }
  }, [isOpen]);

  const loadConversationHistory = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      setStatus('loading');
      const history = await getConversationHistory(userId);
      if (history && history.length > 0) {
        setMessages(history);
        messagesRef.current = history;
        // Extract conversation ID from first message if available
        if (history[0]?.conversation_id) {
          setConversationId(Number(history[0].conversation_id));
        }
      }
      setStatus('connected');
    } catch (e) {
      console.error('Failed to load conversation history:', e);
      setStatus('error');
      setError('Failed to load conversation history');
    }
  };

  const handleSendMessage = async (content: string) => {
    const userId = getCurrentUserId();
    if (!userId) {
      setError('Please log in to send messages');
      return;
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      conversation_id: conversationId ? String(conversationId) : undefined,
    };

    // Optimistically add user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setStatus('loading');
    setError(null);

    try {
      const response = await sendMessage(userId, {
        message: content,
        conversation_id: conversationId || null,
      });

      // Create assistant message from response
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        conversation_id: String(response.conversation_id),
      };

      // Update messages with assistant response
      setMessages([...updatedMessages, assistantMessage]);

      // Update conversation ID if provided
      if (response.conversation_id && !conversationId) {
        setConversationId(response.conversation_id);
      }

      setStatus('connected');
      setRetryCount(0);
    } catch (e) {
      console.error('Failed to send message:', e);
      setStatus('error');
      setError('Failed to send message. Please try again.');

      // Implement retry logic with exponential backoff
      if (retryCount < 3) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        setTimeout(() => {
          setRetryCount(retryCount + 1);
          handleSendMessage(content);
        }, delay);
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={cn(
        // Fixed positioning in bottom-right corner
        'fixed bottom-24 right-6 z-40',
        // Dimensions - responsive
        'w-[calc(100vw-3rem)] sm:w-96',
        'max-h-[calc(100vh-12rem)]',
        // Glass morphism effect
        'glass-card',
        'bg-white/90 dark:bg-gray-900/90',
        'backdrop-blur-xl',
        // Shadow and border
        'shadow-2xl',
        'border border-white/30 dark:border-gray-700/30',
        // Rounded corners
        'rounded-2xl',
        // Flex layout
        'flex flex-col',
        // Animation
        'animate-fadeInUp',
        'origin-bottom-right',
        className
      )}
      role="dialog"
      aria-label="Chat window"
      aria-modal="true"
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between',
          'px-4 py-3',
          'border-b border-gray-200 dark:border-gray-700',
          'bg-gradient-to-r from-indigo-500/10 to-purple-500/10',
          'rounded-t-2xl'
        )}
      >
        <div className="flex items-center gap-3">
          {/* Bot avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          
          {/* Title and status */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              AI Todo Assistant
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  status === 'connected' ? 'bg-green-500' :
                  status === 'loading' ? 'bg-yellow-500' :
                  status === 'error' ? 'bg-red-500' :
                  'bg-gray-400'
                )}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {status === 'connected' ? 'Online' :
                 status === 'loading' ? 'Processing...' :
                 status === 'error' ? 'Connection issue' :
                 'Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Close chat"
          className={cn(
            'flex items-center justify-center',
            'w-8 h-8 rounded-full',
            'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            'hover:bg-gray-200 dark:hover:bg-gray-700',
            'transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500'
          )}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className={cn(
            'mx-4 mt-3 px-3 py-2 rounded-lg',
            'bg-red-50 dark:bg-red-900/20',
            'border border-red-200 dark:border-red-800',
            'text-red-700 dark:text-red-300',
            'text-xs'
          )}
          role="alert"
        >
          {error}
          <button
            onClick={() => {
              setError(null);
              setStatus('idle');
            }}
            className="ml-2 underline hover:text-red-900 dark:hover:text-red-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        isTyping={status === 'loading'}
      />

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onClose={handleClose}
        disabled={status === 'loading'}
        placeholder={
          status === 'loading' 
            ? 'Processing your message...' 
            : 'Ask me to create or manage tasks...'
        }
      />
    </div>
  );
};

export default ChatWindow;
