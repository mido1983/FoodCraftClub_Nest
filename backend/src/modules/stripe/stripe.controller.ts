import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Controller('webhooks/stripe')
export class StripeController {
  private stripe: Stripe;

  constructor(
    private readonly stripeService: StripeService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-02-24.acacia',
    });
  }

  @Post()
  async handleWebhook(
    @Body() payload: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      // Verify webhook signature
      const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
      let event: Stripe.Event;

      try {
        event = this.stripe.webhooks.constructEvent(
          payload,
          signature,
          webhookSecret,
        );
      } catch (err) {
        this.logger.error(`Webhook signature verification failed: ${err.message}`);
        throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
      }

      // Process the webhook event
      return await this.stripeService.handleWebhookEvent(event.type, event.data.object);
    } catch (error) {
      this.logger.error(`Error handling Stripe webhook: ${error.message}`, error.stack);
      throw error;
    }
  }
}
