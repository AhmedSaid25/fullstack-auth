import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/useAuth';
import { signInSchema, type SignInFormValues } from '../auth/validation';
import { AuthLayout } from '../components/AuthLayout';
import { muiField } from '../utils/muiField';

export function SignInPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onTouched',
  });
  const { isSubmitting } = form.formState;

  const onSubmit = async (values: SignInFormValues) => {
    setServerError(null);
    try {
      await signIn(values);
      navigate('/', { replace: true });
    } catch (error) {
      // 401 "Invalid email or password" is deliberately not tied to one field
      setServerError(error instanceof ApiError ? error.message : 'Something went wrong');
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          {serverError && <Alert severity="error">{serverError}</Alert>}

          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            fullWidth
            {...muiField(form, 'email')}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            fullWidth
            {...muiField(form, 'password')}
          />

          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>

          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <Link component={RouterLink} to="/signup">
              Sign up
            </Link>
          </Typography>
        </Stack>
      </form>
    </AuthLayout>
  );
}
