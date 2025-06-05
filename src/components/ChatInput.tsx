import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';

const ChatInput: React.FC = () => {
  const [input, setInput] = useState('');
  const { sendMessage, isLoading } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

  const handleSubmit = async () => {
    if (input.trim() && !isLoading) {
      await sendMessage(input);
      setInput('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-end gap-2 rounded-lg border border-gray-300 bg-white p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition">
        <textarea
          ref={textareaRef}
          className="flex-1 max-h-[120px] resize-none border-0 bg-transparent p-1 outline-none"
          placeholder="メッセージを入力してください (Shift + Enter で送信)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
        />
        
        <button
          className={`p-2 rounded-full ${
            input.trim() && !isLoading
              ? 'text-blue-600 hover:bg-blue-50'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      
      <div className="mt-2 text-xs text-gray-500 text-center">
        Shift + Enter で送信
      </div>
    </div>
  );
};

export default ChatInput;