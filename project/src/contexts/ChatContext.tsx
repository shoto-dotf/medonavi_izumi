import React, { createContext, useContext, useState } from 'react';
import { AIType, ChatMessage, ChatState } from '../types';
import { fetchDifyResponse } from '../api/dify';
const ChatContext = createContext<ChatState | undefined>(undefined);
interface ChatProviderProps {
  children: React.ReactNode;
}
export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedAI, setSelectedAI] = useState<AIType>('calculation');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim()) return;
    // ハッシュタグを追加するマッピング
    const hashtagMap = {
      'calculation': '#算定',
      'clinic': '#クリニック',
      'checkup': '#健診'
    };
    // ハッシュタグを追加
    const hashtag = hashtagMap[selectedAI];
    const contentWithHashtag = `${content} ${hashtag}`;
    // Add user message with hashtag
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: contentWithHashtag,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    try {
      // API呼び出し時にもハッシュタグ付きメッセージを送信
      const response = await fetchDifyResponse(contentWithHashtag, selectedAI);
      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error fetching response:', error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'エラーが発生しました。もう一度お試しください。',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  const clearMessages = (): void => {
    setMessages([]);
  };
  return (
    <ChatContext.Provider
      value={{
        messages,
        selectedAI,
        isLoading,
        setSelectedAI,
        sendMessage,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
export const useChat = (): ChatState => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};