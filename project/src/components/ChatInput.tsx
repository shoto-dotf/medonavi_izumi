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
    <div className="p-6 border-t border-gray-200/50 bg-white/80 backdrop-blur-md">
      <div className="flex items-end gap-3 rounded-full border border-gray-300 bg-gradient-to-r from-gray-50 to-white p-3 shadow-lg focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all duration-300">
        <textarea
          ref={textareaRef}
          className="flex-1 max-h-[120px] resize-none border-0 bg-transparent px-4 py-2 outline-none text-gray-800 placeholder-gray-500"
          placeholder="メッセージを入力してください (Shift + Enter で送信)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
        />
        
        <button
          className={`p-3 rounded-full transition-all duration-300 transform ${
            input.trim() && !isLoading
              ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white hover:shadow-lg hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 text-center font-medium">
        Shift + Enter で送信
      </div>
    </div>
  );
};

export default ChatInput;