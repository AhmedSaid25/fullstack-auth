import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { mongo } from 'mongoose';
import { PublicUser, toPublicUser } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/sign-up.dto';

// Cost factor: each +1 doubles hashing time. 12 is a common production value (~250ms)
const SALT_ROUNDS = 12;

// MongoDB error code for a unique index violation
const DUPLICATE_KEY_ERROR = 11000;

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signUp(dto: SignUpDto): Promise<PublicUser> {
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    try {
      const user = await this.usersService.create({
        ...dto,
        password: hashedPassword,
      });
      return toPublicUser(user);
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
}
