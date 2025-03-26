import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto, @Request() req) {
    return this.subscriptionsService.create(req.user.id, createSubscriptionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    return this.subscriptionsService.findAll(req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-subscription')
  findMySubscription(@Request() req) {
    return this.subscriptionsService.findByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.subscriptionsService.findOne(+id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Request() req,
  ) {
    return this.subscriptionsService.update(
      +id,
      updateSubscriptionDto,
      req.user.id,
      req.user.role,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.subscriptionsService.remove(+id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel')
  cancel(@Request() req) {
    return this.subscriptionsService.cancelUserSubscription(req.user.id);
  }
}
