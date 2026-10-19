import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/useAuth';
import { signUpSchema, type SignUpFormValues } from '../auth/validation';
import { AuthLayout } from '../components/AuthLayout';
import { muiField } from '../utils/muiField';

export function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched', // validate a field after the user leaves it, then on every change
  });
  const { errors, isSubmitting } = form.formState;

  // Only called when the zod schema passes
  const onSubmit = async (values: SignUpFormValues) => {
    setServerError(null);
    try {
      await signUp(values);
      navigate('/', { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // Show "email already registered" under the email field itself
        form.setError('email', { message: error.message });
      } else {
        setServerError(error instanceof ApiError ? error.message : 'Something went wrong');
      }
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Sign up to get started">
      {/* noValidate: turn off browser popups, zod handles validation */}
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
          <TextField label="Name" autoComplete="name" fullWidth {...muiField(form, 'name')} />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            fullWidth
            {...muiField(form, 'password')}
            // Show the rules until there is an error to show instead
            helperText={
              errors.password?.message ??
              'At least 8 characters, with a letter, a number and a special character'
            }
          />

          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Sign up'}
          </Button>

          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/signin">
              Sign in
            </Link>
          </Typography>
        </Stack>
      </form>
    </AuthLayout>
  );
}
