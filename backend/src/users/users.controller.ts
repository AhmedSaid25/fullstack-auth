import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PublicUser, toPublicUser } from './schemas/user.schema';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/me -> the signed-in user's profile (protected)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: AuthenticatedRequest): Promise<PublicUser> {
    const user = await this.usersService.findById(req.user.id);

    // The token can still be valid after the account was deleted
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return toPublicUser(user);
  }
}
