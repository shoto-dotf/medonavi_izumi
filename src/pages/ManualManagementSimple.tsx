import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface Manual {
  id: string;
  title: string;
  category: string;
  url?: string;
  lastSync?: string;
}

const ManualManagementSimple: React.FC = () => {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // カテゴリー名を日本語に変換
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'calculation': return '算定';
      case 'clinic': return 'クリニック業務';
      case 'checkup': return '健診業務';
      default: return 'その他';
    }
  };

  // Notionマニュアルデータを取得
  const loadManuals = async () => {
    try {
      setIsLoading(true);
      console.log('Loading manuals...');
      
      const { initializeNotionAPI, getNotionAPI } = await import('../api/notion');
      const apiKey = import.meta.env.VITE_NOTION_API_KEY;
      const databaseId = import.meta.env.VITE_NOTION_DATABASE_ID;
      
      if (!apiKey || !databaseId) {
        throw new Error('Environment variables not set');
      }
      
      initializeNotionAPI(apiKey);
      const notionAPI = getNotionAPI();
      const notionData = await notionAPI.fetchManualDatabase(databaseId);
      
      // データ変換
      const convertedManuals: Manual[] = notionData.map(item => ({
        id: item.id,
        title: item.title,
        category: item.category,
        url: item.url,
        lastSync: item.lastSync
      }));
      
      setManuals(convertedManuals);
      console.log('Manuals loaded:', convertedManuals.length);
      
    } catch (error) {
      console.error('Error loading manuals:', error);
      
      // エラー時はモックデータを表示
      const mockData: Manual[] = [
        { id: '1', title: '難病外来指導管理料マニュアル', category: 'calculation', url: 'https://example.com/1' },
        { id: '2', title: '特定薬剤治療管理料1マニュアル', category: 'calculation', url: 'https://example.com/2' },
        { id: '3', title: '処方箋紛失マニュアル', category: 'clinic', url: 'https://example.com/3' },
        { id: '4', title: '保険証マニュアル', category: 'clinic', url: 'https://example.com/4' },
        { id: '5', title: '月報業務作成マニュアル', category: 'clinic', url: 'https://example.com/5' },
        { id: '6', title: '健診マニュアル1章', category: 'checkup', url: 'https://example.com/6' },
        { id: '7', title: '健診マニュアル2章', category: 'checkup', url: 'https://example.com/7' },
        { id: '8', title: '健診マニュアル3章', category: 'checkup', url: 'https://example.com/8' },
      ];
      setManuals(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadManuals();
  }, []);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">マニュアルライブラリ</h1>
            <p className="text-gray-600 mt-2">Notionから同期されたマニュアル一覧</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.open('https://www.notion.so/1cd3f0bae9be80d39922ef80780358e1', '_blank')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Notionで管理
            </button>
            <button
              onClick={loadManuals}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? '更新中...' : '更新'}
            </button>
          </div>
        </div>

        {/* シンプルテーブル */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カテゴリー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  マニュアル名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {manuals.map((manual) => (
                <tr key={manual.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getCategoryName(manual.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {manual.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {manual.url ? (
                      <button
                        onClick={() => window.open(manual.url, '_blank')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        開く
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">URLなし</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {manuals.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500">マニュアルが見つかりません</p>
            </div>
          )}
        </div>

        {/* フッター情報 */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          合計 {manuals.length} 件のマニュアル
        </div>
        
      </div>
    </div>
  );
};

export default ManualManagementSimple;