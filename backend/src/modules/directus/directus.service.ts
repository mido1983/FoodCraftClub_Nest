import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { LoggerService } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';

// Define product type
interface DirectusProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  sellerId: string;
}

@Injectable()
export class DirectusService {
  private directusUrl: string;
  private directusToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.directusUrl = this.configService.get<string>('DIRECTUS_URL');
    this.directusToken = this.configService.get<string>('DIRECTUS_ADMIN_TOKEN');
  }

  /**
   * Get HTTP headers for Directus API requests
   */
  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.directusToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Sync products from Directus to our database
   */
  async syncProducts() {
    try {
      // Get products from Directus
      const response = await axios.get(
        `${this.directusUrl}/items/products`,
        { headers: this.getHeaders() }
      );

      const directusProducts: DirectusProduct[] = response.data.data;

      // Process each product
      for (const directusProduct of directusProducts) {
        // Check if product already exists in our database
        const existingProduct = await this.prisma.product.findUnique({
          where: { id: directusProduct.id },
        });

        if (existingProduct) {
          // Update existing product
          await this.prisma.product.update({
            where: { id: directusProduct.id },
            data: {
              name: directusProduct.name,
              description: directusProduct.description,
              price: directusProduct.price,
              imageUrl: directusProduct.imageUrl,
              stock: directusProduct.stock,
              sellerId: directusProduct.sellerId,
            },
          });
        } else {
          // Create new product
          await this.prisma.product.create({
            data: {
              id: directusProduct.id,
              name: directusProduct.name,
              description: directusProduct.description,
              price: directusProduct.price,
              imageUrl: directusProduct.imageUrl,
              stock: directusProduct.stock,
              sellerId: directusProduct.sellerId,
            },
          });
        }
      }

      this.logger.debug(`Synced ${directusProducts.length} products from Directus`);
      return { success: true, count: directusProducts.length };
    } catch (error) {
      this.logger.error(`Failed to sync products from Directus: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Sync a specific product from our database to Directus
   */
  async syncProductToDirectus(productId: string) {
    try {
      // Get product from our database
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      // Check if product exists in Directus
      try {
        await axios.get(
          `${this.directusUrl}/items/products/${productId}`,
          { headers: this.getHeaders() }
        );
        
        // Update product in Directus
        await axios.patch(
          `${this.directusUrl}/items/products/${productId}`,
          {
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
            stock: product.stock,
            sellerId: product.sellerId,
          },
          { headers: this.getHeaders() }
        );
      } catch (error) {
        // Product doesn't exist in Directus, create it
        await axios.post(
          `${this.directusUrl}/items/products`,
          {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
            stock: product.stock,
            sellerId: product.sellerId,
          },
          { headers: this.getHeaders() }
        );
      }

      this.logger.debug(`Synced product ${productId} to Directus`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to sync product to Directus: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle Directus webhook events
   */
  async handleWebhookEvent(collection: string, action: string, data: any) {
    try {
      this.logger.debug(`Handling Directus webhook event: ${collection}.${action}`);
      
      // Store the webhook event
      await this.prisma.webhookEvent.create({
        data: {
          type: `directus.${collection}.${action}`,
          payload: JSON.stringify(data),
        },
      });

      // Process different event types
      switch (collection) {
        case 'products':
          if (action === 'create' || action === 'update') {
            // Sync product to our database
            await this.syncProductFromDirectus(data.id);
          } else if (action === 'delete') {
            // Delete product from our database
            await this.prisma.product.delete({
              where: { id: data.id },
            });
          }
          break;
        // Handle other collections as needed
        default:
          this.logger.debug(`Unhandled Directus collection: ${collection}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to handle Directus webhook event: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Sync a specific product from Directus to our database
   */
  private async syncProductFromDirectus(productId: string) {
    try {
      // Get product from Directus
      const response = await axios.get(
        `${this.directusUrl}/items/products/${productId}`,
        { headers: this.getHeaders() }
      );

      const directusProduct: DirectusProduct = response.data.data;

      if (!directusProduct) {
        throw new Error(`Product not found in Directus: ${productId}`);
      }

      // Check if product already exists in our database
      const existingProduct = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (existingProduct) {
        // Update existing product
        await this.prisma.product.update({
          where: { id: productId },
          data: {
            name: directusProduct.name,
            description: directusProduct.description,
            price: directusProduct.price,
            imageUrl: directusProduct.imageUrl,
            stock: directusProduct.stock,
            sellerId: directusProduct.sellerId,
          },
        });
      } else {
        // Create new product
        await this.prisma.product.create({
          data: {
            id: directusProduct.id,
            name: directusProduct.name,
            description: directusProduct.description,
            price: directusProduct.price,
            imageUrl: directusProduct.imageUrl,
            stock: directusProduct.stock,
            sellerId: directusProduct.sellerId,
          },
        });
      }

      this.logger.debug(`Synced product ${productId} from Directus`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to sync product from Directus: ${error.message}`, error.stack);
      throw error;
    }
  }
}
