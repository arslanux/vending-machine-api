import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @Column()
  amountAvailable: number;

  @ManyToOne(() => User)
  seller: User;
}