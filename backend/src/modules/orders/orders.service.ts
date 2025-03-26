import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrderStatus, UserRole } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, userId: number) {
    const { items, pointsUsed = 0 } = createOrderDto;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate points usage
    if (pointsUsed > user.points) {
      throw new BadRequestException('Not enough points');
    }

    // Fetch products to calculate total amount
    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Check if all products exist and have enough stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Not enough stock for product ${product.name}`);
      }
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      const itemPrice = product.price * item.quantity;
      totalAmount += itemPrice;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Apply points discount (1 point = $1)
    const pointsDiscount = Math.min(pointsUsed, totalAmount);
    totalAmount -= pointsDiscount;

    // Calculate points earned (5% of total amount)
    const pointsEarned = Math.floor(totalAmount * 0.05);

    // Create order and order items in a transaction
    const order = await this.prisma.$transaction(async (prisma) => {
      // Create order
      const newOrder = await prisma.order.create({
        data: {
          userId,
          totalAmount,
          pointsUsed,
          pointsEarned,
          status: OrderStatus.PENDING,
          orderItems: {
            create: orderItems,
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update product stock
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Update user points
      await prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            decrement: pointsUsed,
            increment: pointsEarned,
          },
        },
      });

      return newOrder;
    });

    return order;
  }

  async findAll(userId: number, role: UserRole) {
    // If admin, return all orders
    if (role === UserRole.ADMIN) {
      return this.prisma.order.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          orderItems: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // If seller, return orders containing their products
    if (role === UserRole.SELLER) {
      const sellerProducts = await this.prisma.product.findMany({
        where: { sellerId: userId },
        select: { id: true },
      });

      const productIds = sellerProducts.map((product) => product.id);

      return this.prisma.order.findMany({
        where: {
          orderItems: {
            some: {
              productId: {
                in: productIds,
              },
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          orderItems: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // If client, return their orders
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number, userId: number, role: UserRole) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Check if user has permission to view this order
    if (role === UserRole.CLIENT && order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this order');
    }

    if (role === UserRole.SELLER) {
      // Check if any of the order items belong to the seller
      const sellerProducts = await this.prisma.product.findMany({
        where: { sellerId: userId },
        select: { id: true },
      });

      const productIds = sellerProducts.map((product) => product.id);
      const hasSellerProduct = order.orderItems.some((item) =>
        productIds.includes(item.productId),
      );

      if (!hasSellerProduct) {
        throw new ForbiddenException('You do not have permission to view this order');
      }
    }

    return order;
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto, userId: number, role: UserRole) {
    // Check if order exists
    const order = await this.findOne(id, userId, role);

    // Only admins can update order status
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update order status');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: updateOrderStatusDto.status,
      },
    });
  }

  async cancel(id: number, userId: number, role: UserRole) {
    // Check if order exists
    const order = await this.findOne(id, userId, role);

    // Only the user who placed the order or an admin can cancel it
    if (role !== UserRole.ADMIN && order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to cancel this order');
    }

    // Check if order can be cancelled (only PENDING orders can be cancelled)
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    // Cancel order and restore stock and points in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Update order status
      const cancelledOrder = await prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
        },
      });

      // Restore product stock
      for (const item of order.orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Restore user points (refund points used, remove points earned)
      await prisma.user.update({
        where: { id: order.userId },
        data: {
          points: {
            increment: order.pointsUsed,
            decrement: order.pointsEarned,
          },
        },
      });

      return cancelledOrder;
    });
  }
}
