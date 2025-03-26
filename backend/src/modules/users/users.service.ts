import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, CreateSellerProfileDto } from './dto/user.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

  async findOne(id: number) {
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

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Check if user exists
    await this.findOne(id);

    // Check if email is already in use by another user
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

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

  async remove(id: number) {
    // Check if user exists
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async changePassword(id: number, currentPassword: string, newPassword: string) {
    // Find user with password
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new ConflictException('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    return this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
      select: {
        id: true,
      },
    });
  }

  async createSellerProfile(userId: number, createSellerProfileDto: CreateSellerProfileDto) {
    // Check if user exists
    const user = await this.findOne(userId);

    // Check if user already has a seller profile
    if (user.sellerProfile) {
      throw new ConflictException('User already has a seller profile');
    }

    // Create seller profile and update user role to SELLER
    const [sellerProfile] = await this.prisma.$transaction([
      this.prisma.sellerProfile.create({
        data: {
          ...createSellerProfileDto,
          userId,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          role: UserRole.SELLER,
        },
      }),
    ]);

    return sellerProfile;
  }

  async updateSellerProfile(userId: number, updateSellerProfileDto: CreateSellerProfileDto) {
    // Check if user exists and has a seller profile
    const user = await this.findOne(userId);

    if (!user.sellerProfile) {
      throw new NotFoundException('Seller profile not found');
    }

    return this.prisma.sellerProfile.update({
      where: { userId },
      data: updateSellerProfileDto,
    });
  }
}
