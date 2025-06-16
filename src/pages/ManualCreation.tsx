import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Save, FileText, CheckCircle, Download, Eye, Loader, Plus } from 'lucide-react';
import { fetchDifyRefinement } from '../api/dify';
import { createApplication } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [refinedContent, setRefinedContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('calculation');
  const [error, setError] = useState<string | null>(null);

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
      setOriginalText(draft.content || '');
      window.currentManualContent = draft.content || '';
    }
  }, []);

  // 下書き保存
  const saveDraft = () => {
    const draft = {
      content: originalText,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('manualDraft', JSON.stringify(draft));
    showNotificationMessage('下書きを保存しました', 'success');
  };

  // テンプレート挿入
  const insertTemplate = (type: keyof typeof templates) => {
    const template = templates[type];
    setOriginalText(template.content);
    window.currentManualContent = template.content;
  };

  // Step 2への遷移（Dify清書処理）
  const proceedToStep2 = async () => {
    if (!originalText.trim()) {
      showNotificationMessage('マニュアル内容を入力してください', 'error');
      return;
    }

    window.currentManualContent = originalText;
    setCurrentStep(2);
    setIsLoading(true);
    setError(null);

    try {
      // Dify ワークフローAPIを使用して清書
      const refinedResult = await fetchDifyRefinement(originalText);
      setRefinedContent(refinedResult);
      window.currentRefinedContent = refinedResult;
      setIsLoading(false);
      showNotificationMessage('Difyワークフローによる清書が完了しました', 'success');
    } catch (error) {
      console.error('清書処理エラー:', error);
      showNotificationMessage('清書処理に失敗しました', 'error');
      setIsLoading(false);
    }
  };

  // Step 3への遷移（管理者申請）
  const proceedToStep3 = async () => {
    setCurrentStep(3);
    setIsLoading(true);

    try {
      // タイトルを生成（清書内容の最初の行または固定テキスト）
      const firstLine = refinedContent.split('\n')[0].substring(0, 50);
      const title = firstLine || `マニュアル申請 - ${new Date().toLocaleDateString('ja-JP')}`;

      // Supabaseに申請データを保存
      if (user?.id) {
        await createApplication({
          title,
          original_content: originalText,
          refined_content: refinedContent,
          category: selectedCategory,
          submitted_by: user.id
        });
      } else {
        // ユーザーが未認証の場合はローカルストレージに保存（フォールバック）
        const applicationData = {
          id: Date.now().toString(),
          title,
          original_content: originalText,
          refined_content: refinedContent,
          status: 'pending',
          submitted_by: 'guest_user',
          submitted_at: new Date().toISOString(),
          category: selectedCategory
        };

        const existingApplications = JSON.parse(localStorage.getItem('manualApplications') || '[]');
        existingApplications.push(applicationData);
        localStorage.setItem('manualApplications', JSON.stringify(existingApplications));
      }

      // 申請完了処理
      setTimeout(() => {
        setIsLoading(false);
        showNotificationMessage('管理者への申請が完了しました', 'success');
      }, 1000);

    } catch (error) {
      console.error('申請処理エラー:', error);
      showNotificationMessage('申請に失敗しました', 'error');
      setIsLoading(false);
    }
  };

  // ステップ間の移動
  const backToStep1 = () => {
    setCurrentStep(1);
    setError(null);
  };

  const backToStep2 = () => {
    setCurrentStep(2);
  };

  // モックデータ生成関数（スライド生成用）
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
      max-width: 400px;
      word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
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
          <span>Dify清書</span>
          <span>管理者申請</span>
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
                    onClick={() => {
                      insertTemplate(key as keyof typeof templates);
                      showNotificationMessage(`${template.title}を挿入しました`, 'info');
                    }}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    {template.title}
                  </button>
                ))}
              </div>
            </div>

            {/* カテゴリー選択 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリー
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="calculation">算定</option>
                <option value="clinic">クリニック</option>
                <option value="checkup">健診</option>
              </select>
            </div>

            {/* メインテキストエリア */}
            <textarea
              id="manualContentInput"
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
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
                disabled={!originalText.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Difyで清書
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Dify清書結果 */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Step 2: Difyワークフローによる清書結果
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Difyワークフローで内容を清書・構造化中...</p>
                  <div className="flex justify-center mt-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">エラーが発生しました</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={backToStep1}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  入力画面に戻る
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 元の内容 */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">【元の内容】</h3>
                  <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {originalText}
                    </pre>
                  </div>
                </div>

                {/* 清書後の内容 */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">【清書後の内容】</h3>
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
            {!isLoading && !error && refinedContent && (
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
                      setOriginalText(refinedContent);
                      setCurrentStep(1);
                    }}
                    className="px-6 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    編集
                  </button>
                  
                  <button
                    onClick={proceedToStep3}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    管理者に申請
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: 申請完了 */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Step 3: 管理者申請完了
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">管理者に申請を送信中...</p>
                  <div className="flex justify-center mt-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">申請が完了しました！</h3>
                  <p className="text-gray-600">管理者による承認とHTMLスライド生成をお待ちください</p>
                </div>

                {/* 申請内容カード */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-200">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-white rounded-lg p-4 shadow-md">
                      <FileText className="h-12 w-12 text-green-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">申請内容</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Difyで清書されたマニュアル内容が管理者に送信されました
                  </p>
                  <div className="bg-white rounded-lg p-4 text-left">
                    <h5 className="font-medium text-gray-700 mb-2">清書内容プレビュー:</h5>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {refinedContent.substring(0, 150)}...
                    </p>
                  </div>
                </div>

                {/* 次のステップの案内 */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h5 className="font-medium text-blue-900 mb-2">次のステップ</h5>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>1. 管理者が申請内容を確認します</p>
                    <p>2. 承認後、ClaudeでHTMLスライドが生成されます</p>
                    <p>3. 完成したマニュアルがNotionに保存されます</p>
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={backToStep2}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    戻る
                  </button>
                  
                  <button
                    onClick={() => {
                      setCurrentStep(1);
                      setOriginalText('');
                      setRefinedContent('');
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    新しいマニュアル作成
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