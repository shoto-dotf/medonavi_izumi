import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Database, 
  Folder,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  Search
} from 'lucide-react';

// デモ用のNotionデータ構造
interface NotionData {
  databases: {
    id: string;
    title: string;
    description: string;
    lastSync: string;
    manualCount: number;
  }[];
  manuals: {
    id: string;
    title: string;
    category: string;
    url: string;
    content: string;
    lastModified: string;
    syncStatus: 'synced' | 'pending' | 'error';
  }[];
}

const NotionIntegrationDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'manuals' | 'content'>('overview');
  const [selectedManual, setSelectedManual] = useState<any>(null);
  const [expandedManual, setExpandedManual] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // デモデータ
  const notionData: NotionData = {
    databases: [
      {
        id: 'db1',
        title: '0001_マニュアルフォルダ_しおや消化器内科クリニック',
        description: 'クリニックの全マニュアルを格納するメインデータベース',
        lastSync: '2025/01/15 14:30',
        manualCount: 13
      }
    ],
    manuals: [
      {
        id: '1',
        title: '難病外来指導管理料マニュアル',
        category: '算定',
        url: 'file.notion.so/f/f...ル.pdf',
        content: `# 難病外来指導管理料マニュアル

## 概要
難病外来指導管理料は、厚生労働大臣が定める疾患を主病とする患者に対して、計画的な医学管理を継続して行い、かつ、治療計画に基づき療養上必要な指導を行った場合に算定できます。

## 算定要件
1. **対象疾患**: 厚生労働大臣が定める疾患（指定難病）
2. **算定頻度**: 月1回
3. **点数**: 270点

## 必要な記録
- 治療計画の作成
- 指導内容の記録
- 患者の状態評価

## 注意事項
⚠️ 特定疾患療養管理料との併算定不可
⚠️ 同一月に他の指導管理料との調整が必要`,
        lastModified: '2025/01/10 09:00',
        syncStatus: 'synced'
      },
      {
        id: '2',
        title: '特定薬剤治療管理料1マニュアル',
        category: '算定',
        url: 'file.notion.so/f/f...AB.pdf',
        content: `# 特定薬剤治療管理料1マニュアル

## 対象薬剤
- 抗てんかん剤
- 強心配糖体製剤
- 不整脈用剤
- テオフィリン製剤
- 免疫抑制剤

## 算定条件
血中濃度測定を行い、その結果に基づき投与量を精密に管理した場合

## 点数
- 初回算定: 470点
- 2回目以降: 235点（月1回）`,
        lastModified: '2025/01/08 15:20',
        syncStatus: 'synced'
      },
      {
        id: '3',
        title: '保険証マニュアル',
        category: 'クリニック業務',
        url: 'file.notion.so/f/f...AB.pdf',
        content: `# 保険証確認マニュアル

## 確認タイミング
1. 初診時
2. 月初めの受診時
3. 保険証変更時

## 確認項目
- 有効期限
- 記号・番号
- 負担割合
- 公費受給者証の有無

## システム入力
1. 受付システムで患者検索
2. 保険情報タブを選択
3. 変更内容を入力
4. 確認後、保存`,
        lastModified: '2025/01/12 11:00',
        syncStatus: 'synced'
      }
    ]
  };

  const filteredManuals = notionData.manuals.filter(manual =>
    manual.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manual.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notion連携の仕組み</h1>
        <p className="text-gray-600">NotionのマニュアルがメドナビAIでどのように表示・活用されるか</p>
      </div>

      {/* タブナビゲーション */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'overview' 
              ? 'bg-white text-blue-600 shadow' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          概要
        </button>
        <button
          onClick={() => setActiveTab('manuals')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'manuals' 
              ? 'bg-white text-blue-600 shadow' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          マニュアル一覧
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'content' 
              ? 'bg-white text-blue-600 shadow' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          コンテンツ表示
        </button>
      </div>

      {/* 概要タブ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Notionデータベース連携
            </h2>
            
            <div className="space-y-4">
              {notionData.databases.map(db => (
                <div key={db.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{db.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{db.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="flex items-center gap-1 text-gray-500">
                          <FileText className="h-4 w-4" />
                          {db.manualCount} マニュアル
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          最終同期: {db.lastSync}
                        </span>
                      </div>
                    </div>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <RefreshCw className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                  <Folder className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">1. Notion構造取得</h3>
              </div>
              <p className="text-sm text-gray-700">
                NotionのデータベースやページのURL、カテゴリー情報を自動取得
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-600 text-white rounded-lg">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">2. コンテンツ同期</h3>
              </div>
              <p className="text-sm text-gray-700">
                PDFファイルのURLとメタデータを15分間隔で自動同期
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-600 text-white rounded-lg">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">3. AI検索対応</h3>
              </div>
              <p className="text-sm text-gray-700">
                同期されたマニュアルはAIチャットで検索・参照可能に
              </p>
            </div>
          </div>
        </div>
      )}

      {/* マニュアル一覧タブ */}
      {activeTab === 'manuals' && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">同期されたマニュアル</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="マニュアルを検索..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredManuals.map(manual => (
              <div key={manual.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" 
                        alt="Notion" 
                        className="w-5 h-5"
                      />
                      <h3 className="font-semibold text-gray-900">{manual.title}</h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {manual.category}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        manual.syncStatus === 'synced' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {manual.syncStatus === 'synced' ? '同期済み' : '同期中'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      最終更新: {manual.lastModified}
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <button
                        onClick={() => setExpandedManual(expandedManual === manual.id ? null : manual.id)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {expandedManual === manual.id ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            詳細を隠す
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            詳細を見る
                          </>
                        )}
                      </button>
                      <a
                        href={manual.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        PDFを開く
                      </a>
                    </div>

                    {expandedManual === manual.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {manual.content}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* コンテンツ表示タブ */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">メドナビAIでの活用方法</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">1. AIチャットでの検索</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-3">スタッフがAIチャットで質問すると：</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600">Q:</span>
                      <span className="text-gray-700">「難病外来指導管理料の算定方法を教えて」</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600">A:</span>
                      <div className="text-gray-700">
                        <p>難病外来指導管理料は月1回270点で算定できます。</p>
                        <p className="text-sm text-gray-500 mt-2">
                          参照: 難病外来指導管理料マニュアル (Notion)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold mb-2">2. マニュアル管理画面での閲覧</h3>
                <p className="text-sm text-gray-700 mb-3">
                  同期されたマニュアルは管理画面で一覧表示され、カテゴリ別にフィルタリング可能
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <img 
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3Crect x='10' y='10' width='380' height='40' fill='white' stroke='%23e5e7eb'/%3E%3Ctext x='20' y='35' font-family='Arial' font-size='14' fill='%23374151'%3E算定 (8件)%3C/text%3E%3Crect x='10' y='60' width='380' height='40' fill='white' stroke='%23e5e7eb'/%3E%3Ctext x='20' y='85' font-family='Arial' font-size='14' fill='%23374151'%3Eクリニック業務 (5件)%3C/text%3E%3Crect x='10' y='110' width='380' height='40' fill='white' stroke='%23e5e7eb'/%3E%3Ctext x='20' y='135' font-family='Arial' font-size='14' fill='%23374151'%3E健診業務 (2件)%3C/text%3E%3C/svg%3E"
                    alt="マニュアル管理画面"
                    className="w-full rounded border border-gray-200"
                  />
                </div>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold mb-2">3. PDF直接アクセス</h3>
                <p className="text-sm text-gray-700 mb-3">
                  各マニュアルのPDFファイルへの直接リンクが保持され、ワンクリックでアクセス可能
                </p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                    PDFをダウンロード
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                    Notionで開く
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <h3 className="font-semibold mb-3">💡 メリット</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Notionで更新すれば自動的にメドナビAIにも反映</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>AIが最新のマニュアル内容を参照して回答</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>カテゴリー別の整理で必要な情報にすぐアクセス</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>PDFとテキストの両方で情報を活用</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotionIntegrationDemo;