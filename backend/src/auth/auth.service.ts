import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { mongo } from 'mongoose';
import {
  PublicUser,
  toPublicUser,
  UserDocument,
} from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

// Cost factor: each +1 doubles hashing time. 12 is a common production value (~250ms)
const SALT_ROUNDS = 12;

// MongoDB error code for a unique index violation
const DUPLICATE_KEY_ERROR = 11000;

export type AuthResult = { user: PublicUser; accessToken: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto): Promise<AuthResult> {
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    try {
      const user = await this.usersService.create({
        ...dto,
        password: hashedPassword,
      });
      return this.buildAuthResult(user);
    } catch (error) {
      // Rely on the unique index instead of "find then insert", which has a race condition
      if (
        error instanceof mongo.MongoServerError &&
        error.code === DUPLICATE_KEY_ERROR
      ) {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
  }

  async signIn(dto: SignInDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    const passwordMatches =
      user !== null && (await bcrypt.compare(dto.password, user.password));

    // Same message for "no such user" and "wrong password" so attackers can't tell which
    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResult(user);
  }

  private async buildAuthResult(user: UserDocument): Promise<AuthResult> {
    // "sub" (subject) is the standard JWT claim for "who this token belongs to"
    const accessToken = await this.jwtService.signAsync({
      sub: user._id.toString(),
    });
    return { user: toPublicUser(user), accessToken };
  }
}
