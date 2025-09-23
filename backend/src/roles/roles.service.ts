import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

const roleInclude = {
  rolePermissions: {
    include: {
      permission: true,
    },
  },
  userRoles: true,
} as const;

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  private async resolvePermissionIds(permissionIds?: number[]) {
    if (permissionIds?.length) {
      const uniquePermissionIds = Array.from(new Set(permissionIds));
      const permissions = await this.prisma.permission.findMany({
        where: { id: { in: uniquePermissionIds } },
        select: { id: true },
      });
      if (permissions.length !== uniquePermissionIds.length) {
        throw new NotFoundException('One or more permissions were not found.');
      }
      return uniquePermissionIds;
    }
    return [];
  }

  findAll() {
    return this.prisma.role.findMany({ include: roleInclude });
  }

  async create(createRoleDto: CreateRoleDto) {
    const { permissionIds, ...rest } = createRoleDto;
    const resolvedPermissionIds = await this.resolvePermissionIds(permissionIds);
    return this.prisma.role.create({
      data: {
        ...rest,
        rolePermissions: resolvedPermissionIds.length
          ? {
              create: resolvedPermissionIds.map((permissionId) => ({
                permission: { connect: { id: permissionId } },
              })),
            }
          : undefined,
      },
      include: roleInclude,
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const { permissionIds, ...rest } = updateRoleDto;
    const data: any = { ...rest };

    if (permissionIds) {
      const resolvedPermissionIds = await this.resolvePermissionIds(permissionIds);
      data.rolePermissions = {
        deleteMany: { roleId: id },
        create: resolvedPermissionIds.map((permissionId) => ({
          permission: { connect: { id: permissionId } },
        })),
      };
    }

    return this.prisma.role.update({
      where: { id },
      data,
      include: roleInclude,
    });
  }

  async remove(id: number) {
    const usersWithRole = await this.prisma.userRole.count({ where: { roleId: id } });
    if (usersWithRole > 0) {
      throw new BadRequestException('Cannot delete a role that is assigned to users.');
    }
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    return this.prisma.role.delete({ where: { id } });
  }

  async assignPermissions(roleId: number, permissionIds: number[]) {
    await this.prisma.role.findUniqueOrThrow({ where: { id: roleId } });
    const resolved = await this.resolvePermissionIds(permissionIds);
    await this.prisma.rolePermission.createMany({
      data: resolved.map((permissionId) => ({ roleId, permissionId })),
      skipDuplicates: true,
    });
    return this.prisma.role.findUnique({ where: { id: roleId }, include: roleInclude });
  }

  async unassignPermissions(roleId: number, permissionIds: number[]) {
    await this.prisma.role.findUniqueOrThrow({ where: { id: roleId } });
    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: { in: permissionIds },
      },
    });
    return this.prisma.role.findUnique({ where: { id: roleId }, include: roleInclude });
  }
}
