import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import AssetDetail from './pages/AssetDetail';
import AssetEdit from './pages/AssetEdit';
import Assets from './pages/Assets';
import AdminPanel from './pages/admin/AdminPanel';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSpareParts from './pages/admin/AdminSpareParts';
import ManagerReports from './pages/manager/ManagerReports';

import { useAuthStore } from './store/authStore';

/** Proteksi route: harus login */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

/** Proteksi route berdasarkan role */
const RoleGuard = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const user = useAuthStore((state) => state.user);
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<MainLayout />}>

          {/* ── Dashboard: Semua role ── */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Assets: Semua role (tampilan berbeda per role) ── */}
          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <Assets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets/:id"
            element={
              <ProtectedRoute>
                <AssetDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets/:id/edit"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin']}>
                  <AssetEdit />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* ── Admin Only Panel ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin']}>
                  <AdminPanel />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin']}>
                  <AdminUsers />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/spare-parts"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin']}>
                  <AdminSpareParts />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* ── Manager & Admin Reports ── */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin', 'Manager']}>
                  <ManagerReports />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;