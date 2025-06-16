// Notion API連携用クライアント

export interface NotionPage {
  id: string;
  url: string;
  title: string;
  content: string;
  lastModified: string;
}

export interface NotionIntegration {
  id: string;
  title: string;
  url: string;
  refinedUrl?: string;
  category: string;
  lastSync: string;
  status: 'synced' | 'outdated' | 'error';
  lastModified?: string;
}

class NotionAPI {
  private apiKey?: string;
  private baseURL = 'https://api.notion.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  // Notion公開ページの内容を取得（APIキー不要）
  async fetchPublicPage(url: string): Promise<NotionPage> {
    try {
      // 実際の実装では、Notion公開ページのHTMLを取得してパースする
      // または、Notion公開APIを使用する
      
      // 現在はモックデータを返す
      const mockContent = `
# サンプルNotionページ

## 概要
これはNotionから取得されたサンプルコンテンツです。

## 手順
1. ステップ1: 初期設定
2. ステップ2: データ入力
3. ステップ3: 確認作業

## 注意事項
- 重要な注意点1
- 重要な注意点2

## 参考資料
- [リンク1](https://example.com)
- [リンク2](https://example.com)
`;

      return {
        id: this.extractPageId(url),
        url,
        title: 'Notionページタイトル',
        content: mockContent,
        lastModified: new Date().toISOString()
      };
    } catch (error) {
      console.error('Notion fetch error:', error);
      throw new Error('Notionページの取得に失敗しました');
    }
  }

  // Notionデータベースから全マニュアルを取得
  async fetchManualDatabase(databaseId: string): Promise<NotionIntegration[]> {
    if (!this.apiKey) {
      throw new Error('Notion API key is required');
    }

    try {
      console.log('Fetching from Notion Database:', databaseId);
      
      // 本番環境ではNetlify Functionsを使用
      const isProduction = window.location.hostname !== 'localhost';
      const apiUrl = isProduction 
        ? `/.netlify/functions/notion-proxy?database_id=${databaseId}`
        : `${this.baseURL}/databases/${databaseId}/query`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: isProduction ? {
          'Content-Type': 'application/json'
        } : {
          'Authorization': `Bearer ${this.apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: isProduction ? undefined : JSON.stringify({
          sorts: [
            {
              property: "マニュアル名",
              direction: "ascending"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Notion API Error Response:', errorText);
        throw new Error(`Notion Database API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Notion API Response:', data);
      
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid response format from Notion API');
      }

      return this.convertDatabaseToManuals(data.results);
    } catch (error) {
      console.error('Notion database fetch error:', error);
      throw error; // エラーを再スローして呼び出し元で処理
    }
  }

  // データベースの結果をマニュアル形式に変換
  private convertDatabaseToManuals(pages: any[]): NotionIntegration[] {
    return pages.map(page => {
      const properties = page.properties;
      
      return {
        id: page.id,
        title: this.extractManualTitle(properties),
        url: this.extractUrl(properties) || page.url,
        refinedUrl: this.extractRefinedUrl(properties),
        category: this.extractCategory(properties),
        lastSync: new Date().toISOString(),
        status: 'synced' as const,
        lastModified: page.last_edited_time
      };
    });
  }

  // Notion内部APIを使用してページを取得（要APIキー）
  async fetchPrivatePage(pageId: string): Promise<NotionPage> {
    if (!this.apiKey) {
      throw new Error('Notion API key required for private pages');
    }

    try {
      // ページ情報を取得
      const pageResponse = await fetch(`${this.baseURL}/pages/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Notion-Version': '2022-06-28'
        }
      });

      if (!pageResponse.ok) {
        throw new Error(`Notion API error: ${pageResponse.status}`);
      }

      const pageData = await pageResponse.json();

      // ページのブロック（コンテンツ）を取得
      const blocksResponse = await fetch(`${this.baseURL}/blocks/${pageId}/children`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Notion-Version': '2022-06-28'
        }
      });

      if (!blocksResponse.ok) {
        throw new Error(`Notion blocks API error: ${blocksResponse.status}`);
      }

      const blocksData = await blocksResponse.json();
      const content = this.convertBlocksToMarkdown(blocksData.results);

      return {
        id: pageId,
        url: pageData.url,
        title: this.extractTitle(pageData.properties),
        content,
        lastModified: pageData.last_edited_time
      };
    } catch (error) {
      console.error('Notion private page fetch error:', error);
      throw new Error('Notionページの取得に失敗しました');
    }
  }

  // NotionブロックをMarkdownに変換
  private convertBlocksToMarkdown(blocks: any[]): string {
    return blocks.map(block => {
      switch (block.type) {
        case 'heading_1':
          return `# ${this.extractTextFromRichText(block.heading_1.rich_text)}`;
        case 'heading_2':
          return `## ${this.extractTextFromRichText(block.heading_2.rich_text)}`;
        case 'heading_3':
          return `### ${this.extractTextFromRichText(block.heading_3.rich_text)}`;
        case 'paragraph':
          return this.extractTextFromRichText(block.paragraph.rich_text);
        case 'bulleted_list_item':
          return `- ${this.extractTextFromRichText(block.bulleted_list_item.rich_text)}`;
        case 'numbered_list_item':
          return `1. ${this.extractTextFromRichText(block.numbered_list_item.rich_text)}`;
        case 'code':
          return `\`\`\`\n${this.extractTextFromRichText(block.code.rich_text)}\n\`\`\``;
        default:
          return '';
      }
    }).filter(text => text.trim()).join('\n\n');
  }

  // リッチテキストからプレーンテキストを抽出
  private extractTextFromRichText(richText: any[]): string {
    return richText.map(text => text.plain_text).join('');
  }

  // Notionページのプロパティからタイトルを抽出
  private extractTitle(properties: any): string {
    const titleProperty = Object.values(properties).find((prop: any) => prop.type === 'title') as any;
    if (titleProperty && titleProperty.title && titleProperty.title.length > 0) {
      return titleProperty.title[0].plain_text;
    }
    return 'Untitled';
  }

  // プロパティからURLを抽出
  private extractUrl(properties: any): string | null {
    // Notionデータベースのカラム名に基づいて抽出
    console.log('Available properties:', Object.keys(properties));
    
    // マニュアル（URL）カラムから抽出 - URL型の場合（最優先）
    if (properties['マニュアル（URL）'] && properties['マニュアル（URL）'].url) {
      console.log('Found URL in マニュアル（URL）:', properties['マニュアル（URL）'].url);
      return properties['マニュアル（URL）'].url;
    }
    
    // マニュアル (URL) カラムから抽出 - 空白ありバージョン
    if (properties['マニュアル (URL)'] && properties['マニュアル (URL)'].url) {
      console.log('Found URL in マニュアル (URL):', properties['マニュアル (URL)'].url);
      return properties['マニュアル (URL)'].url;
    }
    
    // ファイル型の場合
    if (properties['マニュアル（URL）'] && properties['マニュアル（URL）'].files && properties['マニュアル（URL）'].files.length > 0) {
      return properties['マニュアル（URL）'].files[0].file?.url || properties['マニュアル（URL）'].files[0].external?.url;
    }
    
    // fallback
    if (properties['URL'] && properties['URL'].url) {
      return properties['URL'].url;
    }
    
    return null;
  }

  // 清書URLを抽出
  private extractRefinedUrl(properties: any): string | null {
    // 清書 (URL) カラムから抽出（ファイル型の場合）
    if (properties['清書 (URL)'] && properties['清書 (URL)'].files && properties['清書 (URL)'].files.length > 0) {
      return properties['清書 (URL)'].files[0].file?.url || properties['清書 (URL)'].files[0].external?.url;
    }
    
    // 清書 (URL) カラムから抽出（URL型の場合）
    if (properties['清書 (URL)'] && properties['清書 (URL)'].url) {
      return properties['清書 (URL)'].url;
    }
    
    return null;
  }

  // プロパティからカテゴリを抽出
  private extractCategory(properties: any): string {
    if (properties['カテゴリー'] && properties['カテゴリー'].select) {
      const category = properties['カテゴリー'].select.name;
      // カテゴリをシステム用に変換
      switch (category) {
        case '算定': return 'calculation';
        case 'クリニック業務': return 'clinic';
        case '健診業務': return 'checkup';
        default: return 'other';
      }
    }
    return 'other';
  }

  // マニュアル名を抽出
  private extractManualTitle(properties: any): string {
    if (properties['マニュアル名'] && properties['マニュアル名'].title) {
      return properties['マニュアル名'].title[0]?.plain_text || 'Untitled';
    }
    return 'Untitled';
  }

  // 実際のNotionデータに基づくモック（Notionのスクリーンショットより）
  private getMockManuals(): NotionIntegration[] {
    return [
      {
        id: '1',
        title: '難病外来指導管理料マニュアル',
        url: 'file.notion.so/f/...ル.pdf',
        category: 'calculation',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '2',
        title: '特定薬剤治療管理料1マニュアル',
        url: 'file.notion.so/f/...AB.pdf',
        category: 'calculation',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '3',
        title: '処方箋紛失マニュアル',
        url: 'file.notion.so/f/...AB.pdf',
        category: 'clinic',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '4',
        title: '保険証マニュアル',
        url: 'file.notion.so/f/...AB.pdf',
        category: 'clinic',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '5',
        title: '月報業務作成マニュアル',
        url: 'file.notion.so/f/...AB.pdf',
        category: 'clinic',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '6',
        title: 'デジスマ予約マニュアル',
        url: 'file.notion.so/f/...AB.pdf',
        category: 'clinic',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '7',
        title: 'オンライン請求送信マニュアル',
        url: 'file.notion.so/f/...AB.pdf',
        category: 'clinic',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '8',
        title: '特定疾患管理料、難病指導管理料、生活習慣病管理料',
        url: 'file.notion.so/f/...AB.pdf',
        category: 'calculation',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '9',
        title: '在宅自己注射指導管理料マニュアル',
        url: 'file.notion.so/f/...AB.pdf',
        category: 'calculation',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '10',
        title: '血糖自己測定器加算マニュアル',
        url: 'file.notion.so/f/...AB.pdf',
        category: 'calculation',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '11',
        title: '胃カメラマニュアル',
        url: 'file.notion.so/f/...AB.pdf',
        category: 'clinic',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '12',
        title: '悪性腫瘍特異物質治療管理料マニュアル',
        url: 'file.notion.so/f/...AB.pdf',
        category: 'calculation',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '13',
        title: 'ピロリ菌検査マニュアル',
        url: 'file.notion.so/f/...AB.pdf',
        category: 'clinic',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '14',
        title: '62肝炎公費マニュアル',
        url: 'file.notion.so/f/...AB.pdf',
        category: 'calculation',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '15',
        title: '健診マニュアル1章',
        url: 'file.notion.so/f/...A0.pdf',
        category: 'checkup',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '16',
        title: '健診マニュアル2章',
        url: 'file.notion.so/f/...A0.pdf',
        category: 'checkup',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '17',
        title: '健診マニュアル3章',
        url: 'file.notion.so/f/...A0.pdf',
        category: 'checkup',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '18',
        title: '健診マニュアル4章',
        url: 'file.notion.so/f/...A0.pdf',
        category: 'checkup',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '19',
        title: '健診マニュアル5章',
        url: 'file.notion.so/f/...A0.pdf',
        category: 'checkup',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '20',
        title: '健診マニュアル6章',
        url: 'file.notion.so/f/...A0.pdf',
        category: 'checkup',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '21',
        title: '健診マニュアル7章',
        url: 'file.notion.so/f/...A0.pdf',
        category: 'checkup',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '22',
        title: '健診マニュアル8章',
        url: 'file.notion.so/f/...A0.pdf',
        category: 'checkup',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '23',
        title: '健診マニュアル9章',
        url: 'file.notion.so/f/...A0.pdf',
        category: 'checkup',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '24',
        title: '健診マニュアル10章',
        url: 'file.notion.so/f/...A0.pdf',
        category: 'checkup',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '25',
        title: '健診マニュアル11章',
        url: 'file.notion.so/f/...A0.pdf',
        category: 'checkup',
        lastSync: new Date().toISOString(),
        status: 'synced'
      },
      {
        id: '26',
        title: '健診マニュアル12章',
        url: 'file.notion.so/f/...A0.pdf',
        category: 'checkup',
        lastSync: new Date().toISOString(),
        status: 'synced'
      }
    ];
  }

  // NotionURLからページIDを抽出
  private extractPageId(url: string): string {
    const match = url.match(/notion\.so\/([a-zA-Z0-9-]+)/);
    if (match) {
      return match[1].replace(/-/g, '');
    }
    throw new Error('Invalid Notion URL');
  }

  // ページの更新チェック
  async checkForUpdates(pageId: string, lastSync: string): Promise<boolean> {
    try {
      if (!this.apiKey) {
        // 公開ページの場合は常に最新として扱う
        return false;
      }

      const response = await fetch(`${this.baseURL}/pages/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Notion-Version': '2022-06-28'
        }
      });

      if (!response.ok) {
        return false;
      }

      const pageData = await response.json();
      const lastModified = new Date(pageData.last_edited_time);
      const lastSyncDate = new Date(lastSync);

      return lastModified > lastSyncDate;
    } catch (error) {
      console.error('Notion update check error:', error);
      return false;
    }
  }
}

// シングルトンインスタンス
let notionAPI: NotionAPI | null = null;

export const initializeNotionAPI = (apiKey?: string) => {
  notionAPI = new NotionAPI(apiKey);
};

export const getNotionAPI = (): NotionAPI => {
  if (!notionAPI) {
    notionAPI = new NotionAPI(); // APIキーなしで初期化
  }
  return notionAPI;
};

export default NotionAPI;