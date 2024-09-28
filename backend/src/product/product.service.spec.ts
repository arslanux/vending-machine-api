import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { User } from '../user/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let mockProductRepository: any;
  let mockUserRepository: any;

  beforeEach(async () => {
    mockProductRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buy', () => {
    it('should successfully buy a product', async () => {
      const product = new Product();
      product.id = 1;
      product.productName = 'Test Product';
      product.cost = 50;
      product.amountAvailable = 10;

      const user = new User();
      user.id = 1;
      user.username = 'testuser';
      user.role = 'buyer';
      user.deposit = 100;

      mockProductRepository.findOne.mockResolvedValue(product);
      mockUserRepository.findOne.mockResolvedValue(user);
      mockProductRepository.save.mockResolvedValue({ ...product, amountAvailable: 9 });
      mockUserRepository.save.mockResolvedValue({ ...user, deposit: 50 });

      const result = await service.buy(1, 1, 1);

      expect(result.totalSpent).toBe(50);
      expect(result.products.length).toBe(1);
      expect(result.products[0].productName).toBe('Test Product');
      expect(result.change).toEqual([50]);
    });

    it('should throw ConflictException if not enough products available', async () => {
      const product = new Product();
      product.id = 1;
      product.productName = 'Test Product';
      product.cost = 50;
      product.amountAvailable = 1;

      const user = new User();
      user.id = 1;
      user.username = 'testuser';
      user.role = 'buyer';
      user.deposit = 100;

      mockProductRepository.findOne.mockResolvedValue(product);
      mockUserRepository.findOne.mockResolvedValue(user);

      await expect(service.buy(1, 2, 1)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if user has insufficient funds', async () => {
      const product = new Product();
      product.id = 1;
      product.productName = 'Test Product';
      product.cost = 50;
      product.amountAvailable = 10;

      const user = new User();
      user.id = 1;
      user.username = 'testuser';
      user.role = 'buyer';
      user.deposit = 40;

      mockProductRepository.findOne.mockResolvedValue(product);
      mockUserRepository.findOne.mockResolvedValue(user);

      await expect(service.buy(1, 1, 1)).rejects.toThrow(ConflictException);
    });
  });
});