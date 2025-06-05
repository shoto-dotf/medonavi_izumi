import React from 'react';
import { X } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-auto animate-modalShow">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">注意事項</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
              <p>
                AIは間違いを犯すことがあります。出力結果はよく確認してご利用ください。
              </p>
            </div>
            
            <p className="text-sm">
              入力されたプロンプトは学習には利用されませんが、メドナビAIのサービスの品質維持のためモニタリングをしています。
            </p>
            
            <div className="p-3 bg-red-50 border-l-4 border-red-400 text-sm">
              <p className="font-medium">患者情報は入力しないでください。</p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">各AI提供元の利用規約とプライバシーポリシー</h3>
              <ul className="text-sm space-y-2 text-blue-600">
                <li>
                  <a href="https://openai.com/policies" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    OpenAI
                  </a>
                </li>
                <li>
                  <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Gemini
                  </a>
                </li>
                <li>
                  <a href="https://www.anthropic.com/legal/terms" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Claude
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;