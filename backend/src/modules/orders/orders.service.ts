import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrderStatus, UserRole } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
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

  async findAll(userId: string, role: UserRole) {
    // Admins can see all orders
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

    // Sellers can see orders containing their products
    if (role === UserRole.SELLER) {
      // Get seller's products
      const sellerProducts = await this.prisma.product.findMany({
        where: { sellerId: userId },
        select: { id: true },
      });

      const sellerProductIds = sellerProducts.map((product) => product.id);

      // Get orders containing seller's products
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
        where: {
          orderItems: {
            some: {
              productId: {
                in: sellerProductIds,
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // Clients can only see their own orders
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

  async findOne(id: string, userId: string, role: UserRole) {
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

    // Check if user has access to this order
    if (role === UserRole.CLIENT && order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    if (role === UserRole.SELLER) {
      // Get seller's products
      const sellerProducts = await this.prisma.product.findMany({
        where: { sellerId: userId },
        select: { id: true },
      });

      const sellerProductIds = sellerProducts.map((product) => product.id);

      // Check if order contains any of the seller's products
      const hasSellerProduct = order.orderItems.some((item) =>
        sellerProductIds.includes(item.productId),
      );

      if (!hasSellerProduct) {
        throw new ForbiddenException('You do not have access to this order');
      }
    }

    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, userId: string, role: UserRole) {
    // Check if order exists and user has access
    const order = await this.findOne(id, userId, role);

    // Only admins and sellers can update order status
    if (role === UserRole.CLIENT) {
      throw new ForbiddenException('Clients cannot update order status');
    }

    // Update order status
    return this.prisma.order.update({
      where: { id },
      data: {
        status: updateOrderStatusDto.status,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async cancel(id: string, userId: string, role: UserRole) {
    // Check if order exists and user has access
    const order = await this.findOne(id, userId, role);

    // Only admin or the order owner can cancel an order
    if (role !== UserRole.ADMIN && order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to cancel this order');
    }

    // Can only cancel orders in PENDING status
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be canceled');
    }

    // Cancel order and restore stock in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Update order status to CANCELED
      const canceledOrder = await prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
        },
        include: {
          orderItems: true,
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

      // Restore user points if any were used
      if (order.pointsUsed > 0) {
        await prisma.user.update({
          where: { id: order.userId },
          data: {
            points: {
              increment: order.pointsUsed,
              decrement: order.pointsEarned,
            },
          },
        });
      }

      return canceledOrder;
    });
  }
}
