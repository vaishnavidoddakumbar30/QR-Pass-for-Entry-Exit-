import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Guards
import ProtectedRoute from './routes/ProtectedRoute';

// Public pages
import LandingPage from './pages/Landing';
import LoginPage from './pages/Login';
import ForgotPasswordPage from './pages/ForgotPassword';
import NotFoundPage from './pages/NotFound';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import ApplyPage from './pages/student/ApplyPage';
import MyPassesPage from './pages/student/MyPassesPage';
import PassDetailPage from './pages/student/PassDetailPage';
import RequestsPage from './pages/student/RequestsPage';
import NotificationsPage from './pages/student/NotificationsPage';
import ProfilePage from './pages/student/ProfilePage';

// Warden pages
import WardenDashboard from './pages/warden/WardenDashboard';
import WardenRequests from './pages/warden/WardenRequests';
import LateEntryPage from './pages/warden/LateEntryPage';

// Security pages
import SecurityDashboard from './pages/security/SecurityDashboard';
import ScannerPage from './pages/security/ScannerPage';
import AlertsPage from './pages/security/AlertsPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminRequests from './pages/admin/AdminRequests';
import AdminPasses from './pages/admin/AdminPasses';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import AdminSettings from './pages/admin/AdminSettings';

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-4 border-[#082b63]/20 border-t-[#082b63] rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Toaster position="top-right" richColors closeButton />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/"                element={<LandingPage />} />
              <Route path="/login"           element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Student — ProtectedRoute renders AppLayout which renders Outlet */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/student/dashboard"     element={<StudentDashboard />} />
                <Route path="/student/apply"         element={<ApplyPage />} />
                <Route path="/student/passes"        element={<MyPassesPage />} />
                <Route path="/student/pass/:id"      element={<PassDetailPage />} />
                <Route path="/student/requests"      element={<RequestsPage />} />
                <Route path="/student/notifications" element={<NotificationsPage />} />
                <Route path="/student/profile"       element={<ProfilePage />} />
              </Route>

              {/* Warden */}
              <Route element={<ProtectedRoute allowedRoles={['warden']} />}>
                <Route path="/warden/dashboard"     element={<WardenDashboard />} />
                <Route path="/warden/requests"      element={<WardenRequests />} />
                <Route path="/warden/late-entry"    element={<LateEntryPage />} />
                <Route path="/warden/notifications" element={<NotificationsPage />} />
                <Route path="/warden/profile"       element={<ProfilePage />} />
              </Route>

              {/* Security */}
              <Route element={<ProtectedRoute allowedRoles={['security']} />}>
                <Route path="/security/dashboard"  element={<SecurityDashboard />} />
                <Route path="/security/scanner"    element={<ScannerPage />} />
                <Route path="/security/entry-exit" element={<ScannerPage />} />
                <Route path="/security/late-entry" element={<LateEntryPage />} />
                <Route path="/security/alerts"     element={<AlertsPage />} />
                <Route path="/security/profile"    element={<ProfilePage />} />
              </Route>

              {/* Admin */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard"  element={<AdminDashboard />} />
                <Route path="/admin/users"      element={<UserManagement />} />
                <Route path="/admin/requests"   element={<AdminRequests />} />
                <Route path="/admin/passes"     element={<AdminPasses />} />
                <Route path="/admin/analytics"  element={<AdminDashboard />} />
                <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                <Route path="/admin/settings"   element={<AdminSettings />} />
                <Route path="/admin/profile"    element={<ProfilePage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
