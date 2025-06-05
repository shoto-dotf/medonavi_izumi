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
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="text-lg font-medium text-gray-800">
          {getAILabel(selectedAI)}に質問中
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            {showGuide && (
              <div className="max-w-lg mx-auto p-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg relative">
                <button
                  onClick={() => setShowGuide(false)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="text-blue-800">
                  左側のメニューから質問したいAIを選択してから、このチャットエリアで質問を入力してください
                </p>
              </div>
            )}
            <p className="text-center max-w-md px-4">
              {getAILabel(selectedAI)}にメッセージを送信してください。
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="p-4 text-center text-gray-500">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                <p className="mt-2">回答を生成中...</p>
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