import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(username: string, password: string, role: 'buyer' | 'seller'): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ username, password: hashedPassword, role });
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async deposit(username: string, amount: number): Promise<User> {
    const user = await this.findOne(username);
    if (user.role !== 'buyer') {
      throw new ConflictException('Only buyers can deposit');
    }
    if (![5, 10, 20, 50, 100].includes(amount)) {
      throw new ConflictException('Invalid coin denomination');
    }
    user.deposit += amount;
    return this.userRepository.save(user);
  }

  async reset(username: string): Promise<User> {
    const user = await this.findOne(username);
    if (user.role !== 'buyer') {
      throw new ConflictException('Only buyers can reset their deposit');
    }
    user.deposit = 0;
    return this.userRepository.save(user);
  }
}