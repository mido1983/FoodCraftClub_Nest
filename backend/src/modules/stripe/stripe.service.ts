import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { LoggerService } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {
    // Initialize Stripe with API key from environment variables
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16', // Use the latest API version
    });
  }

  /**
   * Create a Stripe customer for a user
   */
  async createCustomer(userId: string, email: string, name?: string) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      });

      // Update user with Stripe customer ID
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          stripeCustomerId: customer.id,
        },
      });

      return customer;
    } catch (error) {
      this.logger.error(`Failed to create Stripe customer: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get or create a Stripe customer for a user
   */
  async getOrCreateCustomer(userId: string, email: string, name?: string) {
    try {
      // Check if user already has a Stripe customer ID
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.stripeCustomerId) {
        // Get existing customer
        return await this.stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        // Create new customer
        return await this.createCustomer(userId, email, name);
      }
    } catch (error) {
      this.logger.error(`Failed to get or create Stripe customer: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a checkout session for subscription
   */
  async createSubscriptionCheckout(userId: string, priceId: string, successUrl: string, cancelUrl: string) {
    try {
      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      // Get or create customer
      const customer = await this.getOrCreateCustomer(
        userId,
        user.email,
        `${user.firstName} ${user.lastName}`.trim(),
      );

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
        },
      });

      return session;
    } catch (error) {
      this.logger.error(`Failed to create subscription checkout: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a checkout session for a one-time payment
   */
  async createPaymentCheckout(orderId: string, userId: string, amount: number, successUrl: string, cancelUrl: string) {
    try {
      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      // Get or create customer
      const customer = await this.getOrCreateCustomer(
        userId,
        user.email,
        `${user.firstName} ${user.lastName}`.trim(),
      );

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Order #${orderId}`,
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          orderId,
          userId,
        },
      });

      return session;
    } catch (error) {
      this.logger.error(`Failed to create payment checkout: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(eventType: string, data: any) {
    try {
      this.logger.debug(`Handling Stripe webhook event: ${eventType}`);
      
      // Store the webhook event
      await this.prisma.webhookEvent.create({
        data: {
          type: eventType,
          payload: JSON.stringify(data),
        },
      });

      // Process different event types
      switch (eventType) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(data);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(data);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(data);
          break;
        default:
          this.logger.debug(`Unhandled Stripe webhook event type: ${eventType}`);
      }

      // Mark the webhook event as processed
      await this.prisma.webhookEvent.update({
        where: { id: data.id },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to handle Stripe webhook event: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle checkout session completed event
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    try {
      const { metadata } = session;

      if (!metadata) {
        this.logger.warn('Checkout session has no metadata');
        return;
      }

      // Handle order payment
      if (metadata.orderId) {
        await this.prisma.order.update({
          where: { id: metadata.orderId },
          data: {
            status: 'PAID',
            stripePaymentIntentId: session.payment_intent as string,
          },
        });

        this.logger.debug(`Order ${metadata.orderId} marked as paid`);
      }

      // Subscription is handled by the subscription event handlers
    } catch (error) {
      this.logger.error(`Failed to handle checkout session completed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle subscription updated event
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
      const customerId = subscription.customer as string;
      
      // Find user by Stripe customer ID
      const user = await this.prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (!user) {
        this.logger.warn(`No user found for Stripe customer: ${customerId}`);
        return;
      }

      // Determine subscription type based on price ID
      const priceId = subscription.items.data[0].price.id;
      let subscriptionType: 'VIP_CLIENT' | 'SELLER_BASIC' | 'SELLER_PREMIUM' = 'VIP_CLIENT';
      
      // In a real app, you would map price IDs to subscription types
      // For example:
      // if (priceId === 'price_seller_basic') {
      //   subscriptionType = 'SELLER_BASIC';
      // } else if (priceId === 'price_seller_premium') {
      //   subscriptionType = 'SELLER_PREMIUM';
      // }

      // Update or create subscription in database
      await this.prisma.stripeSubscription.upsert({
        where: { id: subscription.id },
        update: {
          status: this.mapStripeStatusToDbStatus(subscription.status),
          startDate: new Date(subscription.current_period_start * 1000),
          endDate: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
          stripePriceId: priceId,
          stripeCustomerId: customerId,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
        create: {
          id: subscription.id,
          type: subscriptionType,
          status: this.mapStripeStatusToDbStatus(subscription.status),
          startDate: new Date(subscription.current_period_start * 1000),
          endDate: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
          userId: user.id,
          stripePriceId: priceId,
          stripeCustomerId: customerId,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });

      // Update user role if needed
      if (subscriptionType.startsWith('SELLER_') && user.role === 'CLIENT') {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { role: 'SELLER' },
        });
      }

      this.logger.debug(`Subscription ${subscription.id} updated for user ${user.id}`);
    } catch (error) {
      this.logger.error(`Failed to handle subscription updated: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle subscription deleted event
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
      // Update subscription status in database
      await this.prisma.stripeSubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELED',
          endDate: new Date(),
        },
      });

      this.logger.debug(`Subscription ${subscription.id} marked as canceled`);
    } catch (error) {
      this.logger.error(`Failed to handle subscription deleted: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Map Stripe subscription status to database status
   */
  private mapStripeStatusToDbStatus(stripeStatus: string): 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' | 'TRIAL' {
    switch (stripeStatus) {
      case 'active':
        return 'ACTIVE';
      case 'past_due':
        return 'PAST_DUE';
      case 'canceled':
        return 'CANCELED';
      case 'unpaid':
        return 'UNPAID';
      case 'trialing':
        return 'TRIAL';
      default:
        return 'ACTIVE';
    }
  }
}
