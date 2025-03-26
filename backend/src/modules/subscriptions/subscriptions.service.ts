import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';
import { UserRole, SubscriptionType } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createSubscriptionDto: CreateSubscriptionDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user already has a subscription
    if (user.subscription) {
      throw new ConflictException('User already has an active subscription');
    }

    // Validate subscription type based on user role
    if (
      (user.role === UserRole.CLIENT &&
        createSubscriptionDto.type !== SubscriptionType.VIP_CLIENT) ||
      (user.role === UserRole.SELLER &&
        ![SubscriptionType.SELLER_BASIC, SubscriptionType.SELLER_PREMIUM].includes(
          createSubscriptionDto.type,
        ))
    ) {
      throw new ConflictException('Invalid subscription type for user role');
    }

    // Create subscription
    return this.prisma.subscription.create({
      data: {
        ...createSubscriptionDto,
        userId,
      },
    });
  }

  async findAll(role: UserRole) {
    // Only admins can view all subscriptions
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async findOne(id: number, userId: number, role: UserRole) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    // Users can only view their own subscription unless they're admins
    if (role !== UserRole.ADMIN && subscription.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return subscription;
  }

  async findByUser(userId: number) {
    return this.prisma.subscription.findUnique({
      where: { userId },
    });
  }

  async update(id: number, updateSubscriptionDto: UpdateSubscriptionDto, userId: number, role: UserRole) {
    // Check if subscription exists
    await this.findOne(id, userId, role);

    // Only admins can update subscriptions
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update subscriptions');
    }

    return this.prisma.subscription.update({
      where: { id },
      data: updateSubscriptionDto,
    });
  }

  async remove(id: number, userId: number, role: UserRole) {
    // Check if subscription exists
    await this.findOne(id, userId, role);

    // Only admins can delete subscriptions
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete subscriptions');
    }

    return this.prisma.subscription.delete({
      where: { id },
    });
  }

  async cancelUserSubscription(userId: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription for user with ID ${userId} not found`);
    }

    return this.prisma.subscription.update({
      where: { userId },
      data: {
        isActive: false,
      },
    });
  }
}
