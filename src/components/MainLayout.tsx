import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import DisclaimerModal from './DisclaimerModal';
import {
  MessageCircle,
  FileText,
  FolderOpen,
  AlertCircle,
  LogOut,
  Globe,
  Folder,
  Settings,
  ExternalLink,
  GraduationCap,
  Shield,
  Clock
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const menuItems = [
    {
      path: '/',
      icon: MessageCircle,
      label: 'AIチャット',
      category: 'main'
    },
    {
      path: '/manual-creation',
      icon: FileText,
      label: 'マニュアル作成',
      category: 'main'
    },
    {
      path: '/application-status',
      icon: Clock,
      label: '申請状況',
      category: 'main'
    },
    {
      path: '/manual-management',
      icon: FolderOpen,
      label: 'マニュアルライブラリ',
      category: 'main'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 py-3 px-6 shadow-sm flex-shrink-0">
        <div className="text-sm font-medium text-gray-600">しおや消化器内科クリニック</div>
      </header>
      
      <div className="flex-1 flex min-h-0">
        <aside className="w-64 flex-shrink-0 hidden md:block">
          <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 overflow-y-auto">
            <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
              <Logo />
            </div>
            
            <div className="flex-1 mt-6 space-y-1">
              <div className="px-6 py-3 text-amber-400 font-semibold text-sm uppercase tracking-wider">
                メイン機能
              </div>
              
              {menuItems.filter(item => item.category === 'main').map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 w-full px-6 py-4 text-left transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-white/20 text-white border-l-4 border-amber-400 pl-5'
                      : 'text-white/90 hover:bg-white/10 hover:pl-7'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              
              {/* 管理者メニュー */}
              {user?.role === 'admin' && (
                <>
                  <div className="px-6 py-3 mt-4 text-amber-400 font-semibold text-sm uppercase tracking-wider">
                    管理者機能
                  </div>
                  <button
                    onClick={() => navigate('/admin')}
                    className={`flex items-center gap-3 w-full px-6 py-4 text-left transition-all duration-300 ${
                      isActive('/admin')
                        ? 'bg-white/20 text-white border-l-4 border-amber-400 pl-5'
                        : 'text-white/90 hover:bg-white/10 hover:pl-7'
                    }`}
                  >
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">管理者ダッシュボード</span>
                  </button>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-white/10">
              <h3 className="text-amber-400 font-semibold mb-3 text-sm uppercase tracking-wider">クリニック情報</h3>
              <div className="space-y-2">
                <a
                  href="https://www.shioya-clinic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-300 bg-white/5 backdrop-blur-sm whitespace-nowrap hover:shadow-lg"
                >
                  <Globe className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">当院HP</span>
                </a>
                <a
                  href="https://www.notion.so/1cd3f0bae9be80d39922ef80780358e1?v=1cd3f0bae9be80998c5b000c1f275343&source=copy_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-300 bg-white/5 backdrop-blur-sm whitespace-nowrap hover:shadow-lg"
                >
                  <Folder className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">マニュアルフォルダ</span>
                </a>
              </div>
            </div>

            
            <div className="mt-auto border-t border-white/10 p-6 space-y-3">
              <button
                className="flex items-center gap-3 w-full px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover:shadow-md"
                onClick={() => setIsDisclaimerOpen(true)}
              >
                <AlertCircle className="h-5 w-5" />
                <span>注意事項</span>
              </button>
              
              <button
                className="flex items-center gap-3 w-full px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover:shadow-md"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span>ログアウト</span>
              </button>
            </div>
          </div>
        </aside>
        
        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-white">
          {children}
        </main>
      </div>
      
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
};

export default MainLayout;