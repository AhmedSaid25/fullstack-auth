import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';
import { AUTH_COOKIE_NAME } from './auth.constants';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  // POST /auth/signup -> 201, creates the user and logs them in
  @Post('signup')
  async signUp(
    @Body() dto: SignUpDto,
    // passthrough: we only set a cookie, Nest still sends the returned value as JSON
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken } = await this.authService.signUp(dto);
    res.cookie(AUTH_COOKIE_NAME, accessToken, this.cookieOptions());
    return user;
  }

  // POST /auth/signin -> 200 (not 201, nothing is created)
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken } = await this.authService.signIn(dto);
    res.cookie(AUTH_COOKIE_NAME, accessToken, this.cookieOptions());
    return user;
  }

  // POST /auth/signout -> 204, the browser deletes the cookie
  @Post('signout')
  @HttpCode(HttpStatus.NO_CONTENT)
  signOut(@Res({ passthrough: true }) res: Response) {
    // Options must match the ones used to set it, or the browser keeps the cookie
    res.clearCookie(AUTH_COOKIE_NAME, this.cookieOptions());
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true, // JavaScript in the browser can't read it -> safe from XSS token theft
      secure: this.config.get('NODE_ENV') === 'production', // HTTPS only in production
      sameSite: 'lax', // not sent on cross-site POSTs -> basic CSRF protection
      maxAge: Number(this.config.getOrThrow<string>('JWT_EXPIRES_IN')) * 1000, // ms
      path: '/',
    };
  }
}
