// frontend/src/components/Chat/MessageInput.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onClose?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Text input component for sending chat messages.
 * Features:
 * - Enter to send, Escape to close
 * - Send button with ripple effect
 * - Disabled state during API calls
 * - Auto-resizing textarea
 * - Accessible with ARIA labels
 */
const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onClose,
  disabled = false,
  placeholder = 'Type your message...',
  className = '',
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
      // Reset height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape' && onClose) {
      e.preventDefault();
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div
      className={cn(
        // Base container
        'flex items-end gap-2 p-4',
        'border-t border-gray-200 dark:border-gray-700',
        'bg-white/80 dark:bg-gray-900/80',
        'backdrop-blur-sm',
        className
      )}
    >
      {/* Text input area */}
      <div
        className={cn(
          'flex-1 relative',
          'rounded-2xl',
          'transition-all duration-200',
          isFocused ? 'ring-2 ring-indigo-500 ring-offset-2' : '',
          'bg-gray-100 dark:bg-gray-800'
        )}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Message input"
          rows={1}
          className={cn(
            'w-full px-4 py-3 pr-12',
            'bg-transparent',
            'text-gray-900 dark:text-gray-100',
            'placeholder-gray-500 dark:placeholder-gray-400',
            'resize-none',
            'focus:outline-none',
            'max-h-[120px]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'text-sm leading-relaxed'
          )}
        />
      </div>

      {/* Send button with ripple effect */}
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        aria-label="Send message"
        className={cn(
          // Base styles
          'flex items-center justify-center',
          'w-12 h-12 rounded-full',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
          // Enabled state
          !disabled && message.trim()
            ? 'btn-gradient text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed',
          // Ripple effect container
          'relative overflow-hidden group'
        )}
      >
        {/* Ripple animation */}
        {!disabled && message.trim() && (
          <span
            className={cn(
              'absolute inset-0 rounded-full',
              'bg-white opacity-0',
              'group-active:animate-ping',
              'group-active:opacity-30'
            )}
          />
        )}

        {/* Send icon */}
        <Send className="w-5 h-5 ml-0.5" />
      </button>
    </div>
  );
};

export default MessageInput;
