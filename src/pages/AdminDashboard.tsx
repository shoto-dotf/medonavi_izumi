import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  Play,
  RefreshCw,
  X,
  Check,
  User,
  Calendar
} from 'lucide-react';
import { 
  getApplications, 
  updateApplicationStatus, 
  updateApplicationSlide,
  subscribeToApplications,
  ManualApplication 
} from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ManualApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ManualApplication | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    loadApplications();
    
    // リアルタイム更新の購読
    const subscription = subscribeToApplications((payload) => {
      console.log('Application updated:', payload);
      loadApplications();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [filterStatus]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const status = filterStatus === 'all' ? undefined : filterStatus;
      const data = await getApplications(status);
      setApplications(data || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
      showNotification('申請データの取得に失敗しました', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ステータスに応じた色を取得
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // ステータスに応じたアイコンを取得
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <Check className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // ステータスのラベル
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '承認待ち';
      case 'approved': return '承認済み';
      case 'rejected': return '却下';
      case 'completed': return '完了';
      default: return status;
    }
  };

  // 申請の承認
  const approveApplication = async () => {
    if (!selectedApplication || !user) return;
    
    setIsProcessing(true);
    setProcessStatus('申請を承認しています...');
    
    try {
      await updateApplicationStatus(
        selectedApplication.id,
        'approved',
        user.id,
        '承認されました'
      );
      
      // Claude APIでスライド生成
      setProcessStatus('Claude 3.5 SonnetでHTMLスライドを生成中...');
      await generateSlides();
      
      showNotification('申請が承認され、スライドが生成されました', 'success');
      setSelectedApplication(null);
      loadApplications();
    } catch (error) {
      console.error('Approval failed:', error);
      showNotification('承認処理に失敗しました', 'error');
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  // 申請の却下
  const rejectApplication = async () => {
    if (!selectedApplication || !user || !rejectReason.trim()) return;
    
    try {
      await updateApplicationStatus(
        selectedApplication.id,
        'rejected',
        user.id,
        rejectReason
      );
      
      showNotification('申請を却下しました', 'info');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedApplication(null);
      loadApplications();
    } catch (error) {
      console.error('Rejection failed:', error);
      showNotification('却下処理に失敗しました', 'error');
    }
  };

  // スライド生成（モック実装）
  const generateSlides = async () => {
    if (!selectedApplication) return;
    
    const mockSlideHTML = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${selectedApplication.title}</title>
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            margin: 0;
            background: #f5f5f5;
            padding: 20px;
        }
        .slide {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2c5aa0 0%, #1e3c72 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .content {
            padding: 40px;
            line-height: 1.8;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #2c5aa0;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="slide">
        <div class="header">
            <h1>${selectedApplication.title}</h1>
            <p>しおや消化器内科クリニック</p>
        </div>
        <div class="content">
            ${selectedApplication.refined_content.replace(/\n/g, '<br>')}
        </div>
        <div class="footer">
            <p>作成日: ${new Date().toLocaleDateString('ja-JP')}</p>
            <p>メドナビAI - Claude 3.5 Sonnetで生成</p>
        </div>
    </div>
</body>
</html>`;
    
    // Supabaseに保存
    await updateApplicationSlide(
      selectedApplication.id,
      mockSlideHTML,
      'https://notion.so/sample-url' // 実際はNotionに保存後のURL
    );
  };

  // 通知表示
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    // 実装は省略（トースト通知など）
    console.log(`${type}: ${message}`);
  };

  // カテゴリーラベル取得
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'calculation': return '算定';
      case 'clinic': return 'クリニック';
      case 'checkup': return '健診';
      default: return 'その他';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">管理者ダッシュボード</h1>
        <p className="text-gray-600">マニュアル申請の確認と承認</p>
      </div>

      {/* フィルター */}
      <div className="mb-6 flex gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">すべて</option>
          <option value="pending">承認待ち</option>
          <option value="approved">承認済み</option>
          <option value="rejected">却下</option>
          <option value="completed">完了</option>
        </select>
        <button
          onClick={loadApplications}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          更新
        </button>
      </div>

      {/* 申請一覧 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">申請一覧</h2>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">読み込み中...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">申請がありません</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {applications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApplication(app)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedApplication?.id === app.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 line-clamp-2">
                      {app.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      {getStatusLabel(app.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {/* @ts-ignore */}
                      {app.users?.name || '不明'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(app.submitted_at).toLocaleDateString('ja-JP')}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                      {getCategoryLabel(app.category)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 申請詳細 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">申請詳細</h2>
          </div>
          
          {selectedApplication ? (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedApplication.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className={`px-3 py-1 rounded-full font-medium ${getStatusColor(selectedApplication.status)}`}>
                    {getStatusLabel(selectedApplication.status)}
                  </span>
                  <span>{getCategoryLabel(selectedApplication.category)}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">元の内容</h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-600">
                      {selectedApplication.original_content}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">清書後の内容</h4>
                  <div className="bg-blue-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {selectedApplication.refined_content}
                    </pre>
                  </div>
                </div>

                {selectedApplication.comments && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">コメント</h4>
                    <p className="text-gray-600">{selectedApplication.comments}</p>
                  </div>
                )}

                {/* アクションボタン */}
                {selectedApplication.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={approveApplication}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      承認してスライド生成
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      却下
                    </button>
                  </div>
                )}

                {selectedApplication.status === 'completed' && selectedApplication.slide_html && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        const blob = new Blob([selectedApplication.slide_html!], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      プレビュー
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([selectedApplication.slide_html!], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedApplication.title}.html`;
                        a.click();
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      ダウンロード
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>申請を選択してください</p>
            </div>
          )}
        </div>
      </div>

      {/* 処理中モーダル */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-700 font-medium">{processStatus}</p>
            </div>
          </div>
        </div>
      )}

      {/* 却下理由モーダル */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">却下理由を入力</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="却下理由を記入してください..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={rejectApplication}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                却下する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;