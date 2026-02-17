// frontend/src/components/Chat/MessageList.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/services/types';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  className?: string;
}

/**
 * Renders a list of chat messages with markdown support.
 * Features:
 * - User messages (right/indigo) and assistant messages (left/slate)
 * - Auto-scroll to bottom on new message
 * - Markdown rendering for assistant responses
 * - Typing indicator support
 * - Timestamp display
 * - Accessible with proper ARIA roles
 */
const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping = false,
  className = '',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex-1 overflow-y-auto',
        'px-4 py-6',
        'space-y-4',
        className
      )}
      role="log"
      aria-label="Chat messages"
    >
      {/* Empty state */}
      {messages.length === 0 && !isTyping && (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Welcome to AI Todo Chatbot
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
            Ask me to create tasks, show your tasks, or manage your todos naturally!
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <span className="text-xs px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
              "Add a task to call dentist"
            </span>
            <span className="text-xs px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
              "Show my pending tasks"
            </span>
            <span className="text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              "Who am I?"
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message, index) => {
        const isUser = message.role === 'user';
        const isAssistant = message.role === 'assistant';

        return (
          <div
            key={message.id || index}
            className={cn(
              'flex items-start gap-3',
              'animate-fadeInUp',
              isUser ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full',
                'flex items-center justify-center',
                'shadow-md',
                isUser
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-500'
                  : 'bg-gradient-to-br from-slate-500 to-gray-600'
              )}
              aria-hidden="true"
            >
              {isUser ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Message content */}
            <div
              className={cn(
                'max-w-[75%] sm:max-w-[80%]',
                'flex flex-col',
                isUser ? 'items-end' : 'items-start'
              )}
            >
              <div
                className={cn(
                  'px-4 py-2.5 rounded-2xl shadow-sm',
                  'text-sm leading-relaxed',
                  isUser
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
                )}
              >
                {isAssistant ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <span className="inline">{children}</span>,
                      code: ({ children, className }) => (
                        <code
                          className={cn(
                            'px-1.5 py-0.5 rounded text-xs',
                            className?.includes('inline') 
                              ? 'bg-gray-200 dark:bg-gray-700'
                              : 'block bg-gray-200 dark:bg-gray-700 p-2 my-1 rounded'
                          )}
                        >
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => <div className="my-2">{children}</div>,
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside my-1 space-y-0.5 text-xs">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside my-1 space-y-0.5 text-xs">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => <li className="text-sm">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <span className="whitespace-pre-wrap">{message.content}</span>
                )}
              </div>

              {/* Timestamp */}
              <span
                className={cn(
                  'text-xs mt-1',
                  'text-gray-500 dark:text-gray-400'
                )}
              >
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-start gap-3 animate-fadeInUp">
          <div
            className={cn(
              'flex-shrink-0 w-8 h-8 rounded-full',
              'flex items-center justify-center',
              'shadow-md',
              'bg-gradient-to-br from-slate-500 to-gray-600'
            )}
            aria-hidden="true"
          >
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div
            className={cn(
              'px-4 py-3 rounded-2xl rounded-bl-md',
              'bg-gray-100 dark:bg-gray-800',
              'shadow-sm'
            )}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  'bg-gray-400 dark:bg-gray-500',
                  'animate-bounce'
                )}
                style={{ animationDelay: '0ms' }}
              />
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  'bg-gray-400 dark:bg-gray-500',
                  'animate-bounce'
                )}
                style={{ animationDelay: '150ms' }}
              />
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  'bg-gray-400 dark:bg-gray-500',
                  'animate-bounce'
                )}
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
