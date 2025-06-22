import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { X, FileText, ExternalLink, Search, Calculator, Stethoscope, Activity } from 'lucide-react';
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
  const { messages, selectedAI, isLoading, availableManuals, searchManuals, setSelectedAI } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [manualSearchQuery, setManualSearchQuery] = useState('');
  const [showManuals, setShowManuals] = useState(true);
  const [showAISelection, setShowAISelection] = useState(true);

  const displayedManuals = manualSearchQuery 
    ? searchManuals(manualSearchQuery) 
    : availableManuals.slice(0, 5); // 最初の5件のみ表示

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'medical': return '診療業務';
      case 'reception': return '受付業務'; 
      case 'health-check': return '健診業務';
      case 'accounting': return '会計・レセプト';
      default: return 'その他';
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAISelection = (type: AIType) => {
    setSelectedAI(type);
    setShowAISelection(false);
  };

  const aiOptions = [
    {
      type: 'calculation' as AIType,
      label: '算定AI',
      description: '医療費の計算・レセプト請求に関する質問',
      icon: Calculator,
      color: 'blue'
    },
    {
      type: 'clinic' as AIType,
      label: 'クリニックAI',
      description: 'クリニック運営・業務管理に関する質問',
      icon: Stethoscope,
      color: 'green'
    },
    {
      type: 'checkup' as AIType,
      label: '健診AI',
      description: '健康診断・予防医療に関する質問',
      icon: Activity,
      color: 'purple'
    }
  ];

  return (
    <div className="flex h-full overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      {/* AI選択画面 */}
      {showAISelection && messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">質問したいAIを選択してください</h2>
              <p className="text-gray-600">専門分野に特化したAIがお答えします</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aiOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.type}
                    onClick={() => handleAISelection(option.type)}
                    className={`
                      relative overflow-hidden group
                      bg-white rounded-xl shadow-lg hover:shadow-xl
                      transform transition-all duration-300 hover:-translate-y-1
                      border-2 border-transparent hover:border-${option.color}-500
                      p-6 text-left
                    `}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br from-${option.color}-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                    
                    <div className="relative z-10">
                      <div className={`w-16 h-16 bg-${option.color}-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-${option.color}-200 transition-colors`}>
                        <Icon className={`h-8 w-8 text-${option.color}-600`} />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {option.label}
                      </h3>
                      
                      <p className="text-gray-600 text-sm">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* チャットエリア */}
          <div className="flex flex-col flex-1 overflow-hidden">
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
                        このチャットエリアで質問を入力してください
                      </p>
                    </div>
                  )}
                  <p className="text-center max-w-md px-4 text-gray-600 font-medium">
                    {getAILabel(selectedAI)}にメッセージを送信してください。
                  </p>
                  <button
                    onClick={() => setShowAISelection(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    AIを変更する
                  </button>
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

          {/* Notionマニュアルサイドバー */}
          {showManuals && (
            <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    関連マニュアル
                  </h3>
                  <button
                    onClick={() => setShowManuals(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={manualSearchQuery}
                    onChange={(e) => setManualSearchQuery(e.target.value)}
                    placeholder="マニュアルを検索..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {displayedManuals.length > 0 ? (
                  <div className="space-y-3">
                    {displayedManuals.map((manual) => (
                      <div key={manual.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                              {manual.title}
                            </h4>
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mb-2">
                              {getCategoryLabel(manual.category)}
                            </span>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                manual.status === 'synced' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {manual.status === 'synced' ? '✓ 同期完了' : '⚠️ 要更新'}
                              </span>
                              <a 
                                href={manual.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="マニュアルを開く"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">
                      {manualSearchQuery ? '検索結果がありません' : `${getAILabel(selectedAI)}用のマニュアルがありません`}
                    </p>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-600 text-center">
                  💡 質問に関連するマニュアルが自動表示されます
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* マニュアルサイドバーを閉じた場合の再表示ボタン */}
      {!showManuals && !showAISelection && (
        <button
          onClick={() => setShowManuals(true)}
          className="fixed right-4 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10"
          title="マニュアルを表示"
        >
          <FileText className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default ChatArea;