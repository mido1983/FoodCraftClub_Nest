import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Controller('webhooks/clerk')
export class ClerkController {
  constructor(
    private readonly clerkService: ClerkService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async handleWebhook(
    @Body() payload: any,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    try {
      // Verify webhook signature (in a real app)
      // const webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');
      // Verify signature logic would go here
      
      // For now, we'll just log and process the event
      this.logger.debug(`Received Clerk webhook: ${payload.type}`);
      
      // Process the webhook event
      return await this.clerkService.handleWebhookEvent(payload.type, payload.data);
    } catch (error) {
      this.logger.error(`Error handling Clerk webhook: ${error.message}`, error.stack);
      throw error;
    }
  }
}
