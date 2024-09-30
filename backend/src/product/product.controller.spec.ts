import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { User } from '../user/user.entity';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockUser: User = {
    id: 1,
    username: 'seller1',
    password: 'hashedpassword',
    role: 'seller',
    deposit: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            buy: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto = { productName: 'Test Product', cost: 50, amountAvailable: 10 };
      const req = { user: mockUser };
      const mockProduct: Product = {
        id: 1,
        ...createProductDto,
        seller: mockUser,
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockProduct);

      expect(await controller.create(createProductDto, req)).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const result: Product[] = [
        { id: 1, productName: 'Test Product', cost: 50, amountAvailable: 10, seller: mockUser },
      ];
      
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const result: Product = { 
        id: 1, 
        productName: 'Test Product', 
        cost: 50, 
        amountAvailable: 10, 
        seller: mockUser
      };
      
      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne('1')).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto = { productName: 'Updated Product', cost: 60, amountAvailable: 15 };
      const req = { user: mockUser };
      const result: Product = { 
        id: 1, 
        ...updateProductDto, 
        seller: mockUser
      };

      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update('1', updateProductDto, req)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      const req = { user: mockUser };
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      expect(await controller.remove('1', req)).toBeUndefined();
    });
  });

  describe('buy', () => {
    it('should buy a product', async () => {
      const buyProductDto = { amount: 1 };
      const req = { user: { ...mockUser, role: 'buyer' } };
      const mockProduct: Product = { 
        id: 1, 
        productName: 'Test Product', 
        cost: 50, 
        amountAvailable: 9, 
        seller: mockUser
      };
      const result = { 
        totalSpent: 50, 
        products: [mockProduct], 
        change: [50] 
      };

      jest.spyOn(service, 'buy').mockResolvedValue(result);

      expect(await controller.buy(req, { productId: 1, ...buyProductDto })).toBe(result);
    });
  });
});