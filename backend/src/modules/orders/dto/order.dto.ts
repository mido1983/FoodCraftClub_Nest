import { IsNotEmpty, IsNumber, IsOptional, Min, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

class OrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  @IsNotEmpty()
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty()
  items: OrderItemDto[];

  @IsNumber()
  @Min(0, { message: 'Points used must be greater than or equal to 0' })
  @IsOptional()
  pointsUsed?: number;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  @IsNotEmpty()
  status: OrderStatus;
}
