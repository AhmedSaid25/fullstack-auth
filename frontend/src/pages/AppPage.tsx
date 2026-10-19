import { Alert, AppBar, Box, Button, Card, CardContent, Toolbar, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../auth/useAuth';

export function AppPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setError(null);
    try {
      await signOut();
      navigate('/signin', { replace: true });
    } catch {
      // The cookie was not cleared on the server, so the user is still signed in
      setError('Could not sign out. Please try again.');
      setIsSigningOut(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fullstack Auth
          </Typography>
          <Button color="inherit" onClick={handleSignOut} disabled={isSigningOut}>
            {isSigningOut ? 'Signing out…' : 'Log out'}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'grid', placeItems: 'center', p: 2, mt: 8 }}>
        <Card sx={{ width: '100%', maxWidth: 520 }} elevation={3}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
              Welcome to the application.
            </Typography>
            {/* user is never null here: ProtectedRoute only renders this page when signed in */}
            <Typography color="text.secondary">
              Signed in as {user?.name} ({user?.email})
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
