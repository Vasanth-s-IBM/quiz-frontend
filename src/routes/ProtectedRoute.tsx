import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: JSX.Element;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, token, initialized } = useAuth();

  // Wait until localStorage has been restored before deciding
  if (!initialized) return null;

  // Not logged in — send to login
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role — redirect to their own home
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role ?? '').toLowerCase();
    const hasRole = allowedRoles.some(r => r.toLowerCase() === userRole);
    if (!hasRole) {
      return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/topics'} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
