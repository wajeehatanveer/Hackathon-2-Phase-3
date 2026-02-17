'use client';

import React from 'react';
import { ChatButton, ChatWindow } from './Chat';
import { useChat } from './Chat/useChat';

/**
 * Chat interface component that combines ChatButton and ChatWindow.
 * This component should be rendered once at the app level (e.g., in layout.tsx)
 * to provide chat functionality across all pages.
 */
const ChatInterface: React.FC = () => {
  const { isChatOpen, toggleChat } = useChat();

  return (
    <>
      {/* Chat window - positioned in bottom-right corner */}
      <ChatWindow isOpen={isChatOpen} onClose={toggleChat} />
      
      {/* Chat button - floating action button */}
      <ChatButton isOpen={isChatOpen} onClick={toggleChat} />
    </>
  );
};

export default ChatInterface;
