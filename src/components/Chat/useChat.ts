// frontend/src/components/Chat/useChat.ts
'use client';

import { useState, useCallback } from 'react';

/**
 * Hook for managing chat panel state across the application.
 * Provides centralized state for chat open/close and unread count.
 */
export const useChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const openChat = useCallback(() => {
    setIsChatOpen(true);
    setUnreadCount(0); // Clear unread count when opening
  }, []);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
    if (!isChatOpen) {
      setUnreadCount(0); // Clear unread count when opening
    }
  }, [isChatOpen]);

  const incrementUnread = useCallback(() => {
    setUnreadCount(prev => prev + 1);
  }, []);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    isChatOpen,
    unreadCount,
    openChat,
    closeChat,
    toggleChat,
    incrementUnread,
    clearUnread,
  };
};

export default useChat;
