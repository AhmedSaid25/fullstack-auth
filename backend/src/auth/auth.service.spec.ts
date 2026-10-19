import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { mongo, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  // Fakes: no database or real JWT signing, only the service's own logic is tested
  const usersService = {
    create: jest.fn<Promise<unknown>, [User]>(),
    findByEmailWithPassword: jest.fn(),
  };
  const jwtService = { signAsync: jest.fn().mockResolvedValue('signed-token') };

  const userId = new Types.ObjectId();
  const input = { email: 'sara@test.com', name: 'Sara', password: 'Passw0rd!' };
  const publicUser = {
    id: userId.toString(),
    email: input.email,
    name: input.name,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  describe('signUp', () => {
    it('stores a bcrypt hash, never the plain password', async () => {
      usersService.create.mockImplementation((data) =>
        Promise.resolve({ _id: userId, ...data }),
      );

      await authService.signUp(input);

      const [saved] = usersService.create.mock.calls[0];
      expect(saved.password).not.toBe(input.password);
      expect(await bcrypt.compare(input.password, saved.password)).toBe(true);
    });

    it('returns the public user and a token, without the password', async () => {
      usersService.create.mockResolvedValue({ _id: userId, ...input });

      const result = await authService.signUp(input);

      expect(result).toEqual({ user: publicUser, accessToken: 'signed-token' });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: userId.toString(),
      });
    });

    it('throws 409 Conflict when the email already exists', async () => {
      usersService.create.mockRejectedValue(
        new mongo.MongoServerError({ message: 'duplicate key', code: 11000 }),
      );

      await expect(authService.signUp(input)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('rethrows unexpected database errors', async () => {
      usersService.create.mockRejectedValue(new Error('connection lost'));

      await expect(authService.signUp(input)).rejects.toThrow(
        'connection lost',
      );
    });
  });

  describe('signIn', () => {
    let storedUser: User & { _id: Types.ObjectId };

    beforeAll(async () => {
      // Low cost factor keeps the test fast, the logic is the same
      storedUser = {
        _id: userId,
        email: input.email,
        name: input.name,
        password: await bcrypt.hash(input.password, 4),
      };
    });

    it('returns the user and a token for correct credentials', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(storedUser);

      const result = await authService.signIn({
        email: input.email,
        password: input.password,
      });

      expect(result).toEqual({ user: publicUser, accessToken: 'signed-token' });
    });

    it('throws 401 for a wrong password', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(storedUser);

      await expect(
        authService.signIn({ email: input.email, password: 'WrongPass1!' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws the same 401 for an unknown email', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        authService.signIn({ email: 'ghost@test.com', password: 'Passw0rd!' }),
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
