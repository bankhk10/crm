import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import * as bcrypt from 'bcrypt';

const employeeInclude = {
  userRoles: {
    include: {
      role: true,
    },
  },
} as const;

@Injectable()
export class EmployeesService {
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

  async create(createEmployeeDto: CreateEmployeeDto) {
    const {
      employeeId,
      email,
      password,
      firstName,
      lastName,
      roleIds,
      ...rest
    } = createEmployeeDto;

    const existEmpId = await this.prisma.user.findUnique({
      where: { employeeId },
    });
    if (existEmpId) {
      throw new BadRequestException(`รหัสพนักงาน ${employeeId} ถูกใช้งานแล้ว`);
    }

    const existEmail = await this.prisma.user.findUnique({ where: { email } });
    if (existEmail) {
      throw new BadRequestException(`อีเมล ${email} ถูกใช้งานแล้ว`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const resolvedRoleIds = await this.resolveRoleIds(roleIds);

    const user = await this.prisma.user.create({
      data: {
        employeeId,
        email,
        ...rest,
        firstName,
        lastName,
        name: [firstName, lastName].filter(Boolean).join(' ') || undefined,
        password: hashedPassword,
        userRoles: {
          create: resolvedRoleIds.map((roleId) => ({ role: { connect: { id: roleId } } })),
        },
      },
      include: employeeInclude,
    });

    const { password: _pwd, ...result } = user;
    void _pwd;
    return result;
  }

  findAll() {
    return this.prisma.user.findMany({ include: employeeInclude });
  }

  async findOne(id: string) {
    const employee = await this.prisma.user.findUnique({
      where: { employeeId: id },
      include: employeeInclude,
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const existing = await this.prisma.user.findUnique({
      where: { employeeId: id },
      include: { userRoles: true },
    });
    if (!existing) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const {
      employeeId,
      email,
      password,
      firstName,
      lastName,
      roleIds,
      ...rest
    } = updateEmployeeDto;

    const data: any = { ...rest };

    if (employeeId && employeeId !== id) {
      const existEmpId = await this.prisma.user.findUnique({
        where: { employeeId },
      });
      if (existEmpId) {
        throw new BadRequestException(`รหัสพนักงาน ${employeeId} ถูกใช้งานแล้ว`);
      }
      data.employeeId = employeeId;
    }

    if (email && email !== existing.email) {
      const existEmail = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existEmail && existEmail.id !== existing.id) {
        throw new BadRequestException(`อีเมล ${email} ถูกใช้งานแล้ว`);
      }
      data.email = email;
    }

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    if (firstName !== undefined) {
      data.firstName = firstName;
    }
    if (lastName !== undefined) {
      data.lastName = lastName;
    }
    if (firstName !== undefined || lastName !== undefined) {
      const newFirst = firstName ?? existing.firstName ?? '';
      const newLast = lastName ?? existing.lastName ?? '';
      data.name = `${newFirst} ${newLast}`.trim();
    }

    if (roleIds) {
      const resolvedRoleIds = await this.resolveRoleIds(roleIds);
      const adminRole = await this.prisma.role.findUnique({ where: { name: 'ADMIN' } });
      if (adminRole) {
        const hadAdmin = existing.userRoles.some((role) => role.roleId === adminRole.id);
        const willHaveAdmin = resolvedRoleIds.includes(adminRole.id);
        if (hadAdmin && !willHaveAdmin) {
          const adminCount = await this.prisma.userRole.count({ where: { roleId: adminRole.id } });
          if (adminCount <= 1) {
            throw new BadRequestException('Cannot remove the last admin role.');
          }
        }
      }
      data.userRoles = {
        deleteMany: { userId: existing.id },
        create: resolvedRoleIds.map((roleId) => ({ role: { connect: { id: roleId } } })),
      };
    }

    return this.prisma.user.update({
      where: { id: existing.id },
      data,
      include: employeeInclude,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.user.findUnique({
      where: { employeeId: id },
      include: { userRoles: true },
    });
    if (!existing) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const adminRole = await this.prisma.role.findUnique({ where: { name: 'ADMIN' } });
    if (adminRole) {
      const hasAdmin = existing.userRoles.some((role) => role.roleId === adminRole.id);
      if (hasAdmin) {
        const adminCount = await this.prisma.userRole.count({ where: { roleId: adminRole.id } });
        if (adminCount <= 1) {
          throw new ForbiddenException('Cannot delete the last admin.');
        }
      }
    }

    await this.prisma.userRole.deleteMany({ where: { userId: existing.id } });
    return this.prisma.user.delete({ where: { id: existing.id } });
  }
}
