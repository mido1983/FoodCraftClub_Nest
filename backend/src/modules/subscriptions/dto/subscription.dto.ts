import { IsNotEmpty, IsEnum, IsDate, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionType } from '@prisma/client';

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionType, { message: 'Invalid subscription type' })
  @IsNotEmpty()
  type: SubscriptionType;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateSubscriptionDto {
  @IsEnum(SubscriptionType, { message: 'Invalid subscription type' })
  @IsOptional()
  type?: SubscriptionType;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
