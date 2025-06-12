export type AIType = 'calculation' | 'clinic' | 'checkup';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (userId: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export interface ChatState {
  messages: ChatMessage[];
  selectedAI: AIType;
  isLoading: boolean;
  setSelectedAI: (type: AIType) => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}