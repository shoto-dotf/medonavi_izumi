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

const ManualManagement: React.FC = () => {
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

  // モックマニュアルデータを取得
  const getMockManuals = (): Manual[] => {
    return [
      {
        id: '1',
        title: '難病外来指導管理料マニュアル',
        category: 'calculation',
        notionUrl: 'https://www.notion.so/1cd3f0bae9be80d39922ef80780358e1?v=1cd3f0bae9be80998c5b000c1f275343&p=1cd3f0bae9be805fa7e4e2970596ba29&pm=s',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '2',
        title: '特定薬剤治療管理料1マニュアル',
        category: 'calculation',
        notionUrl: 'https://www.notion.so/1cd3f0bae9be80d39922ef80780358e1?v=1cd3f0bae9be80998c5b000c1f275343&p=1cd3f0bae9be805fa7e4e2970596ba30&pm=s',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '3',
        title: '処方箋紛失マニュアル',
        category: 'clinic',
        notionUrl: 'https://www.notion.so/1cd3f0bae9be80d39922ef80780358e1?v=1cd3f0bae9be80998c5b000c1f275343&p=1cd3f0bae9be805fa7e4e2970596ba31&pm=s',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '4',
        title: '保険証マニュアル',
        category: 'clinic',
        notionUrl: 'https://www.notion.so/1cd3f0bae9be80d39922ef80780358e1?v=1cd3f0bae9be80998c5b000c1f275343&p=1cd3f0bae9be805fa7e4e2970596ba32&pm=s',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '5',
        title: '月報業務作成マニュアル',
        category: 'clinic',
        notionUrl: 'https://www.notion.so/1cd3f0bae9be80d39922ef80780358e1?v=1cd3f0bae9be80998c5b000c1f275343&p=1cd3f0bae9be805fa7e4e2970596ba33&pm=s',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '6',
        title: 'デジスマ予約マニュアル',
        category: 'clinic',
        notionUrl: 'https://www.notion.so/1cd3f0bae9be80d39922ef80780358e1?v=1cd3f0bae9be80998c5b000c1f275343&p=1cd3f0bae9be805fa7e4e2970596ba34&pm=s',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '7',
        title: 'オンライン請求送信マニュアル',
        category: 'clinic',
        notionUrl: 'https://www.notion.so/1cd3f0bae9be80d39922ef80780358e1?v=1cd3f0bae9be80998c5b000c1f275343&p=1cd3f0bae9be805fa7e4e2970596ba35&pm=s',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '8',
        title: '特定疾患管理料、難病指導管理料、生活習慣病管理料',
        category: 'calculation',
        notionUrl: 'https://www.notion.so/1cd3f0bae9be80d39922ef80780358e1?v=1cd3f0bae9be80998c5b000c1f275343&p=1cd3f0bae9be805fa7e4e2970596ba98&pm=s',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '9',
        title: '在宅自己注射指導管理料マニュアル',
        category: 'calculation',
        notionUrl: 'https://www.notion.so/1cd3f0bae9be80d39922ef80780358e1?v=1cd3f0bae9be80998c5b000c1f275343&p=1cd3f0bae9be805fa7e4e2970596ba99&pm=s',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '10',
        title: '血糖自己測定器加算マニュアル',
        category: 'calculation',
        notionUrl: 'https://file.notion.so/f/...AB.pdf',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '11',
        title: '胃カメラマニュアル',
        category: 'clinic',
        notionUrl: 'https://file.notion.so/f/...AB.pdf',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '12',
        title: '悪性腫瘍特異物質治療管理料マニュアル',
        category: 'calculation',
        notionUrl: 'https://file.notion.so/f/...AB.pdf',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '13',
        title: 'ピロリ菌検査マニュアル',
        category: 'clinic',
        notionUrl: 'https://file.notion.so/f/...AB.pdf',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '14',
        title: '62肝炎公費マニュアル',
        category: 'calculation',
        notionUrl: 'https://file.notion.so/f/...AB.pdf',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '15',
        title: '健診マニュアル1章',
        category: 'checkup',
        notionUrl: 'https://www.notion.so/1cd3f0bae9be80d39922ef80780358e1',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '16',
        title: '健診マニュアル2章',
        category: 'checkup',
        notionUrl: 'https://file.notion.so/f/...A0.pdf',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '17',
        title: '健診マニュアル3章',
        category: 'checkup',
        notionUrl: 'https://file.notion.so/f/...A0.pdf',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '18',
        title: '健診マニュアル4章',
        category: 'checkup',
        notionUrl: 'https://file.notion.so/f/...A0.pdf',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '19',
        title: '健診マニュアル5章',
        category: 'checkup',
        notionUrl: 'https://file.notion.so/f/...A0.pdf',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '20',
        title: '健診マニュアル6章',
        category: 'checkup',
        notionUrl: 'https://file.notion.so/f/...A0.pdf',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '21',
        title: '健診マニュアル7章',
        category: 'checkup',
        notionUrl: 'https://file.notion.so/f/...A0.pdf',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '22',
        title: '健診マニュアル8章',
        category: 'checkup',
        notionUrl: 'https://file.notion.so/f/...A0.pdf',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '23',
        title: '健診マニュアル9章',
        category: 'checkup',
        notionUrl: 'https://file.notion.so/f/...A0.pdf',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '24',
        title: '健診マニュアル10章',
        category: 'checkup',
        notionUrl: 'https://file.notion.so/f/...A0.pdf',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '25',
        title: '健診マニュアル11章',
        category: 'checkup',
        notionUrl: 'https://file.notion.so/f/...A0.pdf',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      },
      {
        id: '26',
        title: '健診マニュアル12章',
        category: 'checkup',
        notionUrl: 'https://file.notion.so/f/...A0.pdf',
        lastSync: new Date().toLocaleString('ja-JP'),
        status: 'synced' as const,
        createdAt: '2025/01/10',
        updatedAt: '2025/01/15'
      }
    ];
  };

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
    // return を削除して実際のAPIロジックを有効化
  }, []);

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
        let category = 'other';
        if (properties['カテゴリー']?.select?.name) {
          category = properties['カテゴリー'].select.name;
        } else if (properties['Category']?.select?.name) {
          category = properties['Category'].select.name;
        } else if (properties['カテゴリー']?.multi_select?.[0]?.name) {
          category = properties['カテゴリー'].multi_select[0].name;
        }
        
        // カテゴリーをマップ
        const categoryMap: Record<string, string> = {
          '算定': 'calculation',
          'クリニック': 'clinic', 
          'クリニック業務': 'clinic',
          '健診': 'checkup',
          '': 'other'
        };
        const mappedCategory = categoryMap[category] || 'other';
        
        // URLを抽出（複数の可能性を考慮）
        let notionUrl = `https://www.notion.so/${page.id.replace(/-/g, '')}`;
        
        // マニュアル（URL）フィールドを確認
        const urlField = properties['マニュアル (URL)'] || properties['マニュアル（URL）'] || properties['URL'];
        if (urlField) {
          console.log(`URL field for ${title}:`, urlField);
          
          if (urlField.url) {
            notionUrl = urlField.url;
          } else if (urlField.files && urlField.files.length > 0) {
            if (urlField.files[0].file?.url) {
              notionUrl = urlField.files[0].file.url;
            } else if (urlField.files[0].external?.url) {
              notionUrl = urlField.files[0].external.url;
            }
          } else if (urlField.rich_text?.[0]?.plain_text) {
            notionUrl = urlField.rich_text[0].plain_text;
          }
        }
        
        // デバッグログ
        console.log(`Manual: ${title}`);
        console.log(`  - Page ID: ${page.id}`);
        console.log(`  - Category: ${category} -> ${mappedCategory}`);
        console.log(`  - Final URL: ${notionUrl}`);
        
        return {
          id: page.id,
          title: title,
          category: mappedCategory,
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
      showNotification('マニュアルの同期が完了しました', 'success');
      
    } catch (error) {
      console.error('=== Netlify Function error ===', error);
      throw error; // エラーを再スローして呼び出し元で処理
    } finally {
      setIsLoading(false);
      console.log('=== loadNotionManualsViaNetlify End ===');
    }
  };

  // 実際のNotionマニュアルデータを取得
  const loadNotionManuals = async () => {
    try {
      console.log('=== loadNotionManuals Start ===');
      setIsLoading(true);
      
      // Notion APIを使用して実際のデータを取得
      const { initializeNotionAPI, getNotionAPI } = await import('../api/notion');
      const apiKey = import.meta.env.VITE_NOTION_API_KEY;
      console.log('Initializing Notion API with key:', apiKey ? 'Key exists' : 'No key');
      initializeNotionAPI(apiKey);
      const notionAPI = getNotionAPI();
      
      const databaseId = import.meta.env.VITE_NOTION_DATABASE_ID;
      console.log('Fetching from database ID:', databaseId);
      const notionData = await notionAPI.fetchManualDatabase(databaseId);
      console.log('Notion data received:', notionData.length, 'items');
      
      // フォールバックデータは削除（実際のAPIのみ使用）
      /*manualData = [
        {
          id: '1',
          title: '難病外来指導管理料マニュアル',
          category: 'calculation',
          notionUrl: 'https://www.notion.so/1cd3f0bae9be80d39922ef80780358e1',
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

      // データをManualインターフェースに合わせて変換
      console.log('Converting Notion data to Manual format...');
      const convertedManuals: Manual[] = notionData.map((item, index) => {
        const manual = {
          id: item.id,
          title: item.title,
          category: item.category,
          notionUrl: item.url,
          lastSync: item.lastSync,
          status: item.status,
          createdAt: new Date(item.lastModified || '2025/01/10').toLocaleDateString('ja-JP'),
          updatedAt: new Date(item.lastModified || '2025/01/15').toLocaleDateString('ja-JP')
        };
        if (index < 3) { // Log first 3 items for debugging
          console.log(`Manual ${index + 1}:`, manual);
        }
        return manual;
      });
      
      console.log('Total converted manuals:', convertedManuals.length);
      setManuals(convertedManuals);
      console.log('Manuals state updated');
      showNotification('マニュアルの同期が完了しました', 'success');
      
    } catch (error) {
      console.error('=== Notion manual sync error ===', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      showNotification('マニュアルの同期に失敗しました', 'error');
      // エラー時はモックデータを表示
      const mockData = getMockManuals();
      console.log('Loading mock data due to error:', mockData.length, 'items');
      setManuals(mockData);
    } finally {
      setIsLoading(false);
      console.log('=== loadNotionManuals End ===');
    }
  };


  const filteredManuals = manuals.filter(manual => {
    const matchesSearch = manual.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || manual.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // デバッグ用ログ
  console.log('Current manuals:', manuals.length, 'total');
  console.log('Filter category:', filterCategory);
  console.log('Filtered manuals:', filteredManuals.length, 'results');
  
  // Show category breakdown
  if (manuals.length > 0) {
    const categoryBreakdown = manuals.reduce((acc, manual) => {
      acc[manual.category] = (acc[manual.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('Categories:', categoryBreakdown);
  }




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
                <p className="text-gray-600 mb-4">クラウドから同期されたマニュアル一覧を表示しています</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-blue-800">
                      <FileText className="w-5 h-5 flex-shrink-0 text-blue-600" />
                      <span className="font-medium text-sm lg:text-base">マニュアル作成・管理はクラウドで行います</span>
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
                  クラウドで管理
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
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
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
                    {/* モダンなカードグリッドレイアウト */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredManuals.map(manual => {
                        const categoryLabel = categories.find(cat => cat.value === manual.category)?.label || manual.category;
                        const categoryColors = {
                          calculation: 'bg-purple-100 text-purple-800 border-purple-200',
                          clinic: 'bg-blue-100 text-blue-800 border-blue-200',
                          checkup: 'bg-green-100 text-green-800 border-green-200',
                          other: 'bg-gray-100 text-gray-800 border-gray-200'
                        };
                        const categoryColor = categoryColors[manual.category] || categoryColors.other;
                        
                        return (
                          <div key={manual.id} className="group bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 overflow-hidden">
                            {/* カテゴリーヘッダー */}
                            <div className={`px-4 py-2 border-b ${categoryColor.split(' ')[0]} ${categoryColor.split(' ')[2]}`}>
                              <span className={`text-xs font-semibold uppercase tracking-wider ${categoryColor.split(' ')[1]}`}>
                                {categoryLabel}
                              </span>
                            </div>
                            
                            {/* カード本体 */}
                            <div className="p-4">
                              {/* タイトル */}
                              <div className="flex items-start gap-3 mb-3">
                                <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                                  {manual.title}
                                </h3>
                              </div>
                              
                              {/* URL */}
                              <div className="mb-4">
                                <div className="text-xs text-gray-500 mb-1">URL:</div>
                                {manual.notionUrl ? (
                                  <a 
                                    href={manual.notionUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 group/link break-all"
                                  >
                                    <Link className="h-3 w-3 flex-shrink-0" />
                                    <span className="block">{manual.notionUrl}</span>
                                  </a>
                                ) : (
                                  <span className="text-xs text-gray-400">URLが設定されていません</span>
                                )}
                              </div>
                              
                              {/* ステータス */}
                              <div className="flex items-center justify-between mb-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(manual.status)}`}>
                                  {getStatusText(manual.status)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {manual.lastSync || '未同期'}
                                </span>
                              </div>
                              
                              {/* アクションボタン */}
                              <button
                                onClick={() => window.open(manual.notionUrl || 'https://www.notion.so/1cd3f0bae9be80d39922ef80780358e1', '_blank')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                              >
                                <ExternalLink className="h-4 w-4" />
                                マニュアルを開く
                              </button>
                            </div>
                          </div>
                        );
                      })}
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

export default ManualManagement;