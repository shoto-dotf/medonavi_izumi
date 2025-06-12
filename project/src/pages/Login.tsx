import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Stethoscope } from 'lucide-react';

const Login: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(userId, password);
      if (!success) {
        setError('ユーザーIDまたはパスワードが正しくありません');
      }
    } catch (err) {
      setError('ログイン中にエラーが発生しました');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          <div className="px-8 py-10">
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-4 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">
                <Stethoscope className="h-12 w-12 text-white" />
              </div>
              <h1 className="mt-6 text-3xl font-bold bg-gradient-to-r from-blue-200 to-blue-400 bg-clip-text text-transparent">メドナビAI</h1>
              <p className="mt-2 text-blue-200/80">社内FAQ質問システム</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg text-sm text-red-300">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-blue-200 mb-2">
                  ユーザーID
                </label>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                  placeholder="IDを入力"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-2">
                  パスワード
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                  placeholder="パスワードを入力"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-lg text-slate-900 font-semibold bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ログイン中...
                  </span>
                ) : (
                  'ログイン'
                )}
              </button>
            </form>
          </div>

          <div className="px-8 py-6 bg-white/5 border-t border-white/10">
            <p className="text-xs text-center text-blue-200/60">
              ※実際のサービスでは、社内システム管理者に<br />アカウント発行をご依頼ください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;