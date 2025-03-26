import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Database connection established');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Database connection closed');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }
    
    // Add transaction to ensure all deletes happen or none
    const models = Reflect.ownKeys(this).filter(
      (key) => key[0] !== '_' && key[0] !== '$' && key !== 'cleanDatabase',
    );
    
    return this.$transaction(
      models.map((modelKey) => this[modelKey].deleteMany()),
    );
  }
}
