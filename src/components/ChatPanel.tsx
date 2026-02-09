import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls: any[];
}

const ChatPanel = ({ userId, authToken }: { userId: string; authToken: string }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      createdAt: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      // Import the API service
      const { sendChatMessage } = await import('../services/api');

      // Send message to backend using the API service
      const data = await sendChatMessage(userId, input);

      // Add assistant response to UI
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
        createdAt: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      // Add error message to UI
      let errorMessageText = 'Oops! I couldn\'t process that. Try again?';

      // Check if it's a network error or specific API error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessageText = 'Network error: Please check your connection and try again.';
      } else if (error.message) {
        errorMessageText = `Oops! ${error.message}. Try again?`;
      }

      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorMessageText,
        createdAt: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex space-x-1 p-2">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg p-4 border border-gray-100">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-100">
        <div className="w-3 h-3 rounded-full bg-[#635BFF]"></div>
        <h2 className="text-lg font-semibold text-gray-800">AI Assistant</h2>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 max-h-[calc(100vh-250px)]">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#E6E0FF] text-gray-800 rounded-br-none'
                    : msg.content.startsWith('Oops!') || msg.content.includes('error')
                      ? 'bg-[#FFEAEA] text-red-700 rounded-bl-none'
                      : 'bg-[#C9BFFF] text-gray-800 rounded-bl-none'
                } shadow-sm`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 flex justify-start"
          >
            <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-[#C9BFFF] text-gray-800 rounded-bl-none shadow-sm">
              <TypingIndicator />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message AI assistant..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 shadow-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-[#635BFF] to-[#958CFF] text-white px-5 py-3 rounded-xl hover:opacity-90 disabled:opacity-50 shadow-sm transition-all duration-200 flex items-center justify-center"
          disabled={!input.trim() || isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;