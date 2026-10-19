import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/useAuth';
import { signUpSchema, type SignUpFormValues } from '../auth/validation';
import { AuthLayout } from '../components/AuthLayout';

export function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched', // validate a field after the user leaves it, then on every change
  });

  // MUI's TextField puts `ref` on its wrapper <div>; react-hook-form needs the real <input>
  const field = (name: keyof SignUpFormValues) => {
    const { ref, ...rest } = register(name);
    return {
      ...rest,
      inputRef: ref,
      error: Boolean(errors[name]),
      helperText: errors[name]?.message,
    };
  };

  // Only called when the zod schema passes
  const onSubmit = async (values: SignUpFormValues) => {
    setServerError(null);
    try {
      await signUp(values);
      navigate('/', { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // Show "email already registered" under the email field itself
        setError('email', { message: error.message });
      } else {
        setServerError(error instanceof ApiError ? error.message : 'Something went wrong');
      }
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Sign up to get started">
      {/* noValidate: turn off browser popups, zod handles validation */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          {serverError && <Alert severity="error">{serverError}</Alert>}

          <TextField label="Email" type="email" autoComplete="email" fullWidth {...field('email')} />
          <TextField label="Name" autoComplete="name" fullWidth {...field('name')} />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            fullWidth
            {...field('password')}
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
