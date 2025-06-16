import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  Tag,
  MessageSquare,
  Eye,
  Download
} from 'lucide-react';
import { getMyApplications, ManualApplication, subscribeToApplications } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const ApplicationStatus: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ManualApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ManualApplication | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadMyApplications();

      // リアルタイム更新の購読
      const subscription = subscribeToApplications((payload) => {
        // 自分の申請のみ更新
        if (payload.new && payload.new.submitted_by === user.id) {
          loadMyApplications();
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadMyApplications = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const data = await getMyApplications(user.id);
      setApplications(data || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
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
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'approved': return <CheckCircle className="h-5 w-5" />;
      case 'rejected': return <XCircle className="h-5 w-5" />;
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">申請状況</h1>
        <p className="text-gray-600">マニュアル申請の状況を確認できます</p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">申請がありません</h3>
          <p className="text-gray-600">マニュアル作成から新しい申請を作成できます</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {app.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(app.submitted_at).toLocaleDateString('ja-JP')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        {getCategoryLabel(app.category)}
                      </span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${getStatusColor(app.status)}`}>
                    {getStatusIcon(app.status)}
                    <span className="font-medium">{getStatusLabel(app.status)}</span>
                  </div>
                </div>

                {/* ステータスごとのメッセージ */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  {app.status === 'pending' && (
                    <p className="text-gray-700">
                      管理者による承認をお待ちください。承認後、HTMLスライドが自動生成されます。
                    </p>
                  )}
                  {app.status === 'approved' && (
                    <p className="text-blue-700">
                      申請が承認されました。現在、HTMLスライドを生成中です。
                    </p>
                  )}
                  {app.status === 'rejected' && (
                    <div>
                      <p className="text-red-700 mb-2">申請が却下されました。</p>
                      {app.comments && (
                        <div className="bg-red-50 rounded p-3">
                          <p className="text-sm text-red-800">
                            <MessageSquare className="h-4 w-4 inline mr-1" />
                            却下理由: {app.comments}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {app.status === 'completed' && (
                    <div>
                      <p className="text-green-700 mb-3">
                        マニュアルが完成しました！Notionに保存され、いつでも参照できます。
                      </p>
                      {app.slide_html && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              const blob = new Blob([app.slide_html!], { type: 'text/html' });
                              const url = URL.createObjectURL(blob);
                              window.open(url, '_blank');
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            プレビュー
                          </button>
                          <button
                            onClick={() => {
                              const blob = new Blob([app.slide_html!], { type: 'text/html' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${app.title}.html`;
                              a.click();
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            ダウンロード
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 詳細表示トグル */}
                <button
                  onClick={() => setSelectedApplication(
                    selectedApplication?.id === app.id ? null : app
                  )}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {selectedApplication?.id === app.id ? '詳細を閉じる' : '詳細を表示'}
                </button>

                {/* 詳細内容 */}
                {selectedApplication?.id === app.id && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">元の内容</h4>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-600">
                          {app.original_content}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">清書後の内容</h4>
                      <div className="bg-blue-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700">
                          {app.refined_content}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationStatus;