import { IsArray, ArrayNotEmpty, ArrayUnique, IsInt } from 'class-validator';

export class UpdateUserRolesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  roleIds: number[];
}
