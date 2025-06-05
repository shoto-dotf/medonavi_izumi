import React from 'react';
import { User, Bot } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';
import { markdownToHtml } from '../utils/markdown';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { isUser, content } = message;
  
  return (
    <div
      className={`flex gap-3 p-4 ${
        isUser ? 'bg-gray-50' : 'bg-white'
      } animate-fadeIn`}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
            <Bot className="h-5 w-5 text-teal-600" />
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <div className="font-medium text-sm text-gray-500 mb-1">
          {isUser ? 'あなた' : 'メドナビAI'}
        </div>
        
        <div className="prose prose-sm max-w-none">
          {isUser ? (
            <p>{content}</p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;