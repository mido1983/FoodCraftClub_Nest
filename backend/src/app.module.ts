import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { LoggerModule } from './modules/logger/logger.module';
import { ClerkModule } from './modules/clerk/clerk.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { DirectusModule } from './modules/directus/directus.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Core modules
    LoggerModule,
    PrismaModule,
    
    // External service integrations
    ClerkModule,
    StripeModule,
    DirectusModule,
    
    // Feature modules
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule {}
