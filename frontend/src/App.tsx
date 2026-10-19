import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AuthProvider } from './auth/AuthProvider';
import { AppPage } from './pages/AppPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { GuestRoute, ProtectedRoute } from './routes/RouteGuards';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Layout routes without a path: they only wrap their children with a guard */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppPage />} />
          </Route>

          <Route element={<GuestRoute />}>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Route>

          {/* Unknown URLs go home (which redirects to /signin if signed out) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
