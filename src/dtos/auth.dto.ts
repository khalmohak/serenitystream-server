import { IsEmail, IsString, MinLength, IsOptional, IsEnum, Matches, IsUUID, IsUrl } from 'class-validator';
import { UserRole } from '../entities';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character'
  })
  password: string;

  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  lastName: string;

  @IsString()
  countryCode: string;
  
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @IsEnum(UserRole, { message: 'Role must be either student,instructor or admin' })
  role: string;
  
  @IsOptional()
  @IsUrl()
  imageUrl: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsUUID('4', { message: 'Invalid token format' })
  token: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character'
  })
  newPassword: string;
}

export class VerifyEmailDto {
  @IsString()
  @IsUUID('4', { message: 'Invalid token format' })
  token: string;
}

export class VerifyPhoneDto {
  @IsString()
  @MinLength(6, { message: 'OTP must be at least 6 characters long' })
  otp: string;

  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Please provide a valid phone number with country code' })
  phone: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsUUID('4', { message: 'Invalid token format' })
  refreshToken: string;

  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Please provide a valid phone number with country code' })
  phone?: string;
}

export class ResendVerificationDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;
}