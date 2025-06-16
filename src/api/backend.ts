// バックエンドAPI連携用クライアント

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  clinic_id: string;
}

export interface ManualDraft {
  id: string;
  raw_content: string;
  refined_content?: string;
  slide_html?: string;
  status: ManualStatus;
  metadata: {
    user_id: string;
    category: string;
    created_at: string;
    updated_at: string;
  };
  dify_index_id?: string;
}

export type ManualStatus = 
  | 'draft'           // 下書き
  | 'refining'        // GPT-4o処理中
  | 'pending'         // 管理者確認待ち
  | 'processing'      // スライド生成中
  | 'active';         // 公開中

export interface ManualListResponse {
  manuals: ManualDraft[];
  total: number;
  page: number;
  per_page: number;
}

class BackendAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  // 認証ヘッダー
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // エラーハンドリング
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // ====================
  // 認証関連
  // ====================

  async login(userId: string, password: string): Promise<{ user: User; token: string }> {
    // モック実装
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          id: 'user_001',
          email: 'staff@clinic.jp',
          name: 'スタッフ太郎',
          role: userId === 'admin' ? 'admin' : 'staff',
          clinic_id: 'clinic_001'
        };
        const token = 'mock_jwt_token_' + Date.now();
        this.token = token;
        localStorage.setItem('auth_token', token);
        resolve({ user, token });
      }, 500);
    });
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // ====================
  // マニュアル作成関連
  // ====================

  // 下書き保存
  async saveDraft(content: string, metadata: any): Promise<{ draft_id: string }> {
    // モック実装
    return new Promise((resolve) => {
      setTimeout(() => {
        const draft_id = 'draft_' + Date.now();
        // 実際はlocalStorageではなくサーバーに保存
        const drafts = JSON.parse(localStorage.getItem('manual_drafts') || '[]');
        drafts.push({
          id: draft_id,
          raw_content: content,
          status: 'draft',
          metadata: {
            ...metadata,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        });
        localStorage.setItem('manual_drafts', JSON.stringify(drafts));
        resolve({ draft_id });
      }, 300);
    });
  }

  // GPT-4o清書実行
  async refineManual(draft_id: string): Promise<{ refined_content: string }> {
    // 実際のAPI実装時
    // const response = await fetch(`${this.baseURL}/manual/refine`, {
    //   method: 'POST',
    //   headers: this.getHeaders(),
    //   body: JSON.stringify({ draft_id })
    // });
    // return this.handleResponse(response);

    // モック実装
    return new Promise((resolve) => {
      setTimeout(() => {
        const refined_content = `# プロフェッショナルマニュアル

## 1. 概要
このマニュアルは業務効率化のために作成されました。

## 2. 手順
1. **準備段階**
   - 必要な資料を準備
   - システムにログイン

2. **実行段階**
   - 手順に従って作業を進める
   - チェックポイントで確認

3. **完了段階**
   - 結果を確認
   - レポートを作成

## 3. 注意事項
- 個人情報の取り扱いに注意
- 不明な点は管理者に確認`;
        
        resolve({ refined_content });
      }, 2000);
    });
  }

  // マニュアル完了（管理者処理後）
  async completeManual(
    manual_id: string, 
    refined_content: string
  ): Promise<{ status: ManualStatus }> {
    // モック実装
    return new Promise((resolve) => {
      setTimeout(() => {
        const drafts = JSON.parse(localStorage.getItem('manual_drafts') || '[]');
        const manual = drafts.find((d: any) => d.id === manual_id);
        if (manual) {
          manual.status = 'pending';
          manual.refined_content = refined_content;
          localStorage.setItem('manual_drafts', JSON.stringify(drafts));
        }
        resolve({ status: 'pending' });
      }, 300);
    });
  }

  // ====================
  // マニュアル管理関連
  // ====================

  // マニュアル一覧取得
  async getManuals(params?: {
    status?: ManualStatus;
    category?: string;
    search?: string;
    page?: number;
  }): Promise<ManualListResponse> {
    // モック実装
    return new Promise((resolve) => {
      setTimeout(() => {
        const allManuals = JSON.parse(localStorage.getItem('manual_drafts') || '[]');
        
        // フィルタリング
        let filtered = allManuals;
        if (params?.status) {
          filtered = filtered.filter((m: any) => m.status === params.status);
        }
        if (params?.category) {
          filtered = filtered.filter((m: any) => m.metadata.category === params.category);
        }
        if (params?.search) {
          filtered = filtered.filter((m: any) => 
            m.raw_content.includes(params.search) || 
            m.refined_content?.includes(params.search)
          );
        }
        
        resolve({
          manuals: filtered,
          total: filtered.length,
          page: params?.page || 1,
          per_page: 20
        });
      }, 500);
    });
  }

  // Notion同期
  async syncNotion(manual_id: string): Promise<{ sync_status: string }> {
    // モック実装
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ sync_status: 'synced' });
      }, 1500);
    });
  }

  // ====================
  // 管理者用API
  // ====================

  // 保留中のマニュアル取得
  async getPendingManuals(): Promise<{ manuals: ManualDraft[] }> {
    const response = await this.getManuals({ status: 'pending' });
    return { manuals: response.manuals };
  }

  // マニュアルステータス更新
  async updateManualStatus(
    manual_id: string, 
    status: ManualStatus
  ): Promise<{ success: boolean }> {
    // モック実装
    return new Promise((resolve) => {
      setTimeout(() => {
        const drafts = JSON.parse(localStorage.getItem('manual_drafts') || '[]');
        const manual = drafts.find((d: any) => d.id === manual_id);
        if (manual) {
          manual.status = status;
          manual.metadata.updated_at = new Date().toISOString();
          localStorage.setItem('manual_drafts', JSON.stringify(drafts));
        }
        resolve({ success: true });
      }, 300);
    });
  }

  // HTMLスライド保存
  async saveSlideHTML(
    manual_id: string,
    slide_html: string
  ): Promise<{ success: boolean }> {
    // モック実装
    return new Promise((resolve) => {
      setTimeout(() => {
        const drafts = JSON.parse(localStorage.getItem('manual_drafts') || '[]');
        const manual = drafts.find((d: any) => d.id === manual_id);
        if (manual) {
          manual.slide_html = slide_html;
          manual.status = 'active';
          manual.dify_index_id = 'kb_' + Date.now();
          manual.metadata.updated_at = new Date().toISOString();
          localStorage.setItem('manual_drafts', JSON.stringify(drafts));
        }
        resolve({ success: true });
      }, 300);
    });
  }

  // ====================
  // チャット関連
  // ====================

  async sendChatMessage(params: {
    message: string;
    ai_type: 'calculation' | 'clinic' | 'checkup';
    context?: string;
  }): Promise<{ answer: string; sources: string[] }> {
    // モック実装
    return new Promise((resolve) => {
      setTimeout(() => {
        const answers = {
          calculation: '診療報酬の算定について回答します...',
          clinic: 'クリニック業務について回答します...',
          checkup: '健診業務について回答します...'
        };
        
        resolve({
          answer: answers[params.ai_type],
          sources: ['マニュアルA', 'マニュアルB']
        });
      }, 1000);
    });
  }
}

// シングルトンインスタンス
let backendAPI: BackendAPI | null = null;

export const getBackendAPI = (): BackendAPI => {
  if (!backendAPI) {
    backendAPI = new BackendAPI(import.meta.env.VITE_API_URL || '/api');
  }
  return backendAPI;
};

export default BackendAPI;