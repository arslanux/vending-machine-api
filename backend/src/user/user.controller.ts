import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DepositDto } from './dto/deposit.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto.username, createUserDto.password, createUserDto.role);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':username')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('username') username: string) {
    return this.userService.findOne(username);
  }

  @Put('deposit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  async deposit(@Req() req, @Body() depositDto: DepositDto) {
    return this.userService.deposit(req.user.username, depositDto.amount);
  }

  @Put('reset')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  async reset(@Req() req) {
    return this.userService.reset(req.user.username);
  }
}