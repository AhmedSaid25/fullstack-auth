import { request } from './client';

export type User = { id: string; email: string; name: string };
export type SignUpInput = { email: string; name: string; password: string };
export type SignInInput = { email: string; password: string };

// One function per backend endpoint
export const authApi = {
  signUp: (data: SignUpInput) =>
    request<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  signIn: (data: SignInInput) =>
    request<User>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  signOut: () => request<void>('/auth/signout', { method: 'POST' }),

  me: () => request<User>('/users/me'),
};
