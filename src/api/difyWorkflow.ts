// Dify Workflow API連携用クライアント

export interface DifyWorkflowRequest {
  inputs: {
    refined_text: string;
  };
  response_mode: 'blocking' | 'streaming';
  user: string;
}

export interface DifyWorkflowResponse {
  workflow_run_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: string;
    outputs: {
      text?: string;
      [key: string]: any;
    };
    error?: string;
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: number;
    finished_at: number;
  };
}

class DifyWorkflowAPI {
  private apiKey: string;
  private workflowId: string;
  private baseURL = 'https://api.dify.ai/v1/workflows/run';

  constructor(apiKey: string, workflowId: string) {
    this.apiKey = apiKey;
    this.workflowId = workflowId;
  }

  async refineText(text: string): Promise<string> {
    try {
      console.log('Calling Dify Workflow API for text refinement...');
      
      const requestBody: DifyWorkflowRequest = {
        inputs: {
          refined_text: text
        },
        response_mode: 'blocking',
        user: 'shioya0001CL'
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dify Workflow API error response:', errorText);
        throw new Error(`Dify Workflow API error: ${response.status} - ${errorText}`);
      }

      const data: DifyWorkflowResponse = await response.json();
      console.log('Dify Workflow API response:', data);

      // レスポンスからテキストを抽出
      if (data.data?.outputs?.text) {
        return data.data.outputs.text;
      } else if (data.data?.error) {
        throw new Error(`Workflow error: ${data.data.error}`);
      } else {
        // outputs内の他のキーをチェック
        const outputs = data.data?.outputs || {};
        const outputKeys = Object.keys(outputs);
        
        // 最初に見つかった文字列値を返す
        for (const key of outputKeys) {
          if (typeof outputs[key] === 'string' && outputs[key].trim()) {
            return outputs[key];
          }
        }
        
        throw new Error('No text output found in workflow response');
      }
    } catch (error) {
      console.error('Dify Workflow API Error:', error);
      if (error instanceof Error) {
        throw new Error(`テキスト清書に失敗しました: ${error.message}`);
      } else {
        throw new Error('テキスト清書に失敗しました');
      }
    }
  }
}

// シングルトンインスタンス
const difyWorkflowAPI = new DifyWorkflowAPI(
  'app-79fszVyBoAH6W4BT8Skre5yj',
  'f0618ba1-0551-4f21-a759-28591a93eee8'
);

export const getDifyWorkflowAPI = (): DifyWorkflowAPI => {
  return difyWorkflowAPI;
};

export default DifyWorkflowAPI;