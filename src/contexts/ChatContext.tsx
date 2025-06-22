import React, { createContext, useContext, useState, useEffect } from 'react';
import { AIType, ChatMessage, ChatState, Manual } from '../types';
import { fetchDifyResponse } from '../api/dify';
import { getNotionAPI } from '../api/notion';
const ChatContext = createContext<ChatState | undefined>(undefined);
interface ChatProviderProps {
  children: React.ReactNode;
}
export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedAI, setSelectedAI] = useState<AIType>('calculation');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [availableManuals, setAvailableManuals] = useState<Manual[]>([]);

  // Notionマニュアルデータを取得
  useEffect(() => {
    const loadManuals = async () => {
      try {
        // Netlify Functions経由でNotionデータを取得
        const response = await fetch('/.netlify/functions/notion-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'queryDatabase',
            databaseId: import.meta.env.VITE_NOTION_DATABASE_ID
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const convertedManuals: Manual[] = data.results.map((page: any) => {
          const properties = page.properties;
          
          // URLの抽出 - マニュアル (URL) カラムから
          let url = page.url; // デフォルトはNotionページのURL
          if (properties['マニュアル (URL)']) {
            if (properties['マニュアル (URL)'].files && properties['マニュアル (URL)'].files.length > 0) {
              url = properties['マニュアル (URL)'].files[0].file?.url || properties['マニュアル (URL)'].files[0].external?.url;
            } else if (properties['マニュアル (URL)'].url) {
              url = properties['マニュアル (URL)'].url;
            }
          }
          
          // カテゴリーの抽出
          let category = 'other';
          if (properties['カテゴリー'] && properties['カテゴリー'].multi_select) {
            const categories = properties['カテゴリー'].multi_select;
            if (categories.length > 0) {
              const categoryMap: { [key: string]: string } = {
                '算定': 'medical',
                'クリニック業務': 'reception',
                '健診': 'health-check'
              };
              category = categoryMap[categories[0].name] || 'other';
            }
          } else if (properties['カテゴリー'] && properties['カテゴリー'].select) {
            const categoryMap: { [key: string]: string } = {
              '算定': 'medical',
              'クリニック業務': 'reception',
              '健診': 'health-check'
            };
            category = categoryMap[properties['カテゴリー'].select.name] || 'other';
          }
          
          // タイトルの抽出
          let title = 'タイトルなし';
          if (properties['マニュアル名'] && properties['マニュアル名'].title && properties['マニュアル名'].title.length > 0) {
            title = properties['マニュアル名'].title.map((t: any) => t.plain_text).join('');
          }
          
          return {
            id: page.id,
            title: title,
            category: category,
            url: url,
            lastSync: page.last_edited_time || new Date().toISOString(),
            status: 'synced' as const
          };
        });
        
        setManuals(convertedManuals);
        setAvailableManuals(convertedManuals);
      } catch (error) {
        console.error('Failed to load manuals:', error);
        // フォールバックデータを使用
        setManuals([]);
        setAvailableManuals([]);
      }
    };

    loadManuals();
  }, []);

  // AIタイプに基づいてマニュアルをフィルタリング
  useEffect(() => {
    const categoryMap = {
      'calculation': 'medical',
      'clinic': 'reception', 
      'checkup': 'health-check'
    };
    
    const relevantCategory = categoryMap[selectedAI];
    const filtered = manuals.filter(manual => 
      manual.category === relevantCategory || manual.category === 'other'
    );
    
    setAvailableManuals(filtered);
  }, [selectedAI, manuals]);
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

  // マニュアル検索機能
  const searchManuals = (query: string): Manual[] => {
    if (!query.trim()) return availableManuals;
    
    const lowercaseQuery = query.toLowerCase();
    return manuals.filter(manual =>
      manual.title.toLowerCase().includes(lowercaseQuery) ||
      manual.category.toLowerCase().includes(lowercaseQuery)
    );
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        selectedAI,
        isLoading,
        manuals,
        availableManuals,
        setSelectedAI,
        sendMessage,
        clearMessages,
        searchManuals,
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