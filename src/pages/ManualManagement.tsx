import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  Search,
  Filter,
  Link
} from 'lucide-react';
import { getNotionOAuthAPI } from '../api/notionOAuth';

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

const ManualManagement: React.FC = () => {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isNotionConnected, setIsNotionConnected] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
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
    // APIトークンが設定されていれば、直接Notionデータベースから取得
    const apiKey = import.meta.env.VITE_NOTION_API_KEY;
    if (apiKey) {
      setIsNotionConnected(true);
      setWorkspaceName('しおや消化器内科クリニック');
      // 実際のNotionデータを取得
      loadNotionManuals();
    } else {
      // APIキーが設定されていない場合はサンプルデータ
      setIsNotionConnected(false);
      setManuals([
        {
          id: '1',
          title: 'サンプルマニュアル',
          category: 'other',
          notionUrl: '',
          lastSync: '',
          status: 'error',
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        }
      ]);
    }
  }, []);

  // 実際のNotionマニュアルデータを取得
  const loadNotionManuals = async () => {
    try {
      setIsLoading(true);
      
      // Notion APIを使用して実際のデータを取得
      const { initializeNotionAPI, getNotionAPI } = await import('../api/notion');
      const apiKey = import.meta.env.VITE_NOTION_API_KEY;
      initializeNotionAPI(apiKey);
      const notionAPI = getNotionAPI();
      let manualData;
      
      try {
        // 実際のNotionデータベースから取得を試行
        const databaseId = import.meta.env.VITE_NOTION_DATABASE_ID;
        manualData = await notionAPI.fetchManualDatabase(databaseId);
        console.log('Successfully fetched from Notion API:', manualData);
      } catch (error) {
        console.error('Notion API failed:', error);
        // APIが失敗した場合はエラーを表示
        showNotification(`Notion連携エラー: ${error.message}`, 'error');
        setIsLoading(false);
        return;
      }
      
      // フォールバックデータは削除（実際のAPIのみ使用）
      /*manualData = [
        {
          id: '1',
          title: '難病外来指導管理料マニュアル',
          category: 'calculation',
          notionUrl: 'file.notion.so/f/...ル.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '2',
          title: '特定薬剤治療管理料1マニュアル',
          category: 'calculation',
          notionUrl: 'file.notion.so/f/...AB.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '3',
          title: '処方箋紛失マニュアル',
          category: 'clinic',
          notionUrl: 'file.notion.so/f/...AB.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '4',
          title: '保険証マニュアル',
          category: 'clinic',
          notionUrl: 'file.notion.so/f/...AB.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '5',
          title: '月報業務作成マニュアル',
          category: 'clinic',
          notionUrl: 'file.notion.so/f/...AB.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '6',
          title: 'デジスマ予約マニュアル',
          category: 'clinic',
          notionUrl: 'file.notion.so/f/...AB.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '7',
          title: 'オンライン請求送信マニュアル',
          category: 'clinic',
          notionUrl: 'file.notion.so/f/...AB.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '8',
          title: '特定疾患管理料、難病指導管理料、生活習慣病管理料',
          category: 'calculation',
          notionUrl: 'file.notion.so/f/...AB.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '9',
          title: '在宅自己注射指導管理料マニュアル',
          category: 'calculation',
          notionUrl: 'file.notion.so/f/...AB.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '10',
          title: '血糖自己測定器加算マニュアル',
          category: 'calculation',
          notionUrl: 'file.notion.so/f/...AB.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '11',
          title: '胃カメラマニュアル',
          category: 'clinic',
          notionUrl: 'file.notion.so/f/...AB.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '12',
          title: '悪性腫瘍特異物質治療管理料マニュアル',
          category: 'calculation',
          notionUrl: 'file.notion.so/f/...AB.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '13',
          title: 'ピロリ菌検査マニュアル',
          category: 'clinic',
          notionUrl: 'file.notion.so/f/...AB.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '14',
          title: '62肝炎公費マニュアル',
          category: 'calculation',
          notionUrl: 'file.notion.so/f/...AB.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '15',
          title: '健診マニュアル1章',
          category: 'checkup',
          notionUrl: 'file.notion.so/f/...A0.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '16',
          title: '健診マニュアル2章',
          category: 'checkup',
          notionUrl: 'file.notion.so/f/...A0.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '17',
          title: '健診マニュアル3章',
          category: 'checkup',
          notionUrl: 'file.notion.so/f/...A0.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '18',
          title: '健診マニュアル4章',
          category: 'checkup',
          notionUrl: 'file.notion.so/f/...A0.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '19',
          title: '健診マニュアル5章',
          category: 'checkup',
          notionUrl: 'file.notion.so/f/...A0.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '20',
          title: '健診マニュアル6章',
          category: 'checkup',
          notionUrl: 'file.notion.so/f/...A0.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '21',
          title: '健診マニュアル7章',
          category: 'checkup',
          notionUrl: 'file.notion.so/f/...A0.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '22',
          title: '健診マニュアル8章',
          category: 'checkup',
          notionUrl: 'file.notion.so/f/...A0.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '23',
          title: '健診マニュアル9章',
          category: 'checkup',
          notionUrl: 'file.notion.so/f/...A0.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '24',
          title: '健診マニュアル10章',
          category: 'checkup',
          notionUrl: 'file.notion.so/f/...A0.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '25',
          title: '健診マニュアル11章',
          category: 'checkup',
          notionUrl: 'file.notion.so/f/...A0.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        },
        {
          id: '26',
          title: '健診マニュアル12章',
          category: 'checkup',
          notionUrl: 'file.notion.so/f/...A0.pdf',
          lastSync: new Date().toLocaleString('ja-JP'),
          status: 'synced' as const,
          createdAt: '2025/01/10',
          updatedAt: '2025/01/15'
        }
      ];*/

      // データベース形式に変換
      const convertedManuals = manualData.map((manual: any) => ({
        id: manual.id,
        title: manual.title,
        category: manual.category,
        notionUrl: manual.url || manual.notionUrl || '',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: new Date(manual.createdAt || '2025/01/10').toLocaleDateString('ja-JP'),
        updatedAt: new Date(manual.updatedAt || '2025/01/15').toLocaleDateString('ja-JP')
      }));

      setManuals(convertedManuals);
      showNotification('Notionマニュアルの同期が完了しました', 'success');
      
    } catch (error) {
      console.error('Notion manual sync error:', error);
      showNotification('Notionマニュアルの同期に失敗しました', 'error');
    } finally {
      setIsLoading(false);
    }
  };


  const filteredManuals = manuals.filter(manual => {
    const matchesSearch = manual.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || manual.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const syncNotion = async (manualId: string) => {
    try {
      // Notion API同期処理
      console.log('Syncing Notion for manual:', manualId);
      
      setManuals(prev => prev.map(manual => 
        manual.id === manualId 
          ? { ...manual, status: 'synced', lastSync: new Date().toLocaleString('ja-JP') }
          : manual
      ));
      
      // 成功通知
      showNotification('同期が完了しました！', 'success');
    } catch (error) {
      console.error('Sync failed:', error);
      showNotification('同期に失敗しました', 'error');
    }
  };



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
                  onClick={() => loadNotionManuals()}
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
              <div className="flex-shrink-0 px-4 lg:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    マニュアル一覧 ({filteredManuals.length}件)
                  </h2>
                  <div className="text-sm text-gray-500">
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
                  <div className="divide-y divide-gray-200">
                    {filteredManuals.map(manual => (
                      <div key={manual.id} className="p-3 sm:p-4 lg:p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-3 xl:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="mt-1 flex-shrink-0">
                                <FileText className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 truncate">{manual.title}</h3>
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 self-start">
                                    {categories.find(cat => cat.value === manual.category)?.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {manual.notionUrl && manual.notionUrl.includes('notion.so') && (
                              <div className="mb-2 ml-8 lg:ml-9">
                                <span className="text-xs lg:text-sm text-gray-500 flex items-center gap-1">
                                  <Link className="h-3 w-3 flex-shrink-0" />
                                  <span>Notionで管理されています</span>
                                </span>
                              </div>
                            )}
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs lg:text-sm text-gray-500 mt-3 ml-8 lg:ml-9">
                              <div className="flex items-center gap-1">
                                <img 
                                  src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" 
                                  alt="Notion" 
                                  className="w-3 h-3 lg:w-4 lg:h-4"
                                />
                                <span>Notion連携</span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(manual.status)} self-start`}>
                                {getStatusText(manual.status)}
                              </span>
                              <span className="whitespace-nowrap">最終更新: {manual.lastSync || '未同期'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 xl:ml-4 flex-shrink-0">
                            <button
                              onClick={() => window.open('https://www.notion.so/1cd3f0bae9be80d39922ef80780358e1', '_blank')}
                              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                              title="Notionデータベースで開く"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span className="hidden sm:inline">Notionで見る</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
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

export default ManualManagement;