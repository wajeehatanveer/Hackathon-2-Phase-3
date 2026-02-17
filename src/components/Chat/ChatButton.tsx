// frontend/src/components/Chat/ChatButton.tsx
'use client';

import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
  className?: string;
}

/**
 * Floating action button for opening/closing the chat panel.
 * Features:
 * - Bottom-right corner positioning
 * - Pulse animation on hover
 * - Unread message indicator badge
 * - Icon changes based on open/closed state
 * - Accessible with ARIA labels
 */
const ChatButton: React.FC<ChatButtonProps> = ({
  isOpen,
  onClick,
  unreadCount = 0,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
      aria-expanded={isOpen}
      className={cn(
        // Base styles
        'fixed bottom-6 right-6 z-50',
        'flex items-center justify-center',
        'w-14 h-14 rounded-full',
        'shadow-lg hover:shadow-xl',
        'transition-all duration-300 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
        // Gradient background with theme support
        'btn-gradient text-white',
        // Hover pulse animation
        'hover:scale-110 active:scale-95',
        'group',
        className
      )}
    >
      {/* Pulse animation effect */}
      <span
        className={cn(
          'absolute inset-0 rounded-full',
          'bg-indigo-500 opacity-0',
          'group-hover:animate-ping',
          'group-hover:opacity-75'
        )}
      />

      {/* Icon container */}
      <span className="relative z-10">
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-300" />
        ) : (
          <MessageCircle className="w-6 h-6 transition-transform duration-300" />
        )}
      </span>

      {/* Unread message indicator */}
      {unreadCount > 0 && !isOpen && (
        <span
          className={cn(
            'absolute -top-1 -right-1',
            'flex items-center justify-center',
            'min-w-[20px] h-5 px-1.5',
            'bg-red-500 text-white text-xs font-bold',
            'rounded-full',
            'shadow-md',
            'animate-bounce'
          )}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default ChatButton;
