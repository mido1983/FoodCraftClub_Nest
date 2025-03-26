import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';
import { UserRole, SubscriptionType, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createSubscriptionDto: CreateSubscriptionDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user already has a subscription
    const existingSubscription = await this.prisma.stripeSubscription.findUnique({
      where: { userId },
    });

    if (existingSubscription) {
      throw new ConflictException('User already has an active subscription');
    }

    // Validate subscription type based on user role
    if (
      (user.role === UserRole.CLIENT &&
        createSubscriptionDto.type !== SubscriptionType.VIP_CLIENT) ||
      (user.role === UserRole.SELLER &&
        ![SubscriptionType.SELLER_BASIC, SubscriptionType.SELLER_PREMIUM].includes(
          createSubscriptionDto.type as any,
        ))
    ) {
      throw new ConflictException('Invalid subscription type for user role');
    }

    // Create subscription
    return this.prisma.stripeSubscription.create({
      data: {
        ...createSubscriptionDto,
        userId,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        stripePriceId: 'price_placeholder', // This would come from Stripe in a real implementation
        stripeCustomerId: user.stripeCustomerId || 'customer_placeholder',
        id: `sub_${Date.now()}`, // This would come from Stripe in a real implementation
      },
    });
  }

  async findAll(role: UserRole) {
    // Only admins can view all subscriptions
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.stripeSubscription.findMany({
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

  async findOne(id: string, userId: string, role: UserRole) {
    const subscription = await this.prisma.stripeSubscription.findUnique({
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

  async findByUser(userId: string) {
    return this.prisma.stripeSubscription.findUnique({
      where: { userId },
    });
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto, userId: string, role: UserRole) {
    // Check if subscription exists
    const subscription = await this.findOne(id, userId, role);

    // Update subscription
    return this.prisma.stripeSubscription.update({
      where: { id },
      data: updateSubscriptionDto,
    });
  }

  async remove(id: string, userId: string, role: UserRole) {
    // Check if subscription exists and user has access
    await this.findOne(id, userId, role);

    // Delete subscription
    return this.prisma.stripeSubscription.delete({
      where: { id },
    });
  }

  async cancelUserSubscription(userId: string) {
    const subscription = await this.prisma.stripeSubscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException(`No active subscription found for user ${userId}`);
    }

    // Update subscription status to canceled
    return this.prisma.stripeSubscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELED,
      },
    });
  }
}
