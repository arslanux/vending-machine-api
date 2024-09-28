import { IsInt, IsIn } from 'class-validator';

export class DepositDto {
  @IsInt()
  @IsIn([5, 10, 20, 50, 100])
  amount: number;
}