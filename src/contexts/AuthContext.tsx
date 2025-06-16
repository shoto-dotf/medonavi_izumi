import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User } from '../types';

const AuthContext = createContext<AuthState | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // localStorage から初期値を取得
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 認証状態が変更されたら localStorage に保存
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [isAuthenticated, user]);

  const login = async (userId: string, password: string): Promise<boolean> => {
    // In a real application, this would be an API call
    // For demo purposes, we're using hardcoded credentials
    if (userId === 'shioya0001CL' && password === 'shioya0001CL') {
      setIsAuthenticated(true);
      setUser({ id: userId, name: 'Shioya', role: 'staff' });
      return true;
    }
    if (userId === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      setUser({ id: userId, name: 'Administrator', role: 'admin' });
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};