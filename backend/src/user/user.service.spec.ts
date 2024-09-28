import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
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

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = { username: 'testuser', password: 'password', role: 'buyer' as const };
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(createUserDto);
      mockRepository.save.mockResolvedValue(createUserDto);

      const result = await service.create(createUserDto.username, createUserDto.password, createUserDto.role);

      expect(result).toEqual(createUserDto);
      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        username: createUserDto.username,
        role: createUserDto.role,
      }));
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if username already exists', async () => {
      const createUserDto = { username: 'testuser', password: 'password', role: 'buyer' as const };
      mockRepository.findOne.mockResolvedValue({ username: 'testuser' });

      await expect(service.create(createUserDto.username, createUserDto.password, createUserDto.role))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const mockUser = { username: 'testuser', role: 'buyer' };
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('testuser');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('testuser')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deposit', () => {
    it('should successfully deposit valid coin amounts', async () => {
      const user = new User();
      user.username = 'testuser';
      user.role = 'buyer';
      user.deposit = 0;

      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue({ ...user, deposit: 5 });

      const result = await service.deposit('testuser', 5);
      expect(result.deposit).toBe(5);
    });

    it('should throw ConflictException for invalid coin amounts', async () => {
      const user = new User();
      user.username = 'testuser';
      user.role = 'buyer';

      mockRepository.findOne.mockResolvedValue(user);

      await expect(service.deposit('testuser', 7)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if user is not a buyer', async () => {
      const user = new User();
      user.username = 'testuser';
      user.role = 'seller';

      mockRepository.findOne.mockResolvedValue(user);

      await expect(service.deposit('testuser', 5)).rejects.toThrow(ConflictException);
    });
  });
});