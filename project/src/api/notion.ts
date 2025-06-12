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
  category: string;
  lastSync: string;
  status: 'synced' | 'outdated' | 'error';
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