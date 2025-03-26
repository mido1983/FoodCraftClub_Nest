import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(UserRole, { message: 'Invalid role' })
  @IsOptional()
  role?: UserRole;

  @IsNumber()
  @Min(0)
  @IsOptional()
  points?: number;
}

export class UserResponseDto {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  role: UserRole;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateSellerProfileDto {
  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  companyName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsEmail({}, { message: 'Please provide a valid contact email' })
  @IsOptional()
  contactEmail?: string;
}
