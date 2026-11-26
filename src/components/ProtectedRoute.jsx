import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentMockSession } from '../utils/mockAuth';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const session = getCurrentMockSession();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
