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
  role?: 'admin' | 'staff';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (userId: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export interface Manual {
  id: string;
  title: string;
  category: string;
  url: string;
  lastSync: string;
  status: 'synced' | 'outdated' | 'error';
}

export interface ChatState {
  messages: ChatMessage[];
  selectedAI: AIType;
  isLoading: boolean;
  manuals: Manual[];
  availableManuals: Manual[];
  setSelectedAI: (type: AIType) => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  searchManuals: (query: string) => Manual[];
}