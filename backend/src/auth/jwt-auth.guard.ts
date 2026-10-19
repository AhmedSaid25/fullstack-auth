import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AUTH_COOKIE_NAME } from './auth.constants';
import { AuthenticatedRequest, JwtPayload } from './auth.types';

// Runs before the route handler: returning true lets the request through, throwing blocks it
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    // cookie-parser types cookies as "any", so we state the type we expect
    const token = request.cookies?.[AUTH_COOKIE_NAME] as string | undefined;

    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }

    try {
      // Checks the signature (with JWT_SECRET) and the expiry date
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      request.user = { id: payload.sub };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}
