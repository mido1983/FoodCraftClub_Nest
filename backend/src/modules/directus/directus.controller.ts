import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { DirectusService } from './directus.service';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Controller('webhooks/directus')
export class DirectusController {
  constructor(
    private readonly directusService: DirectusService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-directus-token') token: string,
  ) {
    try {
      // Verify webhook token
      const webhookSecret = this.configService.get<string>('DIRECTUS_WEBHOOK_SECRET');
      if (token !== webhookSecret) {
        this.logger.error('Invalid Directus webhook token');
        throw new UnauthorizedException('Invalid webhook token');
      }

      // Extract event details from payload
      const { collection, action, payload: data } = payload;
      
      this.logger.debug(`Received Directus webhook: ${collection}.${action}`);
      
      // Process the webhook event
      return await this.directusService.handleWebhookEvent(collection, action, data);
    } catch (error) {
      this.logger.error(`Error handling Directus webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('sync/products')
  async syncProducts() {
    try {
      return await this.directusService.syncProducts();
    } catch (error) {
      this.logger.error(`Error syncing products: ${error.message}`, error.stack);
      throw error;
    }
  }
}
