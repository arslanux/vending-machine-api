import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { User } from '../user/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: any;
  let userRepository: any;

  beforeEach(async () => {
    productRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    userRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: productRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a product if found', async () => {
      const mockProduct = { id: 1, productName: 'Test Product', cost: 10, amountAvailable: 5 };
      productRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      productRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  // Add more tests for other methods...
});