// import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables');
// }

// Supabaseクライアントの作成
// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabase = null; // 一時的に無効化

// データベース型定義
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  created_at: string;
}

export interface ManualApplication {
  id: string;
  title: string;
  original_content: string;
  refined_content: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  submitted_by: string;
  submitted_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  slide_html?: string | null;
  notion_url?: string | null;
  category: string;
  comments?: string | null;
}

// 申請作成
export const createApplication = async (data: {
  title: string;
  original_content: string;
  refined_content: string;
  category: string;
  submitted_by: string;
}) => {
  // モック実装
  console.log('Mock: Creating application', data);
  return {
    id: Date.now().toString(),
    ...data,
    status: 'pending',
    submitted_at: new Date().toISOString()
  };
};

// 申請一覧取得（管理者用）
export const getApplications = async (status?: string) => {
  // モック実装
  console.log('Mock: Getting applications', status);
  return [];
};

// 自分の申請一覧取得
export const getMyApplications = async (userId: string) => {
  // モック実装
  console.log('Mock: Getting my applications', userId);
  return [];
};

// 申請ステータス更新
export const updateApplicationStatus = async (
  applicationId: string,
  status: 'approved' | 'rejected' | 'completed',
  reviewedBy: string,
  comments?: string
) => {
  // モック実装
  console.log('Mock: Updating application status', applicationId, status);
  return { id: applicationId, status };
};

// スライドHTML保存
export const updateApplicationSlide = async (
  applicationId: string,
  slideHtml: string,
  notionUrl?: string
) => {
  // モック実装
  console.log('Mock: Updating application slide', applicationId);
  return { id: applicationId, slide_html: slideHtml, notion_url: notionUrl };
};

// リアルタイム購読
export const subscribeToApplications = (
  callback: (payload: any) => void
) => {
  // モック実装
  console.log('Mock: Subscribing to applications');
  return {
    unsubscribe: () => console.log('Mock: Unsubscribed')
  };
};

// ユーザー作成
export const createUser = async (userData: {
  email: string;
  name: string;
  role?: 'admin' | 'staff';
}) => {
  // モック実装
  console.log('Mock: Creating user', userData);
  return {
    id: Date.now().toString(),
    ...userData,
    role: userData.role || 'staff',
    created_at: new Date().toISOString()
  };
};

// ユーザー取得（メールアドレス）
export const getUserByEmail = async (email: string) => {
  // モック実装
  console.log('Mock: Getting user by email', email);
  return null;
};