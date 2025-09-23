import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

const userWithRoles = {
  userRoles: {
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  },
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private async resolveRoleIds(roleIds?: number[]) {
    if (roleIds?.length) {
      const uniqueRoleIds = Array.from(new Set(roleIds));
      const roles = await this.prisma.role.findMany({
        where: { id: { in: uniqueRoleIds } },
        select: { id: true },
      });
      if (roles.length !== uniqueRoleIds.length) {
        throw new NotFoundException('One or more roles were not found.');
      }
      return uniqueRoleIds;
    }

    const defaultRole = await this.prisma.role.findUnique({ where: { name: 'USER' } });
    if (!defaultRole) {
      throw new NotFoundException('Default USER role not found');
    }
    return [defaultRole.id];
  }

  async create(createUserDto: CreateUserDto) {
    const saltRounds = 10;
    const { roleIds, ...payload } = createUserDto;
    const hashedPassword = await bcrypt.hash(payload.password, saltRounds);
    const resolvedRoleIds = await this.resolveRoleIds(roleIds);

    return this.prisma.user.create({
      data: {
        ...payload,
        password: hashedPassword,
        userRoles: {
          create: resolvedRoleIds.map((roleId) => ({
            role: { connect: { id: roleId } },
          })),
        },
      },
      include: userWithRoles,
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        type: true,
        status: true,
        createdAt: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: userWithRoles,
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: userWithRoles,
    });
  }

  findOneByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: userWithRoles,
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: true,
      },
    });
    if (!userToUpdate) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { roleIds, ...rest } = updateUserDto;
    const data: any = { ...rest };
    if (rest.password) {
      const saltRounds = 10;
      data.password = await bcrypt.hash(rest.password, saltRounds);
    } else {
      delete data.password;
    }

    if (roleIds) {
      const resolvedRoleIds = await this.resolveRoleIds(roleIds);
      const adminRole = await this.prisma.role.findUnique({ where: { name: 'ADMIN' } });
      if (adminRole) {
        const hadAdmin = userToUpdate.userRoles.some((ur) => ur.roleId === adminRole.id);
        const willHaveAdmin = resolvedRoleIds.includes(adminRole.id);
        if (hadAdmin && !willHaveAdmin) {
          const adminCount = await this.prisma.userRole.count({ where: { roleId: adminRole.id } });
          if (adminCount <= 1) {
            throw new BadRequestException('Cannot remove the last admin role.');
          }
        }
      }

      data.userRoles = {
        deleteMany: { userId: id },
        create: resolvedRoleIds.map((roleId) => ({ role: { connect: { id: roleId } } })),
      };
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        type: true,
        userRoles: {
          include: { role: true },
        },
      },
    });
  }

  async remove(id: number, currentUserId: number) {
    if (id === currentUserId) {
      throw new ForbiddenException('You cannot delete your own account.');
    }

    const userToDelete = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: true,
      },
    });
    if (!userToDelete) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const adminRole = await this.prisma.role.findUnique({ where: { name: 'ADMIN' } });
    if (adminRole) {
      const hasAdminRole = userToDelete.userRoles.some((ur) => ur.roleId === adminRole.id);
      if (hasAdminRole) {
        const adminCount = await this.prisma.userRole.count({ where: { roleId: adminRole.id } });
        if (adminCount <= 1) {
          throw new BadRequestException('Cannot delete the last admin.');
        }
      }
    }

    await this.prisma.userRole.deleteMany({ where: { userId: id } });
    return this.prisma.user.delete({ where: { id } });
  }

  async assignRoles(userId: number, roleIds: number[]) {
    await this.findOne(userId);
    const roleIdsToAssign = await this.resolveRoleIds(roleIds);
    await this.prisma.userRole.createMany({
      data: roleIdsToAssign.map((roleId) => ({ userId, roleId })),
      skipDuplicates: true,
    });
    return this.findOne(userId);
  }

  async unassignRoles(userId: number, roleIds: number[]) {
    await this.findOne(userId);
    const adminRole = await this.prisma.role.findUnique({ where: { name: 'ADMIN' } });
    if (adminRole && roleIds.includes(adminRole.id)) {
      const adminCount = await this.prisma.userRole.count({ where: { roleId: adminRole.id } });
      const userHasAdmin = await this.prisma.userRole.findUnique({
        where: { userId_roleId: { userId, roleId: adminRole.id } },
      });
      if (userHasAdmin && adminCount <= 1) {
        throw new BadRequestException('Cannot remove the last admin role.');
      }
    }
    await this.prisma.userRole.deleteMany({
      where: {
        userId,
        roleId: { in: roleIds },
      },
    });
    return this.findOne(userId);
  }
}
