import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { hasPermission } from './config/rolePermissions';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Trips from './pages/Trips';
import MaintenanceLogs from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Drivers from './pages/Drivers';
import Analytics from './pages/Analytics';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#DD700B] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
}

// Role-based route guard - redirects to dashboard if no permission
function RoleRoute({ module, children }) {
  const { user } = useAuth();
  if (!user || !hasPermission(user.role, module, 'view')) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: '#1e293b', color: '#fff', fontSize: '14px' } }} />
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="vehicles" element={<RoleRoute module="vehicles"><Vehicles /></RoleRoute>} />
            <Route path="trips" element={<RoleRoute module="trips"><Trips /></RoleRoute>} />
            <Route path="maintenance" element={<RoleRoute module="maintenance"><MaintenanceLogs /></RoleRoute>} />
            <Route path="expenses" element={<RoleRoute module="expenses"><Expenses /></RoleRoute>} />
            <Route path="drivers" element={<RoleRoute module="drivers"><Drivers /></RoleRoute>} />
            <Route path="analytics" element={<RoleRoute module="analytics"><Analytics /></RoleRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
