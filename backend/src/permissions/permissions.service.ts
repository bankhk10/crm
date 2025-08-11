import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  create(createPermissionDto: CreatePermissionDto) {
    return this.prisma.permission.create({ data: createPermissionDto });
  }

  findAll() {
    return this.prisma.permission.findMany();
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return this.prisma.permission.update({ where: { id }, data: updatePermissionDto });
  }

  remove(id: number) {
    return this.prisma.permission.delete({ where: { id } });
  }
}
