import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  create(createEmployeeDto: CreateEmployeeDto) {
    return this.prisma.employee.create({ data: createEmployeeDto });
  }

  findAll() {
    return this.prisma.employee.findMany();
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({ where: { employeeId: id } });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    return this.prisma.employee.update({ where: { employeeId: id }, data: updateEmployeeDto });
  }

  remove(id: string) {
    return this.prisma.employee.delete({ where: { employeeId: id } });
  }
}
