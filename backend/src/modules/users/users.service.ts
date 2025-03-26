import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, CreateSellerProfileDto } from './dto/user.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        points: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        points: true,
        createdAt: true,
        updatedAt: true,
        sellerProfile: true,
        subscription: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        points: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    // Check if user exists
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        points: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async becomeSeller(id: string, createSellerProfileDto: CreateSellerProfileDto) {
    // Check if user exists
    const user = await this.findOne(id);

    // Check if user is already a seller
    if (user.role === UserRole.SELLER) {
      throw new ConflictException('User is already a seller');
    }

    // Update user role and create seller profile in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Update user role
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          role: UserRole.SELLER,
        },
      });

      // Create seller profile
      await prisma.sellerProfile.create({
        data: {
          ...createSellerProfileDto,
          userId: id,
        },
      });

      return updatedUser;
    });
  }

  async getSellerProfile(userId: string) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!sellerProfile) {
      throw new NotFoundException(`Seller profile for user ${userId} not found`);
    }

    return sellerProfile;
  }
}
