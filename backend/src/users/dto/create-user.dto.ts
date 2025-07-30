import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';
export class CreateUserDto {
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsNumber()
  roleId: number;
}