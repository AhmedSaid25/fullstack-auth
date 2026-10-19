import { z } from 'zod';

// Same rules as the backend DTOs. The backend is the real gate,
// these give instant feedback without a round trip.
export const signUpSchema = z.object({
  // trim first, then check the format (the backend also lowercases)
  email: z.string().trim().pipe(z.email('Enter a valid email address')),
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(50),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be at most 64 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// The TypeScript type comes from the schema: one source of truth
export type SignUpFormValues = z.infer<typeof signUpSchema>;

// No strength rules on sign-in, only "is something there"
export const signInSchema = z.object({
  email: z.string().trim().pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Password is required'),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
