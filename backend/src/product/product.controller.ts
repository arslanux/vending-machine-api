import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get API status' })
  @ApiResponse({ status: 200, description: 'Returns OK if the API is running.' })
  async getStatus() {
    return { status: 'OK' };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'The product has been successfully created.', type: Product })
  async create(@Body() createProductDto: CreateProductDto, @Req() req: Request): Promise<Product> {
    return this.productService.create(createProductDto, req.user['userId']);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Return all products.', type: [Product] })
  async findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiResponse({ status: 200, description: 'Return the product.', type: Product })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productService.findOne(+id);
  }

  @Put(':id')
  @Roles('seller')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'The product has been successfully updated.', type: Product })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() req: Request): Promise<Product> {
    return this.productService.update(+id, updateProductDto, req.user['userId']);
  }

  @Delete(':id')
  @Roles('seller')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'The product has been successfully deleted.' })
  async remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
    return this.productService.remove(+id, req.user['userId']);
  }

  @Post('buy/:id')
  @Roles('buyer')
  @ApiOperation({ summary: 'Buy a product' })
  @ApiResponse({ status: 200, description: 'The product has been successfully purchased.' })
  async buy(
    @Param('id') id: string,
    @Body() buyDto: { amount: number },
    @Req() req: Request,
  ) {
    return this.productService.buy(+id, buyDto.amount, req.user['userId']);
  }
}