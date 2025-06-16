import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { getNotionOAuthAPI } from '../api/notionOAuth';

const NotionCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage('Notion認証がキャンセルされました');
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('認証コードが見つかりません');
        return;
      }

      try {
        const notionOAuth = getNotionOAuthAPI();
        const response = await notionOAuth.exchangeCodeForToken(code);
        
        setWorkspaceName(response.workspace.name);
        setStatus('success');
        setMessage('Notion連携が完了しました！');
        
        // 3秒後にマニュアル管理ページにリダイレクト
        setTimeout(() => {
          navigate('/manual-management');
        }, 3000);
        
      } catch (error) {
        console.error('Notion callback error:', error);
        setStatus('error');
        setMessage('Notion連携に失敗しました');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Notion連携中...
            </h2>
            <p className="text-gray-600">
              認証情報を処理しています
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              連携完了！
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            {workspaceName && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  <strong>接続先:</strong> {workspaceName}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              3秒後にマニュアル管理ページに移動します...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              連携失敗
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/manual-management')}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                マニュアル管理に戻る
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                再試行
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotionCallback;