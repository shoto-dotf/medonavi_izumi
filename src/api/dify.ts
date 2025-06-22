import { AIType } from '../types';

// チャット用API設定
const CHAT_API_ENDPOINT = 'https://api.dify.ai/v1/chat-messages';
const CHAT_API_KEY = 'app-UTXkKP1yVjS7WlwusquhFlcf';

// 清書用ワークフローAPI設定
const WORKFLOW_API_ENDPOINT = 'https://api.dify.ai/v1/workflows/run';
const WORKFLOW_API_KEY = 'app-79fszVyBoAH6W4BT8Skre5yj';
const WORKFLOW_ID = 'f0618ba1-0551-4f21-a759-28591a93eee8';

export const fetchDifyResponse = async (
  message: string,
  aiType: AIType
): Promise<string> => {
  try {
    console.log(`Calling Dify API with message: ${message} and aiType: ${aiType}`);
    
    // Updated request body to match Dify API requirements
    const requestBody = {
      conversation_id: null, // Optional, can be null for new conversations
      inputs: {}, // Additional parameters if needed
      query: message,
      response_mode: "blocking",
      user: "shioya0001CL"
    };
    
    console.log('Request body:', JSON.stringify(requestBody));
    
    const response = await fetch(CHAT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHAT_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.answer || 'お答えできる情報がありません。';
  } catch (error) {
    console.error('Error fetching from Dify API:', error);
    throw error;
  }
};

// 清書用ワークフローAPI
export const fetchDifyRefinement = async (originalText: string): Promise<string> => {
  try {
    console.log(`Calling Dify Workflow API for text refinement: ${originalText}`);
    
    const requestBody = {
      inputs: {
        refined_text: originalText
      },
      response_mode: "blocking",
      user: "shioya0001CL"
    };
    
    console.log('Workflow request body:', JSON.stringify(requestBody));
    
    const response = await fetch(`${WORKFLOW_API_ENDPOINT}/${WORKFLOW_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WORKFLOW_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Workflow API error response:', errorText);
      throw new Error(`Workflow API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Workflow API response:', data);
    console.log('Full response structure:', JSON.stringify(data, null, 2));
    
    // より詳細なレスポンス構造の確認
    let extractedText = '';
    
    // 様々な可能なパスを試行
    if (data.data?.outputs) {
      extractedText = data.data.outputs.text || 
                     data.data.outputs.answer || 
                     data.data.outputs.result || 
                     data.data.outputs.output ||
                     JSON.stringify(data.data.outputs);
    } else if (data.outputs) {
      extractedText = data.outputs.text || 
                     data.outputs.answer || 
                     data.outputs.result ||
                     data.outputs.output ||
                     JSON.stringify(data.outputs);
    } else if (data.result) {
      extractedText = data.result;
    } else if (data.answer) {
      extractedText = data.answer;
    } else {
      // 完全なレスポンスをログに記録
      console.log('Unable to extract text, full response:', data);
      extractedText = `API接続成功！\n\n元のテキスト: ${originalText}\n\n[Dify応答構造を確認中...]\n\n応答データ: ${JSON.stringify(data, null, 2)}`;
    }
    
    return extractedText || 'レスポンスからテキストを抽出できませんでした。';
  } catch (error) {
    console.error('Error fetching from Dify Workflow API:', error);
    // エラー時はモック応答を返す
    return `【清書結果】\n\n${originalText}\n\n上記の内容を以下のように整理いたします：\n\n■ 目的\n明確で読みやすいマニュアル作成\n\n■ 手順\n1. 原文の内容を整理\n2. 構造化された形式に変換\n3. 読みやすさを向上\n\n※ 実際のDify APIとの接続でエラーが発生したため、サンプル応答を表示しています。`;
  }
};