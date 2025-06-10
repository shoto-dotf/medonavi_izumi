import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Save, FileText, CheckCircle, Download, Eye, Loader } from 'lucide-react';

// Global state for manual content (as specified in requirements)
declare global {
  interface Window {
    currentManualContent: string;
    currentRefinedContent: string;
    generatedSlideHTML: string;
  }
}

// Initialize global state
if (typeof window !== 'undefined') {
  window.currentManualContent = window.currentManualContent || '';
  window.currentRefinedContent = window.currentRefinedContent || '';
  window.generatedSlideHTML = window.generatedSlideHTML || '';
}

const ManualCreation: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [refinedContent, setRefinedContent] = useState('');

  // テンプレート定義
  const templates = {
    procedure: {
      title: '手順テンプレート',
      content: `マニュアルタイトル: [ここにタイトルを入力]

目的:
このマニュアルの目的と対象者を記載してください。

準備するもの:
- 必要な資料や機器
- 事前に確認しておくこと

手順:
1. 第一段階の作業
   - 具体的な操作内容
   - 注意すべきポイント

2. 第二段階の作業
   - 具体的な操作内容
   - 注意すべきポイント

3. 完了確認
   - 確認項目
   - 次のステップ

注意事項:
- 重要な注意点
- よくある間違いとその対策

関連資料:
- 参考になる文書やシステム`
    },
    checklist: {
      title: 'チェックリストテンプレート',
      content: `チェックリスト: [ここにタイトルを入力]

事前準備:
□ 必要な資料の準備
□ システムの動作確認
□ 関係者への連絡

実行項目:
□ 作業項目1の実施
□ 作業項目2の実施
□ 作業項目3の実施
□ 中間確認の実施

完了確認:
□ 結果の確認
□ データの保存
□ 報告書の作成
□ 関係者への報告

緊急時対応:
□ 問題発生時の連絡先確認
□ エスカレーション手順の確認
□ 代替手段の準備

補足情報:
- 各項目の詳細説明
- 参考資料へのリンク`
    },
    faq: {
      title: 'FAQ形式テンプレート',
      content: `FAQ: [ここにタイトルを入力]

基本的な質問:

Q1: この業務はいつ実施しますか？
A1: [回答を記載]

Q2: 必要な権限はありますか？
A2: [回答を記載]

Q3: 所要時間はどのくらいですか？
A3: [回答を記載]

トラブルシューティング:

Q4: エラーが発生した場合はどうしますか？
A4: [回答を記載]

Q5: システムが応答しない場合は？
A5: [回答を記載]

Q6: データが見つからない場合は？
A6: [回答を記載]

その他:

Q7: 担当者が不在の場合は？
A7: [回答を記載]

Q8: 緊急時の連絡先は？
A8: [回答を記載]`
    }
  };

  // コンポーネント初期化時に下書きを復元
  useEffect(() => {
    const savedDraft = localStorage.getItem('manualDraft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setUserInput(draft.content || '');
      window.currentManualContent = draft.content || '';
    }
  }, []);

  // 下書き保存
  const saveDraft = () => {
    const draft = {
      content: userInput,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('manualDraft', JSON.stringify(draft));
    showNotificationMessage('下書きを保存しました', 'success');
  };

  // テンプレート挿入
  const insertTemplate = (type: keyof typeof templates) => {
    const template = templates[type];
    setUserInput(template.content);
    window.currentManualContent = template.content;
  };

  // Step 2への遷移（GPT清書処理）
  const proceedToStep2 = async () => {
    if (!userInput.trim()) {
      showNotificationMessage('マニュアル内容を入力してください', 'error');
      return;
    }

    window.currentManualContent = userInput;
    setCurrentStep(2);
    setIsLoading(true);

    // モックGPT清書処理（2秒後にモックデータを表示）
    setTimeout(() => {
      const mockRefinedContent = generateMockRefinedContent(userInput);
      setRefinedContent(mockRefinedContent);
      window.currentRefinedContent = mockRefinedContent;
      setIsLoading(false);
    }, 2000);

    // TODO: 実際のAPI実装時に以下のコードを使用
    // try {
    //   const response = await callDifyGPTAPI({
    //     content: userInput,
    //     task: 'refine_and_structure'
    //   });
    //   setRefinedContent(response.content);
    //   window.currentRefinedContent = response.content;
    //   setIsLoading(false);
    // } catch (error) {
    //   showNotificationMessage('清書処理に失敗しました', 'error');
    //   setIsLoading(false);
    // }
  };

  // Step 3への遷移（Claude スライド生成）
  const proceedToStep3 = async () => {
    setCurrentStep(3);
    setIsLoading(true);

    // モックClaude スライド生成（3秒後に完了画面を表示）
    setTimeout(() => {
      const mockSlideHTML = generateMockSlideHTML(refinedContent);
      window.generatedSlideHTML = mockSlideHTML;
      setIsLoading(false);
    }, 3000);

    // TODO: 実際のAPI実装時に以下のコードを使用
    // try {
    //   const response = await callDifyClaudeAPI({
    //     content: refinedContent,
    //     task: 'generate_html_slides'
    //   });
    //   window.generatedSlideHTML = response.html;
    //   setIsLoading(false);
    // } catch (error) {
    //   showNotificationMessage('スライド生成に失敗しました', 'error');
    //   setIsLoading(false);
    // }
  };

  // ステップ間の移動
  const backToStep1 = () => {
    setCurrentStep(1);
  };

  const backToStep2 = () => {
    setCurrentStep(2);
  };

  // モックデータ生成関数
  const generateMockRefinedContent = (content: string): string => {
    return `# マニュアル（AI清書版）

## 概要
${content.substring(0, 100)}...の内容をAIが清書・構造化しました。

## 目的
このマニュアルは業務の効率化と品質向上を目的としています。

## 対象者
- 新入スタッフ
- 経験者の復習用
- 業務引き継ぎ時の参考

## 詳細手順

### 準備段階
1. **事前確認**
   - 必要な資料の準備
   - システムの動作確認
   - 権限の確認

2. **初期設定**
   - ログイン
   - 初期画面の確認
   - 必要なモジュールの起動

### 実行段階
1. **メイン作業**
   - データの入力
   - 確認作業
   - 保存処理

2. **品質確認**
   - ダブルチェック
   - エラー確認
   - 完了報告

### 完了段階
1. **後処理**
   - システムからのログアウト
   - 資料の整理
   - 次回に向けた準備

## 注意事項
⚠️ **重要**: 患者情報の取り扱いには十分注意してください
💡 **ヒント**: 不明な点は必ず上司に確認してください
📋 **チェック**: 各ステップ完了後は必ず確認を行ってください

## トラブルシューティング
### よくある問題と解決方法
1. **システムエラー**: 再ログインを試してください
2. **データ保存失敗**: ネットワーク接続を確認してください
3. **権限エラー**: 管理者に連絡してください

## 関連資料
- [基本操作マニュアル]
- [緊急時対応手順]
- [連絡先一覧]

---
*GPT-4oにより清書・構造化されました*`;
  };

  const generateMockSlideHTML = (content: string): string => {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>マニュアルスライド</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #f5f5f5; }
        .slide { width: 100%; max-width: 800px; margin: 20px auto; background: white; border-radius: 10px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        h1 { color: #2c5aa0; border-bottom: 3px solid #2c5aa0; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        .highlight { background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0; }
        .step { background: #e3f2fd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .warning { background: #ffebee; padding: 10px; border-left: 4px solid #f44336; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="slide">
        <h1>🏥 クリニック業務マニュアル</h1>
        <div class="highlight">
            <strong>本マニュアルの目的:</strong> 業務の標準化と品質向上
        </div>
    </div>
    
    <div class="slide">
        <h1>📋 業務フロー概要</h1>
        <div class="step">
            <h3>Step 1: 準備</h3>
            <p>必要な資料とシステムの準備を行います</p>
        </div>
        <div class="step">
            <h3>Step 2: 実行</h3>
            <p>定められた手順に従って業務を実行します</p>
        </div>
        <div class="step">
            <h3>Step 3: 確認</h3>
            <p>結果の確認と報告を行います</p>
        </div>
    </div>
    
    <div class="slide">
        <h1>⚠️ 重要な注意事項</h1>
        <div class="warning">
            <strong>患者情報保護:</strong> 個人情報の取り扱いには最大限の注意を払ってください
        </div>
        <div class="warning">
            <strong>確認の徹底:</strong> 各ステップで必ずダブルチェックを実施してください
        </div>
        <div class="warning">
            <strong>報告・連絡・相談:</strong> 不明な点は必ず上司に相談してください
        </div>
    </div>
    
    <div class="slide">
        <h1>📞 緊急時対応</h1>
        <h2>システムトラブル時</h2>
        <ol>
            <li>システムの再起動を試行</li>
            <li>ネットワーク接続の確認</li>
            <li>管理者への連絡</li>
        </ol>
        
        <h2>医療緊急時</h2>
        <ol>
            <li>担当医師への即座の連絡</li>
            <li>必要に応じて救急通報</li>
            <li>記録の作成</li>
        </ol>
    </div>
</body>
</html>`;
  };

  // ステップインジケーター更新
  const updateStepIndicator = (step: number) => {
    setCurrentStep(step);
  };

  // 通知表示（既存システム統合）
  const showNotificationMessage = (message: string, type: 'success' | 'error' | 'info') => {
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      info: '#3b82f6'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-left: 4px solid ${colors[type]};
      z-index: 3000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  // プレビュー表示
  const showPreview = () => {
    const previewWindow = window.open('', '_blank', 'width=1000,height=700');
    if (previewWindow) {
      previewWindow.document.write(window.generatedSlideHTML);
      previewWindow.document.close();
    }
  };

  // ダウンロード機能
  const downloadSlides = () => {
    const blob = new Blob([window.generatedSlideHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manual-slides.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  // マニュアル管理に保存
  const saveToManuals = () => {
    // TODO: マニュアル管理システムとの統合
    showNotificationMessage('マニュアルが保存されました', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">マニュアル作成</h1>
        <p className="text-gray-600">3ステップでプロフェッショナルなHTMLスライド形式のマニュアルを自動生成</p>
      </div>

      {/* ステップインジケーター */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                ${currentStep >= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
                ${currentStep === step ? 'ring-4 ring-blue-200' : ''}
              `}>
                {currentStep > step ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  step
                )}
              </div>
              {step < 3 && (
                <div className={`
                  w-24 h-1 mx-4
                  ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between max-w-2xl mx-auto mt-4 text-sm text-gray-600">
          <span>内容入力</span>
          <span>GPT清書</span>
          <span>スライド生成</span>
        </div>
      </div>

      {/* Step 1: 内容入力 */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Step 1: マニュアル内容を入力
            </h2>
            
            {/* テンプレートボタン */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">テンプレートを使用して効率的に作成:</p>
              <div className="flex gap-3 flex-wrap">
                {Object.entries(templates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => insertTemplate(key as keyof typeof templates)}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    {template.title}
                  </button>
                ))}
              </div>
            </div>

            {/* メインテキストエリア */}
            <textarea
              id="manualContentInput"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="マニュアルの内容を自由に記述してください。

例：
新患受付の手順について

1. 患者さんが来院されたら...
2. 保険証を確認して...
3. 問診票をお渡しして...

注意事項：
- 個人情報の取り扱いに注意
- システム入力時のダブルチェック..."
            />

            {/* アクションボタン */}
            <div className="flex justify-between mt-6">
              <button
                onClick={saveDraft}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                下書き保存
              </button>
              
              <button
                onClick={proceedToStep2}
                disabled={!userInput.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                GPTで清書
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: GPT清書結果 */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Step 2: GPT-4oによる清書結果
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">GPT-4oで内容を清書・構造化中...</p>
                  <div className="flex justify-center mt-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 元の内容 */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">元の内容</h3>
                  <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {userInput}
                    </pre>
                  </div>
                </div>

                {/* 清書後の内容 */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">清書後の内容</h3>
                  <div className="bg-green-50 rounded-lg p-4 h-96 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800">
                        {refinedContent}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* アクションボタン */}
            {!isLoading && (
              <div className="flex justify-between mt-6">
                <button
                  onClick={backToStep1}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  戻る
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setUserInput(refinedContent);
                      setCurrentStep(1);
                    }}
                    className="px-6 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    編集
                  </button>
                  
                  <button
                    onClick={proceedToStep3}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    スライド生成
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: スライド生成完了 */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Step 3: HTMLスライド生成完了
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Claude 3.5 SonnetでHTMLスライドを生成中...</p>
                  <div className="flex justify-center mt-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">マニュアル生成完了！</h3>
                  <p className="text-gray-600">プロフェッショナルなHTMLスライドが生成されました</p>
                </div>

                {/* プレビューカード */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-white rounded-lg p-4 shadow-md">
                      <FileText className="h-12 w-12 text-blue-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">HTMLスライドマニュアル</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Claude 3.5 Sonnetによって生成された高品質なマニュアルスライド
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={showPreview}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      プレビュー
                    </button>
                    <button
                      onClick={downloadSlides}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      ダウンロード
                    </button>
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex justify-between">
                  <button
                    onClick={backToStep2}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    戻る
                  </button>
                  
                  <button
                    onClick={saveToManuals}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    マニュアルに保存
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualCreation;