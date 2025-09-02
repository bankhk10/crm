import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

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

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  responsibleArea?: string;

  @IsOptional()
  @IsIn(['Admin', 'GM', 'User'])
  type?: string;
}