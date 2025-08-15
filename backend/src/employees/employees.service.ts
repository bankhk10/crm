import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const { password, roleId, firstName, lastName, ...data } = createEmployeeDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    let finalRoleId = roleId;
    if (!finalRoleId) {
      const userRole = await this.prisma.role.findUnique({ where: { name: 'USER' } });
      if (!userRole) throw new Error('Default USER role not found');
      finalRoleId = userRole.id;
    }
    const user = await this.prisma.user.create({
      data: {
        ...data,
        firstName,
        lastName,
        name: [firstName, lastName].filter(Boolean).join(' ') || undefined,
        password: hashedPassword,
        roleId: finalRoleId,
      },
    });
    const { password: _pwd, ...result } = user;
    return result;
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    const employee = await this.prisma.user.findUnique({ where: { employeeId: id } });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const { password, firstName, lastName, ...rest } = updateEmployeeDto;
    const data: any = { ...rest };
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
      const existing = await this.prisma.user.findUnique({ where: { employeeId: id } });
      const newFirst = firstName ?? existing?.firstName ?? '';
      const newLast = lastName ?? existing?.lastName ?? '';
      data.name = `${newFirst} ${newLast}`.trim();
    }
    return this.prisma.user.update({ where: { employeeId: id }, data });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { employeeId: id } });
  }
}
