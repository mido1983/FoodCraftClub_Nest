import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, CreateSellerProfileDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    // Only admins can get all users
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    // Users can only view their own profile unless they're admins
    if (req.user.role !== UserRole.ADMIN && req.user.id !== +id) {
      throw new ForbiddenException('Access denied');
    }
    return this.usersService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    // Users can only update their own profile unless they're admins
    if (req.user.role !== UserRole.ADMIN && req.user.id !== +id) {
      throw new ForbiddenException('Access denied');
    }
    
    // Only admins can update roles
    if (updateUserDto.role && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update user roles');
    }
    
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    // Only admins can delete users
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }
    return this.usersService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(
      req.user.id,
      body.currentPassword,
      body.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('seller-profile')
  async createSellerProfile(
    @Request() req,
    @Body() createSellerProfileDto: CreateSellerProfileDto,
  ) {
    return this.usersService.createSellerProfile(req.user.id, createSellerProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('seller-profile')
  async updateSellerProfile(
    @Request() req,
    @Body() updateSellerProfileDto: CreateSellerProfileDto,
  ) {
    return this.usersService.updateSellerProfile(req.user.id, updateSellerProfileDto);
  }
}
