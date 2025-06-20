import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import Login from './pages/Login';
import ChatPage from './pages/ChatPage';
import ManualCreation from './pages/ManualCreation';
import ManualManagement from './pages/ManualManagement';
import ManualManagementSimple from './pages/ManualManagementSimple';
import ManualManagementTable from './pages/ManualManagementTable';
import AdminDashboard from './pages/AdminDashboard';
import ApplicationStatus from './pages/ApplicationStatus';
import NotionCallback from './pages/NotionCallback';
import NotionIntegrationDemo from './pages/NotionIntegrationDemo';
import MainLayout from './components/MainLayout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <ChatPage />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/manual-creation" element={
          <ProtectedRoute>
            <MainLayout>
              <ManualCreation />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/manual-management" element={
          <ProtectedRoute>
            <MainLayout>
              <ManualManagementTable />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/manual-simple" element={
          <ProtectedRoute>
            <MainLayout>
              <ManualManagementSimple />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <MainLayout>
              <AdminDashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/application-status" element={
          <ProtectedRoute>
            <MainLayout>
              <ApplicationStatus />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/auth/notion/callback" element={<NotionCallback />} />
        <Route path="/notion-demo" element={
          <ProtectedRoute>
            <MainLayout>
              <NotionIntegrationDemo />
            </MainLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;