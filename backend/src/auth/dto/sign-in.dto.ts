import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  // No strength rules here: sign-in only checks the password against the stored hash
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
