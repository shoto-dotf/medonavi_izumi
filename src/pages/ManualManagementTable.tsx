import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ExternalLink, 
  RefreshCw, 
  Search,
  Filter,
  Link
} from 'lucide-react';

interface Manual {
  id: string;
  title: string;
  category: string;
  notionUrl?: string;
  lastSync?: string;
  status: 'synced' | 'outdated' | 'error';
  createdAt: string;
  updatedAt: string;
}

const ManualManagementTable: React.FC = () => {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isNotionConnected, setIsNotionConnected] = useState(false);
  const [, setWorkspaceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { value: 'all', label: 'すべて' },
    { value: 'calculation', label: '算定' },
    { value: 'clinic', label: 'クリニック' },
    { value: 'checkup', label: '健診' },
    { value: 'other', label: 'その他' }
  ];

  // Notion連携状態とマニュアルデータの初期化
  useEffect(() => {
    console.log('=== LOADING REAL NOTION DATA ===');
    
    // 実際のNotion APIを使用
    const apiKey = import.meta.env.VITE_NOTION_API_KEY;
    console.log('Notion API Key exists:', !!apiKey);
    console.log('Notion Database ID:', import.meta.env.VITE_NOTION_DATABASE_ID);
    
    if (apiKey) {
      setIsNotionConnected(true);
      setWorkspaceName('しおや消化器内科クリニック');
      console.log('Loading Notion manuals...');
      // Netlify Functions経由でNotionデータを取得
      loadNotionManualsViaNetlify().catch(error => {
        console.error('Failed to load Notion manuals via Netlify:', error);
        // エラー時はモックデータを使用
        const mockData = getMockManuals();
        console.log('Loading mock data due to error:', mockData.length, 'items');
        setManuals(mockData);
      });
    } else {
      // APIキーがない場合はモックデータを使用
      console.log('No API key found, using mock data');
      const mockData = getMockManuals();
      setManuals(mockData);
    }
  }, []);

  // モックマニュアルデータを取得
  const getMockManuals = (): Manual[] => {
    return [
      {
        id: '1',
        title: '難病外来指導管理料マニュアル',
        category: 'calculation',
        notionUrl: 'https://www.notion.so/1cd3f0bae9be805fa7e4e2970596ba29',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '2',
        title: '特定薬剤治療管理料1マニュアル',
        category: 'calculation',
        notionUrl: 'https://www.notion.so/1-20f3f0bae9be80c595c1ee2ada4b1212',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      }
    ];
  };

  // Netlify Functions経由でNotionマニュアルデータを取得
  const loadNotionManualsViaNetlify = async () => {
    try {
      console.log('=== loadNotionManualsViaNetlify Start ===');
      setIsLoading(true);
      
      // Netlify Functions のエンドポイントを使用
      const response = await fetch(`/.netlify/functions/notion-proxy?database_id=${import.meta.env.VITE_NOTION_DATABASE_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Netlify Function error: ${response.status}`);
      }
      
      const notionResponse = await response.json();
      console.log('Netlify Function response:', notionResponse);
      
      if (!notionResponse.results || !Array.isArray(notionResponse.results)) {
        throw new Error('Invalid response format from Notion API');
      }
      
      console.log('Notion API Response:', notionResponse.results.length, 'items');
      
      // Notionの結果をManualインターフェースに合わせて変換
      const convertedManuals: Manual[] = notionResponse.results.map((page: any) => {
        const properties = page.properties;
        
        // マニュアル名を抽出（複数の可能性を考慮）
        const title = properties['マニュアル名']?.title?.[0]?.plain_text || 
                     properties['Name']?.title?.[0]?.plain_text ||
                     properties['Title']?.title?.[0]?.plain_text ||
                     properties['マニュアル名']?.rich_text?.[0]?.plain_text || 
                     'タイトルなし';
        
        // カテゴリーを抽出（複数の可能性を考慮）
        const rawCategory = properties['カテゴリー']?.select?.name || 
                           properties['Category']?.select?.name ||
                           properties['カテゴリー']?.multi_select?.[0]?.name ||
                           'other';
        
        // カテゴリーをシステム用に変換
        let category = 'other';
        switch (rawCategory) {
          case '算定': category = 'calculation'; break;
          case 'クリニック業務': 
          case 'クリニック': category = 'clinic'; break;
          case '健診業務': 
          case '健診': category = 'checkup'; break;
          default: category = 'other';
        }
        
        // NotionのURL フィールドを確認（ファイル型とURL型の両方をチェック）
        let urlField = null;
        
        // ファイル型のURLフィールドをチェック
        if (properties['マニュアル (URL)']?.files?.length > 0) {
          urlField = properties['マニュアル (URL)'].files[0].file?.url || 
                    properties['マニュアル (URL)'].files[0].external?.url;
        } 
        // URL型のフィールドをチェック
        else if (properties['マニュアル (URL)']?.url) {
          urlField = properties['マニュアル (URL)'].url;
        }
        // rich_text型もチェック
        else if (properties['マニュアル (URL)']?.rich_text?.[0]?.plain_text) {
          urlField = properties['マニュアル (URL)'].rich_text[0].plain_text;
        }
        
        const pageIdForUrl = page.id.replace(/-/g, '');
        const notionUrl = urlField || `https://www.notion.so/${pageIdForUrl}`;
        
        // デバッグログ（特定薬剤治療管理料1マニュアルに注目）
        if (title.includes('特定薬剤治療管理料1')) {
          console.log(`\n=== 特定薬剤治療管理料1マニュアル DEBUG ===`);
          console.log(`Page object:`, page);
          console.log(`Properties:`, properties);
          console.log(`All property keys:`, Object.keys(properties));
          console.log(`Page ID (raw): "${page.id}"`);
          console.log(`Page URL (from API): "${page.url}"`);
          console.log(`URL field: "${urlField}"`);
          console.log(`Page ID for URL: "${pageIdForUrl}"`);
          console.log(`Final URL: "${notionUrl}"`);
          console.log(`Expected URL: "https://www.notion.so/1-20f3f0bae9be80c595c1ee2ada4b1212"`);
          console.log(`=== END DEBUG ===\n`);
        }
        
        return {
          id: page.id,
          title: title,
          category: category,
          notionUrl: notionUrl,
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: new Date(page.created_time || '2025/01/10').toLocaleDateString('ja-JP'),
          updatedAt: new Date(page.last_edited_time || '2025/01/15').toLocaleDateString('ja-JP')
        };
      });
      
      console.log('Total converted manuals:', convertedManuals.length);
      setManuals(convertedManuals);
      console.log('Manuals state updated');
      showNotification('Notionマニュアルの同期が完了しました', 'success');
      
    } catch (error) {
      console.error('=== Netlify Function error ===', error);
      throw error; // エラーを再スローして呼び出し元で処理
    } finally {
      setIsLoading(false);
      console.log('=== loadNotionManualsViaNetlify End ===');
    }
  };

  const filteredManuals = manuals.filter(manual => {
    const matchesSearch = manual.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || manual.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const showNotification = (message: string, type: 'success' | 'error') => {
    // 通知の実装
    console.log(`${type}: ${message}`);
  };

  const getStatusColor = (status: Manual['status']) => {
    switch (status) {
      case 'synced': return 'text-green-600 bg-green-100';
      case 'outdated': return 'text-orange-600 bg-orange-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: Manual['status']) => {
    switch (status) {
      case 'synced': return '✓ 同期完了';
      case 'outdated': return '⚠️ 要更新';
      case 'error': return '❌ エラー';
      default: return '不明';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">マニュアルライブラリ</h1>
                <p className="text-gray-600 mb-4">Notionから同期されたマニュアル一覧を表示しています</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-blue-800">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" 
                        alt="Notion" 
                        className="w-5 h-5 flex-shrink-0"
                      />
                      <span className="font-medium text-sm lg:text-base">マニュアル作成・管理はNotionで行います</span>
                    </div>
                    <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded self-start">
                      {isNotionConnected ? '同期済み' : 'サンプルデータ'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                <button
                  onClick={() => window.open('https://www.notion.so/1cd3f0bae9be80d39922ef80780358e1', '_blank')}
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  Notionで管理
                </button>
                <button
                  onClick={() => {
                    const apiKey = import.meta.env.VITE_NOTION_API_KEY;
                    if (apiKey) {
                      loadNotionManualsViaNetlify().catch(error => {
                        console.error('Failed to load Notion manuals via Netlify:', error);
                        // エラー時はモックデータを使用
                        setManuals(getMockManuals());
                        showNotification('エラーが発生しました。モックデータを表示しています。', 'error');
                      });
                    } else {
                      // APIキーがない場合はモックデータをリロード
                      setManuals(getMockManuals());
                      showNotification('モックデータを読み込みました', 'success');
                    }
                  }}
                  className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-medium"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? '同期中...' : '最新に更新'}
                </button>
              </div>
            </div>

            {/* 検索・フィルター */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="マニュアルを検索..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="relative sm:w-48">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* マニュアルリスト */}
        <div className="flex-1 overflow-hidden px-4 lg:px-6 pb-4 lg:pb-6">
          <div className="max-w-7xl mx-auto h-full">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
              <div className="flex-shrink-0 px-4 lg:px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-gray-900">
                    マニュアル一覧 
                    <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {filteredManuals.length}件
                    </span>
                  </h2>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <RefreshCw className="h-3 w-3" />
                    最終更新: {new Date().toLocaleString('ja-JP')}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredManuals.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">マニュアルが見つかりません</p>
                  </div>
                ) : (
                  <div className="p-6">
                    {/* テーブルレイアウト（NotionのUIに合わせて） */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">カテゴリー</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">マニュアル名</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">マニュアル (URL)</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredManuals.map(manual => {
                            const categoryLabel = categories.find(cat => cat.value === manual.category)?.label || manual.category;
                            const categoryColors = {
                              calculation: 'bg-purple-100 text-purple-800',
                              clinic: 'bg-orange-100 text-orange-800',
                              checkup: 'bg-blue-100 text-blue-800',
                              other: 'bg-gray-100 text-gray-800'
                            };
                            const categoryColor = categoryColors[manual.category] || categoryColors.other;
                            
                            return (
                              <tr key={manual.id} className="hover:bg-gray-50 transition-colors">
                                {/* カテゴリー */}
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${categoryColor}`}>
                                    {categoryLabel}
                                  </span>
                                </td>
                                
                                {/* マニュアル名 */}
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-red-500 flex-shrink-0" />
                                    <span className="text-sm font-medium text-gray-900">{manual.title}</span>
                                  </div>
                                </td>
                                
                                {/* URL */}
                                <td className="px-4 py-3">
                                  {manual.notionUrl ? (
                                    <a 
                                      href={manual.notionUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                    >
                                      <Link className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate max-w-xs">
                                        {manual.notionUrl.includes('file.notion.so') 
                                          ? manual.notionUrl.replace('https://file.notion.so/f/', 'file.notion.so/f/...')
                                          : `notion.so/${manual.notionUrl.split('/').pop()?.substring(0, 8)}...`
                                        }
                                      </span>
                                    </a>
                                  ) : (
                                    <span className="text-sm text-gray-400">URLなし</span>
                                  )}
                                </td>
                                
                                {/* 操作 */}
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => window.open(manual.notionUrl || 'https://www.notion.so/1cd3f0bae9be80d39922ef80780358e1', '_blank')}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    開く
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualManagementTable;