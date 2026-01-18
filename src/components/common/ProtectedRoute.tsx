import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export function ProtectedRoute({ children, requireSuperAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireSuperAdmin && user?.role !== 'SUPERADMIN') {
    return <Navigate to="/projects" replace />;
  }

  return <>{children}</>;
}
