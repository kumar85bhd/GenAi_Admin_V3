import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PreferencesProvider } from './shared/context/PreferencesContext';
import { UserPreferenceProvider } from './shared/context/UserPreferenceContext';
import { AuthProvider } from './shared/context/AuthContext';
import { useAuth } from './shared/context/useAuth';
import WorkspaceModule from './modules/workspace/WorkspaceModule';
import AdminModule from './modules/admin/AdminModule';
import Layout from './components/Layout';
import Login from './pages/Login';
import LoggedOut from './pages/LoggedOut';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user?.is_admin) {
    return <Navigate to="/workspace" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/workspace" replace /> : <Login />} />
      <Route path="/logged-out" element={<LoggedOut />} />
      <Route 
        path="/workspace/*" 
        element={
          <ProtectedRoute>
            <Layout><WorkspaceModule /></Layout>
          </ProtectedRoute>
        }
      />
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Layout><AdminModule /></Layout>
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/workspace" replace />} />
      <Route path="*" element={<Navigate to="/workspace" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PreferencesProvider>
          <UserPreferenceProvider>
            <AppRoutes />
          </UserPreferenceProvider>
        </PreferencesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
