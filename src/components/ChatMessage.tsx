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
      className={`flex gap-4 p-6 ${
        isUser ? 'bg-gradient-to-r from-gray-50 to-gray-100' : 'bg-white'
      } animate-fadeIn hover:shadow-md transition-shadow duration-300`}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
            <User className="h-6 w-6 text-white" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <div className="font-semibold text-sm text-gray-600 mb-2">
          {isUser ? 'あなた' : 'メドナビAI'}
        </div>
        
        <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900">
          {isUser ? (
            <p className="text-gray-800">{content}</p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;