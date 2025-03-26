import { Module } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { ClerkController } from './clerk.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [ClerkController],
  providers: [ClerkService],
  exports: [ClerkService],
})
export class ClerkModule {}
