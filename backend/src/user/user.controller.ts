import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async status(): Promise<{ status: string }> {
    return { status: 'OK' };
  }

  @Post()
  async create(@Body() createUserDto: { username: string; password: string; role: 'buyer' | 'seller' }): Promise<User> {
    return this.userService.create(createUserDto.username, createUserDto.password, createUserDto.role);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':username')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('username') username: string): Promise<User> {
    return this.userService.findOne(username);
  }

  @Put('deposit/:username')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  async deposit(@Param('username') username: string, @Body('amount') amount: number): Promise<User> {
    return this.userService.deposit(username, amount);
  }

  @Put('reset/:username')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  async reset(@Param('username') username: string): Promise<User> {
    return this.userService.reset(username);
  }
}