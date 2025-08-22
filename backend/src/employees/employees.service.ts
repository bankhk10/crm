import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import * as bcrypt from "bcrypt";
import type { Prisma } from "@prisma/client";
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const {
      employeeId,
      email,
      password,
      roleId,
      firstName,
      lastName,
      ...data
    } = createEmployeeDto;

    // เช็ค employeeId ซ้ำ
    const existEmpId = await this.prisma.user.findUnique({
      where: { employeeId },
    });
    if (existEmpId) {
      throw new BadRequestException(`รหัสพนักงาน ${employeeId} ถูกใช้งานแล้ว`);
    }

    // เช็ค email ซ้ำ
    const existEmail = await this.prisma.user.findUnique({ where: { email } });
    if (existEmail) {
      throw new BadRequestException(`อีเมล ${email} ถูกใช้งานแล้ว`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let finalRoleId = roleId;
    if (!finalRoleId) {
      const userRole = await this.prisma.role.findUnique({
        where: { name: "USER" },
      });
      if (!userRole) throw new Error("Default USER role not found");
      finalRoleId = userRole.id;
    }

    const user = await this.prisma.user.create({
      data: {
        employeeId,
        email,
        ...data,
        firstName,
        lastName,
        name: [firstName, lastName].filter(Boolean).join(" ") || undefined,
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
    const employee = await this.prisma.user.findUnique({
      where: { employeeId: id },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const { employeeId, email, password, firstName, lastName, ...rest } =
      updateEmployeeDto;
    const data: any = { ...rest };

    if (employeeId && employeeId !== id) {
      const existEmpId = await this.prisma.user.findUnique({
        where: { employeeId },
      });
      if (existEmpId) {
        throw new BadRequestException(
          `รหัสพนักงาน ${employeeId} ถูกใช้งานแล้ว`,
        );
      }
      data.employeeId = employeeId;
    }

    if (email) {
      const existEmail = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existEmail && existEmail.employeeId !== id) {
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
      const existing = await this.prisma.user.findUnique({
        where: { employeeId: id },
      });
      const newFirst = firstName ?? existing?.firstName ?? "";
      const newLast = lastName ?? existing?.lastName ?? "";
      data.name = `${newFirst} ${newLast}`.trim();
    }
    return this.prisma.user.update({ where: { employeeId: id }, data });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { employeeId: id } });
  }
}
