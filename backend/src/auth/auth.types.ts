import type { Request } from 'express';

// What we put inside the JWT
export type JwtPayload = { sub: string };

// A request that has passed JwtAuthGuard
export interface AuthenticatedRequest extends Request {
  user: { id: string };
}
