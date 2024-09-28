import { IsString, IsEnum, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(['buyer', 'seller'])
  role: 'buyer' | 'seller';
}