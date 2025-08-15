import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const { password, ...data } = createEmployeeDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = await this.prisma.role.findUnique({ where: { name: 'USER' } });
    if (!userRole) throw new Error('Default USER role not found');
    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        roleId: userRole.id,
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
    const data: any = { ...updateEmployeeDto };
    if (updateEmployeeDto.password) {
      data.password = await bcrypt.hash(updateEmployeeDto.password, 10);
    }
    return this.prisma.user.update({ where: { employeeId: id }, data });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { employeeId: id } });
  }
}
