import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using mock mode.');
}

// Supabaseクライアントの作成
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// モックモードかどうかを判定
const isInMockMode = !supabase;

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
  if (isInMockMode) {
    console.log('Mock: Creating application', data);
    // モックデータをlocalStorageに保存
    const applicationData = {
      id: Date.now().toString(),
      ...data,
      status: 'pending' as const,
      submitted_at: new Date().toISOString()
    };
    
    const existingApplications = JSON.parse(localStorage.getItem('manualApplications') || '[]');
    existingApplications.push(applicationData);
    localStorage.setItem('manualApplications', JSON.stringify(existingApplications));
    
    return applicationData;
  }
  
  const { data: result, error } = await supabase!.from('manual_applications').insert({
    title: data.title,
    original_content: data.original_content,
    refined_content: data.refined_content,
    category: data.category,
    submitted_by: data.submitted_by,
    status: 'pending'
  }).select().single();
  
  if (error) {
    console.error('Error creating application:', error);
    throw error;
  }
  
  return result;
};

// 申請一覧取得（管理者用）
export const getApplications = async (status?: string) => {
  if (isInMockMode) {
    console.log('Mock: Getting applications', status);
    const applications = JSON.parse(localStorage.getItem('manualApplications') || '[]');
    return status ? applications.filter((app: ManualApplication) => app.status === status) : applications;
  }
  
  let query = supabase!.from('manual_applications').select('*').order('submitted_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error getting applications:', error);
    throw error;
  }
  
  return data || [];
};

// 自分の申請一覧取得
export const getMyApplications = async (userId: string) => {
  if (isInMockMode) {
    console.log('Mock: Getting my applications', userId);
    const applications = JSON.parse(localStorage.getItem('manualApplications') || '[]');
    return applications.filter((app: ManualApplication) => app.submitted_by === userId);
  }
  
  const { data, error } = await supabase!
    .from('manual_applications')
    .select('*')
    .eq('submitted_by', userId)
    .order('submitted_at', { ascending: false });
  
  if (error) {
    console.error('Error getting my applications:', error);
    throw error;
  }
  
  return data || [];
};

// 申請ステータス更新
export const updateApplicationStatus = async (
  applicationId: string,
  status: 'approved' | 'rejected' | 'completed',
  reviewedBy: string,
  comments?: string
) => {
  if (isInMockMode) {
    console.log('Mock: Updating application status', applicationId, status);
    const applications = JSON.parse(localStorage.getItem('manualApplications') || '[]');
    const updatedApplications = applications.map((app: ManualApplication) => 
      app.id === applicationId 
        ? { ...app, status, reviewed_by: reviewedBy, reviewed_at: new Date().toISOString(), comments }
        : app
    );
    localStorage.setItem('manualApplications', JSON.stringify(updatedApplications));
    return { id: applicationId, status };
  }
  
  const { data, error } = await supabase!
    .from('manual_applications')
    .update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      comments
    })
    .eq('id', applicationId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
  
  return data;
};

// スライドHTML保存
export const updateApplicationSlide = async (
  applicationId: string,
  slideHtml: string,
  notionUrl?: string
) => {
  if (isInMockMode) {
    console.log('Mock: Updating application slide', applicationId);
    const applications = JSON.parse(localStorage.getItem('manualApplications') || '[]');
    const updatedApplications = applications.map((app: ManualApplication) => 
      app.id === applicationId 
        ? { ...app, slide_html: slideHtml, notion_url: notionUrl }
        : app
    );
    localStorage.setItem('manualApplications', JSON.stringify(updatedApplications));
    return { id: applicationId, slide_html: slideHtml, notion_url: notionUrl };
  }
  
  const { data, error } = await supabase!
    .from('manual_applications')
    .update({
      slide_html: slideHtml,
      notion_url: notionUrl
    })
    .eq('id', applicationId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating application slide:', error);
    throw error;
  }
  
  return data;
};

// リアルタイム購読
export const subscribeToApplications = (
  callback: (payload: any) => void
) => {
  if (isInMockMode) {
    console.log('Mock: Subscribing to applications');
    return {
      unsubscribe: () => console.log('Mock: Unsubscribed')
    };
  }
  
  const subscription = supabase!
    .channel('manual_applications')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'manual_applications'
    }, callback)
    .subscribe();
  
  return {
    unsubscribe: () => subscription.unsubscribe()
  };
};

// ユーザー作成
export const createUser = async (userData: {
  email: string;
  name: string;
  role?: 'admin' | 'staff';
}) => {
  if (isInMockMode) {
    console.log('Mock: Creating user', userData);
    return {
      id: Date.now().toString(),
      ...userData,
      role: userData.role || 'staff',
      created_at: new Date().toISOString()
    };
  }
  
  const { data, error } = await supabase!
    .from('users')
    .insert({
      email: userData.email,
      name: userData.name,
      role: userData.role || 'staff'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }
  
  return data;
};

// ユーザー取得（メールアドレス）
export const getUserByEmail = async (email: string) => {
  if (isInMockMode) {
    console.log('Mock: Getting user by email', email);
    return null;
  }
  
  const { data, error } = await supabase!
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // ユーザーが見つからない場合
      return null;
    }
    console.error('Error getting user by email:', error);
    throw error;
  }
  
  return data;
};