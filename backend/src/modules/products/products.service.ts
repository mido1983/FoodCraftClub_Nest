import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from './dto/product.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, userId: string) {
    // Check if user is a seller
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user.role !== UserRole.SELLER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only sellers can create products');
    }

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        sellerId: userId,
      },
    });
  }

  async findAll(filters: ProductFilterDto) {
    const where = {};

    // Apply filters
    if (filters.search) {
      where['OR'] = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    if (filters.minPrice !== undefined) {
      where['price'] = { ...where['price'], gte: filters.minPrice };
    }

    if (filters.maxPrice !== undefined) {
      where['price'] = { ...where['price'], lte: filters.maxPrice };
    }

    if (filters.sellerId) {
      where['sellerId'] = filters.sellerId;
    }

    return this.prisma.product.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            sellerProfile: {
              select: {
                companyName: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            sellerProfile: {
              select: {
                companyName: true,
                description: true,
                contactPhone: true,
                contactEmail: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    // Check if product exists
    const product = await this.findOne(id);

    // Check if user is the seller of the product or an admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (product.sellerId !== userId && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own products');
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string, userId: string) {
    // Check if product exists
    const product = await this.findOne(id);

    // Check if user is the seller of the product or an admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (product.sellerId !== userId && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own products');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async getSellerProducts(sellerId: string) {
    return this.prisma.product.findMany({
      where: { sellerId },
    });
  }
}
