import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.role.findMany({ include: { permissions: true } });
  }

  create(createRoleDto: CreateRoleDto) {
    return this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        permissions: {
          connect: createRoleDto.permissionIds.map((id) => ({ id })),
        },
      },
      include: { permissions: true },
    });
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return this.prisma.role.update({
      where: { id },
      data: {
        name: updateRoleDto.name,
        permissions: updateRoleDto.permissionIds
          ? {
              set: updateRoleDto.permissionIds.map((pid) => ({ id: pid })),
            }
          : undefined,
      },
      include: { permissions: true },
    });
  }

  async remove(id: number) {
    const usersWithRole = await this.prisma.user.count({ where: { roleId: id } });
    if (usersWithRole > 0) {
      throw new BadRequestException('Cannot delete a role that is assigned to users.');
    }
    return this.prisma.role.delete({ where: { id } });
  }
}