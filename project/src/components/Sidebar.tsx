import React from 'react';
import { Calculator, FileText, HeartPulse, AlertCircle, LogOut, Globe, Folder, Settings, ExternalLink } from 'lucide-react';
import { AIType } from '../types';
import { useChat } from '../contexts/ChatContext';
import Logo from './Logo';

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick }) => {
  return (
    <button
      className={`flex items-center gap-3 w-full px-6 py-4 text-left transition-all duration-300 ${
        active
          ? 'bg-white/20 text-white border-l-4 border-amber-400 pl-5'
          : 'text-white/90 hover:bg-white/10 hover:pl-7'
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
};

interface SidebarProps {
  onDisclaimerClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onDisclaimerClick }) => {
  const { selectedAI, setSelectedAI, clearMessages } = useChat();

  const handleAIChange = (type: AIType) => {
    if (type !== selectedAI) {
      setSelectedAI(type);
      clearMessages();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
        <Logo />
      </div>
      
      <div className="flex-1 mt-6 space-y-1">
        <div className="px-6 py-3 text-amber-400 font-semibold text-sm uppercase tracking-wider">
          クリニック独自AI
        </div>
        
        <NavButton
          icon={<Calculator className="h-5 w-5 text-white" />}
          label="算定AI"
          active={selectedAI === 'calculation'}
          onClick={() => handleAIChange('calculation')}
        />
        
        <NavButton
          icon={<FileText className="h-5 w-5 text-white" />}
          label="クリニック業務AI"
          active={selectedAI === 'clinic'}
          onClick={() => handleAIChange('clinic')}
        />
        
        <NavButton
          icon={<HeartPulse className="h-5 w-5 text-white" />}
          label="健診業務AI"
          active={selectedAI === 'checkup'}
          onClick={() => handleAIChange('checkup')}
        />
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
            href="https://drive.google.com/drive/u/2/folders/13v5e5oR_fC3okuHXH8HMiVPk0jGxKEZh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-300 bg-white/5 backdrop-blur-sm whitespace-nowrap hover:shadow-lg"
          >
            <Folder className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">マニュアルフォルダ</span>
          </a>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-white/10">
        <div className="space-y-2">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdqLJaq2w1auyB99wGhGpOUxU3e-FW2mvzvlNFpnx42mDTrUw/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>マニュアル作成依頼</span>
            </div>
            <ExternalLink className="h-4 w-4" />
          </a>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScckGgML-Wej_3ubd4kXqCjz3uX5w6kir4tDVIkCoU8-itKLw/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span>機能改善フォーム</span>
            </div>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
      
      <div className="mt-auto border-t border-white/10 p-6 space-y-3">
        <button
          className="flex items-center gap-3 w-full px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover:shadow-md"
          onClick={onDisclaimerClick}
        >
          <AlertCircle className="h-5 w-5" />
          <span>注意事項</span>
        </button>
        
        <button
          className="flex items-center gap-3 w-full px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover:shadow-md"
          onClick={() => {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user');
            window.location.reload();
          }}
        >
          <LogOut className="h-5 w-5" />
          <span>ログアウト</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;