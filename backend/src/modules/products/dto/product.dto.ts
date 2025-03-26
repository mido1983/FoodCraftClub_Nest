import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  @Type(() => Number)
  price: number;

  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @Min(0, { message: 'Stock must be greater than or equal to 0' })
  @Type(() => Number)
  stock: number;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @Min(0, { message: 'Stock must be greater than or equal to 0' })
  @IsOptional()
  @Type(() => Number)
  stock?: number;
}

export class ProductFilterDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sellerId?: number;
}
