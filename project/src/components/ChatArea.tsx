import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { X } from 'lucide-react';
import { AIType } from '../types';

const getAILabel = (type: AIType): string => {
  switch (type) {
    case 'calculation':
      return '算定AI';
    case 'clinic':
      return 'クリニック業務AI';
    case 'checkup':
      return '健診業務AI';
    default:
      return 'メドナビAI';
  }
};

const ChatArea: React.FC = () => {
  const { messages, selectedAI, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-5 shadow-sm">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
          {getAILabel(selectedAI)}に質問中
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            {showGuide && (
              <div className="max-w-lg mx-auto p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl relative shadow-lg">
                <button
                  onClick={() => setShowGuide(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <p className="text-blue-900 font-medium">
                  左側のメニューから質問したいAIを選択してから、このチャットエリアで質問を入力してください
                </p>
              </div>
            )}
            <p className="text-center max-w-md px-4 text-gray-600 font-medium">
              {getAILabel(selectedAI)}にメッセージを送信してください。
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="p-6 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-amber-200 border-t-amber-600"></div>
                <p className="mt-3 text-gray-600 font-medium">回答を生成中...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput />
    </div>
  );
};

export default ChatArea;