// Notion OAuth連携用クライアント

export interface NotionOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface NotionWorkspace {
  id: string;
  name: string;
  icon?: string;
}

export interface NotionOAuthResponse {
  access_token: string;
  workspace: NotionWorkspace;
  bot_id: string;
  owner: {
    type: string;
    user?: any;
    workspace?: boolean;
  };
}

class NotionOAuthAPI {
  private config: NotionOAuthConfig;

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_NOTION_CLIENT_ID,
      clientSecret: import.meta.env.VITE_NOTION_CLIENT_SECRET,
      redirectUri: 'http://localhost:5173/auth/notion/callback'  // 開発環境用に固定
    };
  }

  // Notion OAuth認証URLを生成
  generateAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      owner: 'user',
      redirect_uri: this.config.redirectUri
    });

    return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;
  }

  // 認証コードからアクセストークンを取得
  async exchangeCodeForToken(code: string): Promise<NotionOAuthResponse> {
    try {
      console.log('Exchanging code for token:', code);
      
      // モック実装（実際のAPI呼び出しは一時的に無効化）
      const mockResponse: NotionOAuthResponse = {
        access_token: 'mock_token_' + Date.now(),
        workspace: {
          id: 'workspace_001',
          name: 'メドナビAIのワークスペース',
          icon: '🏥'
        },
        bot_id: 'bot_001',
        owner: {
          type: 'workspace',
          workspace: true
        }
      };

      // アクセストークンをローカルストレージに保存
      this.saveAccessToken(mockResponse.access_token);
      this.saveWorkspaceInfo(mockResponse.workspace);

      console.log('Mock OAuth success:', mockResponse);
      return mockResponse;

      // 実際のAPI呼び出し（コメントアウト）
      /*
      const response = await fetch('https://api.notion.com/v1/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.config.redirectUri
        })
      });

      if (!response.ok) {
        throw new Error(`OAuth token exchange failed: ${response.status}`);
      }

      const data = await response.json();
      
      // アクセストークンをローカルストレージに保存
      this.saveAccessToken(data.access_token);
      this.saveWorkspaceInfo(data.workspace);

      return data;
      */
    } catch (error) {
      console.error('Notion OAuth error:', error);
      throw new Error('Notion認証に失敗しました');
    }
  }

  // アクセストークンを保存
  private saveAccessToken(token: string): void {
    localStorage.setItem('notion_access_token', token);
  }

  // ワークスペース情報を保存
  private saveWorkspaceInfo(workspace: NotionWorkspace): void {
    localStorage.setItem('notion_workspace', JSON.stringify(workspace));
  }

  // 保存されたアクセストークンを取得
  getAccessToken(): string | null {
    return localStorage.getItem('notion_access_token');
  }

  // 保存されたワークスペース情報を取得
  getWorkspaceInfo(): NotionWorkspace | null {
    const workspace = localStorage.getItem('notion_workspace');
    return workspace ? JSON.parse(workspace) : null;
  }

  // 認証状態をチェック
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // 認証をクリア
  clearAuthentication(): void {
    localStorage.removeItem('notion_access_token');
    localStorage.removeItem('notion_workspace');
  }

  // 認証されたAPIリクエストを送信
  async authenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Notion access token not found');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
      ...options.headers
    };

    return fetch(`https://api.notion.com/v1${endpoint}`, {
      ...options,
      headers
    });
  }

  // 認証済みユーザーのワークスペース情報を取得
  async getCurrentUser(): Promise<any> {
    try {
      const response = await this.authenticatedRequest('/users/me');
      
      if (!response.ok) {
        throw new Error(`User info fetch failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      throw new Error('ユーザー情報の取得に失敗しました');
    }
  }
}

// シングルトンインスタンス
let notionOAuthAPI: NotionOAuthAPI | null = null;

export const getNotionOAuthAPI = (): NotionOAuthAPI => {
  if (!notionOAuthAPI) {
    notionOAuthAPI = new NotionOAuthAPI();
  }
  return notionOAuthAPI;
};

export default NotionOAuthAPI;