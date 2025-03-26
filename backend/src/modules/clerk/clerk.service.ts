import { Injectable } from '@nestjs/common';
import { clerkClient, users } from '@clerk/clerk-sdk-node';
import { LoggerService } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClerkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Sync a user from Clerk to our database
   */
  async syncUserFromClerk(clerkUserId: string) {
    try {
      // Get user from Clerk
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      
      // Check if user already exists in our database
      const existingUser = await this.prisma.user.findUnique({
        where: { id: clerkUserId },
      });

      if (existingUser) {
        // Update existing user
        return await this.prisma.user.update({
          where: { id: clerkUserId },
          data: {
            email: clerkUser.emailAddresses[0]?.emailAddress,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new user
        return await this.prisma.user.create({
          data: {
            id: clerkUserId,
            email: clerkUser.emailAddresses[0]?.emailAddress,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            role: 'CLIENT', // Default role
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to sync user from Clerk: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Validate a Clerk JWT token and return the user ID
   */
  async validateClerkJWT(token: string): Promise<string | null> {
    try {
      // This is a simplified example - in a real app, you'd use Clerk's SDK to validate the JWT
      // and extract the user ID
      
      // For example purposes only - this is not actual validation code
      // const session = await clerkClient.sessions.verifySession(token);
      // return session.userId;
      
      // For now, we'll just return a mock user ID
      return 'clerk_user_id';
    } catch (error) {
      this.logger.error(`Failed to validate Clerk JWT: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Get a user by Clerk ID
   */
  async getUserById(clerkUserId: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { id: clerkUserId },
        include: {
          sellerProfile: true,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get user by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle Clerk webhook events
   */
  async handleWebhookEvent(eventType: string, data: any) {
    try {
      this.logger.debug(`Handling Clerk webhook event: ${eventType}`);
      
      // Store the webhook event
      await this.prisma.webhookEvent.create({
        data: {
          type: eventType,
          payload: JSON.stringify(data),
        },
      });

      // Process different event types
      switch (eventType) {
        case 'user.created':
          await this.syncUserFromClerk(data.id);
          break;
        case 'user.updated':
          await this.syncUserFromClerk(data.id);
          break;
        case 'user.deleted':
          // Handle user deletion
          await this.prisma.user.delete({
            where: { id: data.id },
          });
          break;
        default:
          this.logger.debug(`Unhandled Clerk webhook event type: ${eventType}`);
      }

      // Mark the webhook event as processed
      await this.prisma.webhookEvent.update({
        where: { id: data.id },
        data: {
          processed: true,
        },
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to handle Clerk webhook event: ${error.message}`, error.stack);
      throw error;
    }
  }
}
