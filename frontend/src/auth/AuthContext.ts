import { createContext } from 'react';
import type { SignInInput, SignUpInput, User } from '../api/auth';

export type AuthContextValue = {
  user: User | null; // null = signed out
  isLoading: boolean; // true while we ask the server if a session exists
  signUp: (data: SignUpInput) => Promise<void>;
  signIn: (data: SignInInput) => Promise<void>;
  signOut: () => Promise<void>;
};

// null default: using the context outside <AuthProvider> is a bug (useAuth throws)
export const AuthContext = createContext<AuthContextValue | null>(null);
