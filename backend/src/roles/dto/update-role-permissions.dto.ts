import { IsArray, ArrayNotEmpty, ArrayUnique, IsInt } from 'class-validator';

export class UpdateRolePermissionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  permissionIds: number[];
}
