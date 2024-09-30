import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let mockRepository;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deposit', () => {
    it('should successfully deposit valid coin amounts', async () => {
      const user = { username: 'testuser', role: 'buyer', deposit: 0 };
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue({ ...user, deposit: 5 });

      const result = await service.deposit('testuser', 5);
      expect(result.deposit).toBe(5);
    });

    it('should throw ConflictException for invalid coin amounts', async () => {
      const user = { username: 'testuser', role: 'buyer', deposit: 0 };
      mockRepository.findOne.mockResolvedValue(user);

      await expect(service.deposit('testuser', 7)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if user is not a buyer', async () => {
      const user = { username: 'testuser', role: 'seller', deposit: 0 };
      mockRepository.findOne.mockResolvedValue(user);

      await expect(service.deposit('testuser', 5)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.deposit('nonexistentuser', 5)).rejects.toThrow(NotFoundException);
    });
  });

  describe('reset', () => {
    it('should reset deposit to 0 for a buyer', async () => {
      const user = { username: 'testuser', role: 'buyer', deposit: 100 };
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue({ ...user, deposit: 0 });

      const result = await service.reset('testuser');
      expect(result.deposit).toBe(0);
    });

    it('should throw ConflictException if user is not a buyer', async () => {
      const user = { username: 'testuser', role: 'seller', deposit: 100 };
      mockRepository.findOne.mockResolvedValue(user);

      await expect(service.reset('testuser')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.reset('nonexistentuser')).rejects.toThrow(NotFoundException);
    });
  });
});