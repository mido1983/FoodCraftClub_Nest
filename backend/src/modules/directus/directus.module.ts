import { Module } from '@nestjs/common';
import { DirectusService } from './directus.service';
import { DirectusController } from './directus.controller.temp';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [DirectusController],
  providers: [DirectusService],
  exports: [DirectusService],
})
export class DirectusModule {}
