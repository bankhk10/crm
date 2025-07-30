import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({ data: { ...createUserDto, password: hashedPassword } });
  }
  findAll() {
    return this.prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true } });
  }
  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id }, include: { role: { include: { permissions: true } } } });
  }
  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
  findOneByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({ where: { email }, include: { role: true } });
  }
  async update(id: number, updateUserDto: UpdateUserDto) {
    const data: any = { ...updateUserDto };
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    return this.prisma.user.update({ where: { id }, data, select: { id: true, email: true, name: true, role: true } });
  }
  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}