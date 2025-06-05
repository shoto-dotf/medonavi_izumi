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
      className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors ${
        active
          ? 'bg-[#36a9e0] text-white border-l-4 border-white'
          : 'text-white hover:bg-white/10'
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
    <div className="h-full flex flex-col bg-[#0088cc]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/20">
        <Logo />
      </div>
      
      <div className="flex-1 mt-6 space-y-1">
        <div className="px-4 py-2 text-white/90 font-medium bg-[#0088cc]">
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

      <div className="px-4 py-3 border-t border-white/20">
        <h3 className="text-white/90 font-medium mb-2">クリニック情報</h3>
        <div className="space-y-2">
          <a
            href="https://www.shioya-clinic.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-colors bg-white/10 whitespace-nowrap"
          >
            <Globe className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">当院HP</span>
          </a>
          <a
            href="https://drive.google.com/drive/u/2/folders/13v5e5oR_fC3okuHXH8HMiVPk0jGxKEZh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-colors bg-white/10 whitespace-nowrap"
          >
            <Folder className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">マニュアルフォルダ</span>
          </a>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-white/20">
        <div className="space-y-2">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdqLJaq2w1auyB99wGhGpOUxU3e-FW2mvzvlNFpnx42mDTrUw/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
            className="flex items-center justify-between w-full px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span>機能改善フォーム</span>
            </div>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
      
      <div className="mt-auto border-t border-white/20 p-4 space-y-2">
        <button
          className="flex items-center gap-2 w-full px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          onClick={onDisclaimerClick}
        >
          <AlertCircle className="h-5 w-5" />
          <span>注意事項</span>
        </button>
        
        <button
          className="flex items-center gap-2 w-full px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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