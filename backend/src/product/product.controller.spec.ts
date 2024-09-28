import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: any;

  beforeEach(async () => {
    productService = {
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      buy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: productService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProductController>(ProductController);
    console.log('Controller methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(controller)));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const result = { id: 1, productName: 'Test Product', cost: 10, amountAvailable: 5 };
      jest.spyOn(productService, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne('1')).toBe(result);
    });
  });

  describe('buy', () => {
    it('should buy a product', async () => {
      const buyDto = { amount: 1 };
      const result = { totalSpent: 10, products: [{ id: 1, productName: 'Test Product', cost: 10, amountAvailable: 5 }], change: [5] };
      jest.spyOn(productService, 'buy').mockResolvedValue(result);

      expect(await controller.buy('1', buyDto, { user: { userId: 1 } } as any)).toBe(result);
    });
  });

  // Add more tests for other methods...
});