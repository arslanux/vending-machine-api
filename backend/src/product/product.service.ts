import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { User } from '../user/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createProductDto: CreateProductDto, sellerId: number): Promise<Product> {
    const seller = await this.userRepository.findOne({ where: { id: sellerId } });
    if (!seller || seller.role !== 'seller') {
      throw new ForbiddenException('Only sellers can create products');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      seller,
    });

    return this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['seller'] });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto, sellerId: number): Promise<Product> {
    const product = await this.findOne(id);
    if (product.seller.id !== sellerId) {
      throw new ForbiddenException('You can only update your own products');
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number, sellerId: number): Promise<void> {
    const product = await this.findOne(id);
    if (product.seller.id !== sellerId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.productRepository.remove(product);
  }

  async buy(productId: number, amount: number, buyerId: number): Promise<{ totalSpent: number, products: Product[], change: number[] }> {
    const product = await this.findOne(productId);
    const buyer = await this.userRepository.findOne({ where: { id: buyerId } });

    if (!buyer || buyer.role !== 'buyer') {
      throw new ConflictException('Invalid buyer');
    }

    if (product.amountAvailable < amount) {
      throw new ConflictException('Not enough products available');
    }

    const totalCost = product.cost * amount;
    if (buyer.deposit < totalCost) {
      throw new ConflictException('Insufficient funds');
    }

    // Update product amount
    product.amountAvailable -= amount;
    await this.productRepository.save(product);

    // Update buyer's deposit
    buyer.deposit -= totalCost;
    await this.userRepository.save(buyer);

    // Calculate change
    const change = this.calculateChange(buyer.deposit);

    return {
      totalSpent: totalCost,
      products: Array(amount).fill(product),
      change,
    };
  }

  private calculateChange(remainingDeposit: number): number[] {
    const coins = [100, 50, 20, 10, 5];
    const change: number[] = [];

    for (const coin of coins) {
      while (remainingDeposit >= coin) {
        change.push(coin);
        remainingDeposit -= coin;
      }
    }

    return change;
  }
}