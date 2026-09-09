import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { LiveDetectionPage } from './pages/LiveDetectionPage';
import { UploadImagePage } from './pages/UploadImagePage';
import { UploadVideoPage } from './pages/UploadVideoPage';
import { DetectionHistoryPage } from './pages/DetectionHistoryPage';
import { MapViewPage } from './pages/MapViewPage';
import { LiveLocationPage } from './pages/LiveLocationPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* App Workspace Pages */}
      <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
      <Route path="/live-detection" element={<MainLayout><LiveDetectionPage /></MainLayout>} />
      <Route path="/upload-image" element={<MainLayout><UploadImagePage /></MainLayout>} />
      <Route path="/upload-video" element={<MainLayout><UploadVideoPage /></MainLayout>} />
      <Route path="/map-view" element={<MainLayout><MapViewPage /></MainLayout>} />
      <Route path="/live-location-tracker" element={<MainLayout><LiveLocationPage /></MainLayout>} />
      <Route path="/history" element={<MainLayout><DetectionHistoryPage /></MainLayout>} />
      
      {/* Protected Admin */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <MainLayout><AdminDashboardPage /></MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
      <Route path="/settings" element={<MainLayout><SettingsPage /></MainLayout>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
