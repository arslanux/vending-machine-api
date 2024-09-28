import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, Logger } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  async create(@Body() createProductDto: CreateProductDto, @Req() req) {
    this.logger.log(`Attempting to create product for user ${req.user.username}`);
    const result = await this.productService.create(createProductDto, req.user.userId);
    this.logger.log(`Product created successfully for user ${req.user.username}`);
    return result;
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
}