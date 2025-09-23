import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

const permissionInclude = {
  rolePermissions: true,
} as const;

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  create(createPermissionDto: CreatePermissionDto) {
    return this.prisma.permission.create({ data: createPermissionDto, include: permissionInclude });
  }

  findAll() {
    return this.prisma.permission.findMany({ include: permissionInclude });
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return this.prisma.permission.update({ where: { id }, data: updatePermissionDto, include: permissionInclude });
  }

  async remove(id: number) {
    await this.prisma.rolePermission.deleteMany({ where: { permissionId: id } });
    return this.prisma.permission.delete({ where: { id } });
  }
}
