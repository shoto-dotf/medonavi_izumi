import { AIType } from '../types';

// QA AI用API設定
const QA_API_ENDPOINT = 'https://api.dify.ai/v1/chat-messages';
const QA_API_KEY = import.meta.env.VITE_DIFY_QA_API_KEY || 'app-UTXkKP1yVjS7WlwusquhFlcf';

// マニュアル清書AI用ワークフローAPI設定
const REFINEMENT_API_ENDPOINT = 'https://api.dify.ai/v1/workflows/run';
const REFINEMENT_API_KEY = import.meta.env.VITE_DIFY_REFINEMENT_API_KEY || 'app-79fszVyBoAH6W4BT8Skre5yj';
const REFINEMENT_WORKFLOW_ID = import.meta.env.VITE_DIFY_REFINEMENT_WORKFLOW_ID || 'f0618ba1-0551-4f21-a759-28591a93eee8';

// ユーザーID
const DIFY_USER_ID = import.meta.env.VITE_DIFY_USER_ID || 'shioya0001CL';

// QA AI用のAPI呼び出し
export const fetchQAResponse = async (
  message: string,
  aiType: AIType
): Promise<string> => {
  try {
    console.log(`Calling QA AI with message: ${message} and aiType: ${aiType}`);
    
    const requestBody = {
      conversation_id: null,
      inputs: { ai_type: aiType }, // AIタイプを入力として追加
      query: message,
      response_mode: "blocking",
      user: DIFY_USER_ID
    };
    
    console.log('QA AI request body:', JSON.stringify(requestBody));
    
    const response = await fetch(QA_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QA_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('QA AI error response:', errorText);
      throw new Error(`QA AI error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.answer || 'お答えできる情報がありません。';
  } catch (error) {
    console.error('Error fetching from QA AI:', error);
    throw error;
  }
};

// 後方互換性のため
export const fetchDifyResponse = fetchQAResponse;

// マニュアル清書AI用のワークフローAPI
export const fetchManualRefinement = async (originalText: string): Promise<string> => {
  try {
    console.log(`Calling Manual Refinement AI for text refinement: ${originalText.substring(0, 100)}...`);
    
    const requestBody = {
      inputs: {
        original_text: originalText // 修正: パラメータ名を正しく変更
      },
      response_mode: "blocking",
      user: DIFY_USER_ID
    };
    
    console.log('Manual Refinement AI request body:', JSON.stringify(requestBody));
    
    const response = await fetch(`${REFINEMENT_API_ENDPOINT}/${REFINEMENT_WORKFLOW_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${REFINEMENT_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Manual Refinement AI error response:', errorText);
      throw new Error(`Manual Refinement AI error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Manual Refinement AI response:', data);
    
    // レスポンス構造の確認と抽出
    let extractedText = '';
    
    // 一般的なDify Workflowのレスポンス構造を確認
    if (data.data?.outputs) {
      // 最も一般的なパターン
      extractedText = data.data.outputs.refined_text || 
                     data.data.outputs.result || 
                     data.data.outputs.output ||
                     data.data.outputs.text ||
                     data.data.outputs.answer;
    } else if (data.outputs) {
      extractedText = data.outputs.refined_text ||
                     data.outputs.result ||
                     data.outputs.output ||
                     data.outputs.text ||
                     data.outputs.answer;
    } else if (data.result) {
      extractedText = data.result;
    }
    
    if (!extractedText) {
      console.log('Unable to extract refined text, full response:', JSON.stringify(data, null, 2));
      // デバッグ用にレスポンス構造を返す
      return `【デバッグ】API接続成功\n\n元のテキスト: ${originalText.substring(0, 200)}...\n\nAPI応答構造:\n${JSON.stringify(data, null, 2)}`;
    }
    
    return extractedText;
  } catch (error) {
    console.error('Error fetching from Manual Refinement AI:', error);
    // エラー時のフォールバック
    return `【清書結果】\n\n${originalText}\n\n上記の内容を以下のように整理いたします：\n\n■ 目的\n明確で読みやすいマニュアル作成\n\n■ 手順\n1. 原文の内容を整理\n2. 構造化された形式に変換\n3. 読みやすさを向上\n\n※ AIとの接続でエラーが発生したため、サンプル応答を表示しています。`;
  }
};

// 後方互換性のため
export const fetchDifyRefinement = fetchManualRefinement;