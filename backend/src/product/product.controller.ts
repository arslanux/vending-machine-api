import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  async create(@Body() createProductDto: CreateProductDto, @Req() req) {
    return this.productService.create(createProductDto, req.user.userId);
  }

  @Get()
  async findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() req) {
    return this.productService.update(+id, updateProductDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  async remove(@Param('id') id: string, @Req() req) {
    return this.productService.remove(+id, req.user.userId);
  }

  @Post('buy')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  async buy(@Req() req, @Body() buyDto: { productId: number, amount: number }) {
    return this.productService.buy(buyDto.productId, buyDto.amount, req.user.username);
  }
}