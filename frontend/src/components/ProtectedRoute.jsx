// ProtectedRoute — wraps a page; redirects to /login if not logged in,
// or shows a message if the user's role is not allowed.
// (Real security is on the backend; this is only for a good user experience.)
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="center muted">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <p className="alert alert-error">This page is only for: {roles.join(', ')}.</p>;
  }
  return children;
}
