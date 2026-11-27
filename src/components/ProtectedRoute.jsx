import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, session }) {
  const location = useLocation();

  if (session === undefined) return <p className="container section" role="status">Checking your session…</p>;

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
