import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import DisclaimerModal from '../components/DisclaimerModal';
import { useAuth } from '../contexts/AuthContext';

const ChatPage: React.FC = () => {
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 py-2 px-4">
        <div className="text-sm text-gray-500">しおや消化器内科クリニック</div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 h-full hidden md:block">
          <Sidebar onDisclaimerClick={() => setIsDisclaimerOpen(true)} />
        </aside>
        
        <main className="flex-1 h-full overflow-hidden">
          <ChatArea />
        </main>
      </div>
      
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
};

export default ChatPage;