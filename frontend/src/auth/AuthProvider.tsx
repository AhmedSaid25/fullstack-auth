import { useEffect, useState, type ReactNode } from 'react';
import { authApi, type SignInInput, type SignUpInput, type User } from '../api/auth';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // The cookie is httpOnly, so JavaScript can't see it.
  // On page load we ask the server "who am I?" to restore the session.
  useEffect(() => {
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const signUp = async (data: SignUpInput) => {
    setUser(await authApi.signUp(data));
  };

  const signIn = async (data: SignInInput) => {
    setUser(await authApi.signIn(data));
  };

  const signOut = async () => {
    await authApi.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
