import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  Search,
  Filter
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

const ManualManagement: React.FC = () => {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newManual, setNewManual] = useState({
    title: '',
    category: 'reception',
    notionUrl: ''
  });

  const categories = [
    { value: 'all', label: 'すべて' },
    { value: 'reception', label: '受付業務' },
    { value: 'medical', label: '診療業務' },
    { value: 'accounting', label: '会計・レセプト' },
    { value: 'health-check', label: '健診業務' },
    { value: 'other', label: 'その他' }
  ];

  // サンプルデータ
  useEffect(() => {
    setManuals([
      {
        id: '1',
        title: '新患受付マニュアル',
        category: 'reception',
        notionUrl: 'https://notion.so/clinic/new-patient-manual-abc123',
        lastSync: '2025/01/15 14:30',
        status: 'synced',
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '2',
        title: '健康診断フローマニュアル',
        category: 'health-check',
        notionUrl: 'https://notion.so/clinic/health-check-flow-def456',
        lastSync: '2025/01/10 09:15',
        status: 'outdated',
        createdAt: '2025/01/05',
        updatedAt: '2025/01/10'
      },
      {
        id: '3',
        title: 'レセプト算定ガイド',
        category: 'accounting',
        notionUrl: 'https://notion.so/clinic/receipt-guide-ghi789',
        lastSync: '2025/01/14 16:45',
        status: 'synced',
        createdAt: '2025/01/01',
        updatedAt: '2025/01/14'
      }
    ]);
  }, []);

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

  const addNotionManual = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const manual: Manual = {
        id: Date.now().toString(),
        title: newManual.title,
        category: newManual.category,
        notionUrl: newManual.notionUrl,
        status: 'synced',
        createdAt: new Date().toLocaleDateString('ja-JP'),
        updatedAt: new Date().toLocaleDateString('ja-JP'),
        lastSync: new Date().toLocaleString('ja-JP')
      };
      
      setManuals(prev => [...prev, manual]);
      setIsAddModalOpen(false);
      setNewManual({ title: '', category: 'reception', notionUrl: '' });
      
      showNotification('マニュアルが追加されました！', 'success');
    } catch (error) {
      console.error('Add manual failed:', error);
      showNotification('追加に失敗しました', 'error');
    }
  };

  const deleteManual = (manualId: string) => {
    if (confirm('このマニュアルを削除しますか？')) {
      setManuals(prev => prev.filter(manual => manual.id !== manualId));
      showNotification('マニュアルが削除されました', 'success');
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">マニュアル管理</h1>
            <p className="text-gray-600">Notionマニュアルの管理と同期</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            新規追加
          </button>
        </div>

        {/* 検索・フィルター */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="マニュアルを検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* マニュアルリスト */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            登録マニュアル ({filteredManuals.length}件)
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredManuals.map(manual => (
            <div key={manual.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" 
                      alt="Notion" 
                      className="w-5 h-5"
                    />
                    <h3 className="text-lg font-semibold text-gray-900">{manual.title}</h3>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {categories.find(cat => cat.value === manual.category)?.label}
                    </span>
                  </div>
                  
                  {manual.notionUrl && (
                    <div className="mb-2">
                      <a 
                        href={manual.notionUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {manual.notionUrl.substring(0, 60)}...
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>最終同期: {manual.lastSync || '未同期'}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(manual.status)}`}>
                      {getStatusText(manual.status)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => syncNotion(manual.id)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="同期"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="編集"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteManual(manual.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredManuals.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">マニュアルが見つかりません</p>
          </div>
        )}
      </div>

      {/* 追加モーダル */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Notionマニュアルを追加</h3>
              
              <form onSubmit={addNotionManual} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    マニュアル名
                  </label>
                  <input
                    type="text"
                    value={newManual.title}
                    onChange={(e) => setNewManual(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 新患受付マニュアル"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    カテゴリ
                  </label>
                  <select
                    value={newManual.category}
                    onChange={(e) => setNewManual(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notion URL
                  </label>
                  <input
                    type="url"
                    value={newManual.notionUrl}
                    onChange={(e) => setNewManual(prev => ({ ...prev, notionUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://notion.so/..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ※ 公開設定されたNotionページのURLを入力してください
                  </p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    追加
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualManagement;