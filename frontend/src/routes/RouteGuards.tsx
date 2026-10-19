import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../auth/useAuth';
import { FullPageSpinner } from '../components/FullPageSpinner';

// Only for signed-in users, everyone else goes to /signin
export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  // Wait for the session check, otherwise a signed-in user would be redirected on refresh
  if (isLoading) return <FullPageSpinner />;

  // <Outlet /> renders the matched child route; replace: don't add a history entry
  return user ? <Outlet /> : <Navigate to="/signin" replace />;
}

// Only for signed-out users (sign in / sign up), signed-in users go to the app
export function GuestRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />;

  return user ? <Navigate to="/" replace /> : <Outlet />;
}
