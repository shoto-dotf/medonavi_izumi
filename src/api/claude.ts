// Claude API連携用クライアント

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeRequest {
  model: string;
  max_tokens: number;
  messages: ClaudeMessage[];
  system?: string;
}

export interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

class ClaudeAPI {
  private apiKey: string;
  private baseURL = 'https://api.anthropic.com/v1/messages';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateManual(
    title: string,
    category: string,
    description: string,
    notionContent?: string
  ): Promise<string> {
    const systemPrompt = `
あなたはクリニック向けのマニュアル作成専門のAIアシスタントです。
以下の要件に従って、実用的で分かりやすいマニュアルを作成してください：

1. 構造化されたマニュアル（目的、手順、注意事項、FAQ等）
2. クリニックスタッフが実際に使える具体的な内容
3. 見やすいMarkdown形式
4. 専門用語は分かりやすく説明
`;

    const userPrompt = `
以下の情報を基に、クリニック向けの詳細なマニュアルを作成してください：

**マニュアルタイトル:** ${title}
**カテゴリ:** ${category}
**詳細・要求事項:** ${description}
${notionContent ? `**参考資料:** ${notionContent}` : ''}

マニュアルは以下の構成で作成してください：
1. 目的・概要
2. 対象者
3. 手順（ステップバイステップ）
4. 注意事項・ポイント
5. よくある質問（FAQ）
6. 関連文書・参考資料

実際のクリニック業務で使える、実用的な内容にしてください。
`;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ]
        } satisfies ClaudeRequest)
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data: ClaudeResponse = await response.json();
      return data.content[0]?.text || '';
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error('マニュアル生成に失敗しました');
    }
  }

  async improveManual(
    currentManual: string,
    improvementRequest: string
  ): Promise<string> {
    const systemPrompt = `
あなたはクリニック向けマニュアルの改善専門AIです。
既存のマニュアルをユーザーの要求に基づいて改善してください。
`;

    const userPrompt = `
以下のマニュアルを改善してください：

**現在のマニュアル:**
${currentManual}

**改善要求:**
${improvementRequest}

改善されたマニュアルを返してください。
`;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ]
        } satisfies ClaudeRequest)
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data: ClaudeResponse = await response.json();
      return data.content[0]?.text || '';
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error('マニュアル改善に失敗しました');
    }
  }
}

// シングルトンインスタンス
let claudeAPI: ClaudeAPI | null = null;

export const initializeClaudeAPI = (apiKey: string) => {
  claudeAPI = new ClaudeAPI(apiKey);
};

export const getClaudeAPI = (): ClaudeAPI => {
  if (!claudeAPI) {
    throw new Error('Claude API not initialized. Call initializeClaudeAPI first.');
  }
  return claudeAPI;
};

export default ClaudeAPI;